"""
Fallback mocked LLM responses for council analysis when API calls fail.
Ensures users always get a complete analysis even during API timeouts.
"""

MOCK_PROSECUTION_ANALYSIS = {
    "summary": "The prosecution has a moderately strong case based on the available evidence and applicable legal provisions. Key strengths include documented evidence and witness testimonies, though some procedural aspects may require careful handling.",
    "strength_rating": 68,
    "key_arguments": [
        "Prima facie case established through documentary evidence and witness statements under relevant IPC/CrPC provisions",
        "Chain of custody of evidence maintained as per standard operating procedures",
        "Applicable legal provisions clearly invoked with proper jurisdiction established"
    ],
    "evidence_points": [
        "Documentary evidence including official records and statements",
        "Witness testimonies corroborating the sequence of events",
        "Physical evidence linking the accused to the alleged offense"
    ],
    "vulnerabilities": [
        "Potential challenges to procedural compliance under CrPC requirements",
        "Defense may raise questions about evidence collection methods",
        "Timeline gaps that defense could exploit during cross-examination"
    ],
    "recommended_strategy": "Focus on strengthening documentary evidence, ensure all procedural requirements are met, prepare witnesses thoroughly for cross-examination, and anticipate defense arguments regarding procedural lapses.",
    "win_probability": 65,
    "key_legal_principle": "As established in State of Maharashtra v. Som Nath Thapa (1996), prosecution must prove case beyond reasonable doubt with credible evidence and proper procedure."
}

MOCK_DEFENSE_ANALYSIS = {
    "summary": "The defense has viable grounds to challenge the prosecution's case, particularly focusing on procedural safeguards and constitutional protections. Several avenues exist for securing bail and challenging the charges.",
    "defense_strength": 58,
    "constitutional_issues": [
        "Article 21 considerations regarding personal liberty and fair trial rights",
        "Article 22 safeguards ensuring proper procedure during arrest and detention"
    ],
    "procedural_defenses": [
        "CrPC Section 438 grounds for anticipatory bail given case circumstances",
        "Challenge to investigation procedure under CrPC Section 154-173",
        "Potential Section 482 CrPC petition to quash proceedings if procedural irregularities found"
    ],
    "mitigating_factors": [
        "Clean prior record with no criminal antecedents",
        "Strong community ties and stable employment/residence",
        "Cooperation with investigation authorities",
        "Availability of sureties and willingness to comply with bail conditions"
    ],
    "best_strategy": "File comprehensive bail application highlighting constitutional protections, challenge procedural lapses if any, emphasize mitigating circumstances, and demonstrate low flight risk while ensuring compliance with all court directions.",
    "acquittal_probability": 40,
    "key_legal_principle": "Supreme Court in Arnesh Kumar v. State of Bihar (2014) mandated judicial scrutiny before arrest, reinforcing that liberty is the rule and detention the exception."
}

MOCK_LEGAL_SCHOLAR_ANALYSIS = {
    "summary": "From a scholarly perspective, this case presents interesting questions regarding the application of established legal principles and potential precedential value. The interplay of statutory provisions and constitutional safeguards merits careful examination.",
    "applicable_laws": [
        {"statute": "Indian Penal Code", "sections": ["Various sections depending on charges"], "relevance": "Primary criminal law framework"},
        {"statute": "Code of Criminal Procedure, 1973", "sections": ["41A", "154", "157", "438", "482"], "relevance": "Procedural safeguards and investigation guidelines"},
        {"statute": "Indian Evidence Act, 1872", "sections": ["3", "24-30", "45-51", "65B"], "relevance": "Admissibility and evaluation of evidence"}
    ],
    "precedents": [
        {
            "case_name": "Arnesh Kumar v. State of Bihar",
            "court": "Supreme Court of India",
            "year": "2014",
            "relevance": "Established guidelines against arbitrary arrest, mandatory checklist before arrest in cognizable offenses"
        },
        {
            "case_name": "Siddharth v. State of Uttar Pradesh",
            "court": "Supreme Court of India",
            "year": "2021",
            "relevance": "Reaffirmed procedural safeguards and emphasized judicial oversight in criminal matters"
        }
    ],
    "legal_analysis": "The case involves complex interplay between procedural requirements under CrPC and substantive criminal law under IPC. Court must balance state's duty to prosecute criminal offenses with constitutional mandate to protect individual liberty. Recent Supreme Court jurisprudence has consistently emphasized strict adherence to procedural safeguards, making any deviation a strong ground for defense. The burden of proof beyond reasonable doubt remains with prosecution, while accused is entitled to benefit of doubt if prosecution case has material gaps.",
    "constitutional_angles": [
        "Article 21 right to life and personal liberty - cannot be violated except by procedure established by law",
        "Article 22 protection against arbitrary arrest and detention",
        "Article 14 equality before law requiring fair and non-discriminatory investigation/prosecution"
    ],
    "risk_assessment": {
        "conviction_likelihood": "moderate",
        "key_variables": [
            "Quality and admissibility of prosecution evidence",
            "Credibility of witness testimonies under cross-examination",
            "Establishment of mens rea (guilty mind) and actus reus (guilty act)",
            "Defense ability to demonstrate procedural irregularities or constitutional violations"
        ]
    }
}

