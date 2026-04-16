#!/usr/bin/env python3
"""
Script to store eCourts case data into the backend cache.
This is a helper script for the agent to populate eCourts data.
"""

import requests
import json
import os

# Backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')

# Sample eCourts data (this should be replaced with actual data from MCP tool)
ecourts_sample_data = {
    "data": {
        "courtCaseData": {
            "cnr": "DLHC010127602024",
            "caseNumber": "202400000822024",
            "state": "DL",
            "caseType": "FA",
            "caseTypeRaw": "FAO",
            "caseStatus": "PENDING",
            "filingDate": "2024-03-07",
            "registrationNumber": "82/2024",
            "registrationDate": "2024-03-12",
            "courtName": "DLHC",
            "judges": ["DHARMESH SHARMA"],
            "petitioners": ["Hav Narender Singh"],
            "respondents": ["Indian Ex Services League through Its President"],
            "petitionerAdvocates": ["RAKESH DAHIYA"],
            "respondentAdvocates": [],
            "nextHearingDate": "2025-05-26",
            "interimOrders": [
                {"orderDate": "2024-03-13", "orderUrl": "order-1.pdf"},
                {"orderDate": "2024-05-02", "orderUrl": "order-2.pdf"}
            ]
        }
    }
}


def store_ecourts_case(case_data):
    """Store eCourts case data in backend cache"""
    try:
        url = f"{BACKEND_URL}/api/admin/ecourts/store-case"
        
        print(f"Storing eCourts data to: {url}")
        print(f"Case CNR: {case_data.get('data', {}).get('courtCaseData', {}).get('cnr')}")
        
        response = requests.post(url, json=case_data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Successfully stored case: {result.get('cnr')}")
            print(f"  Preview: {result.get('data_preview')}")
            return True
        else:
            print(f"✗ Error: {response.status_code}")
            print(f"  Message: {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Exception: {str(e)}")
        return False


if __name__ == "__main__":
    print("eCourts Data Storage Helper")
    print("=" * 50)
    
    # Store sample data
    success = store_ecourts_case(ecourts_sample_data)
    
    if success:
        print("\n✓ Data stored successfully!")
    else:
        print("\n✗ Failed to store data")
