import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Search, AlertCircle, ChevronRight, Users, ArrowUpDown
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function WeekdaySparkline({ distribution }) {
  if (!distribution) return null;
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const values = days.map((d) => distribution[d] || 0);
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-px h-5">
      {days.map((d, i) => (
        <div
          key={d}
          className="w-2.5 bg-[#C5A059] rounded-t-sm transition-opacity hover:opacity-100"
          style={{ height: `${Math.max((values[i] / max) * 100, 6)}%`, opacity: values[i] > 0 ? 0.65 : 0.15 }}
          title={`${d}: ${values[i]}`}
        />
      ))}
    </div>
  );
}

function RatePill({ label, value, cls }) {
  if (!value || value === 0) return null;
  return (
    <span className={`text-[10px] px-1.5 py-0.5 border font-medium ${cls}`}>
      {label} {(value * 100).toFixed(0)}%
    </span>
  );
}

function BiasRiskBadge({ risk }) {
  const C = { low: "#166534", medium: "#C5A059", high: "#991B1B" };
  const color = C[risk] || "#64748B";
  return (
    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 border whitespace-nowrap" style={{ color, borderColor: color + "40", backgroundColor: color + "15" }}>
      {risk} risk
    </span>
  );
}

function GradeBadgeSm({ grade }) {
  if (!grade) return null;
  const STYLES = { A: { c: "#166534", bg: "#DCFCE7" }, B: { c: "#3F6212", bg: "#ECFCCB" }, C: { c: "#92400E", bg: "#FEF3C7" }, D: { c: "#C2410C", bg: "#FFEDD5" }, F: { c: "#991B1B", bg: "#FEE2E2" } };
  const s = STYLES[grade] || { c: "#64748B", bg: "#F1F5F9" };
  return (
    <span className="text-[10px] font-bold w-5 h-5 inline-flex items-center justify-center border" style={{ color: s.c, backgroundColor: s.bg, borderColor: s.c }}>
      {grade}
    </span>
  );
}

