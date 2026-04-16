import { Scale, Clock, CheckCircle2 } from "lucide-react";

export function ChiefJusticeCard({ chiefData }) {
  const status = chiefData?.status || "pending";
  const synthesis = chiefData?.synthesis;

  return (
    <div className="bg-[#0B192C] border border-[#C5A059]/30" data-testid="chief-justice-card">
      <div className="h-1 bg-[#C5A059]" />
      <div className="px-6 pt-6 pb-4 border-b border-white/10 flex items-start justify-between">
        <div>
          <p className="text-xs tracking-[0.15em] uppercase font-semibold text-[#C5A059]">Chief Justice Synthesizer</p>
          <h3 className="font-playfair text-2xl text-white mt-1">The Council — Final Verdict</h3>
        </div>
        {status === "complete" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/30" data-testid="verdict-ready-badge">
            <CheckCircle2 className="w-3 h-3" /> Verdict Ready
          </span>
        )}
        {status === "analyzing" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 bg-white/10 border border-white/20">
            <div className="flex gap-0.5"><div className="w-1 h-1 bg-slate-300 rounded-full dot-1" /><div className="w-1 h-1 bg-slate-300 rounded-full dot-2" /><div className="w-1 h-1 bg-slate-300 rounded-full dot-3" /></div>
            Deliberating
          </span>
        )}
        {status === "pending" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 bg-white/5 border border-white/10">
            <Clock className="w-3 h-3" /> Awaiting Analysts
          </span>
        )}
      </div>

      <div className="p-6">
        {(status === "pending" || status === "analyzing") && (
          <div className="flex flex-col items-center justify-center py-16">
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
          <div className="space-y-6 animate-fade-in-up">
            {/* Executive Summary */}
            <div>
              <p className="text-xs uppercase tracking-widest text-[#C5A059] mb-3">Executive Summary</p>
              <p className="text-slate-300 text-sm leading-relaxed">{synthesis.executive_summary}</p>
            </div>

            {/* Final Verdict */}
            {synthesis.final_verdict && (
              <div className="border border-[#C5A059]/30 bg-[#C5A059]/5 p-5">
                <p className="text-xs uppercase tracking-widest text-[#C5A059] mb-2">Final Verdict</p>
                <p className="text-white font-playfair italic text-base leading-relaxed">"{synthesis.final_verdict}"</p>
              </div>
            )}

            {/* Two-column details */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Key Insights */}
              {synthesis.key_insights?.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#C5A059] mb-3">Key Insights</p>
                  <ul className="space-y-2">
                    {synthesis.key_insights.map((ins, i) => (
                      <li key={i} className="text-sm text-slate-300 flex gap-2 leading-relaxed">
                        <span className="text-[#C5A059] mt-0.5 shrink-0">›</span>{ins}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Outcome Assessment */}
              {synthesis.outcome_assessment && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#C5A059] mb-3">Outcome Assessment</p>
                    <p className="text-white text-sm mb-4 leading-relaxed">{synthesis.outcome_assessment.most_likely_outcome}</p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                          <span>Prosecution</span>
                          <span>{synthesis.outcome_assessment.prosecution_wins_probability}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-sm overflow-hidden">
                          <div className="h-full bg-[#991B1B] rounded-sm" style={{ width: `${synthesis.outcome_assessment.prosecution_wins_probability}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                          <span>Defense</span>
                          <span>{synthesis.outcome_assessment.defense_wins_probability}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-sm overflow-hidden">
                          <div className="h-full bg-[#1E40AF] rounded-sm" style={{ width: `${synthesis.outcome_assessment.defense_wins_probability}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cross-review impact */}
            {synthesis.cross_review_impact && (
              <div className="border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-widest text-[#C5A059] mb-2">Cross-Review Impact</p>
                <p className="text-slate-300 text-sm leading-relaxed">{synthesis.cross_review_impact}</p>
              </div>
            )}

            {/* Recommendations + Bias row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {synthesis.recommendations_for_user?.length > 0 && (
                <div className="bg-white/5 border border-white/10 p-5">
                  <p className="text-xs uppercase tracking-widest text-[#C5A059] mb-3">Your Action Items</p>
                  <div className="space-y-2.5">
                    {synthesis.recommendations_for_user.slice(0, 4).map((rec, i) => (
                      <div key={i} className="flex gap-2.5">
                        <span className={`text-xs px-1.5 py-0.5 shrink-0 mt-0.5 ${rec.priority === "high" ? "bg-red-900/50 text-red-300" : rec.priority === "medium" ? "bg-amber-900/50 text-amber-300" : "bg-slate-800 text-slate-400"}`}>
                          {(rec.priority || "med").toUpperCase()}
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">{rec.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {synthesis.overall_bias_risk && (
                <div className="bg-white/5 border border-white/10 p-5">
                  <p className="text-xs uppercase tracking-widest text-[#C5A059] mb-3">Overall Bias Risk</p>
                  <span className={`text-lg font-bold uppercase ${synthesis.overall_bias_risk === "high" ? "text-red-400" : synthesis.overall_bias_risk === "medium" ? "text-amber-400" : "text-emerald-400"}`}>
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
