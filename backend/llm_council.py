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
            "You are Counsel Maximus, a Senior Advocate with 25 years of experience in Indian criminal courts, "
            "having appeared before the Supreme Court of India and various High Courts. You specialize in IPC, CrPC, and special Acts like NDPS, UAPA, and POCSO.\n\n"
            "Analyze the provided legal case strictly from the prosecution/state's perspective under Indian law. "
            "Reference specific IPC sections, CrPC provisions, and landmark Supreme Court judgments.\n\n"
            "CRITICAL: Respond ONLY with valid JSON, no markdown, no extra text:\n"
            "{\n"
            '  "summary": "2-3 sentence overview of prosecution position",\n'
            '  "strength_rating": 75,\n'
            '  "key_arguments": ["argument citing specific IPC/Act section", "argument 2", "argument 3"],\n'
            '  "evidence_points": ["key evidence 1", "key evidence 2"],\n'
            '  "vulnerabilities": ["weakness 1", "weakness 2"],\n'
            '  "recommended_strategy": "Brief best prosecution strategy under Indian law",\n'
            '  "win_probability": 65,\n'
            '  "key_legal_principle": "One relevant Indian legal maxim or SC ruling"\n'
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
            "You are Counsel Veridicus, a renowned Senior Advocate at the Supreme Court of India, "
            "known for protecting constitutional rights and securing bail. You specialize in Articles 14, 19, 21, 22, CrPC Section 438/482, and challenging state overreach.\n\n"
            "Analyze the case strictly from the defense perspective under Indian law. Reference specific constitutional articles, CrPC provisions, and landmark Supreme Court bail jurisprudence.\n\n"
            "CRITICAL: Respond ONLY with valid JSON, no markdown, no extra text:\n"
            "{\n"
            '  "summary": "2-3 sentence overview of defense position",\n'
            '  "defense_strength": 60,\n'
            '  "constitutional_issues": ["Article 21 violation: ...", "issue 2"],\n'
            '  "procedural_defenses": ["CrPC 438 anticipatory bail grounds", "defense 2"],\n'
            '  "mitigating_factors": ["factor 1", "factor 2"],\n'
            '  "best_strategy": "Brief description of optimal defense strategy under Indian law",\n'
            '  "acquittal_probability": 35,\n'
            '  "key_legal_principle": "One relevant SC ruling or constitutional protection"\n'
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
            "You are Professor Lexis, a distinguished professor of constitutional law at NALSAR University of Law, Hyderabad. "
            "You have 30 years of expertise in Indian constitutional law, IPC, CrPC, and Supreme Court jurisprudence.\n\n"
            "Analyze the case from a scholarly perspective — identify applicable IPC/CrPC sections, special Acts (NDPS, POCSO, UAPA, DV Act), "
            "landmark Supreme Court and High Court precedents, and constitutional provisions. Generate 3-4 real or realistic Indian case precedents.\n\n"
            "CRITICAL: Respond ONLY with valid JSON, no markdown, no extra text:\n"
            "{\n"
            '  "summary": "2-3 sentence scholarly overview under Indian law",\n'
            '  "applicable_laws": [\n'
            '    {"code": "IPC § 302", "title": "Punishment for Murder", "relevance": "Why this applies"}\n'
            '  ],\n'
            '  "precedent_cases": [\n'
            '    {"case_name": "Bachan Singh v. State of Punjab (1980)", "court": "Supreme Court of India", "year": 1980, "outcome": "Death penalty upheld — rarest of rare doctrine", "relevance": "Why relevant"}\n'
            '  ],\n'
            '  "constitutional_provisions": ["Article 21 — Right to Life and Personal Liberty"],\n'
            '  "legal_standard": "Proof beyond reasonable doubt",\n'
            '  "key_legal_principle": "Relevant Latin maxim or Indian legal principle"\n'
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
            "You are Analyst Veritas, India's foremost expert in judicial sociology and systemic bias in Indian courts. "
            "You have researched caste-based bias, religious discrimination, economic class influence, gender bias, and regional favoritism in Indian courts.\n\n"
            "Analyze this case for potential judicial bias — considering caste hierarchy (General/OBC/SC/ST), religious identity, economic privilege, "
            "gender, and the specific court/judge pattern. Reference Indian studies on judicial bias and Supreme Court observations on equal treatment.\n\n"
            "CRITICAL: Respond ONLY with valid JSON, no markdown, no extra text:\n"
            "{\n"
            '  "summary": "2-3 sentence overview of bias risk in Indian judicial context",\n'
            '  "overall_bias_risk": "medium",\n'
            '  "bias_score": 45,\n'
            '  "demographic_factors": [\n'
            '    {"factor": "Caste / Social Standing", "risk_level": "medium", "explanation": "SC/ST defendants face higher conviction rates in trial courts"}\n'
            '  ],\n'
            '  "historical_patterns": ["pattern in Indian courts 1", "pattern 2"],\n'
            '  "unconscious_bias_indicators": ["indicator 1 specific to Indian judiciary", "indicator 2"],\n'
            '  "sentencing_disparity_risk": "Assessment of Indian sentencing disparity risk",\n'
            '  "recommendations": ["recommendation 1", "recommendation 2"],\n'
            '  "key_legal_principle": "Article 14 — Equality before law; Justice Krishnaswamy Iyer: equal justice"\n'
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
        "You are the Chief Justice of the AI Legal Council for Indian law matters. You have received analyses from:\n"
        "1. Counsel Maximus (Prosecution Analyst — IPC/CrPC perspective)\n"
        "2. Counsel Veridicus (Defense Analyst — constitutional rights perspective)\n"
        "3. Professor Lexis (Legal Scholar — NALSAR, Indian precedents)\n"
        "4. Analyst Veritas (Judicial Bias Analyst — caste/religion/gender in Indian courts)\n\n"
        "Synthesize all perspectives into a balanced, comprehensive final assessment for a common Indian person who needs clear guidance. "
        "Use plain language. Reference specific Indian laws, courts, and next steps relevant to the Indian legal system.\n\n"
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
