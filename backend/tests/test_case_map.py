"""
Test cases for the Case Map feature - /api/cases/by-state endpoint
Tests the geographic distribution of cases across Indian states
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestCaseMapEndpoint:
    """Tests for GET /api/cases/by-state endpoint"""
    
    def test_cases_by_state_returns_200(self):
        """Test that the endpoint returns 200 status"""
        response = requests.get(f"{BASE_URL}/api/cases/by-state")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/cases/by-state returns 200")
    
    def test_cases_by_state_returns_states_object(self):
        """Test that response contains 'states' key with dict value"""
        response = requests.get(f"{BASE_URL}/api/cases/by-state")
        assert response.status_code == 200
        
        data = response.json()
        assert "states" in data, "Response should contain 'states' key"
        assert isinstance(data["states"], dict), "'states' should be a dictionary"
        print(f"✓ Response contains 'states' object with {len(data['states'])} states")
    
    def test_delhi_has_cases(self):
        """Test that Delhi state has cases (should have the most)"""
        response = requests.get(f"{BASE_URL}/api/cases/by-state")
        assert response.status_code == 200
        
        data = response.json()
        states = data.get("states", {})
        
        assert "Delhi" in states, "Delhi should be in states"
        delhi_cases = states["Delhi"]
        assert len(delhi_cases) > 0, "Delhi should have at least one case"
        print(f"✓ Delhi has {len(delhi_cases)} cases")
    
    def test_case_structure_filed_cases(self):
        """Test that filed cases have correct structure"""
        response = requests.get(f"{BASE_URL}/api/cases/by-state")
        assert response.status_code == 200
        
        data = response.json()
        states = data.get("states", {})
        
        # Find a filed case
        filed_case = None
        for state, cases in states.items():
            for case in cases:
                if case.get("source") == "filed":
                    filed_case = case
                    break
            if filed_case:
                break
        
        if filed_case:
            # Check required fields for filed cases
            assert "title" in filed_case, "Filed case should have 'title'"
            assert "source" in filed_case, "Filed case should have 'source'"
            assert filed_case["source"] == "filed", "Source should be 'filed'"
            assert "jurisdiction" in filed_case, "Filed case should have 'jurisdiction'"
            assert "status" in filed_case, "Filed case should have 'status'"
            print(f"✓ Filed case structure is correct: {filed_case.get('title', 'Unknown')[:50]}...")
        else:
            pytest.skip("No filed cases found to test structure")
    
    def test_case_structure_similar_cases(self):
        """Test that similar/precedent cases have correct structure"""
        response = requests.get(f"{BASE_URL}/api/cases/by-state")
        assert response.status_code == 200
        
        data = response.json()
        states = data.get("states", {})
        
        # Find a similar case
        similar_case = None
        for state, cases in states.items():
            for case in cases:
                if case.get("source") == "similar":
                    similar_case = case
                    break
            if similar_case:
                break
        
        if similar_case:
            # Check required fields for similar cases
            assert "title" in similar_case, "Similar case should have 'title'"
            assert "source" in similar_case, "Similar case should have 'source'"
            assert similar_case["source"] == "similar", "Source should be 'similar'"
            print(f"✓ Similar case structure is correct: {similar_case.get('title', 'Unknown')[:50]}...")
        else:
            pytest.skip("No similar cases found to test structure")
    
    def test_state_names_are_valid_indian_states(self):
        """Test that state names are valid Indian states"""
        valid_states = {
            "Jammu & Kashmir", "Himachal Pradesh", "Punjab", "Uttarakhand",
            "Haryana", "Delhi", "Rajasthan", "Uttar Pradesh", "Bihar",
            "Sikkim", "Assam", "Arunachal Pradesh", "Nagaland", "Manipur",
            "Mizoram", "Tripura", "Meghalaya", "West Bengal", "Jharkhand",
            "Odisha", "Chhattisgarh", "Madhya Pradesh", "Gujarat",
            "Maharashtra", "Goa", "Karnataka", "Telangana", "Andhra Pradesh",
            "Tamil Nadu", "Kerala"
        }
        
        response = requests.get(f"{BASE_URL}/api/cases/by-state")
        assert response.status_code == 200
        
        data = response.json()
        states = data.get("states", {})
        
        for state_name in states.keys():
            assert state_name in valid_states, f"'{state_name}' is not a valid Indian state"
        
        print(f"✓ All {len(states)} state names are valid Indian states")
    
    def test_no_duplicate_cases_per_state(self):
        """Test that cases are deduplicated within each state"""
        response = requests.get(f"{BASE_URL}/api/cases/by-state")
        assert response.status_code == 200
        
        data = response.json()
        states = data.get("states", {})
        
        for state_name, cases in states.items():
            titles = [c.get("title", "") for c in cases]
            unique_titles = set(titles)
            assert len(titles) == len(unique_titles), f"Duplicate cases found in {state_name}"
        
        print("✓ No duplicate cases found in any state")


class TestExistingEndpoints:
    """Verify existing endpoints still work after Case Map feature addition"""
    
    def test_root_endpoint(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("✓ GET /api/ returns 200")
    
    def test_cases_list_endpoint(self):
        """Test cases list endpoint"""
        response = requests.get(f"{BASE_URL}/api/cases")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/cases returns {len(data)} cases")
    
    def test_judges_endpoint(self):
        """Test judges list endpoint"""
        response = requests.get(f"{BASE_URL}/api/judges")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/judges returns {len(data)} judges")
    
    def test_laws_endpoint(self):
        """Test laws list endpoint"""
        response = requests.get(f"{BASE_URL}/api/laws")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/laws returns {len(data)} laws")
    
    def test_case_by_id_route_order(self):
        """Test that /api/cases/{case_id} still works (route order check)"""
        # First get a case ID from the list
        response = requests.get(f"{BASE_URL}/api/cases")
        assert response.status_code == 200
        cases = response.json()
        
        if cases:
            case_id = cases[0].get("id")
            response = requests.get(f"{BASE_URL}/api/cases/{case_id}")
            assert response.status_code == 200
            data = response.json()
            assert data.get("id") == case_id
            print(f"✓ GET /api/cases/{{case_id}} works correctly (route order OK)")
        else:
            pytest.skip("No cases available to test")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
