import { Link } from "react-router-dom";
import { Award, ExternalLink, CheckCircle2 } from "lucide-react";
import { GRADE_STYLES } from "./constants";

export function JudgeIntelligencePanel({ judgeSnapshot, stage }) {
  if (!judgeSnapshot) return null;

  const rc = judgeSnapshot.report_card || {};
  const os = judgeSnapshot.outlier_score;
  const tp = judgeSnapshot.temporal_patterns || {};
  const biasScore = judgeSnapshot.bias_score || 0;
  const biasColor = biasScore >= 67 ? "#991B1B" : biasScore >= 34 ? "#C5A059" : "#166534";
  const gs = GRADE_STYLES[rc.overall] || { color: "#64748B", bg: "#F1F5F9", border: "#64748B" };

  const dimensions = [
    { key: "caste_religious", label: "Caste" },
    { key: "gender", label: "Gender" },
    { key: "socioeconomic", label: "Socio" },
    { key: "recidivism", label: "Recid." },
    { key: "geographic", label: "Geo" },
  ];

  return (
    <div className="border border-[#C5A059]/25 bg-white overflow-hidden shadow-[0_4px_24px_-8px_rgba(11,25,44,0.06)]" data-testid="judge-intelligence-panel">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A1428] to-[#12223A] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#C5A059]" />
          <p className="text-xs tracking-[0.15em] uppercase text-[#C5A059] font-medium">Judge Intelligence</p>
        </div>
        <Link
          to="/judges"
          className="text-xs text-slate-400 hover:text-[#C5A059] flex items-center gap-1 transition-colors"
          data-testid="view-judge-profile-link"
        >
          Full Profile <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="p-4 space-y-4">
        {/* Name + Grade */}
        <div className="flex items-start gap-3">
          <div
            className="text-xl font-bold w-12 h-12 shrink-0 flex items-center justify-center border-2"
            style={{ color: gs.color, backgroundColor: gs.bg, borderColor: gs.border }}
          >
            {rc.overall || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-playfair text-base text-slate-900 leading-tight">{judgeSnapshot.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{judgeSnapshot.court}</p>
            <span
              className="text-xs font-bold px-1.5 py-0.5 uppercase border inline-block mt-1"
              style={{ color: biasColor, backgroundColor: biasColor + "15", borderColor: biasColor + "40" }}
            >
              {judgeSnapshot.bias_risk} Risk
            </span>
          </div>
        </div>

        {/* Bias score bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Bias Score</span>
            <span className="font-bold" style={{ color: biasColor }}>{biasScore}/100</span>
          </div>
          <div className="h-2 bg-slate-100 relative overflow-hidden rounded-sm">
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #166534 33%, #C5A059 66%, #991B1B 100%)", opacity: 0.3 }} />
            <div className="absolute top-0 h-full w-0.5 bg-[#0B192C]" style={{ left: `calc(${biasScore}% - 1px)` }} />
          </div>
        </div>

        {/* Report Card grades */}
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Report Card</p>
          <div className="flex gap-1.5 flex-wrap">
            {dimensions.map(({ key, label }) => {
              const g = rc[key];
              if (!g) return null;
              const s = GRADE_STYLES[g] || {};
              return (
                <div key={key} className="text-center">
                  <p className="text-[10px] text-slate-400 mb-0.5">{label}</p>
                  <span
                    className="text-xs font-bold w-7 h-7 inline-flex items-center justify-center border"
                    style={{ color: s.color, backgroundColor: s.bg, borderColor: s.border }}
                  >{g}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Indicators */}
        {judgeSnapshot.bias_indicators?.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Key Indicators</p>
            <ul className="space-y-1.5">
              {judgeSnapshot.bias_indicators?.slice(0, 3).map((ind, i) => (
                <li key={i} className="text-xs text-slate-600 flex gap-1.5 leading-relaxed">
                  <span className="text-[#C5A059] shrink-0 font-bold mt-0.5">›</span>
                  {ind}
                </li>
              ))}
            </ul>
          </div>
        )}



        {/* Used in synthesis */}
        {stage >= 3 && (
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 p-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            Profile given to Chief Justice for synthesis.
          </div>
        )}
      </div>
    </div>
  );
}
