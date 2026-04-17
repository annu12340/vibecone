"""
Pre-analyzed case seed data for populating /history page.

IMPORTANT SCHEMA NOTES (match frontend exactly — see
`frontend/src/components/analysis/CouncilCard.jsx` and `CrossReviewSection.jsx`):

  members.prosecution.analysis  →  summary, win_probability, key_arguments[], key_legal_principle
  members.defense.analysis      →  summary, acquittal_probability, constitutional_issues[], key_legal_principle
  members.legal_scholar.analysis→  summary, applicable_laws[{code,title}], legal_standard
  members.bias_detector.analysis→  summary, bias_score (0-100), unconscious_bias_indicators[]

  cross_reviews.<id>.analysis   →  cross_review_summary, challenges[], agreements[], key_insight

  chief_justice.synthesis       →  executive_summary, final_verdict, key_insights[],
                                   outcome_assessment{most_likely_outcome,prosecution_wins_probability,defense_wins_probability},
                                   cross_review_impact, recommendations_for_user[{action,priority}], overall_bias_risk
"""
from datetime import datetime, timezone, timedelta


def _iso(days_ago: int = 0) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=days_ago)).isoformat()


# =============================================================
# CASE 1 — NDPS / Drug Offense (Defense-favouring verdict 70/30)
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
                "summary": (
                    "Prosecution's case rests on a 9g charas recovery memo dated 14.07.2024, "
                    "a CA report confirming cannabis resin, and two panch witnesses. While 'small quantity' "
                    "classification means Section 37 NDPS bar on bail does not apply, conviction at trial remains "
                    "a serious prospect given the documentary recovery chain. Strategic focus shifts to trial-stage."
                ),
                "win_probability": 30,
                "key_arguments": [
                    "Recovery of 9g charas duly memorialised in Panchnama signed by two independent witnesses (Mr. R. Kadam & Mr. S. Kamble)",
                    "Chemical Analyser's report (FSL-BKC/2024/3287) confirms recovered substance is cannabis resin matching NDPS schedule",
                    "Reverse onus under Section 35 NDPS — once foundational fact of recovery is established, burden shifts to accused",
                    "Petitioner was found in immediate possession at a public place (Ghatkopar Station) — no plausible innocent explanation offered",
                ],
                "key_legal_principle": "Once recovery is proved through the panchnama and CA report, the statutory reverse onus under Section 35 NDPS operates, and the accused must disprove conscious possession.",
            },
        },
        "defense": {
            "status": "complete",
            "analysis": {
                "summary": (
                    "Defense is exceptionally strong on procedural grounds. The mandatory Section 50 NDPS safeguard — "
                    "written intimation of the right to be searched before a Magistrate or Gazetted Officer — appears "
                    "to have been violated. This, read with the stock-witness pattern of the named panchas and the "
                    "time-stamp discrepancy in the memorandum vis-à-vis the radio log, places the recovery itself in doubt. "
                    "Bail is near-certain; trial-stage acquittal highly likely if the Section 50 argument is executed precisely."
                ),
                "acquittal_probability": 70,
                "constitutional_issues": [
                    "Article 21 — Right to personal liberty under fair procedure (Gurbaksh Singh Sibbia v. State of Punjab, (1980) 2 SCC 565)",
                    "Article 20(3) — Protection against self-incrimination (Toofan Singh v. State of Tamil Nadu, (2021) 4 SCC 1)",
                    "Article 14 — Equal protection of law violated by use of stock-witness panchas with 14 prior NDPS cases",
                    "Due process violation under Section 50 NDPS — no written memorandum of right to gazetted-officer search produced at arrest",
                ],
                "key_legal_principle": "Procedure is the handmaid of justice in NDPS matters. Where Section 50 is violated, the recovery itself becomes suspect and cannot form the sole basis of conviction (State of Punjab v. Baldev Singh, (1999) 6 SCC 172).",
            },
        },
        "legal_scholar": {
            "status": "complete",
            "analysis": {
                "summary": (
                    "NDPS jurisprudence has moved decisively toward procedural rigour post-Arif Khan (2018) and "
                    "Toofan Singh (2021). For small-quantity cases involving first-time offenders from educational "
                    "backgrounds, courts have consistently favoured liberty when Section 50 compliance is doubtful. "
                    "The prosecution's reverse-onus argument under Section 35 fails if foundational recovery facts "
                    "are not established beyond reasonable doubt (Noor Aga, 2008). This petitioner's profile and "
                    "the available procedural-irregularity arguments place the case firmly in the bail-and-acquittal zone."
                ),
                "applicable_laws": [
                    {"code": "NDPS Act § 8(c)", "title": "Prohibition on production, manufacture, possession of narcotic drugs"},
                    {"code": "NDPS Act § 20(b)(ii)(A)", "title": "Punishment for small quantity of cannabis — up to 1 yr imprisonment or fine up to Rs. 10,000"},
                    {"code": "NDPS Act § 50", "title": "Mandatory procedural safeguard — right to be searched before Magistrate/Gazetted Officer"},
                    {"code": "NDPS Act § 37", "title": "Bail restrictions — do not apply to small-quantity offences"},
                    {"code": "CrPC § 438", "title": "Power to grant anticipatory bail"},
                    {"code": "Evidence Act § 65B", "title": "Admissibility of electronic records — relevant for radio log"},
                ],
                "legal_standard": "State of Punjab v. Baldev Singh, (1999) 6 SCC 172 (Constitution Bench) — strict compliance with Section 50 NDPS is mandatory; breach renders recovery unsafe. Reinforced by Arif Khan v. State of Uttarakhand, (2018) 18 SCC 380 (written memorandum indispensable) and Noor Aga v. State of Punjab, (2008) 16 SCC 417 (reverse onus only after foundational facts proved).",
            },
        },
        "bias_detector": {
            "status": "complete",
            "analysis": {
                "summary": (
                    "Bias risk in this case is LOW. Hon. Justice Revati Mohite Dere has a documented track record "
                    "of granting bail in small-quantity NDPS matters and prioritising procedural compliance (cf. "
                    "ABA/2145/2022). The petitioner's demographic profile — urban upper-caste student — does not "
                    "indicate individual bias vulnerability. However, systemic concerns about stock-witness panchas "
                    "(present in ~68% of Mumbai NDPS cases per 2022 RTI data) reflect institutional rather than "
                    "judicial bias and actually strengthen the defense narrative."
                ),
                "bias_score": 18,
                "unconscious_bias_indicators": [
                    "Young male defendant in public-place NDPS cases face 34% higher initial remand rates than older accused (NLU Delhi 2022)",
                    "Stock-witness panchas are structurally present in 68% of Mumbai NDPS cases per RTI 2022 — reduces prosecution credibility for this bench",
                    "Students from urban middle-class backgrounds historically see 23% better bail outcomes than rural first-time defendants — defendant benefits from this institutional pattern",
                    "'Public place' drug recovery narratives are statistically over-represented in cases where Section 50 non-compliance is later established",
                ],
            },
        },
    },
    "cross_reviews": {
        "prosecution": {
            "status": "complete",
            "analysis": {
                "cross_review_summary": (
                    "After reviewing defense and scholar inputs, the prosecution must concede the bail question on merit "
                    "given small-quantity classification and absence of Section 37 bar. Conviction focus remains, but the "
                    "memorandum's evidentiary value is weaker than initially assessed when time-stamp inconsistency is factored in."
                ),
                "challenges": [
                    "Defense's reliance on Arif Khan is factually distinguishable — in that case NO memorandum existed at all; here one exists, though its form may be challengeable",
                    "Stock-witness pattern raised by Bias Detector is an institutional critique, not an individualized evidentiary defect — courts have rejected generic stock-witness challenges absent specific proof",
                    "Scholar's invocation of Noor Aga presumes foundational-fact failure; prosecution still contends foundational facts are prima facie established on the record",
                ],
                "agreements": [
                    "Conceded — Section 37 NDPS bar does not apply; bail must be granted on merit with appropriate conditions",
                    "Conceded — radio-log RTI if obtained and showing time-stamp discrepancy would materially weaken the recovery chain",
                ],
                "key_insight": "The prosecution's best path is trial-focused: concede bail early, preserve evidentiary credibility, and prepare witnesses for robust cross-examination on Section 50 compliance.",
            },
        },
        "defense": {
            "status": "complete",
            "analysis": {
                "cross_review_summary": (
                    "Cross-review hardened the defense position. The prosecution's own concession that bail should be granted, "
                    "combined with the scholar's Noor Aga citation, establishes that foundational-fact failure (via Section 50 breach) "
                    "is a winning strategy at trial. Defense revises acquittal probability upward to 70% contingent on the RTI radio-log returns."
                ),
                "challenges": [
                    "Prosecution's claim that the memorandum exists (even if defective) is technically correct — Arif Khan's 'total absence' framing is too strong; we must argue 'fatal defect' under Baldev Singh standard",
                    "Bias Detector's caution against over-relying on Justice Dere's personal inclination is well-taken; the objective Section 50 argument must stand independently of bench sympathy",
                ],
                "agreements": [
                    "Agreed with Scholar — Baldev Singh (Constitution Bench) + Noor Aga combination is the primary anchor; Arif Khan is supporting",
                    "Agreed with Bias Detector — file independent character affidavits from VJTI Director and hostel warden to dilute any demographic-bias concerns",
                ],
                "key_insight": "The radio-log RTI is the knockout punch — if time-stamps don't match, we move from 'argued Section 50 breach' to 'documented prosecution fabrication'. Pursue this aggressively.",
            },
        },
        "legal_scholar": {
            "status": "complete",
            "analysis": {
                "cross_review_summary": (
                    "Scholar's position is reinforced by the cross-review dynamic. Prosecution conceded bail; defense sharpened its "
                    "Section 50 strategy. The single remaining doctrinal question is whether the memorandum's admitted existence "
                    "(but defective form) satisfies Baldev Singh's mandatory-compliance test. The scholarly consensus, drawing on "
                    "Arif Khan and the post-2018 line of cases, is that form failure = substance failure for Section 50 purposes."
                ),
                "challenges": [
                    "Defense's 70% acquittal estimate presumes the RTI returns favourably — scholar cautions that the estimate should be conditional, not absolute",
                    "Prosecution's distinction of Arif Khan (existence vs. defect) is doctrinally weak but rhetorically appealing — defense must preemptively neutralise it at the bail hearing itself",
                ],
                "agreements": [
                    "Full agreement with Bias Detector — systemic stock-witness data should be cited as contextual material, not as the sole basis for rejecting the recovery",
                ],
                "key_insight": "The governing doctrine is: Baldev Singh mandates strict compliance → Arif Khan clarifies compliance requires a written memorandum → Noor Aga makes foundational-fact failure fatal to the reverse-onus presumption. Apply in that sequence.",
            },
        },
        "bias_detector": {
            "status": "complete",
            "analysis": {
                "cross_review_summary": (
                    "Bias risk revised slightly downward to 16/100 after cross-review consensus. The rare four-way convergence that "
                    "bail is highly likely itself reduces individualised bias risk — the outcome is driven by merit-facing analysis, "
                    "not by judicial idiosyncrasy. Systemic (institutional) bias remains documented but operates favourably here."
                ),
                "challenges": [
                    "Defense continues to lean slightly on Justice Dere's personal track record — while statistically supported, this is not litigation-robust; reconstruct the argument on pure procedural grounds",
                    "Prosecution's implicit reliance on the 'public-place student drug peddler' narrative has embedded class/moral assumptions that a skilled defense counsel should surface and rebut",
                ],
                "agreements": [
                    "Agreed with Scholar — the procedural argument is sufficiently strong to prevail regardless of bench composition",
                    "Agreed with Defense — independent character evidence from VJTI authorities will neutralise any narrative-bias risk",
                ],
                "key_insight": "When all four council members converge on an outcome through procedural reasoning (not demographic or identity factors), bias risk is intrinsically low regardless of the individual judge.",
            },
        },
    },
    "chief_justice": {
        "status": "complete",
        "synthesis": {
            "executive_summary": (
                "After two rounds of deliberation, this Council reaches a strong consensus: anticipatory bail is virtually certain "
                "given the 'small quantity' classification, absence of prior record, and the prima facie Section 50 non-compliance "
                "supported by Arif Khan v. State of Uttarakhand. The real battle lies at trial, where the petitioner's acquittal "
                "prospects (65–70%) depend on establishing procedural violation beyond the disputed memorandum — the RTI radio-log "
                "being the single most decisive lever."
            ),
            "outcome_assessment": {
                "most_likely_outcome": "Anticipatory bail granted with conditions (surrender of passport, weekly reporting to IO, no tampering with evidence). Acquittal probable at trial (65–70%) if Section 50 violation is substantiated through the RTI radio-log.",
                "prosecution_wins_probability": 30,
                "defense_wins_probability": 70,
            },
            "key_insights": [
                "Section 50 NDPS compliance is the decisive legal question — everything else is secondary.",
                "Stock-witness pattern documented by RTI data significantly weakens prosecution credibility at trial.",
                "The radio-log discrepancy, if established through RTI, is a knockout argument under Arif Khan and Baldev Singh.",
                "Rare four-way council consensus materially reduces individualised bias risk — outcome is merit-driven.",
            ],
            "cross_review_impact": (
                "Prosecution softened its position on bail during cross-review, conceding Section 37 NDPS bar is inapplicable. "
                "Defense hardened acquittal probability from 65% to 70% after the radio-log RTI insight emerged. "
                "Legal Scholar reinforced Baldev Singh → Arif Khan → Noor Aga as the doctrinal sequence. "
                "Bias Detector revised risk downward to 16/100 citing procedural (not demographic) convergence."
            ),
            "recommendations_for_user": [
                {"action": "File anticipatory bail application immediately at Sessions Court citing Baldev Singh + Arif Khan", "priority": "high", "reason": "Any delay risks custodial interrogation"},
                {"action": "Pursue RTI for Ghatkopar P.S. radio log of 14.07.2024 between 15:00-18:00 hrs", "priority": "high", "reason": "Time-stamp discrepancy is the strongest trial-stage argument"},
                {"action": "Obtain character certificates from VJTI Director and hostel warden", "priority": "medium", "reason": "Strengthens 'no flight risk' and neutralises demographic-narrative risks"},
                {"action": "File parallel Section 482 CrPC quash petition if Section 50 violation is documented", "priority": "medium", "reason": "Avoids full trial and secures clean record"},
            ],
            "overall_bias_risk": "low",
            "final_verdict": (
                "The petitioner's liberty is well protected by established constitutional doctrine — "
                "bail is virtually certain, and acquittal is probable if the defense executes the Section 50 strategy precisely."
            ),
        },
    },
    "similar_cases": [
        {"title": "State of Punjab v. Baldev Singh", "citation": "(1999) 6 SCC 172", "relevance": "Landmark Constitution Bench on Section 50 NDPS"},
        {"title": "Arif Khan v. State of Uttarakhand", "citation": "(2018) 18 SCC 380", "relevance": "Written memorandum requirement under Section 50"},
        {"title": "Noor Aga v. State of Punjab", "citation": "(2008) 16 SCC 417", "relevance": "Reverse onus requires foundational-fact proof"},
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
# CASE 2 — Section 498A IPC / Dowry (Prosecution-favouring verdict 72/28)
# =============================================================
CASE_2_ID = "b28d2e7f-2e5c-4b3f-af12-222222222222"

CASE_2 = {
    "id": CASE_2_ID,
    "title": "Kavita Sharma vs. Rajesh Sharma & Ors. (IPC 498A + Dowry Prohibition Act)",
    "description": (
        "Complainant Smt. Kavita Sharma (aged 29) has lodged FIR No. 178/2024 at Mahila Thana, Lucknow, against her "
        "husband (Respondent No. 1), mother-in-law (Respondent No. 2), and brother-in-law (Respondent No. 3) under "
        "Section 498A IPC and Sections 3 & 4 of the Dowry Prohibition Act, 1961. Allegations include sustained physical "
        "and mental cruelty over 4 years of marriage; repeated demands of Rs. 15 lakhs and a Honda City car in dowry; "
        "forced expulsion from matrimonial home on 10.03.2024 while pregnant; denial of medical care; threats on WhatsApp "
        "(28 hash-verified messages). Medical certificate from KGMU Lucknow documents bruising consistent with blunt-force "
        "trauma. Matter is before the Family Court, Lucknow, alongside a Section 125 CrPC maintenance application. "
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
                "summary": (
                    "Prosecution's case is unusually strong for a 498A matter, placing it well above the NCRB national "
                    "conviction average of 18%. Documentary evidence is threefold: (i) KGMU medical certificate documenting "
                    "bruising; (ii) 28 WhatsApp messages containing dowry threats, hash-verified and preserved; (iii) bank "
                    "transfers of Rs. 3.5 lakhs from complainant's father to respondent No. 1 between 2020-2023. The fact of "
                    "pregnancy at the time of expulsion triggers Rupali Devi (2019) jurisdictional and substantive advantages. "
                    "Section 482 quashing petition is likely to fail against the husband but may succeed for omnibus allegations "
                    "against the mother-in-law and brother-in-law under Kahkashan Kausar (2022)."
                ),
                "win_probability": 75,
                "key_arguments": [
                    "KGMU medical certificate dated 11.03.2024 documenting blunt-force bruising — contemporaneous, institutional, and admissible",
                    "28 WhatsApp messages threatening dowry escalation, hash-verified under Section 65B Evidence Act",
                    "Bank-transfer trail of Rs. 3.5 lakhs from complainant's father — establishes 'giving/taking' element under Section 3 Dowry Act",
                    "Pregnancy at the time of expulsion triggers Rupali Devi v. State of UP, (2019) 5 SCC 384 — jurisdictional and substantive advantages",
                    "Statement of complainant's mother corroborating sustained 4-year harassment pattern",
                ],
                "key_legal_principle": "Where cruelty is evidenced by contemporaneous documentary records (medical, digital, financial) and aligns temporally with pregnancy and expulsion, Section 498A prosecution survives Arnesh Kumar and Section 482 quashing scrutiny as against the principal accused.",
            },
        },
        "defense": {
            "status": "complete",
            "analysis": {
                "summary": (
                    "Defense faces an uphill battle against the husband, but has legitimate ground for quashing the "
                    "proceedings against the mother-in-law and brother-in-law under Kahkashan Kausar (2022). The "
                    "documentary evidence against the husband is difficult to overcome; the WhatsApp 'loan for home "
                    "renovation' framing (12.08.2023) is the only realistic contested factual issue. Strategic pivot: "
                    "drop blanket-quashing ambition, pursue partial quashing, and propose mediation under Rajesh Sharma "
                    "(2018) safeguards. Arnesh Kumar applies to arrest, not to prosecution — conflating these doctrines is a tactical error."
                ),
                "acquittal_probability": 25,
                "constitutional_issues": [
                    "Article 21 — Right to fair trial and procedural safeguards under Arnesh Kumar v. State of Bihar, (2014) 8 SCC 273",
                    "Article 14 — Equal protection (safeguards against misuse of Section 498A under Rajesh Sharma v. State of UP, (2018) 10 SCC 472, subsequently modified)",
                    "Article 20 — Protection against double jeopardy if parallel DV Act and Section 125 CrPC applications overlap",
                    "Section 482 CrPC — inherent jurisdiction of High Court to quash proceedings where continuation would be an abuse of process",
                ],
                "key_legal_principle": "Courts must distinguish between specific allegations with documentary backing and generalized 'omnibus' allegations against relatives — the former survives Section 482 scrutiny, the latter must be quashed (Kahkashan Kausar v. State of Bihar, (2022) 6 SCC 599).",
            },
        },
        "legal_scholar": {
            "status": "complete",
            "analysis": {
                "summary": (
                    "Post-Rupali Devi (2019), 498A jurisprudence has re-centred on the wife's lived experience of cruelty — "
                    "including at her parental home after being driven out. Arnesh Kumar's CrPC 41A procedural safeguard guards "
                    "arrest, not prosecution; defense's reliance on it for quashing is tactically misdirected on these facts. "
                    "The 2022 Kahkashan Kausar ruling introduces a critical distinction between specific and generalised "
                    "allegations — specific allegations against the husband survive; generalised allegations against the "
                    "in-laws face serious quashing risk. The documentary trail here places the principal case in the "
                    "'specific allegations' category with high survival prospects."
                ),
                "applicable_laws": [
                    {"code": "IPC § 498A", "title": "Husband or relative subjecting woman to cruelty — up to 3 yrs imprisonment and fine, non-bailable"},
                    {"code": "IPC § 323", "title": "Punishment for voluntarily causing hurt — up to 1 yr imprisonment"},
                    {"code": "Dowry Prohibition Act § 3", "title": "Penalty for giving or taking dowry — minimum 5 yrs imprisonment"},
                    {"code": "Dowry Prohibition Act § 4", "title": "Penalty for demanding dowry — 6 months to 2 yrs imprisonment"},
                    {"code": "DV Act 2005 §§ 18-22", "title": "Protection, residence, monetary, custody and compensation orders"},
                    {"code": "CrPC § 125", "title": "Maintenance of wives, children and parents"},
                    {"code": "Evidence Act § 65B", "title": "Certified admissibility of electronic records (WhatsApp)"},
                ],
                "legal_standard": "Rupali Devi v. State of UP, (2019) 5 SCC 384 (territorial jurisdiction at wife's post-expulsion residence) + Kahkashan Kausar v. State of Bihar, (2022) 6 SCC 599 (specific vs. omnibus allegations) + Arnesh Kumar v. State of Bihar, (2014) 8 SCC 273 (CrPC 41A applies to arrest, not to continuation of prosecution).",
            },
        },
        "bias_detector": {
            "status": "complete",
            "analysis": {
                "summary": (
                    "Bias risk is MODERATE. Hon. Justice Saurabh Shyam Shamshery has a mixed 498A record — approximately 40% "
                    "quashing rate on omnibus FIRs under Arnesh Kumar reasoning, but consistent survival of prosecutions backed "
                    "by documentary evidence. Given the medical + WhatsApp + bank trail here, quashing against the husband is "
                    "unlikely. The NCRB 2023 baseline (18% 498A conviction rate) is a systemic concern but is substantially "
                    "outweighed by the case-specific evidentiary strength. No caste/religion-axis bias risk (both parties "
                    "upper-caste Hindu). Slight economic asymmetry (retired-government-employee father vs salaried IT respondent) is not litigation-material."
                ),
                "bias_score": 30,
                "unconscious_bias_indicators": [
                    "UP family courts show significant pro-complainant pattern in interim maintenance orders (62% grant rate) — structural advantage for petitioner here",
                    "Pregnant-at-expulsion cases see 2.3x higher conviction rate compared to post-expulsion 498A filings (Rupali Devi citation advantage)",
                    "'Omnibus allegation' framing in UP High Court quashing decisions has risen 28% post-Kahkashan Kausar — slight structural risk for in-laws",
                    "Defense's 'loan for home renovation' narrative around the Rs. 5 lakhs WhatsApp is a documented gendered reframing pattern that reduces complainant credibility in 31% of similar cases (NLU Delhi 2023)",
                    "Middle-class IT-professional respondent profile is statistically correlated with 18% higher quashing-grant rate vs working-class respondents — slight risk factor",
                ],
            },
        },
    },
    "cross_reviews": {
        "prosecution": {
            "status": "complete",
            "analysis": {
                "cross_review_summary": (
                    "After reviewing defense's Kahkashan Kausar argument, prosecution concedes that the case against the "
                    "mother-in-law may be quashed absent more specific role-attribution. However, for the 12.08.2023 "
                    "WhatsApp Rs. 5 lakhs message, prosecution maintains it meets Kahkashan's specificity threshold. "
                    "Revised focus: hardened prosecution against the husband (win probability up to 78%) and tactical "
                    "acceptance of partial quashing for relatives."
                ),
                "challenges": [
                    "Defense's 'loan for home renovation' interpretation of the 12.08.2023 WhatsApp is strained — context, timing, and surrounding messages establish dowry-demand character; court is unlikely to accept defense's alternative reading",
                    "Arnesh Kumar invocation by defense conflates arrest procedure with prosecution viability — this is a legal error, not a merit point, and will not assist defense at the Section 482 hearing",
                ],
                "agreements": [
                    "Conceded — specific-role documentation against the mother-in-law is weaker; partial quashing for her is a realistic outcome we can live with",
                    "Agreed with Bias Detector — document Section 65B certificate immediately, as digital evidence is inadmissible without it",
                ],
                "key_insight": "The Section 482 quashing petition is defense's strongest tactical move but will succeed only partially — against the relatives. The main prosecution against the husband is insulated by the documentary trail.",
            },
        },
        "defense": {
            "status": "complete",
            "analysis": {
                "cross_review_summary": (
                    "Cross-review forces a strategic reset. Scholar's Arnesh-vs-continuation distinction is doctrinally correct; "
                    "blanket quashing is not achievable against the husband. Defense revises acquittal probability downward "
                    "and shifts strategy to: (i) partial quashing for mother-in-law/brother-in-law under Kahkashan Kausar; "
                    "(ii) mediation offer under Rajesh Sharma safeguards; (iii) defamation counter-complaint to shift narrative."
                ),
                "challenges": [
                    "Scholar's Rupali Devi citation cuts both ways — while it expands jurisdiction, it also reinforces substantive 498A survival when cruelty is documented. Cannot be rebutted on these facts.",
                    "Prosecution's Section 65B certified WhatsApp evidence is a genuine documentary weapon — our earlier strategy of contesting authenticity is untenable; shift to contesting interpretation instead",
                    "Bias Detector's 40% quashing-rate framing for Justice Shamshery is for 'omnibus' FIRs specifically — our FIR has specific allegations against the husband and therefore does not enjoy that statistical tailwind",
                ],
                "agreements": [
                    "Conceded to Scholar — Arnesh Kumar cannot be stretched to cover prosecution viability; stop pressing it as quashing ground for the husband",
                    "Agreed with Bias Detector — partial-quashing strategy for in-laws is the realistic ceiling; conserve resources for that",
                ],
                "key_insight": "The realistic best-case is partial quashing + mediation offer. Pursuing blanket quashing would waste tactical capital and invite costs against the respondents — pivot immediately.",
            },
        },
        "legal_scholar": {
            "status": "complete",
            "analysis": {
                "cross_review_summary": (
                    "Cross-review produces healthy doctrinal convergence. Prosecution accepts Kahkashan's partial-quashing "
                    "implication for in-laws; Defense accepts Arnesh Kumar's limited scope. The remaining factual dispute — "
                    "whether the 12.08.2023 WhatsApp constitutes a dowry demand or a legitimate loan request — is a trial-stage "
                    "determination, not a quashing-stage one. The Section 482 court will decline to undertake factual inquiry "
                    "and the matter will proceed to trial on merits."
                ),
                "challenges": [
                    "Defense's pivot to mediation is strategically sound but must not be confused with legal entitlement — mediation is voluntary and cannot be imposed over the complainant's objection",
                    "Prosecution's confidence in 75% win probability should be tempered by NCRB baseline — 18% national conviction rate is a sobering reality check that evidence-handling at trial must be flawless",
                ],
                "agreements": [
                    "Agreed with Bias Detector — the systemic patterns cited here are documentary context, not outcome-determinative; merit-based analysis governs",
                    "Full agreement with Prosecution that pregnancy-at-expulsion fact activates Rupali Devi's most favorable jurisdictional interpretation",
                ],
                "key_insight": "Apply doctrine in sequence: (1) Rupali Devi establishes jurisdiction and substantive 498A survival; (2) Kahkashan Kausar distinguishes specific vs. omnibus; (3) Arnesh Kumar bears only on arrest procedure, not prosecution continuation.",
            },
        },
        "bias_detector": {
            "status": "complete",
            "analysis": {
                "cross_review_summary": (
                    "Bias score revised slightly downward to 28/100 after cross-review consensus. The convergence that "
                    "prosecution against the husband will survive while in-law case may be partially quashed reflects "
                    "precisely the kind of nuanced, merit-calibrated reasoning that reduces bias concerns. Systemic risks "
                    "remain (NCRB baseline, UP family-court patterns), but they operate as context rather than as outcome drivers."
                ),
                "challenges": [
                    "Defense's narrative-reframing of Rs. 5 lakhs as 'loan' is the classic gendered-recharacterisation pattern documented in 31% of reviewed 498A defenses — court should be alert to this framing",
                    "Prosecution's reliance on the 62% UP family-court maintenance pattern is a systemic-advantage argument — it should support but not replace individual evidentiary strength",
                ],
                "agreements": [
                    "Agreed with Scholar — systemic patterns are context, not outcome determiners; the case is merit-strong on its own",
                    "Agreed with Defense on one point — mediation option should remain open to avoid the 3–5 year criminal-trial timeline that harms both parties, if feasible",
                ],
                "key_insight": "Bias risk reduction in 498A cases correlates directly with evidentiary strength — where documentary evidence is robust, structural advantages and disadvantages largely cancel out.",
            },
        },
    },
    "chief_justice": {
        "status": "complete",
        "synthesis": {
            "executive_summary": (
                "After two rounds of deliberation, the Council converges: the prosecution against the husband is highly likely to "
                "survive the Section 482 quashing attempt and proceed to trial with a 72–75% conviction probability. However, "
                "partial quashing is probable for the mother-in-law and brother-in-law absent more specific role-attribution under "
                "Kahkashan Kausar. The documentary evidence — KGMU medical certificate, 28 hash-verified WhatsApp threats, Rs. 3.5L "
                "bank trail, and pregnancy-at-expulsion — places this case well above the NCRB 18% national 498A conviction average."
            ),
            "outcome_assessment": {
                "most_likely_outcome": "Section 482 quashing dismissed against husband; partial quashing granted for in-laws. Trial proceeds on 498A, Section 3 & 4 Dowry Act, and Section 323 IPC against husband. Interim maintenance granted under Section 125 CrPC. Parallel DV Act relief available immediately.",
                "prosecution_wins_probability": 72,
                "defense_wins_probability": 28,
            },
            "key_insights": [
                "Documentary evidence (medical + digital + financial) is the decisive factor outperforming the 18% national 498A conviction average.",
                "Kahkashan Kausar (2022) doctrine favors partial, not blanket, quashing — a reality defense accepted only after cross-review.",
                "The pregnancy-at-expulsion fact triggers Rupali Devi jurisdictional + substantive advantages simultaneously.",
                "Arnesh Kumar guards arrest, not prosecution continuation — defense's tactical error in conflating the two was corrected during cross-review.",
            ],
            "cross_review_impact": (
                "Defense dropped blanket-quashing strategy during cross-review after Scholar's Kahkashan Kausar intervention, "
                "revising acquittal probability from 30% to 25%. Prosecution hardened conviction estimate from 70% to 75%. "
                "Legal Scholar reinforced the Rupali Devi → Kahkashan Kausar → Arnesh Kumar doctrinal sequence. "
                "Bias Detector revised risk downward to 28/100 citing merit-calibrated convergence. "
                "The debate matured from 'whether to prosecute' to 'who to prosecute' — a significant doctrinal clarification."
            ),
            "recommendations_for_user": [
                {"action": "File reply-affidavit to Section 482 petition citing Rupali Devi and Kahkashan Kausar before the listed date", "priority": "high", "reason": "Quashing hearing is imminent; delay could result in an ex-parte order"},
                {"action": "Obtain Section 65B Information Technology Act certificate for all 28 WhatsApp messages", "priority": "high", "reason": "Without 65B certificate, digital evidence is inadmissible at trial — prosecution collapses"},
                {"action": "File parallel DV Act application for protection, residence, and monetary orders at Lucknow Family Court", "priority": "high", "reason": "Provides immediate civil relief independent of the criminal timeline; does not prejudice criminal prosecution"},
                {"action": "Apply for interim maintenance of Rs. 35,000/month under Section 125 CrPC", "priority": "medium", "reason": "Arrears accumulating since March 2024; compound monthly"},
                {"action": "Obtain certified true copy of KGMU medical record and preserve original in sealed envelope", "priority": "medium", "reason": "Hospital records can be altered or lost; certified copy is litigation-robust"},
            ],
            "overall_bias_risk": "medium",
            "final_verdict": (
                "The complainant's case against her husband is well-fortified by documentary evidence and precedent; "
                "the trial will proceed, and conviction is probable. The Council advises strategic acceptance that "
                "the case against in-laws may not survive Kahkashan Kausar scrutiny, and to concentrate prosecutorial "
                "resources on the principal accused while pursuing parallel DV Act and maintenance reliefs aggressively."
            ),
        },
    },
    "similar_cases": [
        {"title": "Rupali Devi v. State of UP", "citation": "(2019) 5 SCC 384", "relevance": "Territorial jurisdiction at complainant's residence after expulsion"},
        {"title": "Kahkashan Kausar v. State of Bihar", "citation": "(2022) 6 SCC 599", "relevance": "Specific vs. omnibus allegations against relatives"},
        {"title": "Arnesh Kumar v. State of Bihar", "citation": "(2014) 8 SCC 273", "relevance": "No automatic arrest in 498A — CrPC 41A procedure"},
        {"title": "Rajesh Sharma v. State of UP", "citation": "(2018) 10 SCC 472", "relevance": "Misuse safeguards (subsequently modified by Social Action Forum, 2018)"},
    ],
    "relevant_laws": [
        "IPC Section 498A (Cruelty)",
        "IPC Section 323 (Voluntarily causing hurt)",
        "Dowry Prohibition Act 1961 — Section 3 (giving/taking dowry)",
        "Dowry Prohibition Act 1961 — Section 4 (demanding dowry)",
        "Protection of Women from Domestic Violence Act, 2005 — Sections 18-22",
        "CrPC Section 125 (Maintenance of wife)",
        "CrPC Section 482 (Quashing of proceedings)",
        "Indian Evidence Act Section 65B (Digital evidence admissibility)",
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
