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
        "You are the Chief Justice of the AI Legal Council for Indian law matters. "
        "You have received TWO rounds of deliberation:\n"
        "— Stage 1: Independent analyses from each of the four council members\n"
        "— Stage 2: Cross-review rebuttals where each analyst challenged the others\n\n"
        "Council members:\n"
        "1. Counsel Maximus (Prosecution Analyst — IPC/CrPC perspective)\n"
        "2. Counsel Veridicus (Defense Analyst — constitutional rights perspective)\n"
        "3. Professor Lexis (Legal Scholar — NALSAR, Indian precedents)\n"
        "4. Analyst Veritas (Judicial Bias Analyst — caste/religion/gender in Indian courts)\n\n"
        "Having observed both rounds of deliberation — original analyses AND cross-review rebuttals — "
        "synthesize the most balanced, well-considered final assessment. "
        "Note where the cross-review shifted positions, where disagreements hardened, and what emerged as the strongest consensus. "
        "Use plain language. Reference specific Indian laws, courts, and actionable next steps.\n\n"
        "CRITICAL: Respond ONLY with valid JSON, no markdown, no extra text:\n"
        "{\n"
        '  "executive_summary": "3-4 sentence balanced overview reflecting both rounds of deliberation",\n'
        '  "outcome_assessment": {\n'
        '    "most_likely_outcome": "Description of most likely outcome",\n'
        '    "prosecution_wins_probability": 60,\n'
        '    "defense_wins_probability": 40\n'
        '  },\n'
        '  "key_insights": ["insight from cross-review deliberation 1", "insight 2", "insight 3"],\n'
        '  "council_consensus": "Where both Stage 1 and Stage 2 converge — strongest agreement",\n'
        '  "key_disagreements": "The sharpest clash that emerged during cross-review and why it matters",\n'
        '  "cross_review_impact": "How Stage 2 deliberation changed or hardened the council positions",\n'
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
    """Build comprehensive case prompt including eCourts metadata"""
    charges = ", ".join(case_data.get("charges", [])) if case_data.get("charges") else "Not specified"
    demographics = case_data.get("defendant_demographics") or {}
    demo_str = ", ".join(f"{k}: {v}" for k, v in demographics.items()) if demographics else "Not provided"
    
    # Extract eCourts metadata if available
    ecourts = case_data.get("ecourts_metadata", {})
    
    # Build base case information
    prompt_parts = [
        f"CASE TITLE: {case_data.get('title', 'Unknown')}",
        f"CASE TYPE: {case_data.get('case_type', 'Unknown')}",
        f"JURISDICTION: {case_data.get('jurisdiction', 'Unknown')}",
        f"PRESIDING JUDGE: {case_data.get('judge_name', 'Unknown')}",
        f"CHARGES/LEGAL PROVISIONS: {charges}",
        f"DEFENDANT DEMOGRAPHICS: {demo_str}",
    ]
    
    # Add eCourts specific information if available
    if ecourts:
        prompt_parts.append("\n=== ECOURTS CASE DETAILS ===")
        
        if ecourts.get("cnr"):
            prompt_parts.append(f"CNR: {ecourts['cnr']}")
        
        if ecourts.get("case_status"):
            prompt_parts.append(f"CASE STATUS: {ecourts['case_status']}")
        
        if ecourts.get("case_number"):
            prompt_parts.append(f"CASE NUMBER: {ecourts['case_number']}")
        
        # Timeline information
        if any([ecourts.get("filing_date"), ecourts.get("registration_date"), 
                ecourts.get("first_hearing_date"), ecourts.get("next_hearing_date")]):
            prompt_parts.append("\nTIMELINE:")
            if ecourts.get("filing_date"):
                prompt_parts.append(f"  - Filed on: {ecourts['filing_date']}")
            if ecourts.get("registration_date"):
                prompt_parts.append(f"  - Registered on: {ecourts['registration_date']}")
            if ecourts.get("first_hearing_date"):
                prompt_parts.append(f"  - First hearing: {ecourts['first_hearing_date']}")
            if ecourts.get("last_hearing_date"):
                prompt_parts.append(f"  - Last hearing: {ecourts['last_hearing_date']}")
            if ecourts.get("next_hearing_date"):
                prompt_parts.append(f"  - Next hearing: {ecourts['next_hearing_date']}")
            if ecourts.get("decision_date"):
                prompt_parts.append(f"  - Decision date: {ecourts['decision_date']}")
        
        # Parties information
        if ecourts.get("petitioners") or ecourts.get("respondents"):
            prompt_parts.append("\nPARTIES:")
            if ecourts.get("petitioners"):
                petitioners_list = ", ".join(ecourts['petitioners'])
                prompt_parts.append(f"  PETITIONER(S): {petitioners_list}")
                if ecourts.get("petitioner_advocates"):
                    advocates = ", ".join(ecourts['petitioner_advocates'])
                    prompt_parts.append(f"    Represented by: {advocates}")
            
            if ecourts.get("respondents"):
                respondents_list = ", ".join(ecourts['respondents'])
                prompt_parts.append(f"  RESPONDENT(S): {respondents_list}")
                if ecourts.get("respondent_advocates"):
                    advocates = ", ".join(ecourts['respondent_advocates'])
                    prompt_parts.append(f"    Represented by: {advocates}")
        
        # Case progress information
        if ecourts.get("order_count") or ecourts.get("stage_of_case"):
            prompt_parts.append("\nCASE PROGRESS:")
            if ecourts.get("stage_of_case"):
                prompt_parts.append(f"  Stage: {ecourts['stage_of_case']}")
            if ecourts.get("order_count"):
                prompt_parts.append(f"  Orders filed: {ecourts['order_count']}")
            if ecourts.get("judicial_section"):
                prompt_parts.append(f"  Judicial section: {ecourts['judicial_section']}")
        
        # Latest order summary if available
        if ecourts.get("latest_order_analysis"):
            order_analysis = ecourts['latest_order_analysis']
            prompt_parts.append("\nLATEST ORDER ANALYSIS:")
            if order_analysis.get("ai_generated_executive_summary"):
                prompt_parts.append(f"  Executive Summary: {order_analysis['ai_generated_executive_summary']}")
            if order_analysis.get("plain_language_summary_for_litigants_outcome_focused"):
                prompt_parts.append(f"  Plain Language: {order_analysis['plain_language_summary_for_litigants_outcome_focused']}")
            if order_analysis.get("court_reasoning_for_decision"):
                prompt_parts.append(f"  Court Reasoning: {order_analysis['court_reasoning_for_decision']}")
        
        # Case AI analysis if available
        if ecourts.get("case_ai_analysis"):
            ai_analysis = ecourts['case_ai_analysis']
            prompt_parts.append("\nCASE AI ANALYSIS:")
            if ai_analysis.get("caseSummary"):
                prompt_parts.append(f"  Summary: {ai_analysis['caseSummary']}")
            if ai_analysis.get("caseType"):
                prompt_parts.append(f"  Case Type: {ai_analysis['caseType']}")
            if ai_analysis.get("complexity"):
                prompt_parts.append(f"  Complexity: {ai_analysis['complexity']}")
            if ai_analysis.get("keyIssues"):
                issues = ", ".join(ai_analysis['keyIssues'])
                prompt_parts.append(f"  Key Issues: {issues}")
        
        # Subordinate court information
        if ecourts.get("subordinate_court"):
            sub_court = ecourts['subordinate_court']
            if sub_court.get("courtName"):
                prompt_parts.append(f"\nSUBORDINATE COURT: {sub_court.get('courtName')}")
                if sub_court.get("caseNumber"):
                    prompt_parts.append(f"  Case Number: {sub_court.get('caseNumber')}")
                if sub_court.get("filingDate"):
                    prompt_parts.append(f"  Filed on: {sub_court.get('filingDate')}")
    
    # Add case description
    prompt_parts.append(f"\nCASE DESCRIPTION:\n{case_data.get('description', 'No description provided')[:2000]}")
    
    return "\n".join(prompt_parts)


