import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { COUNCIL_CONFIG, MEMBER_ORDER } from "./constants";

function StatusDot({ status }) {
  if (status === "complete") return <div className="w-2 h-2 rounded-full bg-emerald-500" />;
  if (status === "analyzing") return <div className="w-2 h-2 rounded-full bg-blue-500 dot-1" />;
  if (status === "failed") return <div className="w-2 h-2 rounded-full bg-red-500" />;
  return <div className="w-2 h-2 rounded-full bg-slate-300" />;
}

export function CrossReviewSection({ crossReviews, stage }) {
  const hasAny = crossReviews && Object.keys(crossReviews).length > 0;
  if (stage < 2 && !hasAny) return null;

  return (
    <div className="space-y-5" data-testid="cross-review-section">
      <div className="grid sm:grid-cols-2 gap-5">
        {MEMBER_ORDER.map((memberId) => {
          const config = COUNCIL_CONFIG[memberId];
          const reviewData = crossReviews?.[memberId];
          const status = reviewData?.status || "pending";
          const review = reviewData?.analysis;

          return (
            <div
              key={memberId}
              className={`bg-white border overflow-hidden transition-all hover:border-[#C5A059]/50 ${
                status === "complete" ? "border-slate-200" : "border-dashed border-slate-200 opacity-70"
              }`}
              data-testid={`cross-review-card-${memberId}`}
            >
              <div className="h-1" style={{ background: `repeating-linear-gradient(90deg, ${config.color} 0px, ${config.color} 8px, transparent 8px, transparent 14px)` }} />

              <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <StatusDot status={status} />
                  <div>
                    <p className="text-xs tracking-[0.12em] uppercase font-semibold text-slate-400">Cross-Review</p>
                    <h3 className="font-playfair text-base text-slate-900">{config.name}</h3>
                  </div>
                </div>
                <span className="text-xs text-slate-400 capitalize">{status}</span>
              </div>

              <div className="p-5 min-h-[140px]">
                {status === "pending" && (
                  <div className="flex flex-col items-center justify-center h-28 text-slate-400">
                    <Clock className="w-5 h-5 mb-1.5 opacity-30" />
                    <p className="text-xs">Awaiting Stage 1...</p>
                  </div>
                )}
                {status === "analyzing" && (
                  <div className="flex flex-col items-center justify-center h-28">
                    <div className="flex gap-1.5 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dot-1" />
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dot-2" />
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dot-3" />
                    </div>
                    <p className="text-xs text-slate-500">Reviewing peers...</p>
                  </div>
                )}
                {status === "failed" && (
                  <div className="flex items-center gap-2 text-red-600 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    <span>Cross-review failed.</span>
                  </div>
                )}
                {status === "complete" && review && (
                  <div className="space-y-3 animate-fade-in-up">
                    {review.cross_review_summary && (
                      <p className="text-sm text-slate-700 leading-relaxed">{review.cross_review_summary}</p>
                    )}
                    {review.challenges?.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400 mb-1.5">Challenges</p>
                        <ul className="space-y-1.5">
                          {review.challenges.slice(0, 2).map((c, i) => (
                            <li key={i} className="text-xs text-slate-600 flex gap-2 leading-relaxed">
                              <span style={{ color: config.color }} className="shrink-0 font-bold mt-0.5">&#10005;</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.agreements?.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400 mb-1.5">Concedes</p>
                        <ul className="space-y-1.5">
                          {review.agreements.slice(0, 1).map((a, i) => (
                            <li key={i} className="text-xs text-slate-600 flex gap-2 leading-relaxed">
                              <span className="text-emerald-600 shrink-0 font-bold mt-0.5">&#10003;</span>
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.key_insight && (
                      <p className="text-xs italic text-slate-500 border-l-2 pl-3 py-1 mt-1" style={{ borderColor: config.color }}>
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
