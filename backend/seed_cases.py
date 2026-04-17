"""
Pre-analyzed case seed data for populating /history page.
Inserts 2 complete cases + their full 3-stage Council analyses into MongoDB
on startup if the `cases` collection is empty.
"""
from datetime import datetime, timezone, timedelta
import uuid


def _iso(days_ago: int = 0) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=days_ago)).isoformat()


# =============================================================
# CASE 1 — NDPS / Drug Offense (Defense-favouring verdict)
# =============================================================
CASE_1_ID = "a17c1f6e-1d4b-4a2e-9e01-111111111111"

CASE_1 = {
    "id": CASE_1_ID,
    "title": "State of Maharashtra vs. Arjun Deshpande (NDPS Act — Anticipatory Bail)",
    "description": (
        "The petitioner, Mr. Arjun Deshpande (aged 21, engineering student at VJTI Mumbai), "
        "has been implicated in FIR No. 412/2024 registered at Ghatkopar Police Station under "
        "Sections 8(c) r/w 20(b)(ii)(A) of the Narcotic Drugs & Psychotropic Substances Act, 1985. "
        "Prosecution alleges recovery of 9 grams of charas (cannabis resin) from the petitioner's "
        "possession during a routine check near Ghatkopar Railway Station on 14th July 2024. "
        "The recovered quantity falls within 'small quantity' classification as per NDPS notification. "
        "The petitioner contends that the alleged contraband was planted and that mandatory "
        "procedure under Section 50 NDPS (informing right to be searched before a gazetted officer) "
        "was not followed. The independent panchas are allegedly police stock witnesses. "
        "No prior criminal antecedents. Anticipatory bail under Section 438 CrPC r/w Section 37 NDPS "
        "sought before Sessions Court, Greater Mumbai."
    ),
    "case_type": "Drug Offense",
    "jurisdiction": "Maharashtra",
    "judge_name": "Hon. Justice Revati Mohite Dere",
    "charges": [
        "NDPS Act, 1985 - Section 8(c)",
        "NDPS Act, 1985 - Section 20(b)(ii)(A)",
    ],
    "defendant_demographics": {
        "age": "21",
        "gender": "Male",
        "occupation": "Engineering student",
        "prior_record": "None",
    },
    "ecourts_metadata": {
        "cnr": "MHMM010042322024",
        "court": "Sessions Court, Greater Mumbai",
        "filing_date": "2024-07-22",
        "next_hearing_date": "2025-03-18",
        "case_status": "PENDING",
    },
    "status": "complete",
    "created_at": _iso(days_ago=21),
}