CROSS_REVIEW_MESSAGES = {
    "prosecution": (
        "You are Counsel Maximus, Prosecution Analyst. You have completed your Stage 1 analysis. "
        "You are now reviewing the other council members' Stage 1 analyses to sharpen your position.\n\n"
        "Read the defense, scholar, and bias analyst responses carefully. "
        "Identify where the defense argument is weakest, where the scholar supports your case, "
        "and whether the bias analyst's findings help or hurt the prosecution.\n\n"
        "CRITICAL: Respond ONLY with valid JSON:\n"
        "{\n"
        '  "cross_review_summary": "1-2 sentence overall reaction after reading others",\n'
        '  "agreements": ["What you agree with from the other analysts — be specific"],\n'
        '  "challenges": ["The weakest defense argument you will demolish in court", "challenge 2"],\n'
        '  "revised_position": "Any change to your prosecution strategy based on what you read",\n'
        '  "key_insight": "The single most important point the other analysts missed or got wrong"\n'
        "}"
    ),
    "defense": (
        "You are Counsel Veridicus, Defense Analyst. You have completed your Stage 1 analysis. "
        "You are now reviewing the other council members' Stage 1 analyses to reinforce your defense.\n\n"
        "Read the prosecution, scholar, and bias analyst responses carefully. "
        "Challenge the prosecution's strongest arguments, find constitutional angles the scholar missed, "
        "and leverage the bias analyst's findings to protect your client.\n\n"
        "CRITICAL: Respond ONLY with valid JSON:\n"
        "{\n"
        '  "cross_review_summary": "1-2 sentence overall reaction after reading others",\n'
        '  "agreements": ["What you agree with from the other analysts — especially the bias analyst"],\n'
        '  "challenges": ["The prosecution argument you will challenge most vigorously", "challenge 2"],\n'
        '  "revised_position": "Any updated defense strategy based on what you read",\n'
        '  "key_insight": "The constitutional protection or precedent the prosecution completely ignored"\n'
        "}"
    ),
    "legal_scholar": (
        "You are Professor Lexis, Legal Scholar. You have completed your Stage 1 analysis. "
        "You are now reviewing the prosecution and defense analyses for legal accuracy.\n\n"
        "As a neutral academic, identify where the prosecution or defense misapplied Indian law, "
        "flag any incorrect citations, and add the most critical precedent that neither side mentioned.\n\n"
        "CRITICAL: Respond ONLY with valid JSON:\n"
        "{\n"
        '  "cross_review_summary": "1-2 sentence scholarly assessment of both sides",\n'
        '  "agreements": ["What either side got legally correct — cite the law/provision"],\n'
        '  "challenges": ["A legal error or misapplication you identified in either analysis", "challenge 2"],\n'
        '  "revised_position": "Any updated scholarly position based on cross-review",\n'
        '  "key_insight": "The most important precedent or legal principle both sides overlooked"\n'
        "}"
    ),
    "bias_detector": (
        "You are Analyst Veritas, Judicial Bias Analyst. You have completed your Stage 1 analysis. "
        "You are now reviewing all other analyses to flag any bias they missed or dismissed.\n\n"
        "Examine whether the prosecution exploited systemic biases, whether the defense adequately "
        "raised equality arguments, and whether the scholar's precedents reflect equitable outcomes.\n\n"
        "CRITICAL: Respond ONLY with valid JSON:\n"
        "{\n"
        '  "cross_review_summary": "1-2 sentence bias assessment of the other analyses",\n'
        '  "agreements": ["Where another analyst correctly identified a systemic factor"],\n'
        '  "challenges": ["Bias angle that the prosecution/defense/scholar completely ignored", "challenge 2"],\n'
        '  "revised_position": "Any refined bias risk assessment after reviewing the full council",\n'
        '  "key_insight": "The single most important equality concern the entire council has underweighted"\n'
        "}"
    ),
}


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


