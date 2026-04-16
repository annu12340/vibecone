"""
Mocked CNR data for testing & demos.
Each entry matches the raw eCourts API response shape, so it can be passed
straight through `transform_ecourts_to_unified_format()`.
"""
from typing import Dict, Any

# ---------- DLHC010127602024 (pre-existing mock — Delhi High Court FAO) ----------
MOCK_DLHC010127602024: Dict[str, Any] = {
    "data": {
        "courtCaseData": {
            "caseNumber": "202400000822024",
            "state": "DL",
            "stateCode": "26",
            "districtCode": "1",
            "causelistType": "COMPLETE CAUSE LIST",
            "courtName": "DLHC",
            "courtNo": 11584,
            "judicialSection": "APP",
            "judicialSectionRaw": "APPELLATE SIDE",
            "subordinateCourt": {
                "filingDate": "2024-01-02",
                "caseNumber": "- IL SUIT - 2152",
                "courtName": "PATIALA HOUSE COURTS, NEW DELHI"
            },
            "purpose": "FRESH MATTERS & APPLICATIONS",
            "stageOfCase": "UNKNOWN",
            "lastHearingDate": "2025-05-26",
            "interimOrders": [
                {"orderDate": "2024-03-13", "description": "View ORDER", "orderUrl": "order-1.pdf"},
                {"orderDate": "2024-05-02", "description": "View ORDER", "orderUrl": "order-2.pdf"},
                {"orderDate": "2024-05-30", "description": "View ORDER", "orderUrl": "order-3.pdf"},
                {"orderDate": "2024-09-09", "description": "View ORDER", "orderUrl": "order-4.pdf"},
                {"orderDate": "2025-01-14", "description": "View ORDER", "orderUrl": "order-5.pdf"},
                {"orderDate": "2025-05-26", "description": "View ORDER", "orderUrl": "order-6.pdf"}
            ],
            "cnr": "DLHC010127602024",
            "cnrCourtCode": "DLHC01",
            "courtComplexCode": "DLHC01",
            "cnrCaseNumber": "012760",
            "cnrYear": "2024",
            "caseType": "FA",
            "caseTypeRaw": "FAO",
            "caseStatus": "PENDING",
            "filingNumber": "629757/2024",
            "filingDate": "2024-03-07",
            "registrationNumber": "82/2024",
            "registrationDate": "2024-03-12",
            "firstHearingDate": "2024-03-13",
            "nextHearingDate": "2025-05-26",
            "caseDurationDays": 445,
            "judges": [{"name": "DHARMESH SHARMA"}],
            "petitioners": [{"name": "Hav Narender Singh"}],
            "petitionerAdvocates": [{"name": "RAKESH DAHIYA"}],
            "respondents": [{"name": "Indian Ex Services League through Its President"}],
            "respondentAdvocates": [],
            "actsAndSections": [
                "Civil Procedure Code, 1908 - Section 104",
                "Order 43 Rule 1"
            ],
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
            "judgmentOrders": []
        },
        "entityInfo": {
            "cnr": "DLHC010127602024",
            "nextDateOfHearing": "2025-05-26T00:00:00Z",
            "dateModified": "2026-02-13T09:45:20.343999Z"
        }
    }
}