CASE_1_ANALYSIS = {
    "case_id": CASE_1_ID,
    "status": "complete",
    "stage": 4,
    "members": {
        "prosecution": {
            "status": "complete",
            "analysis": {
                "strength_of_case": "moderate",
                "key_evidence": [
                    "9g charas recovered as per panchnama dated 14.07.2024",
                    "Chemical Analyser's report confirms recovered substance is cannabis resin",
                    "Independent panch witnesses (Mr. R. Kadam, Mr. S. Kamble) present at scene",
                ],
                "applicable_sections": [
                    "Section 8(c) NDPS Act (prohibition)",
                    "Section 20(b)(ii)(A) NDPS Act (small quantity — up to 1 yr imprisonment or fine up to Rs. 10,000)",
                ],
                "conviction_probability": 35,
                "aggravating_factors": [
                    "Possession of contraband in public place",
                    "Student demographic — concern about supply to peer group",
                ],
                "bail_position": "Prosecution does not object to bail on merit (small quantity — Section 37 NDPS bar does not apply), but insists on strict conditions",
                "strategic_recommendation": "Concede bail with tight reporting conditions; focus on trial conviction",
            },
        },
        "defense": {
            "status": "complete",
            "analysis": {
                "strength_of_case": "strong",
                "constitutional_defenses": [
                    "Article 21 — Right to personal liberty (Gurbaksh Singh Sibbia v. State of Punjab, (1980) 2 SCC 565)",
                    "Article 20(3) — Protection against self-incrimination",
                    "Article 14 — Equal protection (against stock-witness police practices)",
                ],
                "key_precedents": [
                    "State of Punjab v. Baldev Singh, (1999) 6 SCC 172 — mandatory Section 50 compliance",
                    "Arif Khan v. State of Uttarakhand, (2018) 18 SCC 380 — procedural non-compliance vitiates recovery",
                    "Toofan Singh v. State of Tamil Nadu, (2021) 4 SCC 1 — Section 67 NDPS confessions inadmissible",
                ],
                "procedural_violations": [
                    "Section 50 NDPS intimation of right to gazetted-officer search allegedly NOT in writing",
                    "Independent panchas suspected to be stock witnesses with 14 prior NDPS cases",
                    "Videography of search/seizure absent despite Home Ministry SOP 2018",
                ],
                "acquittal_probability": 65,
                "bail_strength": "Very strong — small quantity + no antecedents + student + Section 50 violation argument",
                "strategic_recommendation": "File anticipatory bail pressing Baldev Singh + Arif Khan; parallel quash petition under Section 482 CrPC if Section 50 violation confirmed",
            },
        },
        "legal_scholar": {
            "status": "complete",
            "analysis": {
                "doctrinal_framing": "This case sits at the intersection of NDPS strict-liability doctrine and constitutional due-process protections recognized progressively since Baldev Singh (1999).",
                "scholarly_precedents": [
                    {
                        "case": "State of Punjab v. Baldev Singh, (1999) 6 SCC 172",
                        "ratio": "Non-compliance with Section 50 NDPS renders recovery unsafe for conviction; evidence must be scrutinized with caution.",
                    },
                    {
                        "case": "Noor Aga v. State of Punjab, (2008) 16 SCC 417",
                        "ratio": "Reverse burden under Section 35 NDPS constitutionally valid only when foundational facts of recovery established beyond reasonable doubt.",
                    },
                    {
                        "case": "Arif Khan v. State of Uttarakhand, (2018) 18 SCC 380",
                        "ratio": "Failure to offer choice of search before Magistrate/Gazetted Officer IN WRITING is fatal.",
                    },
                ],
                "academic_commentary": (
                    "Prof. Upendra Baxi has noted that NDPS jurisprudence oscillates between 'War on Drugs' rhetoric "
                    "and constitutional safeguards. Post-Arif Khan, the pendulum has swung decisively toward procedural rigour, "
                    "particularly for small-quantity cases involving first-time offenders from educational backgrounds."
                ),
                "key_legal_principle": "Procedure is the handmaid of justice in NDPS matters. Where Section 50 is violated, the recovery itself becomes suspect and cannot form the sole basis of conviction.",
                "probable_outcome": "High likelihood of bail. At trial, acquittal probable if Section 50 non-compliance is established.",
            },
        },
        "bias_detector": {
            "status": "complete",
            "analysis": {
                "demographic_bias_risk": "low-moderate",
                "judge_profile_note": (
                    "Hon. Justice Revati Mohite Dere (Bombay High Court) has a strong track record of granting "
                    "bail in NDPS small-quantity cases and has repeatedly emphasized procedural compliance "
                    "(see her judgment in ABA/2145/2022 quashing recovery for Section 50 violation)."
                ),
                "systemic_patterns": [
                    "Young male defendants in public-place NDPS cases face higher initial detention rates — see NLU Delhi 2022 study",
                    "Stock-witness panchas are statistically present in 68% of Mumbai NDPS cases per RTI data",
                    "Students from urban middle-class backgrounds have 23% better bail outcomes than rural first-time defendants",
                ],
                "caste_religion_factor": "Defendant's demographic profile (upper-caste Maharashtrian urban student) does not indicate bias risk; however, the disparity noted above for rural defendants is itself a systemic concern.",
                "recommended_safeguards": [
                    "File independent affidavits from reliable neighbourhood character witnesses",
                    "Request court to call police daily-diary entry to verify informant credibility",
                    "Press for videography compliance — trial court can adversely infer from its absence",
                ],
                "bias_risk_score": 22,
            },
        },
    },
    "cross_reviews": {
        "prosecution": {
            "status": "complete",
            "analysis": {
                "rebuttal_to_defense": "Defense's reliance on Arif Khan is misplaced — in that case, NO written memorandum existed at all. Here, the arresting officer did prepare a memorandum; its form may be challenged but non-existence is not established.",
                "rebuttal_to_scholar": "Prof. Baxi's academic view cannot override the binding statutory reverse-onus under Section 35 NDPS. Once recovery is proved, onus shifts.",
                "position_shift": "Soften earlier position — concede bail on merit, focus entirely on trial-stage conviction.",
                "revised_conviction_probability": 30,
            },
        },
        "defense": {
            "status": "complete",
            "analysis": {
                "rebuttal_to_prosecution": "The memorandum relied upon is a post-facto preparation — time-stamps on the document are inconsistent with the radio log of the police vehicle. We have applied under RTI for the radio log; if discrepancy is proved, Arif Khan applies with full force.",
                "rebuttal_to_bias_detector": "Agreed on Justice Dere's pro-procedural track record, but we should not over-rely — we need the Section 50 argument airtight regardless of the bench.",
                "position_shift": "Hardened — acquittal probability revised upward.",
                "revised_acquittal_probability": 70,
            },
        },
        "legal_scholar": {
            "status": "complete",
            "analysis": {
                "rebuttal_to_prosecution": "The statutory reverse-onus under Section 35 presumes foundational facts. Where Section 50 is violated, the foundational fact (lawful recovery) is not established — Noor Aga squarely applies.",
                "consensus_building": "Cross-council consensus: bail will be granted. At trial, conviction hinges on whether Section 50 compliance can be established through oral testimony beyond the disputed memorandum.",
                "position_shift": "Affirmed earlier position with stronger Noor Aga citation.",
            },
        },
        "bias_detector": {
            "status": "complete",
            "analysis": {
                "rebuttal_to_defense": "Do not rest entire case on Justice Dere's personal inclination — benches rotate. The objective procedural argument must stand on its own.",
                "observation": "Cross-review reveals rare consensus among all four members that bail is highly likely. This convergence itself reduces bias risk.",
                "revised_bias_risk_score": 18,
            },
        },
    },
    "chief_justice": {
        "status": "complete",
        "synthesis": {
            "executive_summary": (
                "After two rounds of deliberation, this Council reaches a strong consensus: anticipatory bail is highly likely "
                "to be granted given the 'small quantity' classification, absence of prior record, and the prima facie Section 50 "
                "non-compliance argument supported by Arif Khan v. State of Uttarakhand. The real battle will be at trial, where "
                "the petitioner's acquittal prospects depend on establishing procedural violation beyond the disputed memorandum."
            ),
            "outcome_assessment": {
                "most_likely_outcome": "Anticipatory bail granted with conditions (surrender of passport, weekly reporting to IO, no tampering with evidence). Acquittal probable at trial (65–70%) if Section 50 violation is substantiated.",
                "prosecution_wins_probability": 30,
                "defense_wins_probability": 70,
            },
            "key_insights": [
                "Section 50 NDPS compliance is the decisive legal question — everything else is secondary.",
                "Stock-witness pattern documented by RTI data significantly weakens prosecution credibility.",
                "The radio-log discrepancy, if established through RTI, is a knockout argument under Arif Khan.",
            ],
            "council_consensus": "All four council members agree bail will be granted. Legal Scholar and Defense converge on Noor Aga + Arif Khan as the winning combination at trial.",
            "key_disagreements": "Prosecution contends the memorandum's existence is sufficient; Defense and Scholar insist its form is fatally defective. This is the single sharpest clash.",
            "cross_review_impact": "Prosecution softened its position on bail during cross-review. Defense hardened acquittal probability from 65% to 70% after the radio-log RTI insight emerged.",
            "recommendations_for_user": [
                {"action": "File anticipatory bail application immediately at Sessions Court citing Baldev Singh + Arif Khan", "priority": "high", "reason": "Any delay risks custodial interrogation"},
                {"action": "Pursue RTI for Ghatkopar P.S. radio log of 14.07.2024 between 15:00-18:00 hrs", "priority": "high", "reason": "Time-stamp discrepancy is the strongest trial-stage argument"},
                {"action": "Obtain character certificates from VJTI Director and hostel warden", "priority": "medium", "reason": "Strengthens 'no flight risk' argument"},
                {"action": "File parallel Section 482 CrPC quash petition if Section 50 violation confirmed", "priority": "medium", "reason": "Avoids full trial"},
            ],
            "overall_bias_risk": "low",
            "immediate_next_steps": [
                "Engage senior counsel with NDPS experience for bail hearing",
                "File RTI with Mumbai Police for radio log and station diary entries",
                "Collect character certificates and academic records for court",
            ],
            "final_verdict": (
                "The petitioner's liberty is well protected by established constitutional doctrine — "
                "bail is virtually certain, and acquittal is probable if the defense executes the Section 50 strategy precisely."
            ),
        },
    },
    "similar_cases": [
        {"title": "State of Punjab v. Baldev Singh", "citation": "(1999) 6 SCC 172", "relevance": "Landmark on Section 50 NDPS"},
        {"title": "Arif Khan v. State of Uttarakhand", "citation": "(2018) 18 SCC 380", "relevance": "Written memorandum requirement"},
        {"title": "Noor Aga v. State of Punjab", "citation": "(2008) 16 SCC 417", "relevance": "Reverse onus foundational facts"},
    ],
    "relevant_laws": [
        "NDPS Act, 1985 — Section 8(c)",
        "NDPS Act, 1985 — Section 20(b)(ii)(A)",
        "NDPS Act, 1985 — Section 50 (procedural safeguard)",
        "NDPS Act, 1985 — Section 37 (bail)",
        "CrPC, 1973 — Section 438 (anticipatory bail)",
    ],
    "judge_profile_snapshot": {
        "judge_name": "Hon. Justice Revati Mohite Dere",
        "court": "Bombay High Court",
        "total_cases_analyzed": 142,
        "bail_grant_rate_ndps_small_quantity": 78,
        "procedural_compliance_focus": "High",
    },
    "created_at": _iso(days_ago=21),
    "updated_at": _iso(days_ago=20),
}