async def cross_review_member(member_id: str, case_data: dict, own_analysis: dict, all_analyses: dict) -> dict:
    """Run Stage 2 cross-review for a council member — reads others' Stage 1 analyses and responds."""
    system_msg = CROSS_REVIEW_MESSAGES.get(member_id)
    if not system_msg:
        return {"error": f"No cross-review config for: {member_id}", "cross_review_summary": "Not configured"}

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"legal-xreview-{member_id}-{case_data.get('id', 'unknown')}",
        system_message=system_msg,
    ).with_model(LLM_PROVIDER, LLM_MODEL)

    member_labels = {
        "prosecution": "Counsel Maximus — Prosecution Analyst",
        "defense": "Counsel Veridicus — Defense Analyst",
        "legal_scholar": "Professor Lexis — Legal Scholar",
        "bias_detector": "Analyst Veritas — Judicial Bias Analyst",
    }

    other_analyses_text = f"\n\n=== YOUR OWN STAGE 1 ANALYSIS ===\n{json.dumps(own_analysis, indent=2)}"
    for mid, data in all_analyses.items():
        if mid == member_id:
            continue
        label = member_labels.get(mid, mid)
        analysis = data.get("analysis", {})
        other_analyses_text += f"\n\n=== {label} ===\n{json.dumps(analysis, indent=2)}"

    case_prompt = build_case_prompt(case_data)
    message = (
        f"CASE:\n{case_prompt}\n\n"
        f"COUNCIL ANALYSES TO REVIEW:{other_analyses_text}\n\n"
        "Please provide your cross-review response."
    )

    try:
        response = await chat.send_message(UserMessage(text=message))
        return extract_json_from_response(response)
    except Exception as e:
        logger.error(f"Cross-review failed for {member_id}: {e}")
        return {"cross_review_summary": f"Cross-review failed: {str(e)}", "error": str(e)}


