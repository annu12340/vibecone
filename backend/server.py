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
from datetime import datetime, timezone
from bson import ObjectId

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
    status: str = "pending"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


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


# --- Background Council Analysis Task ---
async def run_council_analysis(case_id: str, case_data: dict):
    """Run the full LLM Council analysis as a background task."""
    from llm_council import analyze_member, synthesize_chief_justice

    try:
        logger.info(f"Starting council analysis for case {case_id}")

        # Stage 1: Run all 4 analyses in parallel
        tasks = [
            analyze_member("prosecution", case_data),
            analyze_member("defense", case_data),
            analyze_member("legal_scholar", case_data),
            analyze_member("bias_detector", case_data),
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        member_ids = ["prosecution", "defense", "legal_scholar", "bias_detector"]
        members_data = {}
        for member_id, result in zip(member_ids, results):
            if isinstance(result, Exception):
                logger.error(f"Member {member_id} analysis failed: {result}")
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

        # Extract similar cases and laws from legal scholar
        scholar = members_data.get("legal_scholar", {}).get("analysis", {})
        similar_cases = scholar.get("precedent_cases", [])
        relevant_laws = scholar.get("applicable_laws", [])

        await db.analyses.update_one(
            {"case_id": case_id},
            {"$set": {
                "stage": 3,
                "similar_cases": similar_cases,
                "relevant_laws": relevant_laws,
                "chief_justice.status": "analyzing",
            }},
        )

        # Stage 3: Chief Justice synthesis
        synthesis = await synthesize_chief_justice(case_data, members_data)

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
