import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Scale, ArrowLeft, AlertCircle, CheckCircle2, Clock, RefreshCw, BookOpen, Gavel, ExternalLink } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COUNCIL_CONFIG = {
  prosecution: { name: "Counsel Maximus", title: "Prosecution Analyst", color: "#991B1B", bg: "#FEF2F2" },
  defense: { name: "Counsel Veridicus", title: "Defense Analyst", color: "#1E40AF", bg: "#EFF6FF" },
  legal_scholar: { name: "Professor Lexis", title: "Legal Scholar", color: "#0B192C", bg: "#F8FAFC" },
  bias_detector: { name: "Analyst Veritas", title: "Judicial Bias Analyst", color: "#7C3AED", bg: "#F5F3FF" },
};

function StatusBadge({ status }) {
  if (status === "complete") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200">
      <CheckCircle2 className="w-3 h-3" /> Complete
    </span>
  );
  if (status === "analyzing") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-blue-700 bg-blue-50 border border-blue-200">
      <div className="flex gap-0.5">
        <div className="w-1 h-1 bg-blue-600 rounded-full dot-1" />
        <div className="w-1 h-1 bg-blue-600 rounded-full dot-2" />
        <div className="w-1 h-1 bg-blue-600 rounded-full dot-3" />
      </div>
      Analyzing
    </span>
  );
  if (status === "failed") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-red-700 bg-red-50 border border-red-200">
      <AlertCircle className="w-3 h-3" /> Failed
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-slate-500 bg-slate-100 border border-slate-200">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

function ProsecutionContent({ a }) {
  if (!a) return null;
  return (
    <div className="space-y-3 animate-fade-in-up">
      <p className="text-sm text-slate-700 leading-relaxed">{a.summary}</p>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 uppercase tracking-wider">Win Probability</span>
        <div className="flex-1 h-1.5 bg-slate-100">
          <div className="h-full bg-[#991B1B]" style={{ width: `${a.win_probability || 50}%` }} />
        </div>
        <span className="text-sm font-semibold text-slate-900">{a.win_probability || 50}%</span>
      </div>
      {a.key_arguments?.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Key Arguments</p>
          <ul className="space-y-1">
            {a.key_arguments.slice(0, 3).map((arg, i) => (
              <li key={i} className="text-xs text-slate-600 flex gap-1.5"><span className="text-[#991B1B] mt-0.5">›</span>{arg}</li>
            ))}
          </ul>
        </div>
      )}
      {a.key_legal_principle && (
        <p className="text-xs italic text-slate-500 border-l-2 border-[#991B1B] pl-2">"{a.key_legal_principle}"</p>
      )}
    </div>
  );
}