async def synthesize_chief_justice(
    case_data: dict,
    members_data: dict,
    cross_reviews: dict = None,
    judge_profile: dict = None,
) -> dict:
    """Run Chief Justice synthesis using Stage 1 analyses + Stage 2 cross-reviews + judge profile."""
    # Update system message to mention judge profile availability
    has_judge = bool(judge_profile and judge_profile.get("name"))
    system_msg = CHIEF_JUSTICE_CONFIG["system_message"]
    if has_judge:
        system_msg = system_msg.replace(
            "You have received TWO rounds of deliberation:",
            "You have received TWO rounds of deliberation AND the presiding judge's historical bias profile:"
        )

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"legal-chief-{case_data.get('id', 'unknown')}",
        system_message=system_msg,
    ).with_model(LLM_PROVIDER, LLM_MODEL)

    member_labels = [
        ("prosecution", "Counsel Maximus — Prosecution Analyst"),
        ("defense", "Counsel Veridicus — Defense Analyst"),
        ("legal_scholar", "Professor Lexis — Legal Scholar"),
        ("bias_detector", "Analyst Veritas — Judicial Bias Analyst"),
    ]

    stage1_text = ""
    for member_id, label in member_labels:
        member_data = members_data.get(member_id, {})
        analysis = member_data.get("analysis", {})
        stage1_text += f"\n\n=== {label} ===\n{json.dumps(analysis, indent=2)}"

    stage2_text = ""
    if cross_reviews:
        for member_id, label in member_labels:
            review = cross_reviews.get(member_id, {}).get("analysis", {})
            if review:
                stage2_text += f"\n\n=== {label} — Cross-Review ===\n{json.dumps(review, indent=2)}"

    judge_text = ""
    if has_judge:
        judge_text = build_judge_profile_text(judge_profile)

    case_prompt = build_case_prompt(case_data)

    extra_schema = ""
    if has_judge:
        extra_schema = (
            ',\n'
            '  "judge_bias_warning": "Specific warning about this judge\'s known bias patterns as they apply to THIS case and defendant demographics",\n'
            '  "judge_temporal_risk": "Any temporal risk from this judge\'s patterns — Monday effect, post-lunch, election year — that should concern the defendant"'
        )
        _ = extra_schema  # used in judge_schema_note construction

    # Update schema prompt to include judge fields
    judge_schema_note = ""
    if has_judge:
        judge_schema_note = (
            "\n\nIMPORTANT: You have the presiding judge's bias profile. Add two fields to your JSON:\n"
            '"judge_bias_warning": A specific, actionable warning about this judge\'s known biases as they apply to this case\'s defendant demographics. Be direct and specific.\n'
            '"judge_temporal_risk": Note any temporal factors (Monday harshness, post-lunch bail denial, election year effects) relevant to when hearings may occur.'
        )

    message = (
        f"CASE INFORMATION:\n{case_prompt}\n"
        + (f"\n=== PRESIDING JUDGE HISTORICAL PROFILE ===\n{judge_text}\n" if judge_text else "")
        + f"\n=== STAGE 1: INDIVIDUAL ANALYSES ==={stage1_text}\n\n"
        f"=== STAGE 2: CROSS-REVIEW DELIBERATIONS ==={stage2_text if stage2_text else chr(10) + '(Cross-review not available)'}\n\n"
        f"Please synthesize all stages into your final Council verdict.{judge_schema_note}"
    )

    try:
        response = await chat.send_message(UserMessage(text=message))
        return extract_json_from_response(response)
    except Exception as e:
        logger.error(f"Chief justice synthesis failed: {e}")
        return {
            "executive_summary": f"Synthesis failed: {str(e)}",
            "error": str(e),
            "outcome_assessment": {"most_likely_outcome": "Unable to determine", "prosecution_wins_probability": 50, "defense_wins_probability": 50},
        }