function JudgeCard({ judge }) {
  const navigate = useNavigate();
  const s = judge.summary_stats;
  const hasSummary = !!s;
  const totalCases = (s?.total_cases || judge.total_cases || 0);
  const rb = judge.ruling_breakdown;
  const rc = judge.report_card;
  const biasScore = judge.bias_score;
  const os = judge.outlier_score;

  return (
    <div
      className="bg-white border border-slate-200 hover:border-[#0B192C] transition-all cursor-pointer hover:shadow-md group"
      onClick={() => navigate(`/judges/${judge.id}`)}
      data-testid={`judge-card-${judge.id}`}
    >
      <div className="h-1 bg-[#0B192C] group-hover:bg-[#C5A059] transition-colors" />
      <div className="p-4">
        {/* Name + court + risk badge */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="min-w-0">
            <h3 className="font-playfair text-base text-slate-900 group-hover:text-[#0B192C] leading-tight">
              {judge.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {judge.court}
              {s?.unique_courts && s.unique_courts > 1 ? ` · ${s.unique_courts} courts` : ""}
              {judge.location ? ` · ${judge.location}` : ""}
            </p>
          </div>
        </div>

        {/* Primary stats row */}
        {hasSummary ? (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center border border-slate-100 py-1.5 rounded-sm">
              <p className="font-playfair text-lg font-semibold text-slate-900">{totalCases.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Cases</p>
            </div>
            <div className="text-center border border-slate-100 py-1.5 rounded-sm">
              <p className="font-playfair text-lg font-semibold text-emerald-700">{(s.allowed_rate * 100).toFixed(0)}%</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Allowed</p>
              <p className="text-[9px] text-slate-400">{s.allowed_cases} of {s.total_cases}</p>
            </div>
            <div className="text-center border border-slate-100 py-1.5 rounded-sm">
              <p className="font-playfair text-lg font-semibold text-red-700">{(s.dismissed_rate * 100).toFixed(0)}%</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Dismissed</p>
              <p className="text-[9px] text-slate-400">{s.dismissed_cases} of {s.total_cases}</p>
            </div>
          </div>
        ) : rb ? (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center border border-slate-100 py-1.5 rounded-sm">
              <p className="font-playfair text-lg font-semibold text-slate-900">{totalCases.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Cases</p>
            </div>
            <div className="text-center border border-slate-100 py-1.5 rounded-sm">
              <p className="font-playfair text-lg font-semibold text-red-700">{rb.prosecution_win_pct}%</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Prosecution</p>
            </div>
            <div className="text-center border border-slate-100 py-1.5 rounded-sm">
              <p className="font-playfair text-lg font-semibold text-blue-700">{rb.defense_win_pct}%</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Defense</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 mb-3">
            <div className="text-center border border-slate-100 py-1.5 rounded-sm">
              <p className="font-playfair text-lg font-semibold text-slate-900">{totalCases.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Cases</p>
            </div>
          </div>
        )}

        {/* Bias score + report card for detailed judges */}
        {biasScore != null && rc && (
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">Bias:</span>
              <span className="text-sm font-bold" style={{ color: biasScore >= 67 ? "#991B1B" : biasScore >= 34 ? "#C5A059" : "#166534" }}>
                {biasScore}
              </span>
            </div>
            {os && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">Outlier:</span>
                <span className="text-sm font-bold" style={{ color: os.direction === "above" ? "#991B1B" : "#166534" }}>
                  {os.direction === "above" ? "+" : ""}{os.score}pp
                </span>
              </div>
            )}
            <div className="flex items-center gap-0.5 ml-auto">
              <span className="text-[10px] text-slate-400 mr-1">Grade:</span>
              {["overall", "caste_religious", "gender", "socioeconomic", "recidivism", "geographic"].map((dim) => (
                <GradeBadgeSm key={dim} grade={rc[dim]} />
              ))}
            </div>
          </div>
        )}

        {/* Context badges (summary stats) */}
        {hasSummary && (
          <div className="flex flex-wrap gap-1 mb-3">
            <RatePill label="Caste" value={s.caste_mention_rate} cls="bg-purple-50 text-purple-700 border-purple-200" />
            <RatePill label="Female" value={s.female_context_rate} cls="bg-sky-50 text-sky-700 border-sky-200" />
            <RatePill label="Male" value={s.male_context_rate} cls="bg-indigo-50 text-indigo-700 border-indigo-200" />
            <RatePill label="Age" value={s.age_mention_rate} cls="bg-amber-50 text-amber-700 border-amber-200" />
          </div>
        )}

        {/* Detailed judge extras: years, jurisdiction, case types */}
        {!hasSummary && (judge.years_on_bench || judge.case_types?.length) && (
          <div className="flex flex-wrap gap-1.5 mb-3 text-[10px]">
            {judge.years_on_bench && <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600">{judge.years_on_bench} yrs</span>}
            {judge.jurisdiction && <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600">{judge.jurisdiction}</span>}
            {judge.case_types?.map((t) => (
              <span key={t} className="px-1.5 py-0.5 bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#92710C]">{t}</span>
            ))}
          </div>
        )}

        {/* Notable cases count for detailed judges */}
        {judge.notable_cases?.length > 0 && (
          <p className="text-[10px] text-slate-500 mb-2">
            {judge.notable_cases.length} notable case{judge.notable_cases.length > 1 ? "s" : ""} · {judge.comparable_cases?.length || 0} comparable case{(judge.comparable_cases?.length || 0) !== 1 ? "s" : ""}
          </p>
        )}

        {/* Weekday sparkline */}
        {s?.weekday_distribution && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Weekly</span>
            <WeekdaySparkline distribution={s.weekday_distribution} />
          </div>
        )}

        <div className="flex items-center justify-end text-xs text-[#0B192C] font-medium group-hover:text-[#C5A059] transition-colors">
          View Profile <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </div>
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { key: "cases_desc", label: "Most Cases" },
  { key: "cases_asc", label: "Fewest Cases" },
  { key: "allowed_desc", label: "Highest Allowed %" },
  { key: "dismissed_desc", label: "Highest Dismissed %" },
  { key: "name_asc", label: "Name A–Z" },
];

export default function JudgeProfiles() {
  const [allJudges, setAllJudges] = useState([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("cases_desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/judges`),
      axios.get(`${API}/judge-summary?limit=200`),
    ])
      .then(([detailedRes, summaryRes]) => {
        const detailed = detailedRes.data;
        const summaries = summaryRes.data.judges;

        // Merge detailed judges with their summary stats
        const merged = detailed.map((j) => {
          const match = summaries.find(
            (s) =>
              s.judge_name.toLowerCase().includes(j.name.toLowerCase()) ||
              j.name.toLowerCase().includes(s.judge_name.toLowerCase())
          );
          return match ? { ...j, summary_stats: match } : j;
        });

        // Summary-only judges (not in detailed)
        const detailedLower = detailed.map((j) => j.name.toLowerCase());
        const summaryOnly = summaries
          .filter(
            (s) =>
              !detailedLower.some(
                (n) =>
                  n.includes(s.judge_name.toLowerCase()) ||
                  s.judge_name.toLowerCase().includes(n)
              )
          )
          .map((s) => ({
            id: `summary-${s.judge_name.replace(/\s+/g, "-")}`,
            name: s.judge_name,
            court: s.unique_courts > 1 ? `${s.unique_courts} courts` : "1 court",
            summary_stats: s,
            is_summary_only: true,
          }));

        setAllJudges([...merged, ...summaryOnly]);
      })
      .catch(() => setError("Failed to load judge profiles"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = allJudges;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.name.toLowerCase().includes(q) ||
          (j.court && j.court.toLowerCase().includes(q))
      );
    }

    const getStats = (j) => j.summary_stats || {};
    result = [...result].sort((a, b) => {
      const sa = getStats(a);
      const sb = getStats(b);
      switch (sortKey) {
        case "cases_desc":
          return (sb.total_cases || b.total_cases || 0) - (sa.total_cases || a.total_cases || 0);
        case "cases_asc":
          return (sa.total_cases || a.total_cases || 0) - (sb.total_cases || b.total_cases || 0);
        case "allowed_desc":
          return (sb.allowed_rate || 0) - (sa.allowed_rate || 0);
        case "dismissed_desc":
          return (sb.dismissed_rate || 0) - (sa.dismissed_rate || 0);
        case "name_asc":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    return result;
  }, [allJudges, search, sortKey]);

  return (
    <div className="min-h-screen bg-[#FAF9F6]" data-testid="judge-profiles-page">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0A1428] via-[#0B192C] to-[#11233D] py-10 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <p className="text-xs tracking-[0.2em] uppercase text-[#C5A059] mb-2 font-semibold">
            Intelligence Database
          </p>
          <h1 className="font-playfair text-3xl sm:text-4xl text-white tracking-tight">
            Judge Profiles
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl">
            Comprehensive case statistics, demographic context analysis, and ruling patterns
            for {allJudges.length || "..."} judges across Indian courts.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or court..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 text-sm focus:outline-none focus:border-[#0B192C] focus:ring-1 focus:ring-[#0B192C] rounded-sm"
              data-testid="judge-search-input"
            />
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="border border-slate-300 text-sm py-2 px-3 focus:outline-none focus:border-[#0B192C] rounded-sm"
              data-testid="judge-sort-select"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {filtered.length} judge{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={`skel-${i}`} className="bg-white border border-slate-200 h-56 shimmer rounded-sm" />
            ))}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-sm">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {!loading && !error && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((judge) => (
                <JudgeCard key={judge.id} judge={judge} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No judges match your search.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