function DefenseContent({ a }) {
  if (!a) return null;
  return (
    <div className="space-y-3 animate-fade-in-up">
      <p className="text-sm text-slate-700 leading-relaxed">{a.summary}</p>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 uppercase tracking-wider">Acquittal Probability</span>
        <div className="flex-1 h-1.5 bg-slate-100">
          <div className="h-full bg-[#1E40AF]" style={{ width: `${a.acquittal_probability || 35}%` }} />
        </div>
        <span className="text-sm font-semibold text-slate-900">{a.acquittal_probability || 35}%</span>
      </div>
      {a.constitutional_issues?.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Constitutional Issues</p>
          <ul className="space-y-1">
            {a.constitutional_issues.slice(0, 3).map((issue, i) => (
              <li key={i} className="text-xs text-slate-600 flex gap-1.5"><span className="text-[#1E40AF] mt-0.5">›</span>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      {a.key_legal_principle && (
        <p className="text-xs italic text-slate-500 border-l-2 border-[#1E40AF] pl-2">"{a.key_legal_principle}"</p>
      )}
    </div>
  );
}

function ScholarContent({ a }) {
  if (!a) return null;
  return (
    <div className="space-y-3 animate-fade-in-up">
      <p className="text-sm text-slate-700 leading-relaxed">{a.summary}</p>
      {a.applicable_laws?.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Applicable Laws</p>
          <div className="space-y-1">
            {a.applicable_laws.slice(0, 2).map((law, i) => (
              <div key={i} className="text-xs bg-slate-50 border border-slate-100 px-2 py-1.5">
                <span className="font-mono text-[#0B192C] font-medium">{law.code}</span>
                <span className="text-slate-500 ml-1">— {law.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {a.legal_standard && (
        <p className="text-xs text-slate-500"><span className="font-medium text-slate-700">Standard:</span> {a.legal_standard}</p>
      )}
    </div>
  );
}

function BiasContent({ a }) {
  if (!a) return null;
  const score = a.bias_score || 0;
  const riskColor = score >= 67 ? "#991B1B" : score >= 34 ? "#C5A059" : "#166534";
  const riskLabel = score >= 67 ? "HIGH" : score >= 34 ? "MEDIUM" : "LOW";
  return (
    <div className="space-y-3 animate-fade-in-up">
      <p className="text-sm text-slate-700 leading-relaxed">{a.summary}</p>
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs uppercase tracking-wider text-slate-400">Bias Risk Score</span>
          <span className="text-xs font-bold px-2 py-0.5" style={{ color: riskColor, backgroundColor: riskColor + "15" }}>{riskLabel}</span>
        </div>
        <div className="h-2 bg-slate-100 relative overflow-hidden">
          <div className="h-full bias-gauge absolute inset-0" />
          <div className="absolute top-0 bottom-0 w-1 bg-[#0B192C]" style={{ left: `calc(${score}% - 2px)` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-0.5">
          <span>Low Risk</span><span>Score: {score}/100</span><span>High Risk</span>
        </div>
      </div>
      {a.unconscious_bias_indicators?.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Bias Indicators</p>
          <ul className="space-y-1">
            {a.unconscious_bias_indicators.slice(0, 2).map((ind, i) => (
              <li key={i} className="text-xs text-slate-600 flex gap-1.5">
                <span style={{ color: riskColor }} className="mt-0.5 shrink-0">›</span>{ind}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CouncilCard({ memberId, memberData }) {
  const config = COUNCIL_CONFIG[memberId];
  const status = memberData?.status || "pending";
  const analysis = memberData?.analysis;
  const isAnalyzing = status === "analyzing";

  const contentMap = { prosecution: ProsecutionContent, defense: DefenseContent, legal_scholar: ScholarContent, bias_detector: BiasContent };
  const ContentComponent = contentMap[memberId];

  return (
    <div
      className={`bg-white border-2 overflow-hidden transition-all duration-500 ${isAnalyzing ? "council-analyzing" : "border-slate-200"}`}
      data-testid={`council-card-${memberId}`}
    >
      {/* Color accent bar */}
      <div className="h-1" style={{ backgroundColor: config.color }} />

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex items-start justify-between">
        <div>
          <p className="text-xs tracking-[0.15em] uppercase font-semibold text-slate-400">{config.title}</p>
          <h3 className="font-playfair text-lg text-slate-900 mt-0.5">{config.name}</h3>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Content */}
      <div className="p-4 min-h-[160px]">
        {status === "pending" && (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400">
            <Clock className="w-6 h-6 mb-2 opacity-40" />
            <p className="text-xs">Awaiting assignment...</p>
          </div>
        )}
        {status === "analyzing" && (
          <div className="flex flex-col items-center justify-center h-32">
            <div className="flex gap-1.5 mb-3">
              <div className="w-2 h-2 rounded-full bg-slate-400 dot-1" />
              <div className="w-2 h-2 rounded-full bg-slate-400 dot-2" />
              <div className="w-2 h-2 rounded-full bg-slate-400 dot-3" />
            </div>
            <p className="text-xs text-slate-500">Analyzing case...</p>
          </div>
        )}
        {status === "complete" && ContentComponent && <ContentComponent a={analysis} />}
        {status === "failed" && (
          <div className="flex items-center gap-2 text-red-600 text-xs">
            <AlertCircle className="w-4 h-4" />
            <span>Analysis failed. Please retry.</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CrossReviewSection({ crossReviews, stage }) {
  const memberOrder = ["prosecution", "defense", "legal_scholar", "bias_detector"];
  const hasAny = crossReviews && Object.keys(crossReviews).length > 0;

  // Show the section once stage >= 2
  if (stage < 2 && !hasAny) return null;

  return (
    <div data-testid="cross-review-section">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-px bg-slate-200" />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0B192C] text-xs font-medium uppercase tracking-widest text-[#C5A059]">
          <RefreshCw className="w-3.5 h-3.5" />
          Stage 2 — Cross-Review Deliberation
        </div>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {memberOrder.map((memberId) => {
          const config = COUNCIL_CONFIG[memberId];
          const reviewData = crossReviews?.[memberId];
          const status = reviewData?.status || "pending";
          const review = reviewData?.analysis;

          return (
            <div
              key={memberId}
              className={`bg-white border overflow-hidden transition-all ${
                status === "complete" ? "border-slate-200" : "border-dashed border-slate-200 opacity-70"
              }`}
              data-testid={`cross-review-card-${memberId}`}
            >
              {/* Thin accent + striped pattern to distinguish from Stage 1 */}
              <div className="h-1" style={{ background: `repeating-linear-gradient(90deg, ${config.color} 0px, ${config.color} 8px, transparent 8px, transparent 14px)` }} />

              <div className="px-4 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-[0.12em] uppercase font-semibold text-slate-400">Cross-Review</p>
                  <h3 className="font-playfair text-base text-slate-900" style={{ color: config.color }}>{config.name}</h3>
                </div>
                <StatusBadge status={status} />
              </div>

              <div className="p-4 min-h-[120px]">
                {status === "pending" && (
                  <div className="flex flex-col items-center justify-center h-24 text-slate-400">
                    <Clock className="w-5 h-5 mb-1.5 opacity-30" />
                    <p className="text-xs">Awaiting Stage 1 completion...</p>
                  </div>
                )}
                {status === "analyzing" && (
                  <div className="flex flex-col items-center justify-center h-24">
                    <div className="flex gap-1.5 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dot-1" />
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dot-2" />
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dot-3" />
                    </div>
                    <p className="text-xs text-slate-500">Reviewing other analyses...</p>
                  </div>
                )}
                {status === "failed" && (
                  <div className="flex items-center gap-2 text-red-600 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    <span>Cross-review failed.</span>
                  </div>
                )}
                {status === "complete" && review && (
                  <div className="space-y-2.5 animate-fade-in-up">
                    {review.cross_review_summary && (
                      <p className="text-sm text-slate-700 leading-relaxed">{review.cross_review_summary}</p>
                    )}
                    {review.challenges?.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Challenges</p>
                        <ul className="space-y-1">
                          {review.challenges.slice(0, 2).map((c, i) => (
                            <li key={i} className="text-xs text-slate-600 flex gap-1.5">
                              <span style={{ color: config.color }} className="shrink-0 font-bold mt-0.5">✗</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.agreements?.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Concedes</p>
                        <ul className="space-y-1">
                          {review.agreements.slice(0, 1).map((a, i) => (
                            <li key={i} className="text-xs text-slate-600 flex gap-1.5">
                              <span className="text-emerald-600 shrink-0 font-bold mt-0.5">✓</span>
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.key_insight && (
                      <p className="text-xs italic text-slate-500 border-l-2 pl-2 mt-1" style={{ borderColor: config.color }}>
                        "{review.key_insight}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function ChiefJusticeCard({ chiefData }) {
  const status = chiefData?.status || "pending";
  const synthesis = chiefData?.synthesis;

  return (
    <div className="bg-[#0B192C] border border-[#C5A059]/30" data-testid="chief-justice-card">
      {/* Gold accent */}
      <div className="h-1 bg-[#C5A059]" />
      <div className="px-6 pt-6 pb-4 border-b border-white/10 flex items-start justify-between">
        <div>
          <p className="text-xs tracking-[0.15em] uppercase font-semibold text-[#C5A059]">Chief Justice Synthesizer</p>
          <h3 className="font-playfair text-2xl text-white mt-1">The Council — Final Verdict</h3>
        </div>
        {status === "complete" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/30">
            <CheckCircle2 className="w-3 h-3" /> Verdict Ready
          </span>
        )}
        {status === "analyzing" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-slate-300 bg-white/10 border border-white/20">
            <div className="flex gap-0.5"><div className="w-1 h-1 bg-slate-300 rounded-full dot-1" /><div className="w-1 h-1 bg-slate-300 rounded-full dot-2" /><div className="w-1 h-1 bg-slate-300 rounded-full dot-3" /></div>
            Deliberating
          </span>
        )}
        {status === "pending" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-slate-400 bg-white/5 border border-white/10">
            <Clock className="w-3 h-3" /> Awaiting Analysts
          </span>
        )}
      </div>

      <div className="p-6">
        {(status === "pending" || status === "analyzing") && (
          <div className="flex flex-col items-center justify-center py-12">
            {status === "analyzing" ? (
              <>
                <div className="flex gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C5A059] dot-1" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C5A059] dot-2" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C5A059] dot-3" />
                </div>
                <p className="text-slate-300 text-sm">The Council deliberates...</p>
              </>
            ) : (
              <>
                <Scale className="w-8 h-8 text-white/20 mb-3" />
                <p className="text-slate-500 text-sm">Waiting for all analysts to complete</p>
              </>
            )}
          </div>
        )}

        {status === "complete" && synthesis && (
          <div className="grid lg:grid-cols-3 gap-6 animate-fade-in-up">
            {/* Executive Summary */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#C5A059] mb-2">Executive Summary</p>
                <p className="text-slate-300 text-sm leading-relaxed">{synthesis.executive_summary}</p>
              </div>

              {synthesis.key_insights?.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#C5A059] mb-2">Key Insights</p>
                  <ul className="space-y-1.5">
                    {synthesis.key_insights.map((ins, i) => (
                      <li key={i} className="text-sm text-slate-300 flex gap-2">
                        <span className="text-[#C5A059] mt-0.5 shrink-0">›</span>{ins}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {synthesis.final_verdict && (
                <div className="border border-[#C5A059]/30 bg-[#C5A059]/5 p-4 mt-2">
                  <p className="text-xs uppercase tracking-widest text-[#C5A059] mb-1">Final Verdict</p>
                  <p className="text-white font-playfair italic text-base">"{synthesis.final_verdict}"</p>
                </div>
              )}

              {synthesis.cross_review_impact && (
                <div className="border border-white/10 bg-white/5 p-4 mt-2">
                  <p className="text-xs uppercase tracking-widest text-[#C5A059] mb-1">Cross-Review Impact</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{synthesis.cross_review_impact}</p>
                </div>
              )}
            </div>

            {/* Right panel */}
            <div className="space-y-4">
              {/* Outcome probability */}
              {synthesis.outcome_assessment && (
                <div className="bg-white/5 border border-white/10 p-4">
                  <p className="text-xs uppercase tracking-widest text-[#C5A059] mb-3">Outcome Assessment</p>
                  <p className="text-white text-sm mb-3 leading-relaxed">{synthesis.outcome_assessment.most_likely_outcome}</p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Prosecution</span>
                        <span>{synthesis.outcome_assessment.prosecution_wins_probability}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10">
                        <div className="h-full bg-[#991B1B]" style={{ width: `${synthesis.outcome_assessment.prosecution_wins_probability}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Defense</span>
                        <span>{synthesis.outcome_assessment.defense_wins_probability}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10">
                        <div className="h-full bg-[#1E40AF]" style={{ width: `${synthesis.outcome_assessment.defense_wins_probability}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {synthesis.recommendations_for_user?.length > 0 && (
                <div className="bg-white/5 border border-white/10 p-4">
                  <p className="text-xs uppercase tracking-widest text-[#C5A059] mb-3">Your Action Items</p>
                  <div className="space-y-2">
                    {synthesis.recommendations_for_user.slice(0, 3).map((rec, i) => (
                      <div key={i} className="flex gap-2">
                        <span className={`text-xs px-1.5 py-0.5 shrink-0 mt-0.5 ${rec.priority === "high" ? "bg-red-900/50 text-red-300" : rec.priority === "medium" ? "bg-amber-900/50 text-amber-300" : "bg-slate-800 text-slate-400"}`}>
                          {(rec.priority || "med").toUpperCase()}
                        </span>
                        <p className="text-xs text-slate-300">{rec.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bias risk */}
              {synthesis.overall_bias_risk && (
                <div className="bg-white/5 border border-white/10 p-4">
                  <p className="text-xs uppercase tracking-widest text-[#C5A059] mb-2">Overall Bias Risk</p>
                  <span className={`text-sm font-bold uppercase ${synthesis.overall_bias_risk === "high" ? "text-red-400" : synthesis.overall_bias_risk === "medium" ? "text-amber-400" : "text-emerald-400"}`}>
                    {synthesis.overall_bias_risk}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SimilarCasesPanel({ cases }) {
  if (!cases?.length) return null;
  return (
    <div className="bg-white border border-slate-200" data-testid="similar-cases-panel">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <Gavel className="w-4 h-4 text-slate-500" />
        <h4 className="font-playfair text-base text-slate-900">Similar Cases</h4>
      </div>
      <div className="divide-y divide-slate-100">
        {cases.slice(0, 5).map((c, i) => (
          <div key={i} className="px-4 py-3">
            <p className="text-sm font-medium text-slate-900">{c.case_name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{c.court} — {c.year}</p>
            <p className="text-xs text-slate-600 mt-1">{c.outcome}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LawsPanel({ laws }) {
  if (!laws?.length) return null;
  return (
    <div className="bg-white border border-slate-200" data-testid="laws-panel">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-slate-500" />
        <h4 className="font-playfair text-base text-slate-900">Relevant Laws</h4>
      </div>
      <div className="divide-y divide-slate-100">
        {laws.slice(0, 5).map((law, i) => (
          <div key={i} className="px-4 py-3">
            <p className="text-xs font-mono font-semibold text-[#0B192C]">{law.code}</p>
            <p className="text-sm text-slate-800 mt-0.5">{law.title}</p>
            <p className="text-xs text-slate-500 mt-1">{law.relevance}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const STAGE_LABELS = ["", "Individual Analyses", "Cross-Review Deliberation", "Chief Justice Synthesis", "Complete"];

export default function AnalysisDashboard() {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [pageStatus, setPageStatus] = useState("loading");
  const pollingRef = useRef(null);

  const stopPolling = () => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
  };

  const startPolling = () => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/cases/${caseId}/analysis`);
        setAnalysis(res.data);
        if (res.data.status === "complete" || res.data.status === "failed") {
          stopPolling();
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 2500);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [caseRes, analysisRes] = await Promise.all([
          axios.get(`${API}/cases/${caseId}`),
          axios.get(`${API}/cases/${caseId}/analysis`),
        ]);
        setCaseData(caseRes.data);
        setAnalysis(analysisRes.data);
        setPageStatus("ready");

        if (analysisRes.data.status === "not_started") {
          await axios.post(`${API}/cases/${caseId}/analyze`);
          const fresh = await axios.get(`${API}/cases/${caseId}/analysis`);
          setAnalysis(fresh.data);
          startPolling();
        } else if (analysisRes.data.status === "analyzing") {
          startPolling();
        }
      } catch (err) {
        console.error("Init error", err);
        setPageStatus("error");
      }
    };
    init();
    return () => stopPolling();
    // eslint-disable-next-line
  }, [caseId]);

  const handleRetry = async () => {
    stopPolling();
    await axios.post(`${API}/cases/${caseId}/analyze`);
    const fresh = await axios.get(`${API}/cases/${caseId}/analysis`);
    setAnalysis(fresh.data);
    startPolling();
  };

  if (pageStatus === "loading") {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="flex gap-2 justify-center mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0B192C] dot-1" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#0B192C] dot-2" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#0B192C] dot-3" />
          </div>
          <p className="font-playfair text-lg text-slate-900">Convening the Legal Council...</p>
        </div>
      </div>
    );
  }

  if (pageStatus === "error" || !caseData) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-slate-900 font-medium">Case not found or failed to load.</p>
          <Link to="/history" className="text-sm text-blue-600 hover:underline mt-2 block">Back to Case History</Link>
        </div>
      </div>
    );
  }

  const members = analysis?.members || {};
  const chiefData = analysis?.chief_justice || {};
  const stage = analysis?.stage || 0;
  const stageProgress = Math.min(100, (stage / 4) * 100);
  const overallStatus = analysis?.status || "pending";

  return (
    <div className="min-h-screen bg-[#F8F9FA]" data-testid="analysis-dashboard">
      {/* Header */}
      <div className="bg-[#0B192C] text-white px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/history" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-4 transition-colors" data-testid="back-to-history">
            <ArrowLeft className="w-3.5 h-3.5" /> Case History
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-[#C5A059] mb-1">{caseData.case_type} · {caseData.jurisdiction}</p>
              <h1 className="font-playfair text-2xl sm:text-3xl text-white" data-testid="case-title">{caseData.title}</h1>
              {caseData.judge_name && (
                <p className="text-slate-400 text-sm mt-1">Presiding: {caseData.judge_name}</p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-xs px-3 py-1.5 border font-medium uppercase tracking-wider ${
                overallStatus === "complete" ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" :
                overallStatus === "failed" ? "text-red-400 border-red-400/30 bg-red-400/10" :
                "text-[#C5A059] border-[#C5A059]/30 bg-[#C5A059]/10"
              }`} data-testid="analysis-status">
                {overallStatus === "analyzing" ? "Council in Session" : overallStatus === "complete" ? "Verdict Ready" : overallStatus === "failed" ? "Analysis Failed" : "Pending"}
              </span>
              {(overallStatus === "failed") && (
                <button onClick={handleRetry} className="flex items-center gap-1 px-3 py-1.5 border border-white/20 text-white text-xs hover:bg-white/10" data-testid="retry-button">
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              )}
            </div>
          </div>

          {/* Stage progress */}
          {overallStatus !== "not_started" && (
            <div className="mt-5">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Stage {Math.min(stage, 4)} of 4: {STAGE_LABELS[Math.min(stage, 4)] || "Starting"}</span>
                <span>{Math.round(stageProgress)}%</span>
              </div>
              <div className="h-1 bg-white/10">
                <div className="h-full bg-[#C5A059] stage-progress" style={{ width: `${stageProgress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-4">
          {/* Council grid — 3 cols */}
          <div className="lg:col-span-3 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {["prosecution", "defense", "legal_scholar", "bias_detector"].map((id) => (
                <CouncilCard key={id} memberId={id} memberData={members[id]} />
              ))}
            </div>
            {/* Stage 2 Cross-Review */}
            <CrossReviewSection crossReviews={analysis?.cross_reviews} stage={stage} />
            {/* Chief Justice */}
            <ChiefJusticeCard chiefData={chiefData} />
          </div>

          {/* Sidebar — 1 col */}
          <div className="space-y-4">
            <SimilarCasesPanel cases={analysis?.similar_cases} />
            <LawsPanel laws={analysis?.relevant_laws} />

            {/* Case facts quick view */}
            <div className="bg-white border border-slate-200" data-testid="case-facts-panel">
              <div className="px-4 py-3 border-b border-slate-100">
                <h4 className="font-playfair text-base text-slate-900">Case Facts</h4>
              </div>
              <div className="p-4 space-y-2">
                {caseData.charges?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase text-slate-400 mb-1">Charges</p>
                    <div className="flex flex-wrap gap-1">
                      {caseData.charges.map((c) => (
                        <span key={c} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase text-slate-400 mb-1">Description</p>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-6">{caseData.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
