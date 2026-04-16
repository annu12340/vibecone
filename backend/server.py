from fastapi import FastAPI, APIRouter, BackgroundTasks, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import List, Optional, Dict, Any, Annotated
import uuid
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import requests
from ecourts_helper import transform_ecourts_to_unified_format
from ecourts_api_client import ecourts_client
from map import COURT_STATE_MAP
from sarvam_service import sarvam_router

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Legal Intelligence System API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# --- PyObjectId helper ---
def validate_object_id(v: Any) -> str:
    if isinstance(v, ObjectId):
        return str(v)
    return v

PyObjectId = Annotated[str, BeforeValidator(validate_object_id)]


# --- Models ---
class CaseCreate(BaseModel):
    title: str
    description: str
    case_type: str
    jurisdiction: str
    judge_name: Optional[str] = None
    charges: List[str] = []
    defendant_demographics: Optional[Dict[str, str]] = None
    ecourts_metadata: Optional[Dict[str, Any]] = None


class Case(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    case_type: str
    jurisdiction: str
    judge_name: Optional[str] = None
    charges: List[str] = []
    defendant_demographics: Optional[Dict[str, str]] = None
    ecourts_metadata: Optional[Dict[str, Any]] = None
    status: str = "pending"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# --- Fine Models ---
class FineCreate(BaseModel):
    case_id: str
    case_title: str
    convicted_party: str
    amount: float
    description: Optional[str] = None


class Fine(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    case_id: str
    case_title: str
    convicted_party: str
    amount: float
    description: Optional[str] = None
    allocation: Dict[str, float] = Field(default_factory=lambda: {})
    date_collected: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    status: str = "collected"


# --- Prisoner Models ---
class BehaviorRecord(BaseModel):
    date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    recorded_by: str
    description: str
    type: str  # "positive" or "negative"


class PrisonerCreate(BaseModel):
    name: str
    prisoner_id_number: str
    case_id: Optional[str] = None
    admission_date: str
    expected_release_date: Optional[str] = None


class Prisoner(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    prisoner_id_number: str
    case_id: Optional[str] = None
    admission_date: str
    expected_release_date: Optional[str] = None
    actual_release_date: Optional[str] = None
    status: str = "imprisoned"  # imprisoned, released
    good_behavior_certified: bool = False
    behavior_records: List[BehaviorRecord] = []
    reward_received: float = 0.0
    rewarded: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# --- Reward Distribution Models ---
class LotteryWinner(BaseModel):
    prisoner_id: str
    prisoner_name: str
    amount: float


class RewardDistribution(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    distribution_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    lottery_round: int
    fund_balance_before: float
    amount_distributed: float
    amount_per_prisoner: float
    selected_prisoners: List[LotteryWinner]


# --- Routes ---
@api_router.get("/")
async def root():
    return {"message": "Legal Intelligence System API", "version": "1.0"}


@api_router.post("/cases")
async def create_case(case_input: CaseCreate):
    case = Case(**case_input.model_dump())
    doc = case.model_dump()
    await db.cases.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


@api_router.get("/cases")
async def get_cases():
    cases = await db.cases.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return cases


@api_router.get("/cases/by-state")
async def get_cases_by_state():
    """Aggregate all cases and similar cases by Indian state."""
    states = {}
    cases = await db.cases.find({}, {"_id": 0}).to_list(500)
    for c in cases:
        state = _resolve_state(c.get("jurisdiction")) or _resolve_state(c.get("judge_name"))
        if state:
            states.setdefault(state, []).append({
                "id": c.get("id"),
                "title": c.get("title"),
                "case_type": c.get("case_type", ""),
                "jurisdiction": c.get("jurisdiction", ""),
                "judge": c.get("judge_name", ""),
                "status": c.get("status", "pending"),
                "source": "filed",
            })
    analyses = await db.analyses.find(
        {"status": "complete", "similar_cases": {"$exists": True, "$ne": []}},
        {"_id": 0, "similar_cases": 1, "case_id": 1}
    ).to_list(500)
    for a in analyses:
        for sc in a.get("similar_cases", []):
            state = _resolve_state(sc.get("court")) or _resolve_state(sc.get("case_name"))
            if state:
                states.setdefault(state, []).append({
                    "title": sc.get("case_name", "Unknown"),
                    "case_type": "",
                    "jurisdiction": sc.get("court", ""),
                    "year": sc.get("year"),
                    "outcome": sc.get("outcome", ""),
                    "source": "similar",
                })
    result = {}
    for state, case_list in states.items():
        seen = set()
        deduped = []
        for c in case_list:
            key = c.get("title", "")
            if key not in seen:
                seen.add(key)
                deduped.append(c)
        result[state] = deduped
    return {"states": result}


@api_router.get("/cases/{case_id}")
async def get_case(case_id: str):
    case = await db.cases.find_one({"id": case_id}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@api_router.post("/cases/{case_id}/analyze")
async def start_analysis(case_id: str, background_tasks: BackgroundTasks):
    case = await db.cases.find_one({"id": case_id}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # If already complete, allow re-analysis by deleting old record
    existing = await db.analyses.find_one({"case_id": case_id}, {"_id": 0})
    if existing and existing.get("status") == "analyzing":
        return {"message": "Analysis already in progress", "case_id": case_id}

    # Create/reset analysis record
    analysis_doc = {
        "case_id": case_id,
        "status": "analyzing",
        "stage": 1,
        "members": {
            "prosecution": {"status": "analyzing"},
            "defense": {"status": "analyzing"},
            "legal_scholar": {"status": "analyzing"},
            "bias_detector": {"status": "analyzing"},
        },
        "cross_reviews": {},
        "chief_justice": {"status": "pending"},
        "similar_cases": [],
        "relevant_laws": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.analyses.delete_one({"case_id": case_id})
    await db.analyses.insert_one(analysis_doc)

    background_tasks.add_task(run_council_analysis, case_id, case)
    return {"message": "Analysis started", "case_id": case_id}


@api_router.get("/cases/{case_id}/analysis")
async def get_analysis(case_id: str):
    analysis = await db.analyses.find_one({"case_id": case_id}, {"_id": 0})
    if not analysis:
        return {"case_id": case_id, "status": "not_started", "stage": 0, "members": {}}
    return analysis



# --- eCourts India API Client ---
class ECourtsClient:
    """Client for the eCourts India partner API."""
    BASE_URL = "https://webapi.ecourtsindia.com/api/partner/case"

    def __init__(self):
        self.api_key = os.environ.get("ECOURTS_API_KEY", "")

    def get_case_with_latest_order(self, cnr: str) -> dict:
        """Fetch case details from eCourts API by CNR number."""
        url = f"{self.BASE_URL}/{cnr.strip().upper()}"
        headers = {"Accept": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 404:
            return None
        if response.status_code != 200:
            raise Exception(f"eCourts API returned {response.status_code}: {response.text[:200]}")
        data = response.json()
        # API may wrap data under a key or return it directly
        if isinstance(data, dict) and data.get("status") in (0, "0", False, "false"):
            return None
        return data


def transform_ecourts_to_unified_format(raw: dict) -> dict:
    """
    Transform eCourts API response into the unified shape the frontend expects.
    Handles both direct response and nested { data: { courtCaseData: ... } } shapes.
    """
    # Unwrap common envelope shapes
    if "data" in raw and isinstance(raw["data"], dict):
        inner = raw["data"]
        case_data = inner.get("courtCaseData") or inner.get("caseData") or inner
    else:
        case_data = raw.get("courtCaseData") or raw.get("caseData") or raw

    def _join(val):
        if isinstance(val, list):
            return ", ".join(str(v) for v in val if v)
        return val or ""

    # Parties
    petitioners = []
    respondents = []
    for p in (case_data.get("petitioners") or case_data.get("petitionerDetails") or []):
        name = p.get("name") or p.get("petitionerName") or str(p) if isinstance(p, dict) else str(p)
        if name:
            petitioners.append(name)
    for r in (case_data.get("respondents") or case_data.get("respondentDetails") or []):
        name = r.get("name") or r.get("respondentName") or str(r) if isinstance(r, dict) else str(r)
        if name:
            respondents.append(name)

    # Advocates
    pet_advocates = [a.get("name") or str(a) if isinstance(a, dict) else str(a) for a in (case_data.get("petitionerAdvocates") or []) if a]
    res_advocates = [a.get("name") or str(a) if isinstance(a, dict) else str(a) for a in (case_data.get("respondentAdvocates") or []) if a]

    # Judges
    judges = []
    for j in (case_data.get("judges") or case_data.get("judgeDetails") or []):
        name = j.get("name") or j.get("judgeName") or str(j) if isinstance(j, dict) else str(j)
        if name:
            judges.append(name)
    if not judges and case_data.get("judgeName"):
        judges = [case_data["judgeName"]]

    # Acts & sections
    acts = []
    for a in (case_data.get("actsAndSections") or case_data.get("acts") or []):
        if isinstance(a, dict):
            act_str = a.get("act") or a.get("actName") or ""
            sec = a.get("section") or a.get("sections") or ""
            acts.append(f"{act_str} § {sec}".strip(" §") if sec else act_str)
        elif isinstance(a, str):
            acts.append(a)

    # Build title from parties or case number
    cnr_val = case_data.get("cnr") or case_data.get("cnrNumber") or raw.get("cnr", "")
    pet_str = petitioners[0] if petitioners else ""
    res_str = respondents[0] if respondents else ""
    
    # Initialize title with default value
    title = f"Case {cnr_val}" if cnr_val else "Unknown Case"
    
    # Build more specific title if parties are available
    if pet_str and res_str:
        title = f"{pet_str} vs {res_str}"
    elif pet_str:
        title = f"{pet_str} vs State"
    elif case_data.get("caseTitle") or case_data.get("title"):
        title = case_data.get("caseTitle") or case_data.get("title")

    # Court name
    court = (
        case_data.get("courtName")
        or case_data.get("court")
        or case_data.get("establishmentName")
        or ""
    )

    # AI analysis fields (may or may not be present)
    ai_summary = (
        case_data.get("caseAiSummary")
        or case_data.get("aiSummary")
        or raw.get("caseAiSummary")
        or None
    )
    ai_analysis = case_data.get("caseAiAnalysis") or raw.get("caseAiAnalysis") or None
    latest_order_analysis = (
        case_data.get("latestOrderAnalysis")
        or case_data.get("orderAnalysis")
        or raw.get("latestOrderAnalysis")
        or None
    )

    return {
        "cnr": cnr_val,
        "title": title,
        "court": court,
        "case_type": case_data.get("caseType") or case_data.get("caseTypeCode") or "",
        "case_type_full": case_data.get("caseTypeFull") or case_data.get("caseTypeFullName") or case_data.get("caseType") or "",
        "case_status": case_data.get("caseStatus") or case_data.get("status") or "",
        "registration_number": case_data.get("registrationNumber") or case_data.get("caseNumber") or "",
        "filing_date": case_data.get("filingDate") or case_data.get("dateOfFiling") or "",
        "registration_date": case_data.get("registrationDate") or "",
        "first_hearing_date": case_data.get("firstHearingDate") or "",
        "next_hearing_date": case_data.get("nextHearingDate") or case_data.get("nextDate") or "",
        "last_hearing_date": case_data.get("lastHearingDate") or "",
        "decision_date": case_data.get("decisionDate") or case_data.get("disposalDate") or "",
        "judges": judges,
        "petitioners": petitioners,
        "respondents": respondents,
        "petitioner_advocates": pet_advocates,
        "respondent_advocates": res_advocates,
        "acts_and_sections": acts,
        "court_code": case_data.get("courtCode") or "",
        "judicial_section": case_data.get("judicialSection") or "",
        "stage_of_case": case_data.get("stageOfCase") or case_data.get("stage") or "",
        "order_count": case_data.get("orderCount") or 0,
        "has_orders": bool(case_data.get("orders") or case_data.get("orderCount")),
        "interim_orders": case_data.get("interimOrders") or [],
        "subordinate_court": case_data.get("subordinateCourt") or None,
        "case_ai_summary": ai_summary,
        "case_ai_analysis": ai_analysis,
        "latest_order_analysis": latest_order_analysis,
        "doc_text": case_data.get("caseDetails") or case_data.get("orderText") or "",
        "source": "ecourts",
    }


ecourts_client = ECourtsClient()


# --- Indian Kanoon API Integration ---
class IndianKanoonSearch(BaseModel):
    cnr: str

@api_router.post("/indiankanoon/search")
async def search_indian_kanoon(search_input: IndianKanoonSearch):
    """Search Indian Kanoon API using CNR number"""
    api_token = os.environ.get('INDIAN_KANOON_API_TOKEN')
    if not api_token:
        raise HTTPException(status_code=500, detail="Indian Kanoon API token not configured")
    
    base_url = "https://api.indiankanoon.org"
    headers = {
        "Authorization": f"Token {api_token}",
        "Accept": "application/json"
    }
    
    try:
        # Search for the case using CNR
        logger.info(f"Searching Indian Kanoon for CNR: {search_input.cnr}")
        search_response = requests.post(
            f"{base_url}/search/",
            params={"formInput": search_input.cnr, "pagenum": 0},
            headers=headers,
            timeout=15
        )
        
        if search_response.status_code != 200:
            logger.error(f"Indian Kanoon search failed: {search_response.status_code} - {search_response.text}")
            raise HTTPException(
                status_code=search_response.status_code,
                detail=f"Indian Kanoon API error: {search_response.text}"
            )
        
        search_data = search_response.json()
        
        if not search_data.get("docs") or len(search_data["docs"]) == 0:
            return {
                "success": False,
                "message": "No case found with this CNR",
                "data": None
            }
        
        # Get the first document ID
        first_doc = search_data["docs"][0]
        doc_id = first_doc.get("tid")
        
        if not doc_id:
            return {
                "success": False,
                "message": "Document ID not found in search results",
                "data": None
            }
        
        logger.info(f"Found document ID: {doc_id}, fetching full details...")
        
        # Fetch full document details
        doc_response = requests.post(
            f"{base_url}/doc/{doc_id}/",
            headers=headers,
            timeout=15
        )
        
        if doc_response.status_code != 200:
            logger.error(f"Indian Kanoon doc fetch failed: {doc_response.status_code}")
            raise HTTPException(
                status_code=doc_response.status_code,
                detail="Failed to fetch full document details"
            )
        
        doc_data = doc_response.json()
        
        # Extract relevant information
        result = {
            "success": True,
            "message": "Case found successfully",
            "data": {
                "doc_id": doc_id,
                "title": doc_data.get("title", ""),
                "doc_text": doc_data.get("doc", ""),
                "court": first_doc.get("court", ""),
                "bench": first_doc.get("bench", ""),
                "date": first_doc.get("date", ""),
                "citations": doc_data.get("citations", []),
                "referred_acts": doc_data.get("referred_acts", []),
                "referred_cases": doc_data.get("referred_cases", []),
                "author": doc_data.get("author", ""),  # Judge name
                "raw_search_result": first_doc,
                "raw_doc_data": doc_data
            }
        }
        
        return result
        
    except requests.exceptions.Timeout:
        logger.error("Indian Kanoon API request timed out")
        raise HTTPException(status_code=504, detail="Indian Kanoon API request timed out")
    except requests.exceptions.ConnectionError as e:
        logger.error(f"Connection error to Indian Kanoon API: {e}")
        raise HTTPException(status_code=503, detail="Unable to connect to Indian Kanoon API")
    except Exception as e:
        logger.error(f"Error searching Indian Kanoon: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


# --- eCourts + Indian Kanoon Merged Integration ---
class CaseSearchByCNR(BaseModel):
    cnr: str

@api_router.post("/ecourts/fetch-case/{cnr}")
async def fetch_case_from_ecourts(cnr: str):
    """
    Fetch case directly from eCourts API (not from cache).
    This endpoint makes a live call to eCourts service.
    """
    cnr = cnr.strip().upper()
    logger.info(f"Fetching case from eCourts API for CNR: {cnr}")
    
    try:
        # Fetch from eCourts API
        ecourts_raw_data = ecourts_client.get_case_with_latest_order(cnr)
        
        if not ecourts_raw_data:
            raise HTTPException(
                status_code=404,
                detail=f"Case not found in eCourts for CNR: {cnr}"
            )
        
        # Transform to unified format
        transformed_data = transform_ecourts_to_unified_format(ecourts_raw_data)
        
        # Cache the result for future use
        cache_doc = {
            "cnr": cnr,
            "data": transformed_data,
            "cached_at": datetime.now(timezone.utc).isoformat(),
            "source": "ecourts"
        }
        
        await db.ecourts_cache.update_one(
            {"cnr": cnr},
            {"$set": cache_doc},
            upsert=True
        )
        
        logger.info(f"Successfully fetched and cached eCourts data for CNR: {cnr}")
        
        return {
            "success": True,
            "source": "ecourts_live",
            "message": "Case fetched from eCourts API",
            "data": transformed_data,
            "cached": False
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching from eCourts API: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching case from eCourts: {str(e)}"
        )


@api_router.post("/cases/search-by-cnr")
async def search_case_by_cnr(search_input: CaseSearchByCNR):
    """
    Search for case by CNR using eCourts first, fallback to Indian Kanoon.
    First checks cache, then tries live eCourts API, then falls back to Indian Kanoon.
    Returns comprehensive case details including latest order analysis.
    """
    cnr = search_input.cnr.strip().upper()
    logger.info(f"Searching for case with CNR: {cnr}")
    
    # Special case: DLHC010127602024 - Return mocked data with 10s delay
    # This is temporary to avoid API limits during testing
    if cnr == "DLHC010127602024":
        logger.info(f"Using mocked data for CNR: {cnr} (sleeping 10s to simulate API call)")
        
        # Sleep for 10 seconds to simulate API delay (async sleep)
        await asyncio.sleep(10)
        
        # Mocked eCourts data
        mocked_ecourts_data = {
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
        
        # Transform mocked data to unified format
        transformed_data = transform_ecourts_to_unified_format(mocked_ecourts_data)
        
        logger.info(f"Returning mocked data for CNR: {cnr}")
        
        return {
            "success": True,
            "source": "ecourts_mocked",
            "message": "Case data retrieved (mocked for testing - 10s delay applied)",
            "data": transformed_data,
            "fallback_attempted": False,
            "cached": False,
            "mocked": True
        }
    
    # Step 1: Try eCourts cache first
    ecourts_data = None
    ecourts_error = None
    
    try:
        logger.info(f"Checking eCourts cache for CNR: {cnr}")
        cached_case = await db.ecourts_cache.find_one({"cnr": cnr}, {"_id": 0})
        
        if cached_case:
            logger.info(f"Found cached eCourts data for CNR: {cnr}")
            # Check if cache is recent (less than 24 hours old)
            cache_date = cached_case.get("cached_at")
            if cache_date:
                from datetime import datetime, timedelta
                cache_time = datetime.fromisoformat(cache_date.replace('Z', '+00:00'))
                if datetime.now(timezone.utc) - cache_time < timedelta(hours=24):
                    ecourts_data = cached_case.get("data")
                    logger.info(f"Using fresh cached eCourts data for CNR: {cnr}")
        
    except Exception as e:
        ecourts_error = f"eCourts cache lookup error: {str(e)}"
        logger.warning(f"eCourts cache lookup failed for CNR {cnr}: {ecourts_error}")
    
    # If cache is empty or stale, return cached data if available
    if ecourts_data:
        return {
            "success": True,
            "source": "ecourts",
            "message": "Case found successfully from eCourts cache",
            "data": ecourts_data,
            "fallback_attempted": False,
            "cached": True
        }
    
    # Step 2: Try live eCourts API if cache miss or stale
    logger.info(f"Cache miss or stale, trying live eCourts API for CNR: {cnr}")
    try:
        ecourts_raw_data = ecourts_client.get_case_with_latest_order(cnr)
        
        if ecourts_raw_data:
            logger.info(f"Successfully fetched from live eCourts API for CNR: {cnr}")
            
            # Transform data
            transformed_data = transform_ecourts_to_unified_format(ecourts_raw_data)
            
            # Cache for future use
            cache_doc = {
                "cnr": cnr,
                "data": transformed_data,
                "cached_at": datetime.now(timezone.utc).isoformat(),
                "source": "ecourts"
            }
            
            try:
                await db.ecourts_cache.update_one(
                    {"cnr": cnr},
                    {"$set": cache_doc},
                    upsert=True
                )
                logger.info(f"Cached fresh eCourts data for CNR: {cnr}")
            except Exception as cache_error:
                logger.warning(f"Failed to cache eCourts data: {cache_error}")
            
            return {
                "success": True,
                "source": "ecourts_live",
                "message": "Case found successfully from eCourts API",
                "data": transformed_data,
                "fallback_attempted": False,
                "cached": False
            }
    except Exception as e:
        ecourts_error = f"Live eCourts API error: {str(e)}"
        logger.warning(f"Live eCourts fetch failed for CNR {cnr}: {ecourts_error}")
    
    # Step 3: Fallback to Indian Kanoon
    logger.info(f"eCourts data not available, falling back to Indian Kanoon for CNR: {cnr}")
    try:
        indian_kanoon_result = await search_indian_kanoon(IndianKanoonSearch(cnr=cnr))
        
        if indian_kanoon_result.get("success"):
            logger.info(f"Successfully fetched case from Indian Kanoon: {cnr}")
            return {
                "success": True,
                "source": "indian_kanoon",
                "message": "Case found from Indian Kanoon (eCourts data not available)",
                "data": indian_kanoon_result.get("data"),
                "fallback_attempted": True,
                "ecourts_note": "eCourts integration in progress"
            }
        else:
            # Both failed
            raise HTTPException(
                status_code=404,
                detail={
                    "message": "Case not found in both eCourts and Indian Kanoon",
                    "ecourts_note": "eCourts data not cached yet",
                    "indian_kanoon_message": indian_kanoon_result.get("message")
                }
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Indian Kanoon fallback also failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Both eCourts and Indian Kanoon searches failed",
                "ecourts_note": "eCourts data not cached yet",
                "indian_kanoon_error": str(e)
            }
        )


@api_router.post("/admin/ecourts/cache-case")
async def cache_ecourts_case(search_input: CaseSearchByCNR):
    """
    Admin endpoint to fetch and cache eCourts case data.
    This endpoint should be called by the agent to populate eCourts data.
    """
    cnr = search_input.cnr.strip().upper()
    logger.info(f"Admin request to cache eCourts data for CNR: {cnr}")
    
    # This endpoint expects the data to be provided by the agent
    # For now, it returns a message indicating that data should be posted
    return {
        "success": False,
        "message": "This endpoint should receive eCourts data from external source",
        "cnr": cnr,
        "instructions": "Use POST with 'data' field containing eCourts case information"
    }


@api_router.post("/admin/ecourts/store-case")
async def store_ecourts_case_data(case_data: Dict[str, Any]):
    """
    Admin endpoint to store eCourts case data in cache.
    Accepts full case data from eCourts and stores it for quick retrieval.
    """
    try:
        # Extract CNR from the data
        cnr = case_data.get("cnr") or case_data.get("data", {}).get("courtCaseData", {}).get("cnr")
        
        if not cnr:
            raise HTTPException(status_code=400, detail="CNR is required in case data")
        
        cnr = cnr.strip().upper()
        logger.info(f"Storing eCourts data for CNR: {cnr}")
        
        # Transform eCourts data to unified format
        transformed_data = transform_ecourts_to_unified_format(case_data)
        
        # Create cache document
        cache_doc = {
            "cnr": cnr,
            "data": transformed_data,
            "cached_at": datetime.now(timezone.utc).isoformat(),
            "source": "ecourts"
        }
        
        # Upsert to cache collection
        await db.ecourts_cache.update_one(
            {"cnr": cnr},
            {"$set": cache_doc},
            upsert=True
        )
        
        logger.info(f"Successfully cached eCourts data for CNR: {cnr}")
        
        return {
            "success": True,
            "message": f"eCourts data cached successfully for CNR: {cnr}",
            "cnr": cnr,
            "data_preview": {
                "title": transformed_data.get("title", ""),
                "court": transformed_data.get("court", ""),
                "status": transformed_data.get("case_status", ""),
                "filing_date": transformed_data.get("filing_date", "")
            }
        }
        
    except Exception as e:
        logger.error(f"Error storing eCourts data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error storing data: {str(e)}")


@api_router.get("/judges")
async def get_judges():
    judges = await db.judges.find({}, {"_id": 0}).to_list(100)
    return judges


@api_router.get("/judges/{judge_id}")
async def get_judge(judge_id: str):
    judge = await db.judges.find_one({"id": judge_id}, {"_id": 0})
    if not judge:
        raise HTTPException(status_code=404, detail="Judge not found")
    return judge


@api_router.get("/laws")
async def get_laws(case_type: Optional[str] = None):
    query = {}
    if case_type:
        query["applicable_case_types"] = {"$in": [case_type.lower()]}
    laws = await db.laws.find(query, {"_id": 0}).to_list(100)
    return laws



# --- Judge Summary Statistics Routes ---
@api_router.get("/judge-summary")
async def get_judge_summary(
    judge_name: Optional[str] = None,
    min_cases: Optional[int] = None,
    min_caste_rate: Optional[float] = None,
    limit: Optional[int] = 100
):
    """Get judge summary statistics from CSV data"""
    query = {}
    
    if judge_name:
        # Case-insensitive search
        query["judge_name"] = {"$regex": judge_name, "$options": "i"}
    
    if min_cases is not None:
        query["total_cases"] = {"$gte": min_cases}
    
    if min_caste_rate is not None:
        query["caste_mention_rate"] = {"$gte": min_caste_rate}
    
    judges = await db.judge_summary.find(query, {"_id": 0}).limit(limit).to_list(limit)
    
    return {
        "count": len(judges),
        "judges": judges
    }


@api_router.get("/judge-summary/{judge_name}")
async def get_judge_summary_by_name(judge_name: str):
    """Get detailed statistics for a specific judge"""
    # Try exact match first
    judge = await db.judge_summary.find_one({"judge_name": judge_name}, {"_id": 0})
    
    # If not found, try case-insensitive regex
    if not judge:
        judge = await db.judge_summary.find_one(
            {"judge_name": {"$regex": f"^{judge_name}$", "$options": "i"}},
            {"_id": 0}
        )
    
    if not judge:
        raise HTTPException(status_code=404, detail=f"Judge '{judge_name}' not found in summary statistics")
    
    return judge


@api_router.get("/judge-summary/stats/aggregates")
async def get_judge_summary_aggregates():
    """Get aggregate statistics across all judges"""
    total_judges = await db.judge_summary.count_documents({})
    
    # Calculate averages
    pipeline = [
        {
            "$group": {
                "_id": None,
                "avg_total_cases": {"$avg": "$total_cases"},
                "avg_caste_mention_rate": {"$avg": "$caste_mention_rate"},
                "avg_female_context_rate": {"$avg": "$female_context_rate"},
                "avg_allowed_rate": {"$avg": "$allowed_rate"},
                "avg_dismissed_rate": {"$avg": "$dismissed_rate"},
                "total_cases_all_judges": {"$sum": "$total_cases"}
            }
        }
    ]
    
    result = await db.judge_summary.aggregate(pipeline).to_list(1)
    
    # Top judges by various metrics
    top_by_cases = await db.judge_summary.find(
        {}, {"_id": 0, "judge_name": 1, "total_cases": 1}
    ).sort("total_cases", -1).limit(10).to_list(10)
    
    top_caste_mention = await db.judge_summary.find(
        {"caste_mention_rate": {"$gt": 0}},
        {"_id": 0, "judge_name": 1, "caste_mention_rate": 1, "total_cases": 1}
    ).sort("caste_mention_rate", -1).limit(10).to_list(10)
    
    return {
        "total_judges": total_judges,
        "averages": result[0] if result else {},
        "top_judges_by_cases": top_by_cases,
        "top_judges_caste_mention": top_caste_mention
    }


@api_router.post("/seed")
async def seed_database():
    from seed_data import get_judge_data, get_laws_data
    await db.judges.delete_many({})
    await db.laws.delete_many({})
    judges = get_judge_data()
    laws = get_laws_data()
    if judges:
        await db.judges.insert_many(judges)
    if laws:
        await db.laws.insert_many(laws)
    return {"message": f"Seeded {len(judges)} judges and {len(laws)} laws"}


# --- Fine Management Routes ---
@api_router.post("/fines")
async def create_fine(fine_input: FineCreate):
    """Record a fine collected from a case and allocate 30% to reward fund"""
    fine = Fine(**fine_input.model_dump())
    
    # Calculate allocation: 30% to reward fund, 70% to government
    reward_fund_amount = fine.amount * 0.30
    government_amount = fine.amount * 0.70
    
    fine.allocation = {
        "reward_fund": reward_fund_amount,
        "government": government_amount
    }
    
    doc = fine.model_dump()
    await db.fines.insert_one(doc)
    
    # Update reward fund balance
    reward_fund = await db.reward_fund.find_one({})
    if not reward_fund:
        # Initialize reward fund if doesn't exist
        reward_fund = {
            "total_balance": reward_fund_amount,
            "total_collected_from_fines": reward_fund_amount,
            "total_distributed": 0.0,
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
        await db.reward_fund.insert_one(reward_fund)
    else:
        # Update existing fund
        await db.reward_fund.update_one(
            {},
            {
                "$inc": {
                    "total_balance": reward_fund_amount,
                    "total_collected_from_fines": reward_fund_amount
                },
                "$set": {"last_updated": datetime.now(timezone.utc).isoformat()}
            }
        )
    
    return {k: v for k, v in doc.items() if k != "_id"}


@api_router.get("/fines")
async def get_fines():
    """Get all fines with latest first"""
    fines = await db.fines.find({}, {"_id": 0}).sort("date_collected", -1).to_list(100)
    return fines


@api_router.get("/fines/{fine_id}")
async def get_fine(fine_id: str):
    fine = await db.fines.find_one({"id": fine_id}, {"_id": 0})
    if not fine:
        raise HTTPException(status_code=404, detail="Fine not found")
    return fine


# --- Prisoner Management Routes ---
@api_router.post("/prisoners")
async def create_prisoner(prisoner_input: PrisonerCreate):
    """Add a new prisoner to the system"""
    prisoner = Prisoner(**prisoner_input.model_dump())
    doc = prisoner.model_dump()
    await db.prisoners.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


@api_router.get("/prisoners")
async def get_prisoners(status: Optional[str] = None):
    """Get all prisoners, optionally filtered by status"""
    query = {}
    if status:
        query["status"] = status
    prisoners = await db.prisoners.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return prisoners


@api_router.get("/prisoners/eligible")
async def get_eligible_prisoners():
    """Get prisoners eligible for reward lottery (released + certified + not yet rewarded)"""
    prisoners = await db.prisoners.find(
        {
            "status": "released",
            "good_behavior_certified": True,
            "rewarded": False
        },
        {"_id": 0}
    ).to_list(100)
    return prisoners


@api_router.get("/prisoners/{prisoner_id}")
async def get_prisoner(prisoner_id: str):
    prisoner = await db.prisoners.find_one({"id": prisoner_id}, {"_id": 0})
    if not prisoner:
        raise HTTPException(status_code=404, detail="Prisoner not found")
    return prisoner


@api_router.put("/prisoners/{prisoner_id}")
async def update_prisoner(prisoner_id: str, updates: dict):
    """Update prisoner details (status, release date, etc.)"""
    prisoner = await db.prisoners.find_one({"id": prisoner_id}, {"_id": 0})
    if not prisoner:
        raise HTTPException(status_code=404, detail="Prisoner not found")
    
    # Filter allowed updates
    allowed_fields = ["status", "actual_release_date", "expected_release_date", "good_behavior_certified"]
    update_data = {k: v for k, v in updates.items() if k in allowed_fields}
    
    if update_data:
        await db.prisoners.update_one(
            {"id": prisoner_id},
            {"$set": update_data}
        )
    
    updated_prisoner = await db.prisoners.find_one({"id": prisoner_id}, {"_id": 0})
    return updated_prisoner


@api_router.post("/prisoners/{prisoner_id}/behavior")
async def add_behavior_record(prisoner_id: str, record: BehaviorRecord):
    """Add a behavior record for a prisoner (used by jailers)"""
    prisoner = await db.prisoners.find_one({"id": prisoner_id}, {"_id": 0})
    if not prisoner:
        raise HTTPException(status_code=404, detail="Prisoner not found")
    
    await db.prisoners.update_one(
        {"id": prisoner_id},
        {"$push": {"behavior_records": record.model_dump()}}
    )
    
    return {"message": "Behavior record added", "record": record.model_dump()}


@api_router.put("/prisoners/{prisoner_id}/certify")
async def certify_good_behavior(prisoner_id: str):
    """Certify a prisoner for good behavior (typically at release)"""
    prisoner = await db.prisoners.find_one({"id": prisoner_id}, {"_id": 0})
    if not prisoner:
        raise HTTPException(status_code=404, detail="Prisoner not found")
    
    await db.prisoners.update_one(
        {"id": prisoner_id},
        {"$set": {"good_behavior_certified": True}}
    )
    
    return {"message": "Prisoner certified for good behavior", "prisoner_id": prisoner_id}


# --- Reward Fund Routes ---
@api_router.get("/reward-fund/status")
async def get_reward_fund_status():
    """Get current reward fund balance and statistics"""
    fund = await db.reward_fund.find_one({}, {"_id": 0})
    if not fund:
        return {
            "total_balance": 0.0,
            "total_collected_from_fines": 0.0,
            "total_distributed": 0.0,
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
    return fund


@api_router.post("/reward-distributions/lottery")
async def run_lottery():
    """Run lottery to select 3 random prisoners and distribute rewards equally"""
    import random
    
    # Get eligible prisoners
    eligible = await db.prisoners.find(
        {
            "status": "released",
            "good_behavior_certified": True,
            "rewarded": False
        },
        {"_id": 0}
    ).to_list(100)
    
    if len(eligible) < 3:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough eligible prisoners for lottery. Need 3, found {len(eligible)}"
        )
    
    # Get current fund balance
    fund = await db.reward_fund.find_one({})
    if not fund or fund.get("total_balance", 0) <= 0:
        raise HTTPException(status_code=400, detail="Insufficient reward fund balance")
    
    current_balance = fund["total_balance"]
    amount_per_prisoner = current_balance / 3
    
    # Select 3 random prisoners
    selected = random.sample(eligible, 3)
    
    # Create distribution record
    distribution_count = await db.reward_distributions.count_documents({})
    winners = [
        LotteryWinner(
            prisoner_id=p["id"],
            prisoner_name=p["name"],
            amount=amount_per_prisoner
        )
        for p in selected
    ]
    
    distribution = RewardDistribution(
        lottery_round=distribution_count + 1,
        fund_balance_before=current_balance,
        amount_distributed=current_balance,
        amount_per_prisoner=amount_per_prisoner,
        selected_prisoners=winners
    )
    
    doc = distribution.model_dump()
    await db.reward_distributions.insert_one(doc)
    
    # Update prisoners as rewarded
    for prisoner in selected:
        await db.prisoners.update_one(
            {"id": prisoner["id"]},
            {
                "$set": {
                    "rewarded": True,
                    "reward_received": amount_per_prisoner
                }
            }
        )
    
    # Update reward fund (deduct distributed amount, reset balance to 0)
    await db.reward_fund.update_one(
        {},
        {
            "$inc": {"total_distributed": current_balance},
            "$set": {
                "total_balance": 0.0,
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {k: v for k, v in doc.items() if k != "_id"}


@api_router.get("/reward-distributions")
async def get_reward_distributions():
    """Get history of all lottery distributions"""
    distributions = await db.reward_distributions.find({}, {"_id": 0}).sort("distribution_date", -1).to_list(100)
    return distributions


# --- Background Council Analysis Task ---
async def run_council_analysis(case_id: str, case_data: dict):
    """Run the full LLM Council analysis as a background task."""
    from llm_council import analyze_member, cross_review_member, synthesize_chief_justice

    member_ids = ["prosecution", "defense", "legal_scholar", "bias_detector"]

    try:
        logger.info(f"Starting council analysis for case {case_id}")

        # --- Stage 1: Independent analyses (parallel) ---
        stage1_tasks = [analyze_member(mid, case_data) for mid in member_ids]
        stage1_results = await asyncio.gather(*stage1_tasks, return_exceptions=True)

        members_data = {}
        for member_id, result in zip(member_ids, stage1_results):
            if isinstance(result, Exception):
                logger.error(f"Stage 1 member {member_id} failed: {result}")
                members_data[member_id] = {"status": "failed", "error": str(result)}
            else:
                members_data[member_id] = {"status": "complete", "analysis": result}

            await db.analyses.update_one(
                {"case_id": case_id},
                {"$set": {
                    f"members.{member_id}": members_data[member_id],
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }},
            )

        # Extract similar cases and laws from legal scholar (Stage 1)
        scholar = members_data.get("legal_scholar", {}).get("analysis", {})
        similar_cases = scholar.get("precedent_cases", [])
        relevant_laws = scholar.get("applicable_laws", [])
        
        # Enhance with InLegalBERT semantic search
        try:
            from inlegal_bert_service import get_similar_cases_with_bert, get_related_laws_with_bert
            
            # Build query text from case data
            case_description = case_data.get("description", "")
            if not case_description:
                # Fallback to case metadata if no description
                parts = []
                if case_data.get("title"):
                    parts.append(case_data["title"])
                if case_data.get("case_type"):
                    parts.append(f"Type: {case_data['case_type']}")
                if case_data.get("charges"):
                    parts.append(f"Charges: {', '.join(case_data['charges'])}")
                case_description = " | ".join(parts) if parts else "Unknown case"
            
            # Run BERT-based semantic search
            logger.info(f"Running InLegalBERT semantic search for case {case_id}")
            
            bert_similar_cases = await get_similar_cases_with_bert(db, case_description, limit=5)
            bert_related_laws = await get_related_laws_with_bert(db, case_description, limit=5)
            
            if bert_similar_cases:
                logger.info(f"InLegalBERT found {len(bert_similar_cases)} similar cases")
                # Merge with LLM-generated cases (LLM cases first, then BERT cases)
                # Add source tag to distinguish
                for case in bert_similar_cases:
                    case['source'] = 'bert_semantic_search'
                similar_cases = similar_cases + bert_similar_cases
            
            if bert_related_laws:
                logger.info(f"InLegalBERT found {len(bert_related_laws)} related laws")
                # Merge with LLM-generated laws
                for law in bert_related_laws:
                    law['source'] = 'bert_semantic_search'
                relevant_laws = relevant_laws + bert_related_laws
        
        except Exception as e:
            logger.warning(f"InLegalBERT semantic search failed (continuing without it): {str(e)}")

        await db.analyses.update_one(
            {"case_id": case_id},
            {"$set": {
                "stage": 2,
                "similar_cases": similar_cases,
                "relevant_laws": relevant_laws,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }},
        )
        logger.info(f"Stage 1 complete for case {case_id} — starting Stage 2 cross-review")

        # --- Stage 2: Cross-review deliberation (parallel) ---
        cross_review_tasks = [
            cross_review_member(mid, case_data, members_data.get(mid, {}).get("analysis", {}), members_data)
            for mid in member_ids
        ]
        cross_review_results = await asyncio.gather(*cross_review_tasks, return_exceptions=True)

        cross_reviews = {}
        for member_id, result in zip(member_ids, cross_review_results):
            if isinstance(result, Exception):
                logger.error(f"Stage 2 cross-review {member_id} failed: {result}")
                cross_reviews[member_id] = {"status": "failed", "error": str(result)}
            else:
                cross_reviews[member_id] = {"status": "complete", "analysis": result}

            await db.analyses.update_one(
                {"case_id": case_id},
                {"$set": {
                    f"cross_reviews.{member_id}": cross_reviews[member_id],
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }},
            )

        await db.analyses.update_one(
            {"case_id": case_id},
            {"$set": {
                "stage": 3,
                "chief_justice.status": "analyzing",
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }},
        )
        logger.info(f"Stage 2 cross-review complete for case {case_id} — starting Chief Justice synthesis")

        # --- Fetch judge profile before Stage 3 ---
        judge_profile = None
        judge_name = case_data.get("judge_name")
        if judge_name:
            name_parts = judge_name.replace("Justice", "").replace("justice", "").strip().split()
            search_term = name_parts[-1] if name_parts else judge_name
            judge_doc = await db.judges.find_one(
                {"name": {"$regex": search_term, "$options": "i"}},
                {"_id": 0},
            )
            if judge_doc:
                judge_profile = judge_doc
                logger.info(f"Judge profile found: {judge_doc['name']}")
                # Store minimal snapshot in analysis doc for frontend display
                snapshot = {
                    "id": judge_doc.get("id"),
                    "name": judge_doc.get("name"),
                    "court": judge_doc.get("court"),
                    "location": judge_doc.get("location"),
                    "bias_score": judge_doc.get("bias_score"),
                    "bias_risk": judge_doc.get("bias_risk"),
                    "report_card": judge_doc.get("report_card", {}),
                    "outlier_score": judge_doc.get("outlier_score"),
                    "bias_indicators": judge_doc.get("bias_indicators", [])[:4],
                    "temporal_patterns": {
                        "monday_effect": judge_doc.get("temporal_patterns", {}).get("monday_effect"),
                        "lunch_effect": judge_doc.get("temporal_patterns", {}).get("lunch_effect"),
                        "election_year_effect": judge_doc.get("temporal_patterns", {}).get("election_year_effect"),
                    } if judge_doc.get("temporal_patterns") else {},
                }
                await db.analyses.update_one(
                    {"case_id": case_id},
                    {"$set": {"judge_profile_snapshot": snapshot}},
                )
            else:
                logger.info(f"No judge profile found for: {judge_name}")

        # --- Stage 3: Chief Justice synthesis (uses Stage 1 + Stage 2 + judge profile) ---
        synthesis = await synthesize_chief_justice(case_data, members_data, cross_reviews, judge_profile)

        await db.analyses.update_one(
            {"case_id": case_id},
            {"$set": {
                "chief_justice": {"status": "complete", "synthesis": synthesis},
                "stage": 4,
                "status": "complete",
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }},
        )
        logger.info(f"Council analysis complete for case {case_id}")

    except Exception as e:
        logger.error(f"Council analysis FAILED for case {case_id}: {e}")
        await db.analyses.update_one(
            {"case_id": case_id},
            {"$set": {"status": "failed", "error": str(e), "updated_at": datetime.now(timezone.utc).isoformat()}},
        )


# --- Startup: Seed if empty ---
@app.on_event("startup")
async def startup_event():
    try:
        count = await db.judges.count_documents({})
        if count == 0:
            from seed_data import get_judge_data, get_laws_data
            judges = get_judge_data()
            laws = get_laws_data()
            if judges:
                await db.judges.insert_many(judges)
            if laws:
                await db.laws.insert_many(laws)
            logger.info(f"Auto-seeded {len(judges)} judges and {len(laws)} laws")
    except Exception as e:
        logger.error(f"Startup seeding failed: {e}")


app.include_router(api_router)
app.include_router(sarvam_router, prefix="/api")



def _resolve_state(text):
    """Map a court/jurisdiction/location string to an Indian state."""
    if not text:
        return None
    t = text.lower().strip()
    for key, state in COURT_STATE_MAP.items():
        if key in t:
            return state
    return None


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
