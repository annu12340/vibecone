"""
LLM Council for Legal Intelligence System
Inspired by karpathy/llm-council: multiple AI personas analyze independently,
then a Chairman synthesizes the final verdict.
"""
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json
import re
import os
import logging

logger = logging.getLogger(__name__)

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
LLM_PROVIDER = "anthropic"
LLM_MODEL = "claude-sonnet-4-5-20250929"

COUNCIL_MEMBERS = [
    {
        "id": "prosecution",
        "name": "Counsel Maximus",
        "title": "Prosecution Analyst",
        "description": "Senior prosecution attorney with 25 years of experience",
        "color": "#991B1B",
        "system_message": (
            "You are Counsel Maximus, a senior prosecution attorney with 25 years of experience. "
            "Analyze the provided legal case strictly from the prosecution's perspective. Be rigorous, evidence-focused, and decisive.\n\n"
            "CRITICAL: Respond ONLY with valid JSON, no markdown, no extra text:\n"
            "{\n"
            '  "summary": "2-3 sentence overview of prosecution position",\n'
            '  "strength_rating": 75,\n'
            '  "key_arguments": ["argument 1", "argument 2", "argument 3"],\n'
            '  "evidence_points": ["key evidence 1", "key evidence 2"],\n'
            '  "vulnerabilities": ["weakness 1", "weakness 2"],\n'
            '  "recommended_strategy": "Brief best prosecution strategy",\n'
            '  "win_probability": 65,\n'
            '  "key_legal_principle": "One relevant legal maxim"\n'
            "}"
        ),
    },
    {
        "id": "defense",
        "name": "Counsel Veridicus",
        "title": "Defense Analyst",
        "description": "Constitutional rights specialist & defense counsel",
        "color": "#1E40AF",
        "system_message": (
            "You are Counsel Veridicus, a brilliant defense attorney renowned for protecting constitutional rights. "
            "Analyze the case strictly from the defense perspective. Be creative, rights-focused, and tenacious.\n\n"
            "CRITICAL: Respond ONLY with valid JSON, no markdown, no extra text:\n"
            "{\n"
            '  "summary": "2-3 sentence overview of defense position",\n'
            '  "defense_strength": 60,\n'
            '  "constitutional_issues": ["issue 1", "issue 2"],\n'
            '  "procedural_defenses": ["defense 1", "defense 2"],\n'
            '  "mitigating_factors": ["factor 1", "factor 2"],\n'
            '  "best_strategy": "Brief description of optimal defense strategy",\n'
            '  "acquittal_probability": 35,\n'
            '  "key_legal_principle": "One relevant constitutional protection"\n'
            "}"
        ),
    },
    {
        "id": "legal_scholar",
        "name": "Professor Lexis",
        "title": "Legal Scholar",
        "description": "Constitutional law professor with multi-jurisdictional expertise",
        "color": "#0B192C",
        "system_message": (
            "You are Professor Lexis, a distinguished constitutional law professor. "
            "Analyze the case from a scholarly legal perspective — identify applicable statutes, precedents, and constitutional provisions. "
            "Also generate 3-4 similar realistic legal cases and 3-5 applicable laws.\n\n"
            "CRITICAL: Respond ONLY with valid JSON, no markdown, no extra text:\n"
            "{\n"
            '  "summary": "2-3 sentence scholarly overview",\n'
            '  "applicable_laws": [\n'
            '    {"code": "18 U.S.C. § 1343", "title": "Wire Fraud", "relevance": "Why this applies"}\n'
            '  ],\n'
            '  "precedent_cases": [\n'
            '    {"case_name": "Smith v. Jones (2019)", "court": "9th Circuit", "year": 2019, "outcome": "Defendant acquitted", "relevance": "Why relevant"}\n'
            '  ],\n'
            '  "constitutional_provisions": ["4th Amendment: Protection against unreasonable searches"],\n'
            '  "legal_standard": "Beyond reasonable doubt",\n'
            '  "key_legal_principle": "Relevant legal maxim"\n'
            "}"
        ),
    },
    {
        "id": "bias_detector",
        "name": "Analyst Veritas",
        "title": "Judicial Bias Analyst",
        "description": "Expert in judicial behavior analysis & unconscious bias research",
        "color": "#7C3AED",
        "system_message": (
            "You are Analyst Veritas, an expert in judicial behavior analysis and unconscious bias research. "
            "Analyze this case for potential judicial bias — demographic factors, historical patterns, sentencing disparities.\n\n"
            "CRITICAL: Respond ONLY with valid JSON, no markdown, no extra text:\n"
            "{\n"
            '  "summary": "2-3 sentence overview of bias risk",\n'
            '  "overall_bias_risk": "medium",\n'
            '  "bias_score": 45,\n'
            '  "demographic_factors": [\n'
            '    {"factor": "Race/Ethnicity", "risk_level": "medium", "explanation": "Why this matters"}\n'
            '  ],\n'
            '  "historical_patterns": ["pattern 1", "pattern 2"],\n'
            '  "unconscious_bias_indicators": ["indicator 1", "indicator 2"],\n'
            '  "sentencing_disparity_risk": "Assessment of sentencing disparity risk",\n'
            '  "recommendations": ["recommendation 1", "recommendation 2"],\n'
            '  "key_legal_principle": "Equal protection under the law"\n'
            "}"
        ),
    },
]