def build_judge_profile_text(profile: dict) -> str:
    """Build a concise, structured judge profile summary for the Chief Justice prompt."""
    lines = [
        f"Judge: {profile.get('name', 'Unknown')}",
        f"Court: {profile.get('court', 'Unknown')} | {profile.get('location', '')}",
        f"Bias Score: {profile.get('bias_score', 'N/A')}/100 | Risk: {str(profile.get('bias_risk', 'unknown')).upper()}",
        f"Years on Bench: {profile.get('years_on_bench', 'N/A')} | Total Cases Decided: {profile.get('total_cases', 'N/A')}",
    ]

    rc = profile.get("report_card", {})
    if rc:
        lines.append(
            f"Report Card Grades — Overall: {rc.get('overall','?')} | "
            f"Caste/Religious: {rc.get('caste_religious','?')} | Gender: {rc.get('gender','?')} | "
            f"Socioeconomic: {rc.get('socioeconomic','?')} | Recidivism: {rc.get('recidivism','?')} | "
            f"Geographic: {rc.get('geographic','?')}"
        )

    os_data = profile.get("outlier_score", {})
    if os_data:
        lines.append(
            f"Outlier Score: {os_data.get('direction','?')} peers by {os_data.get('score','?')}pp | "
            f"Conviction rate {os_data.get('this_judge_conviction_rate','?')}% vs peer avg {os_data.get('peer_avg','?')}% | "
            f"{os_data.get('percentile','?')}th percentile"
        )
        if os_data.get("label"):
            lines.append(f"  Assessment: {os_data['label']}")

    indicators = profile.get("bias_indicators", [])
    if indicators:
        lines.append("Documented Bias Indicators:")
        for ind in indicators[:4]:
            lines.append(f"  - {ind}")

    tp = profile.get("temporal_patterns", {})
    if tp:
        lines.append("Temporal Risk Patterns:")
        if tp.get("monday_effect"):
            lines.append(f"  - Monday Effect: {tp['monday_effect']}")
        if tp.get("lunch_effect"):
            lines.append(f"  - Lunch Effect (post-13:00): {tp['lunch_effect']}")
        ee = tp.get("election_year_effect", {})
        if ee and ee.get("assessment"):
            lines.append(f"  - Election Year: {ee['assessment']}")
        me = tp.get("media_effect", {})
        if me and me.get("assessment"):
            lines.append(f"  - Media/High-Profile Effect: {me['assessment']}")

    cc = profile.get("comparable_cases", [])
    if cc:
        lines.append("Historical Pattern — Same Crime, Different Defendant Demographics:")
        for c in cc[:3]:
            obs = c.get("observation", "")[:150]
            lines.append(f"  - [{c.get('year','?')}] {c.get('crime','?')} ({c.get('bias_type','?')} bias): {obs}")

    return "\n".join(lines)
