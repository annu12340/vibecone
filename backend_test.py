#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for LexAI Legal Intelligence System - Reward System
Tests the complete reward system flow including fine management, prisoner management, 
behavior tracking, and lottery system.
"""

import requests
import json
import sys
from datetime import datetime, timezone
from typing import Dict, List, Any

# Configuration
BASE_URL = "https://ecourts-dashboard.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        self.warnings = []
    
    def log_pass(self, test_name: str):
        self.passed += 1
        print(f"✅ PASS: {test_name}")
    
    def log_fail(self, test_name: str, error: str):
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
        print(f"❌ FAIL: {test_name} - {error}")
    
    def log_warning(self, test_name: str, warning: str):
        self.warnings.append(f"{test_name}: {warning}")
        print(f"⚠️  WARNING: {test_name} - {warning}")
    
    def summary(self):
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY")
        print(f"{'='*60}")
        print(f"✅ Passed: {self.passed}")
        print(f"❌ Failed: {self.failed}")
        print(f"⚠️  Warnings: {len(self.warnings)}")
        
        if self.errors:
            print(f"\n🔴 CRITICAL ERRORS:")
            for error in self.errors:
                print(f"  - {error}")
        
        if self.warnings:
            print(f"\n🟡 WARNINGS:")
            for warning in self.warnings:
                print(f"  - {warning}")
        
        return self.failed == 0

def make_request(method: str, endpoint: str, data: Dict = None) -> Dict:
    """Make HTTP request and return response data"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=HEADERS, timeout=30)
        elif method.upper() == "POST":
            response = requests.post(url, headers=HEADERS, json=data, timeout=30)
        elif method.upper() == "PUT":
            response = requests.put(url, headers=HEADERS, json=data, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Request failed: {str(e)}")

def test_api_health(results: TestResults):
    """Test basic API connectivity"""
    print(f"\n{'='*60}")
    print("🔍 TESTING API HEALTH")
    print(f"{'='*60}")
    
    try:
        response = make_request("GET", "/")
        if "Legal Intelligence System API" in response.get("message", ""):
            results.log_pass("API Health Check")
            return True
        else:
            results.log_fail("API Health Check", "Unexpected response format")
            return False
    except Exception as e:
        results.log_fail("API Health Check", str(e))
        return False

def test_fine_management(results: TestResults) -> Dict:
    """Test fine management APIs"""
    print(f"\n{'='*60}")
    print("💰 TESTING FINE MANAGEMENT")
    print(f"{'='*60}")
    
    test_data = {}
    
    # First, get a case ID for testing
    try:
        cases = make_request("GET", "/cases")
        if not cases:
            results.log_fail("Get Cases for Fine Testing", "No cases available for testing")
            return test_data
        
        case_id = cases[0]["id"]
        case_title = cases[0]["title"]
        results.log_pass("Get Cases for Fine Testing")
        test_data["case_id"] = case_id
        test_data["case_title"] = case_title
    except Exception as e:
        results.log_fail("Get Cases for Fine Testing", str(e))
        return test_data
    
    # Test creating a fine
    try:
        fine_data = {
            "case_id": case_id,
            "case_title": case_title,
            "convicted_party": "John Doe",
            "amount": 100000.0,
            "description": "Test fine for reward system testing"
        }
        
        fine_response = make_request("POST", "/fines", fine_data)
        
        # Verify fine creation
        if fine_response.get("id") and fine_response.get("amount") == 100000.0:
            results.log_pass("Create Fine")
            test_data["fine_id"] = fine_response["id"]
            
            # Verify allocation calculation (30% reward fund, 70% government)
            allocation = fine_response.get("allocation", {})
            expected_reward = 100000.0 * 0.30  # 30000
            expected_government = 100000.0 * 0.70  # 70000
            
            if (allocation.get("reward_fund") == expected_reward and 
                allocation.get("government") == expected_government):
                results.log_pass("Fine Allocation Calculation (30/70 split)")
            else:
                results.log_fail("Fine Allocation Calculation", 
                    f"Expected reward_fund: {expected_reward}, government: {expected_government}, "
                    f"Got reward_fund: {allocation.get('reward_fund')}, government: {allocation.get('government')}")
        else:
            results.log_fail("Create Fine", "Invalid response format or amount")
    except Exception as e:
        results.log_fail("Create Fine", str(e))
    
    # Test reward fund status update
    try:
        fund_status = make_request("GET", "/reward-fund/status")
        if fund_status.get("total_balance") >= 30000:
            results.log_pass("Reward Fund Balance Update")
            test_data["initial_fund_balance"] = fund_status["total_balance"]
        else:
            results.log_fail("Reward Fund Balance Update", 
                f"Expected balance >= 30000, got {fund_status.get('total_balance')}")
    except Exception as e:
        results.log_fail("Reward Fund Balance Update", str(e))
    
    # Test getting all fines
    try:
        fines = make_request("GET", "/fines")
        if isinstance(fines, list) and len(fines) > 0:
            results.log_pass("Get All Fines")
        else:
            results.log_fail("Get All Fines", "No fines returned or invalid format")
    except Exception as e:
        results.log_fail("Get All Fines", str(e))
    
    return test_data

def test_prisoner_management(results: TestResults) -> Dict:
    """Test prisoner management APIs"""
    print(f"\n{'='*60}")
    print("👤 TESTING PRISONER MANAGEMENT")
    print(f"{'='*60}")
    
    test_data = {"prisoner_ids": []}
    
    # Create 4 test prisoners
    prisoners_data = [
        {
            "name": "Test Prisoner 1",
            "prisoner_id_number": "PID-001",
            "admission_date": "2023-01-15"
        },
        {
            "name": "Test Prisoner 2", 
            "prisoner_id_number": "PID-002",
            "admission_date": "2023-03-20"
        },
        {
            "name": "Test Prisoner 3",
            "prisoner_id_number": "PID-003", 
            "admission_date": "2023-06-10"
        },
        {
            "name": "Test Prisoner 4",
            "prisoner_id_number": "PID-004",
            "admission_date": "2023-08-05"
        }
    ]
    
    # Create prisoners
    for i, prisoner_data in enumerate(prisoners_data, 1):
        try:
            prisoner_response = make_request("POST", "/prisoners", prisoner_data)
            if prisoner_response.get("id"):
                results.log_pass(f"Create Prisoner {i}")
                test_data["prisoner_ids"].append(prisoner_response["id"])
            else:
                results.log_fail(f"Create Prisoner {i}", "No ID returned")
        except Exception as e:
            results.log_fail(f"Create Prisoner {i}", str(e))
    
    # Test getting all prisoners
    try:
        all_prisoners = make_request("GET", "/prisoners")
        if isinstance(all_prisoners, list) and len(all_prisoners) >= 4:
            results.log_pass("Get All Prisoners")
        else:
            results.log_fail("Get All Prisoners", f"Expected >= 4 prisoners, got {len(all_prisoners) if isinstance(all_prisoners, list) else 0}")
    except Exception as e:
        results.log_fail("Get All Prisoners", str(e))
    
    # Test filtering by status
    try:
        imprisoned_prisoners = make_request("GET", "/prisoners?status=imprisoned")
        if isinstance(imprisoned_prisoners, list):
            results.log_pass("Filter Prisoners by Status")
        else:
            results.log_fail("Filter Prisoners by Status", "Invalid response format")
    except Exception as e:
        results.log_fail("Filter Prisoners by Status", str(e))
    
    return test_data

def test_behavior_tracking(results: TestResults, prisoner_ids: List[str]):
    """Test behavior tracking APIs"""
    print(f"\n{'='*60}")
    print("📝 TESTING BEHAVIOR TRACKING")
    print(f"{'='*60}")
    
    if len(prisoner_ids) < 3:
        results.log_fail("Behavior Tracking Setup", "Not enough prisoners for testing")
        return
    
    # Add positive behavior records for first 3 prisoners
    for i, prisoner_id in enumerate(prisoner_ids[:3], 1):
        try:
            behavior_data = {
                "recorded_by": "Test Jailer",
                "description": f"Excellent behavior during work duty - Prisoner {i}",
                "type": "positive"
            }
            
            behavior_response = make_request("POST", f"/prisoners/{prisoner_id}/behavior", behavior_data)
            if "message" in behavior_response and "record" in behavior_response:
                results.log_pass(f"Add Positive Behavior Record - Prisoner {i}")
            else:
                results.log_fail(f"Add Positive Behavior Record - Prisoner {i}", "Invalid response format")
        except Exception as e:
            results.log_fail(f"Add Positive Behavior Record - Prisoner {i}", str(e))
    
    # Verify behavior records are stored
    for i, prisoner_id in enumerate(prisoner_ids[:3], 1):
        try:
            prisoner = make_request("GET", f"/prisoners/{prisoner_id}")
            behavior_records = prisoner.get("behavior_records", [])
            if len(behavior_records) > 0:
                results.log_pass(f"Verify Behavior Record Storage - Prisoner {i}")
            else:
                results.log_fail(f"Verify Behavior Record Storage - Prisoner {i}", "No behavior records found")
        except Exception as e:
            results.log_fail(f"Verify Behavior Record Storage - Prisoner {i}", str(e))

def test_release_and_certification(results: TestResults, prisoner_ids: List[str]):
    """Test prisoner release and certification"""
    print(f"\n{'='*60}")
    print("🔓 TESTING RELEASE AND CERTIFICATION")
    print(f"{'='*60}")
    
    if len(prisoner_ids) < 3:
        results.log_fail("Release and Certification Setup", "Not enough prisoners for testing")
        return
    
    current_date = datetime.now(timezone.utc).isoformat()
    
    # Release first 3 prisoners
    for i, prisoner_id in enumerate(prisoner_ids[:3], 1):
        try:
            release_data = {
                "status": "released",
                "actual_release_date": current_date
            }
            
            release_response = make_request("PUT", f"/prisoners/{prisoner_id}", release_data)
            if release_response.get("status") == "released":
                results.log_pass(f"Release Prisoner {i}")
            else:
                results.log_fail(f"Release Prisoner {i}", f"Status not updated, got: {release_response.get('status')}")
        except Exception as e:
            results.log_fail(f"Release Prisoner {i}", str(e))
    
    # Certify good behavior for first 3 prisoners
    for i, prisoner_id in enumerate(prisoner_ids[:3], 1):
        try:
            cert_response = make_request("PUT", f"/prisoners/{prisoner_id}/certify")
            if "message" in cert_response and "certified" in cert_response["message"]:
                results.log_pass(f"Certify Good Behavior - Prisoner {i}")
            else:
                results.log_fail(f"Certify Good Behavior - Prisoner {i}", "Invalid response format")
        except Exception as e:
            results.log_fail(f"Certify Good Behavior - Prisoner {i}", str(e))
    
    # Verify eligible prisoners
    try:
        eligible = make_request("GET", "/prisoners/eligible")
        if isinstance(eligible, list) and len(eligible) >= 3:
            results.log_pass("Get Eligible Prisoners")
            print(f"   Found {len(eligible)} eligible prisoners")
        else:
            results.log_fail("Get Eligible Prisoners", f"Expected >= 3 eligible prisoners, got {len(eligible) if isinstance(eligible, list) else 0}")
    except Exception as e:
        results.log_fail("Get Eligible Prisoners", str(e))

def test_lottery_system(results: TestResults, initial_balance: float):
    """Test the lottery system - CRITICAL TEST"""
    print(f"\n{'='*60}")
    print("🎰 TESTING LOTTERY SYSTEM (CRITICAL)")
    print(f"{'='*60}")
    
    # Check fund balance before lottery
    try:
        fund_before = make_request("GET", "/reward-fund/status")
        balance_before = fund_before.get("total_balance", 0)
        print(f"   Fund balance before lottery: ${balance_before:,.2f}")
        
        if balance_before <= 0:
            results.log_fail("Lottery Pre-check", "Insufficient fund balance for lottery")
            return
        
        results.log_pass("Lottery Pre-check - Fund Balance")
    except Exception as e:
        results.log_fail("Lottery Pre-check", str(e))
        return
    
    # Run the lottery
    try:
        lottery_response = make_request("POST", "/reward-distributions/lottery")
        
        # Verify lottery response structure
        required_fields = ["selected_prisoners", "amount_per_prisoner", "amount_distributed", "fund_balance_before"]
        missing_fields = [field for field in required_fields if field not in lottery_response]
        
        if missing_fields:
            results.log_fail("Lottery Response Structure", f"Missing fields: {missing_fields}")
            return
        
        selected_prisoners = lottery_response["selected_prisoners"]
        amount_per_prisoner = lottery_response["amount_per_prisoner"]
        amount_distributed = lottery_response["amount_distributed"]
        fund_balance_before = lottery_response["fund_balance_before"]
        
        # Verify exactly 3 prisoners selected
        if len(selected_prisoners) == 3:
            results.log_pass("Lottery - 3 Prisoners Selected")
        else:
            results.log_fail("Lottery - 3 Prisoners Selected", f"Expected 3, got {len(selected_prisoners)}")
        
        # Verify equal distribution calculation
        expected_per_prisoner = fund_balance_before / 3
        if abs(amount_per_prisoner - expected_per_prisoner) < 0.01:  # Allow for floating point precision
            results.log_pass("Lottery - Equal Distribution Calculation")
        else:
            results.log_fail("Lottery - Equal Distribution Calculation", 
                f"Expected {expected_per_prisoner:.2f} per prisoner, got {amount_per_prisoner:.2f}")
        
        # Verify total distribution equals fund balance
        if abs(amount_distributed - fund_balance_before) < 0.01:
            results.log_pass("Lottery - Total Distribution Amount")
        else:
            results.log_fail("Lottery - Total Distribution Amount",
                f"Expected {fund_balance_before:.2f}, got {amount_distributed:.2f}")
        
        results.log_pass("Run Lottery")
        print(f"   Selected {len(selected_prisoners)} prisoners")
        print(f"   Amount per prisoner: ${amount_per_prisoner:,.2f}")
        print(f"   Total distributed: ${amount_distributed:,.2f}")
        
    except Exception as e:
        results.log_fail("Run Lottery", str(e))
        return
    
    # Verify fund balance reset to 0
    try:
        fund_after = make_request("GET", "/reward-fund/status")
        balance_after = fund_after.get("total_balance", -1)
        
        if balance_after == 0.0:
            results.log_pass("Lottery - Fund Balance Reset to 0")
        else:
            results.log_fail("Lottery - Fund Balance Reset to 0", f"Expected 0, got {balance_after}")
    except Exception as e:
        results.log_fail("Lottery - Fund Balance Reset", str(e))
    
    # Verify eligible prisoners list is now empty (all marked as rewarded)
    try:
        eligible_after = make_request("GET", "/prisoners/eligible")
        if isinstance(eligible_after, list) and len(eligible_after) == 0:
            results.log_pass("Lottery - Eligible Prisoners Marked as Rewarded")
        else:
            results.log_fail("Lottery - Eligible Prisoners Marked as Rewarded", 
                f"Expected 0 eligible prisoners, got {len(eligible_after) if isinstance(eligible_after, list) else 'invalid'}")
    except Exception as e:
        results.log_fail("Lottery - Eligible Prisoners Check", str(e))
    
    # Verify distribution was recorded
    try:
        distributions = make_request("GET", "/reward-distributions")
        if isinstance(distributions, list) and len(distributions) > 0:
            results.log_pass("Lottery - Distribution History Recorded")
        else:
            results.log_fail("Lottery - Distribution History Recorded", "No distributions found")
    except Exception as e:
        results.log_fail("Lottery - Distribution History Check", str(e))

def test_error_handling(results: TestResults):
    """Test error handling scenarios"""
    print(f"\n{'='*60}")
    print("⚠️  TESTING ERROR HANDLING")
    print(f"{'='*60}")
    
    # Try to run lottery again (should fail - not enough eligible prisoners)
    try:
        lottery_response = make_request("POST", "/reward-distributions/lottery")
        results.log_fail("Lottery Error Handling", "Expected error but lottery succeeded")
    except Exception as e:
        if "Not enough eligible prisoners" in str(e) or "400" in str(e):
            results.log_pass("Lottery Error Handling - Insufficient Eligible Prisoners")
        else:
            results.log_fail("Lottery Error Handling", f"Unexpected error: {str(e)}")

def main():
    """Main test execution"""
    print("🚀 Starting LexAI Reward System Backend API Tests")
    print(f"Testing against: {BASE_URL}")
    
    results = TestResults()
    
    # Test API health first
    if not test_api_health(results):
        print("❌ API health check failed. Aborting tests.")
        return False
    
    # Test fine management
    fine_data = test_fine_management(results)
    
    # Test prisoner management
    prisoner_data = test_prisoner_management(results)
    
    # Test behavior tracking
    if prisoner_data.get("prisoner_ids"):
        test_behavior_tracking(results, prisoner_data["prisoner_ids"])
        
        # Test release and certification
        test_release_and_certification(results, prisoner_data["prisoner_ids"])
        
        # Test lottery system
        initial_balance = fine_data.get("initial_fund_balance", 0)
        if initial_balance > 0:
            test_lottery_system(results, initial_balance)
        else:
            results.log_fail("Lottery System Test", "No initial fund balance available")
        
        # Test error handling
        test_error_handling(results)
    else:
        results.log_fail("Prisoner Management Setup", "No prisoners created for subsequent tests")
    
    # Print final summary
    success = results.summary()
    
    if success:
        print(f"\n🎉 ALL TESTS PASSED! Reward system is working correctly.")
    else:
        print(f"\n💥 SOME TESTS FAILED! Please review the errors above.")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)