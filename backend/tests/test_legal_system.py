"""Backend tests for Legal Intelligence System API"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestHealthAndSeed:
    """Health check and seed data tests"""

    def test_api_root(self):
        res = requests.get(f"{BASE_URL}/api/")
        assert res.status_code == 200
        data = res.json()
        assert "Legal Intelligence" in data.get("message", "")

    def test_get_judges_returns_6(self):
        res = requests.get(f"{BASE_URL}/api/judges")
        assert res.status_code == 200
        judges = res.json()
        assert isinstance(judges, list)
        assert len(judges) == 6, f"Expected 6 judges, got {len(judges)}"

    def test_get_laws_returns_15(self):
        res = requests.get(f"{BASE_URL}/api/laws")
        assert res.status_code == 200
        laws = res.json()
        assert isinstance(laws, list)
        assert len(laws) == 15, f"Expected 15 laws, got {len(laws)}"

    def test_get_judges_fields(self):
        res = requests.get(f"{BASE_URL}/api/judges")
        judges = res.json()
        judge = judges[0]
        assert "id" in judge
        assert "name" in judge
        assert "bias_score" in judge
        assert "_id" not in judge  # MongoDB _id should be excluded


class TestCaseCRUD:
    """Case CRUD tests"""

    def test_create_case(self):
        payload = {
            "title": "TEST_State v. Johnson - Drug Possession",
            "description": "Defendant charged with possession of controlled substance",
            "case_type": "criminal",
            "jurisdiction": "Federal US",
            "judge_name": "Judge Thompson",
            "charges": ["Drug Possession", "Intent to Distribute"],
            "defendant_demographics": {"race": "Black", "age": "32", "gender": "Male"}
        }
        res = requests.post(f"{BASE_URL}/api/cases", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "id" in data
        assert data["title"] == payload["title"]
        assert data["status"] == "pending"
        assert "_id" not in data
        # Store for next test
        TestCaseCRUD.created_case_id = data["id"]

    def test_get_case_by_id(self):
        if not hasattr(TestCaseCRUD, 'created_case_id'):
            pytest.skip("No created case ID")
        res = requests.get(f"{BASE_URL}/api/cases/{TestCaseCRUD.created_case_id}")
        assert res.status_code == 200
        data = res.json()
        assert data["id"] == TestCaseCRUD.created_case_id

    def test_get_cases_list(self):
        res = requests.get(f"{BASE_URL}/api/cases")
        assert res.status_code == 200
        cases = res.json()
        assert isinstance(cases, list)

    def test_get_case_not_found(self):
        res = requests.get(f"{BASE_URL}/api/cases/nonexistent-id")
        assert res.status_code == 404


class TestAnalysis:
    """Analysis flow tests"""

    TEST_CASE_ID = "8349fb86-468a-45b6-8f9a-6cf59c14a608"

    def test_get_analysis_existing_case(self):
        res = requests.get(f"{BASE_URL}/api/cases/{self.TEST_CASE_ID}/analysis")
        assert res.status_code == 200
        data = res.json()
        assert "case_id" in data or "status" in data

    def test_start_analysis(self):
        """Create a new case and start analysis"""
        # Create a fresh case
        payload = {
            "title": "TEST_Analysis Test Case",
            "description": "Test case for analysis flow",
            "case_type": "criminal",
            "jurisdiction": "Federal US",
            "charges": ["Theft"]
        }
        create_res = requests.post(f"{BASE_URL}/api/cases", json=payload)
        assert create_res.status_code == 200
        case_id = create_res.json()["id"]

        # Start analysis
        analyze_res = requests.post(f"{BASE_URL}/api/cases/{case_id}/analyze")
        assert analyze_res.status_code == 200
        data = analyze_res.json()
        assert "Analysis started" in data.get("message", "") or "already in progress" in data.get("message", "")

        # Verify analysis record created
        analysis_res = requests.get(f"{BASE_URL}/api/cases/{case_id}/analysis")
        assert analysis_res.status_code == 200
        analysis = analysis_res.json()
        assert analysis["status"] in ["analyzing", "complete"]
        assert "members" in analysis

    def test_analysis_members_structure(self):
        """Check that analysis has correct member structure"""
        # Use existing test case
        res = requests.get(f"{BASE_URL}/api/cases/{self.TEST_CASE_ID}/analysis")
        assert res.status_code == 200
        data = res.json()
        if data.get("status") in ["analyzing", "complete"]:
            members = data.get("members", {})
            assert "prosecution" in members
            assert "defense" in members
            assert "legal_scholar" in members
            assert "bias_detector" in members

    def test_analyze_nonexistent_case(self):
        res = requests.post(f"{BASE_URL}/api/cases/nonexistent-id/analyze")
        assert res.status_code == 404

    def test_laws_filter_by_case_type(self):
        res = requests.get(f"{BASE_URL}/api/laws?case_type=criminal")
        assert res.status_code == 200
        laws = res.json()
        assert isinstance(laws, list)
