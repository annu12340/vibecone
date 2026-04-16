"""
eCourts Helper Module
This module contains helper functions to transform eCourts data into a unified format
"""

from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)


def transform_ecourts_to_unified_format(raw_ecourts_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transform eCourts API response into a unified format similar to Indian Kanoon.
    This ensures consistent data structure across both sources.
    
    Args:
        raw_ecourts_data: Raw response from eCourts MCP tool
        
    Returns:
        Transformed data in unified format
    """
    try:
        case_data = raw_ecourts_data.get("data", {}).get("courtCaseData", {})
        entity_info = raw_ecourts_data.get("data", {}).get("entityInfo", {})
        files_data = raw_ecourts_data.get("data", {}).get("files", {})
        case_ai = raw_ecourts_data.get("data", {}).get("caseAiAnalysis")
        
        # Extract petitioners and respondents
        petitioners = case_data.get("petitioners", [])
        respondents = case_data.get("respondents", [])
        
        # Create case title
        title = ""
        if petitioners and respondents:
            petitioner_str = " & ".join(petitioners[:2])  # First 2 petitioners
            respondent_str = " & ".join(respondents[:2])  # First 2 respondents
            title = f"{petitioner_str} vs {respondent_str}"
        
        # Extract orders
        interim_orders = case_data.get("interimOrders", [])
        judgment_orders = case_data.get("judgmentOrders", [])
        
        # Get latest order
        latest_order = None
        latest_order_date = None
        if interim_orders:
            latest_order = interim_orders[-1]
            latest_order_date = latest_order.get("orderDate")
        
        # Build doc_text from orders if available
        doc_text_parts = []
        files_list = files_data.get("files", [])
        for file_obj in files_list:
            markdown_content = file_obj.get("markdownContent", "")
            if markdown_content:
                doc_text_parts.append(markdown_content)
        
        doc_text = "\n\n---\n\n".join(doc_text_parts) if doc_text_parts else "Full case documents available in eCourts system"
        
        # Extract acts and sections
        acts_list = []
        for act_section in case_data.get("actsAndSections", []):
            if isinstance(act_section, str):
                acts_list.append(act_section)
            elif isinstance(act_section, dict):
                acts_list.append(act_section.get("name", str(act_section)))
        
        # Build unified format
        unified_data = {
            "cnr": case_data.get("cnr", ""),
            "title": title or case_data.get("caseTypeRaw", "") + " " + case_data.get("registrationNumber", ""),
            "doc_text": doc_text,
            "court": case_data.get("courtName", ""),
            "court_code": case_data.get("cnrCourtCode", ""),
            "bench": ", ".join(case_data.get("judges", [])),
            "date": case_data.get("filingDate", ""),
            "filing_date": case_data.get("filingDate", ""),
            "registration_date": case_data.get("registrationDate", ""),
            "registration_number": case_data.get("registrationNumber", ""),
            "filing_number": case_data.get("filingNumber", ""),
            
            # Case status and type
            "case_type": case_data.get("caseType", ""),
            "case_type_full": case_data.get("caseTypeRaw", ""),
            "case_status": case_data.get("caseStatus", ""),
            "stage_of_case": case_data.get("stageOfCase", ""),
            
            # Parties
            "petitioners": petitioners,
            "respondents": respondents,
            "petitioner_advocates": case_data.get("petitionerAdvocates", []),
            "respondent_advocates": case_data.get("respondentAdvocates", []),
            
            # Judges
            "judges": case_data.get("judges", []),
            "author": ", ".join(case_data.get("judges", [])),  # Judge name(s)
            
            # Hearing information
            "first_hearing_date": case_data.get("firstHearingDate", ""),
            "next_hearing_date": case_data.get("nextHearingDate", ""),
            "last_hearing_date": case_data.get("lastHearingDate", ""),
            "case_duration_days": case_data.get("caseDurationDays", 0),
            
            # Acts and citations
            "referred_acts": acts_list,
            "acts_and_sections": acts_list,
            "citations": [],  # eCourts doesn't provide citations in same format
            "referred_cases": case_data.get("taggedMatters", []),
            
            # Orders and judgments
            "interim_orders": interim_orders,
            "judgment_orders": judgment_orders,
            "order_count": case_data.get("orderCount", 0),
            "has_orders": case_data.get("hasOrders", False),
            "has_judgments": case_data.get("hasJudgments", False),
            
            # Latest order
            "latest_order": latest_order,
            "latest_order_date": latest_order_date,
            
            # Interlocutory applications
            "interlocutory_applications": case_data.get("interlocutoryApplications", []),
            "ia_count": case_data.get("iaCount", 0),
            
            # AI Analysis
            "case_ai_summary": case_ai.get("summary", "") if case_ai else "",
            "case_ai_analysis": case_ai,
            
            # Latest order AI analysis (if available from get_case_with_latest_order)
            "latest_order_analysis": _extract_order_analysis(raw_ecourts_data),
            
            # Decision date
            "decision_date": case_data.get("decisionDate", ""),
            
            # Subordinate court details
            "subordinate_court": case_data.get("subordinateCourt", {}),
            
            # Metadata
            "judicial_section": case_data.get("judicialSection", ""),
            "state": case_data.get("state", ""),
            "district_code": case_data.get("districtCode", ""),
            "date_modified": entity_info.get("dateModified", ""),
            
            # Full raw data for advanced use
            "raw_ecourts_data": raw_ecourts_data,
            
            # Source indicator
            "data_source": "ecourts"
        }
        
        return unified_data
        
    except Exception as e:
        logger.error(f"Error transforming eCourts data: {str(e)}")
        # Return minimal structure with raw data
        return {
            "error": "Transformation error",
            "error_message": str(e),
            "raw_ecourts_data": raw_ecourts_data,
            "data_source": "ecourts"
        }


def format_case_for_display(case_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format case data for frontend display.
    Extracts key information in a clean, organized structure.
    
    Args:
        case_data: Unified case data
        
    Returns:
        Formatted data optimized for UI display
    """
    return {
        "header": {
            "title": case_data.get("title", ""),
            "cnr": case_data.get("cnr", ""),
            "case_number": case_data.get("registration_number", ""),
            "status": case_data.get("case_status", ""),
        },
        "court_info": {
            "court": case_data.get("court", ""),
            "judges": case_data.get("judges", []),
            "filing_date": case_data.get("filing_date", ""),
        },
        "parties": {
            "petitioners": case_data.get("petitioners", []),
            "respondents": case_data.get("respondents", []),
            "petitioner_advocates": case_data.get("petitioner_advocates", []),
            "respondent_advocates": case_data.get("respondent_advocates", []),
        },
        "timeline": {
            "filing_date": case_data.get("filing_date", ""),
            "first_hearing": case_data.get("first_hearing_date", ""),
            "last_hearing": case_data.get("last_hearing_date", ""),
            "next_hearing": case_data.get("next_hearing_date", ""),
            "duration_days": case_data.get("case_duration_days", 0),
        },
        "legal_provisions": {
            "acts_and_sections": case_data.get("referred_acts", []),
            "referred_cases": case_data.get("referred_cases", []),
        },
        "documents": {
            "order_count": case_data.get("order_count", 0),
            "has_orders": case_data.get("has_orders", False),
            "has_judgments": case_data.get("has_judgments", False),
            "latest_order_date": case_data.get("latest_order_date", ""),
        },
        "ai_analysis": {
            "summary": case_data.get("case_ai_summary", ""),
            "available": bool(case_data.get("case_ai_analysis")),
        },
    }


def _extract_order_analysis(raw_ecourts_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Extract latest order AI analysis from eCourts response.
    
    Args:
        raw_ecourts_data: Raw eCourts data that may contain latestOrderAnalysis
        
    Returns:
        Formatted order analysis or None
    """
    try:
        # Check if we have latestOrderAnalysis from get_case_with_latest_order
        latest_order_data = raw_ecourts_data.get("latestOrderAnalysis")
        if not latest_order_data:
            return None
        
        ai_data = latest_order_data.get("data", {}).get("aiAnalysis", {})
        if not ai_data:
            return None
        
        # Extract key insights
        insights = ai_data.get("intelligent_insights_analytics", {}).get("order_significance_and_impact_assessment", {})
        legal_substance = ai_data.get("deep_legal_substance_context", {}).get("arguments_and_reasoning_analysis", {})
        
        return {
            "ai_generated_executive_summary": insights.get("ai_generated_executive_summary", ""),
            "plain_language_summary_for_litigants_outcome_focused": insights.get("plain_language_summary_for_litigants_outcome_focused", ""),
            "court_reasoning_for_decision": legal_substance.get("court_reasoning_for_decision", ""),
            "ratio_decidendi_extracted": legal_substance.get("ratio_decidendi_extracted", {}),
            "order_nature": ai_data.get("foundational_metadata", {}).get("procedural_details_from_order", {}).get("order_nature", ""),
            "disposition_outcome": ai_data.get("foundational_metadata", {}).get("procedural_details_from_order", {}).get("disposition_outcome_if_disposed", ""),
        }
        
    except Exception as e:
        logger.error(f"Error extracting order analysis: {str(e)}")
        return None
