"""
eCourts Integration Module
Provides functions to interact with eCourts API through MCP tools
"""

import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)


async def get_case_with_latest_order(cnr: str) -> Optional[Dict[str, Any]]:
    """
    Fetch comprehensive case details from eCourts including latest order analysis.
    
    Args:
        cnr: Case Number Record (16-character identifier)
        
    Returns:
        Dictionary containing case details and latest order analysis, or None if not found
    """
    try:
        # Import the eCourts MCP client
        from mcp import ClientSession
        from mcp.client.stdio import stdio_client
        
        logger.info(f"Fetching eCourts case data for CNR: {cnr}")
        
        # Since we're in the context where MCP tools are available through the agent,
        # we'll call them directly through the context
        # This is a placeholder that will be replaced with actual MCP tool calls
        
        # For now, we'll create a mock structure that matches what we expect
        # The actual implementation will use the MCP tools available in the execution context
        
        # The agent will handle the actual MCP tool calls
        # This function serves as an interface
        
        return None  # This will be populated by the actual MCP tool call
        
    except Exception as e:
        logger.error(f"Error in get_case_with_latest_order: {str(e)}")
        raise


def validate_cnr_format(cnr: str) -> bool:
    """
    Validate CNR format (should be 16 characters: 4 letters + 12 alphanumeric)
    Example: DLCT020357252018
    
    Args:
        cnr: Case Number Record to validate
        
    Returns:
        True if valid format, False otherwise
    """
    if not cnr or len(cnr) != 16:
        return False
    
    # First 4 characters should be letters
    if not cnr[:4].isalpha():
        return False
    
    # Remaining 12 should be alphanumeric
    if not cnr[4:].isalnum():
        return False
    
    return True


def format_case_summary(raw_case_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format raw eCourts case data into a standardized structure.
    
    Args:
        raw_case_data: Raw case data from eCourts API
        
    Returns:
        Formatted case summary
    """
    try:
        # Extract and format key information
        formatted = {
            "case_summary": {
                "cnr": raw_case_data.get("cnr", ""),
                "title": raw_case_data.get("caseTitle", ""),
                "filing_number": raw_case_data.get("filingNumber", ""),
                "filing_date": raw_case_data.get("filingDate", ""),
                "registration_date": raw_case_data.get("registrationDate", ""),
                "case_type": raw_case_data.get("caseType", ""),
                "status": raw_case_data.get("caseStatus", ""),
                "court_name": raw_case_data.get("courtName", ""),
                "court_number": raw_case_data.get("courtNumber", ""),
                "first_hearing_date": raw_case_data.get("firstHearingDate", ""),
                "next_hearing_date": raw_case_data.get("nextHearingDate", ""),
                "last_hearing_date": raw_case_data.get("lastHearingDate", ""),
                "decision_date": raw_case_data.get("decisionDate", ""),
            },
            "parties": {
                "petitioners": raw_case_data.get("petitioners", []),
                "respondents": raw_case_data.get("respondents", []),
            },
            "advocates": {
                "petitioner_advocates": raw_case_data.get("petitionerAdvocates", []),
                "respondent_advocates": raw_case_data.get("respondentAdvocates", []),
            },
            "judges": raw_case_data.get("judges", []),
            "hearings": raw_case_data.get("hearings", []),
            "acts_and_sections": raw_case_data.get("actsAndSections", []),
            "orders": raw_case_data.get("interimOrders", []),
            "judgments": raw_case_data.get("judgmentOrders", []),
            "latest_order_analysis": raw_case_data.get("latestOrderAnalysis"),
            "case_ai_analysis": raw_case_data.get("caseAiAnalysis", {}),
        }
        
        return formatted
        
    except Exception as e:
        logger.error(f"Error formatting case summary: {str(e)}")
        return raw_case_data