# =============================================================
# CASE 2 — Section 498A IPC / Dowry (Prosecution-favouring verdict)
# =============================================================
CASE_2_ID = "b28d2e7f-2e5c-4b3f-af12-222222222222"

CASE_2 = {
    "id": CASE_2_ID,
    "title": "Kavita Sharma vs. Rajesh Sharma & Ors. (IPC 498A + Dowry Prohibition Act)",
    "description": (
        "Complainant Smt. Kavita Sharma (aged 29) has lodged FIR No. 178/2024 at Mahila Thana, Lucknow, against her "
        "husband (Respondent No. 1), mother-in-law (Respondent No. 2), and brother-in-law (Respondent No. 3) under "
        "Section 498A IPC (cruelty by husband & relatives) and Sections 3 & 4 of the Dowry Prohibition Act, 1961. "
        "Allegations include: (i) sustained physical and mental cruelty over 4 years of marriage; (ii) repeated "
        "demands of Rs. 15 lakhs and a Honda City car in dowry; (iii) forced expulsion from matrimonial home on "
        "10.03.2024 while pregnant; (iv) denial of medical care; (v) threats on WhatsApp (screenshots preserved). "
        "Medical certificate from KGMU Lucknow documents bruising consistent with blunt-force trauma. "
        "Matter is before the Family Court, Lucknow, alongside the Section 125 CrPC maintenance application. "
        "Defense has filed a Crl. M.C. before Allahabad High Court under Section 482 CrPC seeking quashing, relying on Arnesh Kumar."
    ),
    "case_type": "Domestic Violence",
    "jurisdiction": "Uttar Pradesh",
    "judge_name": "Hon. Justice Saurabh Shyam Shamshery",
    "charges": [
        "IPC Section 498A (Cruelty)",
        "Dowry Prohibition Act, 1961 - Section 3",
        "Dowry Prohibition Act, 1961 - Section 4",
        "IPC Section 323 (Voluntarily causing hurt)",
    ],
    "defendant_demographics": {
        "age_respondents": "31 / 58 / 27",
        "economic_class": "Middle (salaried IT professional)",
        "religion": "Hindu",
        "caste": "General",
    },
    "ecourts_metadata": {
        "cnr": "UPLU050192782024",
        "court": "Family Court, Lucknow",
        "filing_date": "2024-03-28",
        "next_hearing_date": "2025-04-05",
        "case_status": "PENDING — under Section 482 Crl. M.C.",
    },
    "status": "complete",
    "created_at": _iso(days_ago=9),
}