# ---------- DLCT020357252018 (NEW — Delhi District Court, 2018, criminal) ----------
MOCK_DLCT020357252018: Dict[str, Any] = {
    "data": {
        "courtCaseData": {
            "caseNumber": "202500035722018",
            "state": "DL",
            "stateCode": "26",
            "districtCode": "2",
            "causelistType": "COMPLETE CAUSE LIST",
            "courtName": "Tis Hazari District Court",
            "courtNo": 204,
            "judicialSection": "CRL",
            "judicialSectionRaw": "CRIMINAL",
            "subordinateCourt": None,
            "purpose": "ARGUMENTS",
            "stageOfCase": "ARGUMENTS",
            "lastHearingDate": "2024-11-18",
            "interimOrders": [
                {"orderDate": "2018-09-12", "description": "Bail Application Dismissed", "orderUrl": "order-01.pdf"},
                {"orderDate": "2019-02-04", "description": "Framing of Charge Order", "orderUrl": "order-02.pdf"},
                {"orderDate": "2020-07-21", "description": "Prosecution Evidence — witness examined", "orderUrl": "order-03.pdf"},
                {"orderDate": "2022-05-16", "description": "Defense Evidence concluded", "orderUrl": "order-04.pdf"},
                {"orderDate": "2024-11-18", "description": "Final Arguments in progress", "orderUrl": "order-05.pdf"},
            ],
            "cnr": "DLCT020357252018",
            "cnrCourtCode": "DLCT02",
            "courtComplexCode": "DLCT02",
            "cnrCaseNumber": "035725",
            "cnrYear": "2018",
            "caseType": "CC",
            "caseTypeRaw": "Criminal Case",
            "caseStatus": "PENDING",
            "filingNumber": "CC/35725/2018",
            "filingDate": "2018-06-14",
            "registrationNumber": "35725/2018",
            "registrationDate": "2018-06-20",
            "firstHearingDate": "2018-07-03",
            "nextHearingDate": "2025-03-15",
            "caseDurationDays": 2465,
            "judges": [{"name": "HON'BLE MS. PRIYA SHARMA, ADDITIONAL SESSIONS JUDGE"}],
            "petitioners": [{"name": "State (Govt. of NCT of Delhi)"}],
            "petitionerAdvocates": [{"name": "Ld. Addl. Public Prosecutor, Sh. Ravi Verma"}],
            "respondents": [
                {"name": "Rohit Kumar (Accused No. 1)"},
                {"name": "Suresh Pal (Accused No. 2)"},
            ],
            "respondentAdvocates": [
                {"name": "Adv. Arjun Mehra (for A-1)"},
                {"name": "Adv. Kavita Nair (for A-2)"},
            ],
            "actsAndSections": [
                "Indian Penal Code, 1860 - Section 392 (Robbery)",
                "Indian Penal Code, 1860 - Section 397 (Robbery with deadly weapon)",
                "Indian Penal Code, 1860 - Section 34 (Common intention)",
                "Arms Act, 1959 - Section 25",
            ],
            "hasOrders": True,
            "hasJudgments": False,
            "orderCount": 5,
            "iaCount": 3,
            "interlocutoryApplications": [
                {
                    "regNo": "Bail Application No. 1234/2018",
                    "remark": "Bail u/s 439 CrPC",
                    "filedBy": "ROHIT KUMAR",
                    "filingDate": "2018-07-15",
                    "status": "Dismissed"
                },
                {
                    "regNo": "Discharge Application No. 455/2019",
                    "remark": "Application u/s 227 CrPC",
                    "filedBy": "SURESH PAL",
                    "filingDate": "2019-01-08",
                    "status": "Dismissed"
                },
                {
                    "regNo": "Application u/s 311 CrPC No. 221/2023",
                    "remark": "Recall of witness PW-4",
                    "filedBy": "ROHIT KUMAR",
                    "filingDate": "2023-04-22",
                    "status": "Allowed"
                },
            ],
            "judgmentOrders": [],
            # Summary text that the LLM Council will reason over
            "caseSummary": (
                "State of NCT of Delhi vs. Rohit Kumar & Anr. is a criminal case pending "
                "before Tis Hazari District Court arising out of FIR No. 211/2018 lodged at P.S. "
                "Kashmere Gate under Sections 392/397/34 IPC and Section 25 Arms Act. The prosecution "
                "alleges that on 10.06.2018 the accused persons forcibly robbed the complainant of "
                "cash (Rs. 48,000/-) and a mobile phone at knife-point near ISBT Kashmere Gate. "
                "The accused were arrested on 12.06.2018 and a country-made pistol and a knife "
                "were allegedly recovered at their instance. Charges have been framed; prosecution "
                "led 9 witnesses. Defense has concluded its evidence. Matter is now at final "
                "arguments stage. Bail was earlier dismissed at trial court. Identification of "
                "accused by PW-1 (complainant) is disputed; defense contends Test Identification "
                "Parade was not conducted. Ballistic report supports recovery of weapon."
            ),
        },
        "entityInfo": {
            "cnr": "DLCT020357252018",
            "nextDateOfHearing": "2025-03-15T00:00:00Z",
            "dateModified": "2025-01-20T14:20:00.000000Z"
        }
    }
}

# ---------- Registry ----------
MOCKED_CNRS: Dict[str, Dict[str, Any]] = {
    "DLHC010127602024": MOCK_DLHC010127602024,
    "DLCT020357252018": MOCK_DLCT020357252018,
}


def get_mocked_case(cnr: str) -> Dict[str, Any]:
    """Return raw eCourts-shaped mock data for a given CNR, or None if not mocked."""
    return MOCKED_CNRS.get(cnr.strip().upper())
