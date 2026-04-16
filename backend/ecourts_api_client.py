"""
eCourts API Client
Handles direct communication with eCourts India API
"""

import logging
import os
from typing import Optional, Dict, Any
import requests
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class ECourtsAPIClient:
    """Client for interacting with eCourts India API"""
    
    def __init__(self):
        # Official eCourts Web API base URL
        self.base_url = os.environ.get('ECOURTS_API_URL', 'https://webapi.ecourtsindia.com')
        self.api_key = os.environ.get('ECOURTS_API_KEY', '')
        self.timeout = 30
        # API is available if we have a valid key
        self.api_available = bool(self.api_key and self.api_key.startswith('eci_'))
        
    def _make_request(self, endpoint: str, params: Optional[Dict] = None) -> Optional[Dict]:
        """Make HTTP request to eCourts API"""
        try:
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
            
            # Add API key to headers if available
            if self.api_key:
                headers['Authorization'] = f'Bearer {self.api_key}'
            
            url = f"{self.base_url}{endpoint}"
            logger.info(f"Making request to eCourts API: {url}")
            
            response = requests.get(
                url,
                headers=headers,
                params=params,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                logger.warning(f"Case not found in eCourts: {endpoint}")
                return None
            else:
                logger.error(f"eCourts API error: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.Timeout:
            logger.error("eCourts API request timed out")
            return None
        except requests.exceptions.ConnectionError as e:
            logger.error(f"Connection error to eCourts API: {e}")
            return None
        except Exception as e:
            logger.error(f"Error calling eCourts API: {str(e)}")
            return None
    
    def get_case_details(self, cnr: str) -> Optional[Dict[str, Any]]:
        """
        Fetch complete case details from eCourts by CNR
        
        Args:
            cnr: Case Number Record (16-character identifier)
            
        Returns:
            Dictionary containing case details or None if not found
        """
        # Check if API is available
        if not self.api_available:
            logger.info("eCourts API key not configured - returning None")
            return None
            
        try:
            # Validate CNR format
            cnr = cnr.strip().upper()
            if len(cnr) != 16:
                logger.error(f"Invalid CNR format: {cnr}")
                return None
            
            logger.info(f"Fetching case details for CNR: {cnr}")
            
            # eCourts API endpoint format: /api/partner/case/{cnr}
            endpoint = f"/api/partner/case/{cnr}"
            
            case_data = self._make_request(endpoint)
            
            if not case_data:
                return None
            
            logger.info(f"Successfully fetched case data for CNR: {cnr}")
            return case_data
            
        except Exception as e:
            logger.error(f"Error in get_case_details: {str(e)}")
            return None
    
    def get_case_with_latest_order(self, cnr: str) -> Optional[Dict[str, Any]]:
        """
        Fetch case details with latest order analysis
        
        Args:
            cnr: Case Number Record
            
        Returns:
            Dictionary containing case details with latest order analysis
        """
        # Check if API is available
        if not self.api_available:
            logger.info("eCourts API key not configured - returning None")
            return None
            
        try:
            cnr = cnr.strip().upper()
            logger.info(f"Fetching case with latest order for CNR: {cnr}")
            
            # For now, use the same endpoint as get_case_details
            # If eCourts provides a separate endpoint for latest order, update here
            case_data = self.get_case_details(cnr)
            
            return case_data
            
        except Exception as e:
            logger.error(f"Error in get_case_with_latest_order: {str(e)}")
            return None
    
    def search_cases(self, **filters) -> Optional[Dict[str, Any]]:
        """
        Search cases using various filters
        
        Args:
            **filters: Search filters (case_type, court_code, filing_year, etc.)
            
        Returns:
            Dictionary containing search results
        """
        try:
            logger.info(f"Searching cases with filters: {filters}")
            
            endpoint = "/api/case/search"
            
            results = self._make_request(endpoint, params=filters)
            
            return results
            
        except Exception as e:
            logger.error(f"Error in search_cases: {str(e)}")
            return None


# Create singleton instance
ecourts_client = ECourtsAPIClient()
