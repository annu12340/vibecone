#!/usr/bin/env python3
"""
Backend API Testing for Legal Intelligence System - Precedent Family Tree Feature
Tests the GET /api/cases/{case_id}/analysis endpoint for proper precedent case data
"""

import asyncio
import aiohttp
import json
import sys
from typing import Dict, List, Any

# Backend URL from frontend .env
BACKEND_URL = "https://legal-dna-tree.preview.emergentagent.com"
TEST_CASE_ID = "361cc188-6864-4982-8c1a-6a538d71a30e"

class BackendTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "details": details
        })
    
    async def test_api_health(self):
        """Test basic API connectivity"""
        try:
            async with self.session.get(f"{BACKEND_URL}/api/") as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test("API Health Check", True, f"API version: {data.get('version', 'unknown')}")
                    return True
                else:
                    self.log_test("API Health Check", False, f"Status: {response.status}")
                    return False
        except Exception as e:
            self.log_test("API Health Check", False, f"Connection error: {str(e)}")
            return False
    
    async def test_case_exists(self, case_id: str):
        """Test if the specific case exists"""
        try:
            async with self.session.get(f"{BACKEND_URL}/api/cases/{case_id}") as response:
                if response.status == 200:
                    case_data = await response.json()
                    self.log_test("Case Exists", True, f"Case title: {case_data.get('title', 'Unknown')}")
                    return True, case_data
                elif response.status == 404:
                    self.log_test("Case Exists", False, "Case not found - need to create test case")
                    return False, None
                else:
                    self.log_test("Case Exists", False, f"Unexpected status: {response.status}")
                    return False, None
        except Exception as e:
            self.log_test("Case Exists", False, f"Error: {str(e)}")
            return False, None
    
    async def create_test_case(self, case_id: str):
        """Create a test case for analysis"""
        test_case = {
            "title": "State v. Rajesh Kumar - Murder Case",
            "description": "A complex murder case involving domestic violence, dowry harassment, and premeditated killing. The defendant Rajesh Kumar is accused of murdering his wife Priya Kumar after a history of domestic abuse. The case involves IPC Section 302 (murder), 498A (dowry harassment), and 506 (criminal intimidation). Key evidence includes witness testimonies from neighbors, medical reports showing previous injuries, and digital evidence from the victim's phone showing threats.",
            "case_type": "criminal",
            "jurisdiction": "Delhi High Court",
            "judge_name": "Justice Meera Sharma",
            "charges": ["IPC Section 302 - Murder", "IPC Section 498A - Dowry Harassment", "IPC Section 506 - Criminal Intimidation"],
            "defendant_demographics": {
                "age": "32",
                "gender": "Male",
                "caste": "General",
                "religion": "Hindu",
                "economic_status": "Middle Class",
                "education": "Graduate",
                "occupation": "Software Engineer"
            }
        }
        
        try:
            async with self.session.post(f"{BACKEND_URL}/api/cases", json=test_case) as response:
                if response.status == 200:
                    created_case = await response.json()
                    # Update the case with our specific ID
                    if created_case.get('id') != case_id:
                        print(f"Note: Created case has ID {created_case.get('id')}, but we need {case_id}")
                    self.log_test("Create Test Case", True, f"Created case: {created_case.get('title')}")
                    return True, created_case
                else:
                    self.log_test("Create Test Case", False, f"Status: {response.status}")
                    return False, None
        except Exception as e:
            self.log_test("Create Test Case", False, f"Error: {str(e)}")
            return False, None
    
    async def start_analysis(self, case_id: str):
        """Start analysis for the case"""
        try:
            async with self.session.post(f"{BACKEND_URL}/api/cases/{case_id}/analyze") as response:
                if response.status == 200:
                    result = await response.json()
                    self.log_test("Start Analysis", True, result.get('message', 'Analysis started'))
                    return True
                else:
                    self.log_test("Start Analysis", False, f"Status: {response.status}")
                    return False
        except Exception as e:
            self.log_test("Start Analysis", False, f"Error: {str(e)}")
            return False
    
    async def wait_for_analysis_completion(self, case_id: str, max_wait_seconds: int = 120):
        """Wait for analysis to complete"""
        print(f"Waiting for analysis to complete (max {max_wait_seconds}s)...")
        
        for attempt in range(max_wait_seconds // 5):
            try:
                async with self.session.get(f"{BACKEND_URL}/api/cases/{case_id}/analysis") as response:
                    if response.status == 200:
                        analysis = await response.json()
                        status = analysis.get('status', 'unknown')
                        stage = analysis.get('stage', 0)
                        
                        print(f"  Attempt {attempt + 1}: Status={status}, Stage={stage}")
                        
                        if status == 'complete':
                            self.log_test("Analysis Completion", True, f"Completed in stage {stage}")
                            return True, analysis
                        elif status == 'failed':
                            self.log_test("Analysis Completion", False, f"Analysis failed: {analysis.get('error', 'Unknown error')}")
                            return False, analysis
                        
                        # Wait 5 seconds before next check
                        await asyncio.sleep(5)
                    else:
                        print(f"  Error checking analysis status: {response.status}")
                        await asyncio.sleep(5)
            except Exception as e:
                print(f"  Error during wait: {str(e)}")
                await asyncio.sleep(5)
        
        self.log_test("Analysis Completion", False, f"Timeout after {max_wait_seconds}s")
        return False, None
    
    async def test_precedent_cases_structure(self, case_id: str):
        """Test the main endpoint for precedent cases structure"""
        try:
            async with self.session.get(f"{BACKEND_URL}/api/cases/{case_id}/analysis") as response:
                if response.status != 200:
                    self.log_test("GET Analysis Endpoint", False, f"Status: {response.status}")
                    return False, None
                
                analysis = await response.json()
                self.log_test("GET Analysis Endpoint", True, "Successfully retrieved analysis")
                
                # Check if similar_cases exists
                similar_cases = analysis.get('similar_cases', [])
                if not similar_cases:
                    self.log_test("Similar Cases Array", False, "No similar_cases array found")
                    return False, analysis
                
                self.log_test("Similar Cases Array", True, f"Found {len(similar_cases)} similar cases")
                
                # Test each case structure
                valid_cases = 0
                for i, case in enumerate(similar_cases):
                    case_valid = self.validate_case_structure(case, i)
                    if case_valid:
                        valid_cases += 1
                
                if valid_cases == len(similar_cases):
                    self.log_test("Case Structure Validation", True, f"All {valid_cases} cases have valid structure")
                else:
                    self.log_test("Case Structure Validation", False, f"Only {valid_cases}/{len(similar_cases)} cases have valid structure")
                
                return True, analysis
                
        except Exception as e:
            self.log_test("GET Analysis Endpoint", False, f"Error: {str(e)}")
            return False, None
    
    def validate_case_structure(self, case: Dict[str, Any], index: int) -> bool:
        """Validate individual case structure"""
        required_fields = ['id', 'case_name', 'court', 'year', 'outcome', 'relevance', 'importance_score', 'is_landmark', 'cites', 'influenced_by', 'overturned_by']
        
        missing_fields = []
        for field in required_fields:
            if field not in case:
                missing_fields.append(field)
        
        if missing_fields:
            self.log_test(f"Case {index + 1} Required Fields", False, f"Missing: {', '.join(missing_fields)}")
            return False
        
        # Validate field types and values
        validation_errors = []
        
        # Check importance_score range
        importance_score = case.get('importance_score')
        if not isinstance(importance_score, (int, float)) or not (0 <= importance_score <= 100):
            validation_errors.append(f"importance_score should be 0-100, got {importance_score}")
        
        # Check is_landmark is boolean
        if not isinstance(case.get('is_landmark'), bool):
            validation_errors.append(f"is_landmark should be boolean, got {type(case.get('is_landmark'))}")
        
        # Check cites is array
        if not isinstance(case.get('cites'), list):
            validation_errors.append(f"cites should be array, got {type(case.get('cites'))}")
        
        # Check influenced_by is array
        if not isinstance(case.get('influenced_by'), list):
            validation_errors.append(f"influenced_by should be array, got {type(case.get('influenced_by'))}")
        
        # Check overturned_by is string or null
        overturned_by = case.get('overturned_by')
        if overturned_by is not None and not isinstance(overturned_by, str):
            validation_errors.append(f"overturned_by should be string or null, got {type(overturned_by)}")
        
        if validation_errors:
            self.log_test(f"Case {index + 1} Field Validation", False, "; ".join(validation_errors))
            return False
        
        self.log_test(f"Case {index + 1} Structure", True, f"Valid: {case.get('case_name', 'Unknown')}")
        return True
    
    def test_citation_relationships(self, similar_cases: List[Dict[str, Any]]):
        """Test citation relationships between cases"""
        case_ids = {case.get('id') for case in similar_cases}
        
        # Check for citation relationships
        has_cites = any(case.get('cites') for case in similar_cases)
        has_influenced_by = any(case.get('influenced_by') for case in similar_cases)
        has_landmark = any(case.get('is_landmark') for case in similar_cases)
        
        self.log_test("Cases Have Citations", has_cites, f"Found cases with 'cites' relationships" if has_cites else "No citation relationships found")
        self.log_test("Cases Have Influenced By", has_influenced_by, f"Found cases with 'influenced_by' relationships" if has_influenced_by else "No influence relationships found")
        self.log_test("Landmark Cases Present", has_landmark, f"Found landmark cases" if has_landmark else "No landmark cases found")
        
        # Validate citation references point to valid case IDs
        invalid_citations = []
        for case in similar_cases:
            case_name = case.get('case_name', 'Unknown')
            
            # Check cites references
            for cited_id in case.get('cites', []):
                if cited_id not in case_ids:
                    invalid_citations.append(f"{case_name} cites invalid ID: {cited_id}")
            
            # Check influenced_by references
            for influenced_id in case.get('influenced_by', []):
                if influenced_id not in case_ids:
                    invalid_citations.append(f"{case_name} influenced_by invalid ID: {influenced_id}")
            
            # Check overturned_by reference
            overturned_by = case.get('overturned_by')
            if overturned_by and overturned_by not in case_ids:
                invalid_citations.append(f"{case_name} overturned_by invalid ID: {overturned_by}")
        
        if invalid_citations:
            self.log_test("Citation Reference Validation", False, "; ".join(invalid_citations))
        else:
            self.log_test("Citation Reference Validation", True, "All citation references point to valid case IDs")
    
    def print_summary(self):
        """Print test summary"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['passed'])
        failed_tests = total_tests - passed_tests
        
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\nFAILED TESTS:")
            for result in self.test_results:
                if not result['passed']:
                    print(f"❌ {result['test']}: {result['details']}")
        
        return failed_tests == 0

async def main():
    """Main test execution"""
    print("Starting Backend API Tests for Precedent Family Tree Feature")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Case ID: {TEST_CASE_ID}")
    print("="*60)
    
    async with BackendTester() as tester:
        # Test 1: API Health
        api_healthy = await tester.test_api_health()
        if not api_healthy:
            print("❌ API is not accessible. Stopping tests.")
            return False
        
        # Test 2: Check if case exists
        case_exists, case_data = await tester.test_case_exists(TEST_CASE_ID)
        
        # Test 3: Create case if it doesn't exist
        if not case_exists:
            print(f"\nCase {TEST_CASE_ID} not found. Creating test case...")
            created, case_data = await tester.create_test_case(TEST_CASE_ID)
            if not created:
                print("❌ Could not create test case. Stopping tests.")
                return False
            
            # Use the created case ID for further tests
            actual_case_id = case_data.get('id', TEST_CASE_ID)
            print(f"Using case ID: {actual_case_id}")
        else:
            actual_case_id = TEST_CASE_ID
        
        # Test 4: Start analysis
        analysis_started = await tester.start_analysis(actual_case_id)
        if not analysis_started:
            print("❌ Could not start analysis. Stopping tests.")
            return False
        
        # Test 5: Wait for analysis completion
        analysis_complete, analysis_data = await tester.wait_for_analysis_completion(actual_case_id)
        if not analysis_complete:
            print("❌ Analysis did not complete successfully.")
            return False
        
        # Test 6: Test precedent cases structure
        structure_valid, final_analysis = await tester.test_precedent_cases_structure(actual_case_id)
        if not structure_valid:
            return False
        
        # Test 7: Test citation relationships
        similar_cases = final_analysis.get('similar_cases', [])
        if similar_cases:
            tester.test_citation_relationships(similar_cases)
        
        # Print summary
        return tester.print_summary()

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n❌ Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Test execution failed: {str(e)}")
        sys.exit(1)