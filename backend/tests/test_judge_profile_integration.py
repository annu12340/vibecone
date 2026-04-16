"""
Backend tests for Judge Profile Integration feature.
Tests: /api/judges, judge_profile_snapshot in analysis, case analysis flow.
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestJudgesAPI:
    """Tests for GET /api/judges endpoint"""

    def test_get_judges_returns_6(self):
        r = requests.get(f"{BASE_URL}/api/judges")
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 6, f"Expected 6 judges, got {len(data)}"

    def test_judges_have_required_fields(self):
        r = requests.get(f"{BASE_URL}/api/judges")
        assert r.status_code == 200
        for j in r.json():
            assert "name" in j
            assert "id" in j
            assert "court" in j

    def test_judges_includes_hemant_gupta(self):
        r = requests.get(f"{BASE_URL}/api/judges")
        names = [j["name"] for j in r.json()]
        assert "Justice Hemant Gupta" in names

    def test_judges_includes_arun_kumar_mishra(self):
        r = requests.get(f"{BASE_URL}/api/judges")
        names = [j["name"] for j in r.json()]
        assert "Justice Arun Kumar Mishra" in names

    def test_judge_has_report_card_and_bias(self):
        r = requests.get(f"{BASE_URL}/api/judges")
        hemant = next((j for j in r.json() if j.get("name") == "Justice Hemant Gupta"), None)
        assert hemant is not None
        assert "bias_score" in hemant
        assert "bias_risk" in hemant
        assert "report_card" in hemant
        assert hemant["report_card"].get("overall") is not None


class TestJudgeProfileSnapshot:
    """Tests for judge_profile_snapshot in analysis doc"""

    def test_preseeded_case_has_judge_snapshot(self):
        case_id = "418b1705-866e-4a72-863a-a11051dd43d0"
        r = requests.get(f"{BASE_URL}/api/cases/{case_id}/analysis")
        assert r.status_code == 200
        data = r.json()
        snap = data.get("judge_profile_snapshot")
        assert snap is not None, "judge_profile_snapshot missing from analysis"

    def test_snapshot_has_correct_judge_name(self):
        case_id = "418b1705-866e-4a72-863a-a11051dd43d0"
        r = requests.get(f"{BASE_URL}/api/cases/{case_id}/analysis")
        snap = r.json().get("judge_profile_snapshot", {})
        assert snap.get("name") == "Justice Hemant Gupta"

    def test_snapshot_has_required_fields(self):
        case_id = "418b1705-866e-4a72-863a-a11051dd43d0"
        r = requests.get(f"{BASE_URL}/api/cases/{case_id}/analysis")
        snap = r.json().get("judge_profile_snapshot", {})
        required = ["id", "name", "court", "bias_score", "bias_risk"]
        for field in required:
            assert field in snap, f"Missing field: {field}"

    def test_snapshot_report_card_overall(self):
        case_id = "418b1705-866e-4a72-863a-a11051dd43d0"
        r = requests.get(f"{BASE_URL}/api/cases/{case_id}/analysis")
        snap = r.json().get("judge_profile_snapshot", {})
        rc = snap.get("report_card", {})
        assert rc.get("overall") == "D"

    def test_snapshot_temporal_patterns(self):
        case_id = "418b1705-866e-4a72-863a-a11051dd43d0"
        r = requests.get(f"{BASE_URL}/api/cases/{case_id}/analysis")
        snap = r.json().get("judge_profile_snapshot", {})
        tp = snap.get("temporal_patterns", {})
        assert tp.get("monday_effect") is not None
        assert tp.get("lunch_effect") is not None

    def test_snapshot_bias_score_74(self):
        case_id = "418b1705-866e-4a72-863a-a11051dd43d0"
        r = requests.get(f"{BASE_URL}/api/cases/{case_id}/analysis")
        snap = r.json().get("judge_profile_snapshot", {})
        assert snap.get("bias_score") == 74
        assert snap.get("bias_risk") == "high"

    def test_case_without_judge_no_snapshot(self):
        # Case analyzed before judge feature: 8df151be-181c-48bf-bee1-a412d9fecbf5
        case_id = "8df151be-181c-48bf-bee1-a412d9fecbf5"
        r = requests.get(f"{BASE_URL}/api/cases/{case_id}/analysis")
        assert r.status_code == 200
        data = r.json()
        # Should not have judge_profile_snapshot
        snap = data.get("judge_profile_snapshot")
        assert snap is None, f"Expected no snapshot for old case, got: {snap}"


class TestNewCaseWithJudge:
    """Test creating a case with a judge_name and triggering analysis"""

    def test_create_case_with_judge_name(self):
        payload = {
            "title": "TEST_Judge Profile Test Case",
            "description": "Testing judge profile integration with Hemant Gupta as presiding judge.",
            "case_type": "Criminal (IPC)",
            "jurisdiction": "Supreme Court of India",
            "judge_name": "Justice Hemant Gupta",
            "charges": ["IPC 302"],
        }
        r = requests.post(f"{BASE_URL}/api/cases", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert data.get("judge_name") == "Justice Hemant Gupta"
        assert "id" in data