CASE_2_ANALYSIS = {
    "case_id": CASE_2_ID,
    "status": "complete",
    "stage": 4,
    "members": {
        "prosecution": {
            "status": "complete",
            "analysis": {
                "strength_of_case": "strong",
                "key_evidence": [
                    "KGMU medical certificate dated 11.03.2024 documenting bruising",
                    "28 WhatsApp messages threatening dowry escalation (chat-history preserved, hash-verified)",
                    "Bank transfers of Rs. 3.5 lakhs from complainant's father to respondent No. 1 (2020-2023)",
                    "Statement of complainant's mother corroborating sustained harassment",
                    "Call-detail records showing abusive calls on day of expulsion",
                ],
                "applicable_sections": [
                    "IPC Section 498A (cruelty — up to 3 yrs + fine, non-bailable)",
                    "Dowry Prohibition Act Section 3 (giving/taking — 5 yrs minimum)",
                    "Dowry Prohibition Act Section 4 (demand — 6 months to 2 yrs)",
                    "IPC Section 323 (voluntarily causing hurt)",
                ],
                "conviction_probability": 70,
                "aggravating_factors": [
                    "Pregnancy at time of expulsion — enhanced culpability per Rupali Devi (2019)",
                    "Documentary evidence of dowry transfer",
                    "Repeat pattern of demand over 4 years",
                ],
                "strategic_recommendation": "Oppose quashing aggressively citing Rupali Devi, document trail; press for interim maintenance under DV Act parallel proceedings.",
            },
        },
        "defense": {
            "status": "complete",
            "analysis": {
                "strength_of_case": "moderate",
                "constitutional_defenses": [
                    "Article 21 — Right to fair trial (Arnesh Kumar v. State of Bihar, (2014) 8 SCC 273 — no automatic arrest in 498A)",
                    "Article 14 — Equal protection (Rajesh Sharma v. State of UP, (2018) 10 SCC 472 — safeguards against misuse)",
                ],
                "key_precedents": [
                    "Arnesh Kumar v. State of Bihar, (2014) 8 SCC 273",
                    "Rajesh Sharma v. State of UP, (2018) 10 SCC 472 (later modified)",
                    "Social Action Forum for Manav Adhikar v. UOI, (2018) 10 SCC 443",
                ],
                "counter_arguments": [
                    "Allegations against mother-in-law (aged 58) and brother-in-law may qualify as 'omnibus' — subject to scrutiny per Geeta Mehrotra v. State of UP (2012)",
                    "Bank transfers alone do not prove coercive demand — could be voluntary familial gifts",
                    "Medical certificate is 24 hours post-incident; no contemporaneous FIR",
                ],
                "acquittal_probability": 30,
                "strategic_recommendation": "Seek quashing of proceedings against relatives (not husband) under Geeta Mehrotra; file counter-complaint for defamation; offer mediation per Rajesh Sharma safeguards.",
            },
        },
        "legal_scholar": {
            "status": "complete",
            "analysis": {
                "doctrinal_framing": (
                    "Post-Rupali Devi (2019), the jurisprudence on 498A has re-centred on the wife's lived experience of cruelty, "
                    "even at her parental home. Arnesh Kumar's procedural safeguard (CrPC 41A notice) does NOT bar prosecution — "
                    "it only guards arrest. The defense's reliance on quashing is therefore tactically misdirected on the facts."
                ),
                "scholarly_precedents": [
                    {"case": "Rupali Devi v. State of UP, (2019) 5 SCC 384", "ratio": "Territorial jurisdiction extends to the place where the wife resides after being driven out."},
                    {"case": "U. Suvetha v. State, (2009) 6 SCC 757", "ratio": "Mere threats/insults without physical cruelty do not amount to 498A — but pattern matters."},
                    {"case": "Kahkashan Kausar v. State of Bihar, (2022) 6 SCC 599", "ratio": "Courts must distinguish between generalized allegations and specific acts attributable to each relative."},
                ],
                "academic_commentary": (
                    "Prof. Flavia Agnes (Majlis Law) has argued that the pendulum post-Arnesh Kumar overcorrected against complainants. "
                    "The 2022 Kahkashan Kausar ruling recalibrates — specific allegations survive; generalized ones do not. Here, "
                    "specific allegations against husband are strong; allegations against mother-in-law need greater specificity."
                ),
                "key_legal_principle": "Specificity of allegation determines survival under 498A. Documentary trail (medical, WhatsApp, bank) places this case in the 'specific allegations' category against the husband.",
                "probable_outcome": "Against husband: trial will proceed; conviction probable. Against mother-in-law/brother-in-law: likely to be discharged at Section 227/239 stage absent specific role attribution.",
            },
        },
        "bias_detector": {
            "status": "complete",
            "analysis": {
                "demographic_bias_risk": "moderate",
                "judge_profile_note": (
                    "Hon. Justice Saurabh Shyam Shamshery (Allahabad High Court) has a mixed track record on 498A — "
                    "he has quashed approximately 40% of omnibus 498A FIRs under Arnesh Kumar reasoning but has consistently "
                    "upheld cases with documentary evidence. Given the medical + WhatsApp + bank evidence here, quashing is unlikely."
                ),
                "systemic_patterns": [
                    "NCRB 2023 data: 498A conviction rate is only 18% — but case at hand has above-average evidence strength",
                    "UP family courts show significant gender-disparity in interim maintenance orders (pro-complainant 62%)",
                    "Pregnant-at-expulsion cases see 2.3x higher conviction rate (Rupali Devi citation advantage)",
                ],
                "caste_religion_factor": "Both parties upper-caste Hindu — no bias risk on these axes. Economic disparity slight (complainant's father retired government employee; respondent salaried IT) — not a significant factor.",
                "recommended_safeguards": [
                    "Seek separate legal representation — family court tends to conflate maintenance and criminal tracks",
                    "Apply for protection under Section 19 DV Act for residence rights simultaneously",
                    "Preserve digital evidence with Section 65B certificate BEFORE quashing hearing",
                ],
                "bias_risk_score": 35,
            },
        },
    },
    "cross_reviews": {
        "prosecution": {
            "status": "complete",
            "analysis": {
                "rebuttal_to_defense": "Arnesh Kumar is a procedural safeguard on arrest — it does not require quashing of proceedings. Defense is conflating two doctrines. Here, CrPC 41A notices were properly issued; no Arnesh Kumar violation.",
                "rebuttal_to_scholar": "Agreed that Kahkashan Kausar restricts 'omnibus' allegations. However, specific allegations against mother-in-law (Rs. 5 lakhs demand via WhatsApp on 12.08.2023, preserved) meet the Kahkashan threshold.",
                "position_shift": "Hardened — revised conviction probability upward against husband specifically.",
                "revised_conviction_probability": 75,
            },
        },
        "defense": {
            "status": "complete",
            "analysis": {
                "rebuttal_to_prosecution": "The Rs. 5 lakhs WhatsApp message is ambiguous — 'loan for home renovation' was the specific framing; prosecution's interpretation as 'dowry demand' is strained.",
                "rebuttal_to_scholar": "Conceded — quashing against mother-in-law/brother-in-law is the realistic ceiling; quashing against husband is not achievable on this record.",
                "position_shift": "Revised strategy — stop pursuing blanket quashing; focus on partial quashing + mediation offer.",
                "revised_acquittal_probability": 25,
            },
        },
        "legal_scholar": {
            "status": "complete",
            "analysis": {
                "rebuttal_to_prosecution": "The 2.3x conviction advantage cited by Bias Detector is statistical — it cannot substitute individual assessment of each accused's specific role.",
                "consensus_building": "Council converging: trial proceeds against husband; quashing possible against relatives absent specific documentary role.",
                "position_shift": "Affirmed — added Kahkashan Kausar as binding restriction on omnibus allegations.",
            },
        },
        "bias_detector": {
            "status": "complete",
            "analysis": {
                "rebuttal_to_defense": "Defense's 'loan' framing of WhatsApp message is precisely the kind of gendered reframing that NCRB 2023 data shows reduces complainant credibility in UP family courts.",
                "observation": "Despite moderate bias risk, strong documentary evidence insulates this case substantially.",
                "revised_bias_risk_score": 30,
            },
        },
    },
    "chief_justice": {
        "status": "complete",
        "synthesis": {
            "executive_summary": (
                "After two rounds of deliberation, the Council converges: the prosecution against the husband is highly likely to survive "
                "the Section 482 quashing attempt and proceed to trial with a 70–75% conviction probability. However, quashing is probable "
                "for the mother-in-law and brother-in-law absent more specific role-attribution under Kahkashan Kausar. The documentary "
                "evidence — KGMU medical certificate, 28 hash-verified WhatsApp threats, Rs. 3.5L bank trail, and pregnancy-at-expulsion — "
                "places this case above the NCRB average conviction threshold."
            ),
            "outcome_assessment": {
                "most_likely_outcome": "Section 482 quashing dismissed against husband; partial quashing granted for in-laws. Trial proceeds on 498A, Section 3 & 4 Dowry Act, and Section 323 IPC against husband. Interim maintenance granted under Section 125 CrPC.",
                "prosecution_wins_probability": 72,
                "defense_wins_probability": 28,
            },
            "key_insights": [
                "Documentary evidence (medical + digital + financial) is the decisive factor outperforming the 18% national 498A conviction average.",
                "Kahkashan Kausar (2022) doctrine favors partial, not blanket, quashing — a reality defense accepted only after cross-review.",
                "The pregnancy-at-expulsion fact triggers Rupali Devi jurisdictional + substantive advantages simultaneously.",
            ],
            "council_consensus": "Trial proceeds against husband on strong evidence. Relatives likely discharged at Section 227/239 stage. Mediation path under Rajesh Sharma safeguards remains open for parties willing to explore it.",
            "key_disagreements": "Prosecution and Defense clashed sharpest on interpretation of the 12.08.2023 WhatsApp message ('loan' vs 'demand'). This single factual determination will swing the Section 498A outcome against the mother-in-law.",
            "cross_review_impact": "Defense dropped blanket-quashing strategy during cross-review after Scholar's Kahkashan Kausar intervention. Prosecution hardened conviction estimate upward. The debate matured from 'whether to prosecute' to 'who to prosecute'.",
            "recommendations_for_user": [
                {"action": "File reply-affidavit to Section 482 petition citing Rupali Devi and Kahkashan Kausar", "priority": "high", "reason": "Quashing hearing is imminent; delay could result in ex-parte order"},
                {"action": "Obtain Section 65B Information Technology Act certificate for all WhatsApp evidence", "priority": "high", "reason": "Without 65B certificate, digital evidence is inadmissible at trial"},
                {"action": "File parallel DV Act application for residence and protection orders", "priority": "high", "reason": "Provides immediate civil relief independent of criminal timeline"},
                {"action": "Apply for interim maintenance of Rs. 35,000/month under Section 125 CrPC", "priority": "medium", "reason": "Unpaid since March 2024; arrears compound monthly"},
                {"action": "Preserve KGMU medical record via certified copy", "priority": "medium", "reason": "Hospital records can be altered or lost"},
            ],
            "overall_bias_risk": "moderate",
            "immediate_next_steps": [
                "Appear at Allahabad HC on next listed date with Section 65B-certified digital evidence",
                "File DV Act application at Lucknow Family Court this week",
                "Engage a senior advocate with 498A trial experience for the criminal court",
            ],
            "final_verdict": (
                "The complainant's case against her husband is well-fortified by documentary evidence and precedent; the trial will proceed, and conviction is probable. "
                "The Council advises strategic acceptance that the case against in-laws may not survive Kahkashan Kausar scrutiny, and to concentrate prosecutorial resources on the principal accused."
            ),
        },
    },
    "similar_cases": [
        {"title": "Rupali Devi v. State of UP", "citation": "(2019) 5 SCC 384", "relevance": "Territorial jurisdiction at complainant's residence"},
        {"title": "Kahkashan Kausar v. State of Bihar", "citation": "(2022) 6 SCC 599", "relevance": "Specific vs omnibus allegations against relatives"},
        {"title": "Arnesh Kumar v. State of Bihar", "citation": "(2014) 8 SCC 273", "relevance": "No automatic arrest in 498A — CrPC 41A procedure"},
        {"title": "Rajesh Sharma v. State of UP", "citation": "(2018) 10 SCC 472", "relevance": "Misuse safeguards (subsequently modified)"},
    ],
    "relevant_laws": [
        "IPC Section 498A (Cruelty)",
        "IPC Section 323 (Voluntarily causing hurt)",
        "Dowry Prohibition Act 1961 — Section 3 (giving/taking dowry)",
        "Dowry Prohibition Act 1961 — Section 4 (demanding dowry)",
        "Protection of Women from Domestic Violence Act, 2005 — Sections 18-22",
        "CrPC Section 125 (Maintenance of wife)",
        "CrPC Section 482 (Quashing of proceedings)",
    ],
    "judge_profile_snapshot": {
        "judge_name": "Hon. Justice Saurabh Shyam Shamshery",
        "court": "Allahabad High Court",
        "total_cases_analyzed": 89,
        "quashing_grant_rate_498a": 40,
        "documentary_evidence_weight": "High",
    },
    "created_at": _iso(days_ago=9),
    "updated_at": _iso(days_ago=8),
}


# =============================================================
# Public API
# =============================================================
def get_seed_cases():
    return [CASE_1, CASE_2]


def get_seed_analyses():
    return [CASE_1_ANALYSIS, CASE_2_ANALYSIS]


SEED_CASE_IDS = [CASE_1_ID, CASE_2_ID]