MOCK_BIAS_DETECTOR_ANALYSIS = {
    "summary": "Based on general judicial patterns and demographic factors, there are standard considerations regarding potential implicit biases that may affect case outcomes. Temporal and systemic factors should be monitored throughout proceedings.",
    "overall_bias_risk": 45,
    "bias_risk_level": "moderate",
    "demographic_risk_factors": [
        {
            "factor": "Socioeconomic status",
            "risk_score": 42,
            "explanation": "General patterns show variations in outcomes based on defendant's economic background and access to quality legal representation"
        },
        {
            "factor": "Geographic origin",
            "risk_score": 38,
            "explanation": "Urban vs rural distinctions sometimes influence judicial perception and case handling"
        }
    ],
    "temporal_risk_factors": [
        {
            "factor": "Day of week effect",
            "description": "Studies indicate Monday hearings sometimes result in harsher outcomes compared to mid-week sessions"
        },
        {
            "factor": "Time of day",
            "description": "Post-lunch sessions may show decision fatigue effects in complex bail applications"
        }
    ],
    "systemic_concerns": [
        "Case backlog may influence judicial time allocation and deliberation depth",
        "Media attention on similar cases could create pressure for demonstrative actions",
        "Political climate around specific offense types may affect charging and sentencing patterns"
    ],
    "mitigation_strategies": [
        "Schedule critical hearings during mid-week mornings when judicial attention is optimal",
        "Ensure comprehensive written submissions to counter any implicit bias effects",
        "Request recusal if specific demonstrated bias patterns emerge",
        "Document all proceedings meticulously for potential appellate review"
    ],
    "comparable_patterns": [
        "Similar cases in same jurisdiction show conviction rates around 60-65% with bail grant rates of 55-60%",
        "Sentencing patterns tend toward statutory minimum when mitigating factors are properly documented",
        "Procedural violations have historically resulted in case dismissals in 25-30% of challenged cases"
    ]
}

MOCK_CHIEF_JUSTICE_SYNTHESIS = {
    "executive_summary": "After comprehensive review by the AI Legal Council and cross-deliberation among all members, this case presents a moderately balanced legal situation where both prosecution and defense have viable arguments. The prosecution has established a prima facie case with documentary evidence and witness testimonies, but the defense has strong procedural and constitutional grounds to challenge certain aspects. The outcome will likely depend on the quality of evidence presentation, witness credibility under cross-examination, and the court's interpretation of procedural compliance. Bail is recommended given the nature of charges, clean prior record, and constitutional protections, subject to appropriate conditions. Final verdict at trial will hinge on prosecution's ability to prove guilt beyond reasonable doubt while withstanding defense challenges to procedure and evidence.",
    "case_complexity": 7,
    "council_consensus": "MODERATE PROSECUTION ADVANTAGE",
    "outcome_assessment": {
        "most_likely_outcome": "BAIL GRANTED with conditions; trial outcome uncertain pending evidence quality",
        "prosecution_wins_probability": 62,
        "defense_wins_probability": 38,
        "bail_likelihood": 70,
        "acquittal_likelihood": 38
    },
    "key_turning_points": [
        "Quality and admissibility of prosecution evidence will be decisive",
        "Witness testimony credibility under defense cross-examination",
        "Any procedural irregularities discovered during trial could shift balance significantly",
        "Defendant's cooperation and compliance with court conditions will influence sentencing if convicted"
    ],
    "prosecution_advantage_factors": [
        "Documentary evidence establishing prima facie case",
        "Multiple witness testimonies corroborating prosecution version",
        "Proper invocation of applicable legal provisions"
    ],
    "defense_advantage_factors": [
        "Strong procedural safeguards under CrPC and constitutional protections",
        "Clean prior record and strong mitigating circumstances",
        "Potential challenges to evidence collection and investigation procedure",
        "Recent Supreme Court precedents favoring strict adherence to procedural requirements"
    ],
    "recommended_actions": {
        "for_prosecution": "Strengthen evidence chain, prepare witnesses thoroughly, ensure complete procedural compliance, anticipate and prepare for defense procedural challenges",
        "for_defense": "File comprehensive bail application immediately, challenge any procedural lapses, prepare detailed mitigation documentation, engage with evidence through discovery process",
        "for_court": "Ensure fair trial safeguards, scrutinize procedural compliance strictly per Supreme Court guidelines, balance liberty rights with prosecution needs, maintain detailed record for potential appellate review"
    },
    "timeline_projection": "Bail hearing likely within 2-3 weeks if filed promptly. Trial may take 12-18 months given typical court timelines and case complexity. Regular hearing dates crucial to prevent indefinite delay.",
    "legal_principles_applied": [
        "Presumption of innocence until proven guilty beyond reasonable doubt",
        "Bail is the rule, jail the exception (per Sanjay Chandra v. CBI, 2012)",
        "Strict procedural compliance mandatory (per Arnesh Kumar v. State of Bihar, 2014)",
        "Constitutional safeguards under Articles 14, 21, 22 must be scrupulously observed"
    ],
    "council_confidence_score": 72,
    "note": "This analysis is based on standard legal frameworks and general patterns. Actual case outcome will depend on specific facts, evidence quality, judicial discretion, and effective advocacy by both sides."
}

def get_mock_council_response(member_id: str) -> dict:
    """Return mocked analysis for a specific council member."""
    mock_responses = {
        "prosecution": MOCK_PROSECUTION_ANALYSIS,
        "defense": MOCK_DEFENSE_ANALYSIS,
        "legal_scholar": MOCK_LEGAL_SCHOLAR_ANALYSIS,
        "bias_detector": MOCK_BIAS_DETECTOR_ANALYSIS,
    }
    return mock_responses.get(member_id, {})

def get_mock_chief_justice_synthesis() -> dict:
    """Return mocked chief justice synthesis."""
    return MOCK_CHIEF_JUSTICE_SYNTHESIS
