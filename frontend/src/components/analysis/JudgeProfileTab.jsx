import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { User, ExternalLink, Briefcase, GraduationCap, MapPin, BarChart3 } from "lucide-react";
import { GRADE_STYLES } from "./constants";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function JudgeProfileTab({ judgeSnapshot, caseJudgeName }) {
  const [judge, setJudge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJudge = async () => {
      if (!judgeSnapshot?.id) { setLoading(false); return; }
      try {
        const res = await axios.get(`${API}/judges/${judgeSnapshot.id}`);
        setJudge(res.data);
      } catch {
        setJudge(null);
      } finally {
        setLoading(false);
      }
    };
    fetchJudge();
  }, [judgeSnapshot?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-400 dot-1" />
          <div className="w-2 h-2 rounded-full bg-slate-400 dot-2" />
          <div className="w-2 h-2 rounded-full bg-slate-400 dot-3" />
        </div>
      </div>
    );
  }

  if (!judge && !judgeSnapshot) {
    return (
      <div className="bg-white border border-slate-200/60 shadow-[0_4px_24px_-8px_rgba(11,25,44,0.06)] p-8 text-center" data-testid="judge-tab-empty">
        <User className="w-8 h-8 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500">No judge profile available for this case.</p>
        {caseJudgeName && (
          <p className="text-xs text-slate-400 mt-1">Presiding: {caseJudgeName}</p>
        )}
      </div>
    );
  }

  const data = judge || judgeSnapshot;
  const rc = data.report_card || data.bias_breakdown || {};
  const overall = rc.overall || Object.values(rc)?.[0]?.grade;
  const gs = GRADE_STYLES[overall] || { color: "#64748B", bg: "#F1F5F9", border: "#64748B" };
  const biasScore = data.bias_score || 0;
  const biasColor = biasScore >= 67 ? "#991B1B" : biasScore >= 34 ? "#C5A059" : "#166534";
  const ruling = judge?.ruling_breakdown;

  return (
    <div className="space-y-5" data-testid="judge-profile-tab">
      {/* Profile header card */}
      <div className="bg-white border border-slate-200/60 shadow-[0_4px_24px_-8px_rgba(11,25,44,0.06)] overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#C5A059] to-[#D4B06E]" />
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Grade badge */}
            <div
              className="text-2xl font-bold w-16 h-16 shrink-0 flex items-center justify-center border-2"
              style={{ color: gs.color, backgroundColor: gs.bg, borderColor: gs.border }}
              data-testid="judge-tab-grade"
            >
              {overall || "?"}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-playfair text-xl text-slate-900" data-testid="judge-tab-name">{data.name}</h3>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                <MapPin className="w-3.5 h-3.5" />
                <span>{data.court}</span>
                {data.location && <span className="text-slate-300">·</span>}
                {data.location && <span>{data.location}</span>}
              </div>

              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span
                  className="text-xs font-bold px-2 py-1 uppercase border"
                  style={{ color: biasColor, backgroundColor: biasColor + "15", borderColor: biasColor + "40" }}
                  data-testid="judge-tab-risk"
                >
                  {data.bias_risk} Risk
                </span>
                <span className="text-xs text-slate-500">
                  Bias Score: <strong style={{ color: biasColor }}>{biasScore}/100</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key stats grid */}
      <div className="grid sm:grid-cols-3 gap-4">
        {judge?.years_on_bench && (
          <div className="bg-white border border-slate-200/60 shadow-[0_4px_24px_-8px_rgba(11,25,44,0.06)] p-5" data-testid="judge-tab-experience">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-[#C5A059]" />
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Experience</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{judge.years_on_bench} <span className="text-sm font-normal text-slate-500">years</span></p>
            <p className="text-xs text-slate-500 mt-1">{(judge.total_cases || 0).toLocaleString()} total cases handled</p>
          </div>
        )}

        {judge?.education && (
          <div className="bg-white border border-slate-200/60 shadow-[0_4px_24px_-8px_rgba(11,25,44,0.06)] p-5" data-testid="judge-tab-education">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-[#C5A059]" />
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Education</p>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{judge.education}</p>
          </div>
        )}

        {ruling && (
          <div className="bg-white border border-slate-200/60 shadow-[0_4px_24px_-8px_rgba(11,25,44,0.06)] p-5" data-testid="judge-tab-rulings">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-[#C5A059]" />
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Ruling Split</p>
            </div>
            <div className="space-y-2.5 mt-1">
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Prosecution Wins</span>
                  <span className="font-semibold text-slate-700">{ruling.prosecution_win_pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-sm overflow-hidden">
                  <div className="h-full bg-[#991B1B] rounded-sm" style={{ width: `${ruling.prosecution_win_pct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Defense Wins</span>
                  <span className="font-semibold text-slate-700">{ruling.defense_win_pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-sm overflow-hidden">
                  <div className="h-full bg-[#1E40AF] rounded-sm" style={{ width: `${ruling.defense_win_pct}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Key indicators */}
      {data.bias_indicators?.length > 0 && (
        <div className="bg-white border border-slate-200/60 shadow-[0_4px_24px_-8px_rgba(11,25,44,0.06)] p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3">Key Observations</p>
          <ul className="space-y-2">
            {data.bias_indicators.slice(0, 3).map((ind, i) => (
              <li key={i} className="text-sm text-slate-600 flex gap-2 leading-relaxed">
                <span className="text-[#C5A059] shrink-0 font-bold mt-0.5">›</span>
                {ind}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA to full profile */}
      <Link
        to="/judges"
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#0B192C] to-[#12223A] text-white px-5 py-3.5 text-sm font-medium hover:from-[#12223A] hover:to-[#1E293B] transition-all shadow-sm group"
        data-testid="judge-tab-view-full-profile"
      >
        View Full Judge Profile
        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}
