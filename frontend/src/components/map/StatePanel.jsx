import { X, ExternalLink, Scale, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export function StatePanel({ state, cases, onClose }) {
  if (!state) return null;

  const filedCases = cases.filter(c => c.source === "filed");
  const similarCases = cases.filter(c => c.source === "similar");

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white border-l border-slate-200 shadow-[−16px_0_48px_rgba(11,25,44,0.12)] z-50 flex flex-col animate-slide-in" data-testid="state-panel">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A1428] to-[#12223A] px-6 py-5 flex items-start justify-between shrink-0">
        <div>
          <p className="text-xs tracking-[0.15em] uppercase text-[#C5A059] font-medium mb-1">Case Geography</p>
          <h2 className="font-playfair text-xl text-white">{state}</h2>
          <p className="text-sm text-slate-400 mt-1">{cases.length} related case{cases.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          data-testid="state-panel-close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Cases list */}
      <div className="flex-1 overflow-y-auto">
        {/* Filed cases */}
        {filedCases.length > 0 && (
          <div className="px-6 pt-5 pb-3">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Filed Cases ({filedCases.length})
            </p>
            <div className="space-y-3">
              {filedCases.map((c, i) => (
                <div key={`filed-${i}`} className="border border-slate-200/60 p-4 hover:border-[#C5A059]/40 transition-colors" data-testid={`filed-case-${i}`}>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-slate-900 leading-snug">{c.title}</h4>
                    <span className={`text-[10px] px-1.5 py-0.5 shrink-0 uppercase font-semibold ${
                      c.status === "complete" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                      "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}>{c.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">{c.jurisdiction}</p>
                  {c.judge && <p className="text-xs text-slate-400 mt-0.5">Judge: {c.judge}</p>}
                  {c.id && (
                    <Link
                      to={`/analysis/${c.id}`}
                      className="inline-flex items-center gap-1 text-xs text-[#C5A059] hover:underline mt-2"
                      onClick={onClose}
                      data-testid={`view-case-${i}`}
                    >
                      View Analysis <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar/precedent cases */}
        {similarCases.length > 0 && (
          <div className="px-6 pt-4 pb-5">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              Precedent Cases ({similarCases.length})
            </p>
            <div className="space-y-3">
              {similarCases.map((c, i) => (
                <div key={`sim-${i}`} className="border border-slate-100 bg-slate-50/50 p-4" data-testid={`similar-case-${i}`}>
                  <h4 className="text-sm font-medium text-slate-900 leading-snug">{c.title}</h4>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {c.jurisdiction && <span className="text-xs text-slate-500">{c.jurisdiction}</span>}
                    {c.year && <span className="text-xs text-slate-400">({c.year})</span>}
                  </div>
                  {c.outcome && (
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed border-l-2 border-[#C5A059]/30 pl-2">{c.outcome}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {cases.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-slate-400">No cases found for this state.</p>
          </div>
        )}
      </div>
    </div>
  );
}