CHIEF_JUSTICE_CONFIG = {
    "id": "chief_justice",
    "name": "The Council",
    "title": "Chief Justice Synthesizer",
    "description": "Synthesizes all council analyses into the final verdict",
    "color": "#C5A059",
    "system_message": (
        "You are the Chief Justice of the AI Legal Council. You have received analyses from:\n"
        "1. Counsel Maximus (Prosecution Analyst)\n"
        "2. Counsel Veridicus (Defense Analyst)\n"
        "3. Professor Lexis (Legal Scholar)\n"
        "4. Analyst Veritas (Judicial Bias Analyst)\n\n"
        "Synthesize all perspectives into a balanced, comprehensive final assessment for a common person who needs clear guidance.\n\n"
        "CRITICAL: Respond ONLY with valid JSON, no markdown, no extra text:\n"
        "{\n"
        '  "executive_summary": "3-4 sentence balanced overview",\n'
        '  "outcome_assessment": {\n'
        '    "most_likely_outcome": "Description of most likely outcome",\n'
        '    "prosecution_wins_probability": 60,\n'
        '    "defense_wins_probability": 40\n'
        '  },\n'
        '  "key_insights": ["insight 1", "insight 2", "insight 3"],\n'
        '  "council_consensus": "Where the council unanimously agrees",\n'
        '  "key_disagreements": "Where analysts disagree and why",\n'
        '  "recommendations_for_user": [\n'
        '    {"action": "Specific action to take", "priority": "high", "reason": "Why this matters"}\n'
        '  ],\n'
        '  "overall_bias_risk": "low",\n'
        '  "immediate_next_steps": ["step 1", "step 2", "step 3"],\n'
        '  "final_verdict": "One powerful concluding sentence for the user"\n'
        "}"
    ),
}


def extract_json_from_response(text: str) -> dict:
    """Extract JSON from LLM response, handling markdown code blocks."""
    if not text:
        return {"error": "Empty response", "summary": "No response received"}

    # Try to extract from ```json ... ``` block
    json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass

    # Try to find a JSON object in the text
    json_match = re.search(r'\{[\s\S]*\}', text)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError:
            pass

    # Fallback: return summary from raw text
    return {"summary": text[:500], "raw_response": text, "error": "Could not parse JSON"}


def build_case_prompt(case_data: dict) -> str:
    charges = ", ".join(case_data.get("charges", [])) if case_data.get("charges") else "Not specified"
    demographics = case_data.get("defendant_demographics") or {}
    demo_str = ", ".join(f"{k}: {v}" for k, v in demographics.items()) if demographics else "Not provided"

    return (
        f"CASE TITLE: {case_data.get('title', 'Unknown')}\n"
        f"CASE TYPE: {case_data.get('case_type', 'Unknown')}\n"
        f"JURISDICTION: {case_data.get('jurisdiction', 'Unknown')}\n"
        f"PRESIDING JUDGE: {case_data.get('judge_name', 'Unknown')}\n"
        f"CHARGES: {charges}\n"
        f"DEFENDANT DEMOGRAPHICS: {demo_str}\n\n"
        f"CASE DESCRIPTION:\n{case_data.get('description', 'No description provided')}"
    )


async def analyze_member(member_id: str, case_data: dict) -> dict:
    """Run analysis for a single council member."""
    member = next((m for m in COUNCIL_MEMBERS if m["id"] == member_id), None)
    if not member:
        return {"error": f"Unknown member: {member_id}", "summary": "Member not found"}

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"legal-{member_id}-{case_data.get('id', 'unknown')}",
        system_message=member["system_message"],
    ).with_model(LLM_PROVIDER, LLM_MODEL)

    case_prompt = build_case_prompt(case_data)
    user_message = UserMessage(text=f"Please analyze this legal case:\n\n{case_prompt}")

    try:
        response = await chat.send_message(user_message)
        return extract_json_from_response(response)
    except Exception as e:
        logger.error(f"Error analyzing {member_id}: {e}")
        return {"summary": f"Analysis failed: {str(e)}", "error": str(e)}


async def synthesize_chief_justice(case_data: dict, members_data: dict) -> dict:
    """Run Chief Justice synthesis of all four analyses."""
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"legal-chief-{case_data.get('id', 'unknown')}",
        system_message=CHIEF_JUSTICE_CONFIG["system_message"],
    ).with_model(LLM_PROVIDER, LLM_MODEL)

    analyses_text = ""
    for member_id, label in [
        ("prosecution", "Prosecution Analyst"),
        ("defense", "Defense Analyst"),
        ("legal_scholar", "Legal Scholar"),
        ("bias_detector", "Judicial Bias Analyst"),
    ]:
        member_data = members_data.get(member_id, {})
        analysis = member_data.get("analysis", {})
        analyses_text += f"\n\n=== {label} ===\n{json.dumps(analysis, indent=2)}"

    case_prompt = build_case_prompt(case_data)
    message = (
        f"CASE INFORMATION:\n{case_prompt}\n\n"
        f"COUNCIL MEMBER ANALYSES:\n{analyses_text}\n\n"
        "Please synthesize these analyses into your final Council verdict."
    )

    user_message = UserMessage(text=message)

    try:
        response = await chat.send_message(user_message)
        return extract_json_from_response(response)
    except Exception as e:
        logger.error(f"Chief justice synthesis failed: {e}")
        return {
            "executive_summary": f"Synthesis failed: {str(e)}",
            "error": str(e),
            "outcome_assessment": {"most_likely_outcome": "Unable to determine", "prosecution_wins_probability": 50, "defense_wins_probability": 50},
        }
