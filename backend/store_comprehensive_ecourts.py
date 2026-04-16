#!/usr/bin/env python3
"""
Store comprehensive eCourts case data with AI analysis
"""

import requests
import json

# Comprehensive eCourts case data with all fields
comprehensive_ecourts_data = {
    "data": {
        "courtCaseData": {
            "cnr": "DLHC010127602024",
            "caseNumber": "202400000822024",
            "state": "DL",
            "stateCode": "26",
            "districtCode": "1",
            "courtName": "DLHC",
            "courtNo": 11584,
            "judicialSection": "APP",
            "judicialSectionRaw": "APPELLATE SIDE",
            "caseType": "FA",
            "caseTypeRaw": "FAO",
            "caseStatus": "PENDING",
            "filingNumber": "629757/2024",
            "filingDate": "2024-03-07",
            "registrationNumber": "82/2024",
            "registrationDate": "2024-03-12",
            "firstHearingDate": "2024-03-13",
            "nextHearingDate": "2025-05-26",
            "lastHearingDate": "2025-05-26",
            "decisionDate": None,
            "caseDurationDays": 445,
            "judges": ["DHARMESH SHARMA"],
            "petitioners": ["Hav Narender Singh"],
            "petitionerAdvocates": ["RAKESH DAHIYA"],
            "respondents": ["Indian Ex Services League through Its President"],
            "respondentAdvocates": [],
            "actsAndSections": ["Civil Procedure Code, 1908 - Section 104", "Order 43 Rule 1"],
            "interimOrders": [
                {"orderDate": "2024-03-13", "description": "View ORDER", "orderUrl": "order-1.pdf"},
                {"orderDate": "2024-05-02", "description": "View ORDER", "orderUrl": "order-2.pdf"},
                {"orderDate": "2024-05-30", "description": "View ORDER", "orderUrl": "order-3.pdf"},
                {"orderDate": "2024-09-09", "description": "View ORDER", "orderUrl": "order-4.pdf"},
                {"orderDate": "2025-01-14", "description": "View ORDER", "orderUrl": "order-5.pdf"},
                {"orderDate": "2025-05-26", "description": "View ORDER", "orderUrl": "order-6.pdf"}
            ],
            "judgmentOrders": [],
            "hasOrders": True,
            "hasJudgments": False,
            "orderCount": 6,
            "iaCount": 2,
            "interlocutoryApplications": [
                {
                    "regNo": "CM APPL./15218/2024 (15218 ) Classification :",
                    "remark": "13-03-2024",
                    "filedBy": "HAV NARENDER SINGH",
                    "filingDate": "2024-03-12",
                    "status": "Pending"
                },
                {
                    "regNo": "CM APPL./15219/2024 (15219 ) Classification :",
                    "remark": "13-03-2024",
                    "filedBy": "HAV NARENDER SINGH",
                    "filingDate": "2024-03-12",
                    "status": "Pending"
                }
            ],
            "subordinateCourt": {
                "filingDate": "2024-01-02",
                "caseNumber": "- IL SUIT - 2152",
                "courtName": "PATIALA HOUSE COURTS, NEW DELHI"
            },
            "purpose": "FRESH MATTERS & APPLICATIONS",
            "stageOfCase": "UNKNOWN"
        },
        "entityInfo": {
            "cnr": "DLHC010127602024",
            "nextDateOfHearing": "2025-05-26T00:00:00Z",
            "dateModified": "2026-02-13T09:45:20.343999Z"
        }
    },
    "latestOrderAnalysis": {
        "data": {
            "aiAnalysis": {
                "foundational_metadata": {
                    "core_case_identifiers": {
                        "case_number_primary": "FAO 82/2024",
                        "case_type": "First Appeal from Order",
                        "court_name": "High Court of Delhi at New Delhi",
                        "bench_composition": "Single Judge",
                        "judge_names": ["Dharmesh Sharma"],
                        "order_date": "2025-05-26",
                        "filing_year": 2024
                    },
                    "procedural_details_from_order": {
                        "order_nature": "Procedural",
                        "disposition_status_indicated": "Adjourned",
                        "disposition_outcome_if_disposed": None
                    }
                },
                "deep_legal_substance_context": {
                    "arguments_and_reasoning_analysis": {
                        "court_reasoning_for_decision": "The court's decision to adjourn the hearing was based solely on the practical constraint that 'it would not be possible to pass judgment during the short period of time available to this Court.' This indicates a lack of sufficient judicial time rather than a substantive legal reason.",
                        "ratio_decidendi_extracted": {
                            "statement": "The court's inability to accord hearing and pass judgment within the available short period necessitates an adjournment for fresh matters.",
                            "confidence_score": 9
                        }
                    }
                },
                "intelligent_insights_analytics": {
                    "order_significance_and_impact_assessment": {
                        "ai_generated_executive_summary": "The Delhi High Court, in a procedural order dated May 26, 2025, adjourned two First Appeals from Order (FAO 82/2024 and FAO 150/2024) involving Hav Narender Singh, Major Gen. S. S. Ahlawat (Retd.), and the Indian Ex-Services League. The adjournment was necessitated by the court's inability to conduct a full hearing and pass judgment within the limited time available. The matters are now listed for September 3, 2025, extending the litigation period.",
                        "plain_language_summary_for_litigants_outcome_focused": "For Hav Narender Singh, Major Gen. S. S. Ahlawat (Retd.), and the Indian Ex-Services League, this order means that your case in the Delhi High Court has been postponed. The judge could not hear your arguments and make a decision today because there wasn't enough time. Your case will now be heard on September 3, 2025. This means a decision on your appeal will take longer, and you'll need to wait for the next court date."
                    }
                }
            }
        }
    }
}

# Store the data
url = "http://localhost:8001/api/admin/ecourts/store-case"
response = requests.post(url, json=comprehensive_ecourts_data, timeout=30)

if response.status_code == 200:
    result = response.json()
    print(f"✓ Successfully stored comprehensive case data")
    print(f"  CNR: {result.get('cnr')}")
    print(f"  Preview: {json.dumps(result.get('data_preview'), indent=2)}")
else:
    print(f"✗ Error: {response.status_code}")
    print(f"  Response: {response.text}")
