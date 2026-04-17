import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, AlertCircle, Scale, TrendingUp, Clock, Award, FileText,
  ChevronRight
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid, Legend, PieChart, Pie
} from "recharts";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/* ─── helpers ──────────────────────────────── */

function SectionTitle({ children }) {
  return (
    <h2 className="text-xs tracking-[0.15em] uppercase text-[#C5A059] font-semibold mb-4">
      {children}
    </h2>
  );
}

function StatBox({ label, value, sub, color }) {
  return (
    <div className="border border-slate-200 bg-white p-3 rounded-sm" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      <p className={`font-playfair text-xl font-bold ${color || "text-slate-900"}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function RateBar({ label, rate, count, color }) {
  const pct = (rate * 100).toFixed(1);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="text-slate-500">{pct}% ({count} cases)</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(rate * 100, 0.5)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

const WEEKDAY_LABELS = { monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun" };
const WEEKDAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const GRADE_STYLES = {
  A: { color: "#166534", bg: "#DCFCE7", border: "#166534" },
  B: { color: "#3F6212", bg: "#ECFCCB", border: "#3F6212" },
  C: { color: "#92400E", bg: "#FEF3C7", border: "#92400E" },
  D: { color: "#C2410C", bg: "#FFEDD5", border: "#C2410C" },
  F: { color: "#991B1B", bg: "#FEE2E2", border: "#991B1B" },
};

const BIAS_DIMENSIONS = [
  { key: "caste_religious", label: "Caste/Religious" },
  { key: "gender", label: "Gender" },
  { key: "socioeconomic", label: "Socioeconomic" },
  { key: "recidivism", label: "Recidivism" },
  { key: "geographic", label: "Geographic" },
];

const OUTCOME_STYLES = {
  CONVICTED: { color: "#991B1B", bg: "#FEE2E2" },
  ACQUITTED: { color: "#166534", bg: "#DCFCE7" },
  "BAIL DENIED": { color: "#991B1B", bg: "#FEE2E2" },
  "BAIL GRANTED": { color: "#166534", bg: "#DCFCE7" },
  PROTECTED: { color: "#166534", bg: "#DCFCE7" },
  "NOT PROTECTED": { color: "#991B1B", bg: "#FEE2E2" },
  "PETITION DISMISSED": { color: "#991B1B", bg: "#FEE2E2" },
};

function GradeBadge({ grade, size = "sm" }) {
  if (!grade) return null;
  const s = GRADE_STYLES[grade] || { color: "#64748B", bg: "#F1F5F9", border: "#64748B" };
  const cls = size === "lg" ? "text-2xl font-bold w-12 h-12" : "text-sm font-bold w-7 h-7";
  return (
    <span className={`inline-flex items-center justify-center border-2 ${cls}`} style={{ color: s.color, backgroundColor: s.bg, borderColor: s.border }}>
      {grade}
    </span>
  );
}

function StatusPill({ status }) {
  const cfg = { pass: { color: "#166534", icon: "✓" }, warn: { color: "#B45309", icon: "!" }, fail: { color: "#991B1B", icon: "✗" } };
  const c = cfg[status] || cfg.warn;
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5" style={{ color: c.color, backgroundColor: c.color + "15", border: `1px solid ${c.color}40` }}>
      {c.icon}
    </span>
  );
}

/* ─── Summary Stats Section ─────────────────── */

function SummaryStatsSection({ stats }) {
  if (!stats) return null;

  const weekdayData = WEEKDAY_ORDER.map((d) => ({
    day: WEEKDAY_LABELS[d],
    cases: stats.weekday_distribution?.[d] || 0,
  }));
  const maxWeekday = Math.max(...weekdayData.map((d) => d.cases), 1);

  const outcomeData = [
    { name: "Allowed", value: stats.allowed_cases || 0, color: "#166534" },
    { name: "Dismissed", value: stats.dismissed_cases || 0, color: "#991B1B" },
    { name: "Other", value: Math.max((stats.total_cases || 0) - (stats.allowed_cases || 0) - (stats.dismissed_cases || 0), 0), color: "#94A3B8" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Key Numbers */}
      <div>
        <SectionTitle>Case Statistics</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatBox label="Total Cases" value={stats.total_cases?.toLocaleString() || 0} />
          <StatBox label="Unique Courts" value={stats.unique_courts || 0} />
          <StatBox label="Allowed" value={`${(stats.allowed_rate * 100).toFixed(1)}%`} sub={`${stats.allowed_cases || 0} cases`} color="text-emerald-700" />
          <StatBox label="Dismissed" value={`${(stats.dismissed_rate * 100).toFixed(1)}%`} sub={`${stats.dismissed_cases || 0} cases`} color="text-red-700" />
          <StatBox label="Other Outcomes" value={Math.max((stats.total_cases || 0) - (stats.allowed_cases || 0) - (stats.dismissed_cases || 0), 0)} sub="remaining cases" />
          <StatBox label="Caste Mentions" value={stats.caste_mention_cases || 0} sub={`${(stats.caste_mention_rate * 100).toFixed(1)}% of total`} color={stats.caste_mention_rate > 0.5 ? "text-purple-700" : "text-slate-900"} />
        </div>
      </div>

      {/* Raw counts row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="Female Context" value={stats.female_context_cases || 0} sub={`${(stats.female_context_rate * 100).toFixed(1)}% rate`} color="text-sky-700" />
        <StatBox label="Male Context" value={stats.male_context_cases || 0} sub={`${(stats.male_context_rate * 100).toFixed(1)}% rate`} color="text-indigo-700" />
        <StatBox label="Age Mentions" value={stats.age_mention_cases || 0} sub={`${(stats.age_mention_rate * 100).toFixed(1)}% rate`} color="text-amber-700" />
        <StatBox label="Data Source" value={stats.source || "CSV"} sub={stats.imported_at ? `Imported ${new Date(stats.imported_at).toLocaleDateString()}` : ""} />
      </div>

      {/* Case Outcomes + Weekday Distribution side by side */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Case Outcomes Pie */}
        <div className="bg-white border border-slate-200 p-5 rounded-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-4 font-medium">Case Outcomes</p>
          {outcomeData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={outcomeData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} strokeWidth={0}>
                    {outcomeData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, name) => [`${v} cases`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {outcomeData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-600">{d.name}</span>
                    <span className="font-bold text-slate-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No outcome data available</p>
          )}
        </div>

        {/* Weekday Distribution */}
        <div className="bg-white border border-slate-200 p-5 rounded-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-4 font-medium">Weekday Distribution</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weekdayData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [`${v} cases`]} />
              <Bar dataKey="cases" radius={[3, 3, 0, 0]}>
                {weekdayData.map((entry) => (
                  <Cell key={entry.day} fill={entry.cases === maxWeekday ? "#C5A059" : "#0B192C"} opacity={entry.cases === maxWeekday ? 1 : 0.5} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-slate-400 text-center mt-1">Gold bar = busiest day</p>
        </div>
      </div>

      {/* Demographic Context Rates */}
      <div className="bg-white border border-slate-200 p-5 rounded-sm">
        <p className="text-xs uppercase tracking-wider text-slate-400 mb-4 font-medium">Demographic Context Analysis</p>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1">
          <RateBar label="Caste Mention" rate={stats.caste_mention_rate || 0} count={stats.caste_mention_cases || 0} color="#7C3AED" />
          <RateBar label="Female Context" rate={stats.female_context_rate || 0} count={stats.female_context_cases || 0} color="#0891B2" />
          <RateBar label="Male Context" rate={stats.male_context_rate || 0} count={stats.male_context_cases || 0} color="#4F46E5" />
          <RateBar label="Age Mention" rate={stats.age_mention_rate || 0} count={stats.age_mention_cases || 0} color="#D97706" />
        </div>
      </div>
    </div>
  );
}

/* ─── Detailed Profile Sections ─────────────── */

function BiographySection({ judge }) {
  return (
    <div className="bg-white border border-slate-200 p-5 rounded-sm">
      <SectionTitle>Biography & Career</SectionTitle>
      {judge.bio_summary && (
        <p className="text-sm text-slate-700 leading-relaxed mb-4">{judge.bio_summary}</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {judge.years_on_bench && <StatBox label="Years on Bench" value={judge.years_on_bench} />}
        {judge.education && <StatBox label="Education" value={judge.education} />}
        {judge.appointed_by && <StatBox label="Appointed By" value={judge.appointed_by} />}
        {judge.case_types?.length > 0 && (
          <div className="border border-slate-200 bg-white p-3 rounded-sm">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Case Types</p>
            <div className="flex flex-wrap gap-1">
              {judge.case_types.map((t) => (
                <span key={t} className="text-xs px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700">{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RulingBreakdownSection({ rb }) {
  if (!rb) return null;
  const items = [
    { label: "Prosecution Wins", value: rb.prosecution_win_pct, color: "#991B1B" },
    { label: "Defense Wins", value: rb.defense_win_pct, color: "#1E40AF" },
    { label: "Appeals Reversed", value: rb.appeals_reversed_pct, color: "#B45309" },
  ];
  return (
    <div className="bg-white border border-slate-200 p-5 rounded-sm">
      <SectionTitle>Ruling Breakdown</SectionTitle>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span className="font-medium">{item.label}</span>
              <span>{item.value}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BiasAnalysisSection({ judge }) {
  const [activeDim, setActiveDim] = useState("caste_religious");
  const biasScore = judge.bias_score || 0;
  const biasColor = biasScore >= 67 ? "#991B1B" : biasScore >= 34 ? "#C5A059" : "#166534";
  const rc = judge.report_card || {};
  const bb = judge.bias_breakdown || {};
  const active = bb[activeDim];
  const os = judge.outlier_score;
  const outlierColor = os ? (os.direction === "above" ? "#991B1B" : "#166534") : "#64748B";

  return (
    <div className="space-y-4">
      <SectionTitle>Bias Analysis</SectionTitle>

      {/* Score + Outlier side by side */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">Bias Score</p>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-playfair text-4xl font-bold" style={{ color: biasColor }}>{biasScore}</span>
            <div>
              <p className="text-xs text-slate-500">out of 100</p>
              <span className="text-xs font-bold uppercase px-2 py-0.5 border mt-1 inline-block" style={{ color: biasColor, borderColor: biasColor + "40", backgroundColor: biasColor + "15" }}>
                {judge.bias_risk?.replace("-", " ")} risk
              </span>
            </div>
          </div>
          <div className="h-3 bg-slate-100 relative overflow-hidden mb-3">
            <div className="absolute inset-0 bias-gauge opacity-60" />
            <div className="absolute top-0 h-full w-1 bg-[#0B192C]" style={{ left: `calc(${biasScore}% - 2px)` }} />
          </div>
          {judge.bias_indicators?.map((ind, i) => (
            <div key={`bias-ind-${i}`} className="flex gap-2 text-xs text-slate-600 mb-1">
              <span style={{ color: biasColor }} className="shrink-0 font-bold">›</span>
              {ind}
            </div>
          ))}
        </div>

        {os && (
          <div className="bg-white border border-slate-200 p-5 rounded-sm" data-testid="outlier-score-panel">
            <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">Outlier Score</p>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-playfair text-4xl font-bold" style={{ color: outlierColor }}>
                {os.direction === "above" ? "+" : ""}{os.score}
              </span>
              <div>
                <p className="text-xs text-slate-500">pp vs. peer avg</p>
                <span className="text-xs font-bold px-1.5 py-0.5 uppercase mt-1 inline-block" style={{ color: outlierColor, backgroundColor: outlierColor + "15", border: `1px solid ${outlierColor}40` }}>
                  {os.percentile}th percentile
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1"><span>This judge</span><span>{os.this_judge_conviction_rate}%</span></div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${os.this_judge_conviction_rate}%`, backgroundColor: outlierColor }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Peer average</span><span>{os.peer_avg}%</span></div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-slate-400 rounded-full" style={{ width: `${os.peer_avg}%` }} /></div>
              </div>
            </div>
            <p className="text-xs text-slate-600 italic mt-3 bg-slate-50 border border-slate-100 p-2 rounded-sm">{os.label}</p>
          </div>
        )}
      </div>

      {/* Report Card */}
      {rc.overall && (
        <div className="bg-[#0B192C] p-5 rounded-sm flex items-center gap-6 flex-wrap">
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Overall</p>
            <GradeBadge grade={rc.overall} size="lg" />
          </div>
          <div className="w-px h-14 bg-slate-700 hidden sm:block" />
          <div className="flex gap-4 flex-wrap">
            {BIAS_DIMENSIONS.map((d) => (
              <button key={d.key} onClick={() => setActiveDim(d.key)} className={`text-center transition-opacity ${activeDim === d.key ? "opacity-100" : "opacity-50 hover:opacity-80"}`} data-testid={`dim-btn-${d.key}`}>
                <p className="text-xs text-slate-400 mb-1.5 whitespace-nowrap">{d.label}</p>
                <GradeBadge grade={rc[d.key]} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active dimension detail */}
      {active && (
        <div className="bg-white border border-slate-200 p-5 rounded-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-playfair text-lg text-slate-900">{active.label}</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Score: {active.score}/100</span>
              <GradeBadge grade={active.grade} />
            </div>
          </div>
          <div className="border border-slate-200 overflow-hidden rounded-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0B192C]">
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-slate-300 font-medium">Metric</th>
                  <th className="text-center px-3 py-2 text-xs uppercase tracking-wide text-slate-300 font-medium">Value</th>
                  <th className="text-center px-3 py-2 text-xs uppercase tracking-wide text-slate-300 font-medium hidden sm:table-cell">Benchmark</th>
                  <th className="text-center px-3 py-2 text-xs uppercase tracking-wide text-slate-300 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {active.data_points?.map((dp, i) => (
                  <tr key={`dp-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-3 py-2.5 text-xs text-slate-700 font-medium">{dp.metric}</td>
                    <td className="px-3 py-2.5 text-center text-xs font-bold text-slate-900">{dp.value}</td>
                    <td className="px-3 py-2.5 text-center text-xs text-slate-400 hidden sm:table-cell">{dp.benchmark}</td>
                    <td className="px-3 py-2.5 text-center"><StatusPill status={dp.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-sm">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">Verdict</p>
            <p className="text-sm text-amber-900 leading-relaxed">{active.verdict}</p>
          </div>
        </div>
      )}

      {/* Demographic conviction chart + sentence data */}
      {judge.demographic_patterns && Object.keys(judge.demographic_patterns).length > 0 && (
        <div className="bg-white border border-slate-200 p-5 rounded-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-4 font-medium">Conviction Rate & Avg Sentence by Defendant Community</p>
          <div className="grid lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={150}>
              <BarChart
                data={Object.entries(judge.demographic_patterns).map(([key, data]) => ({
                  name: key === "general_upper_caste" ? "General/UC" : key === "obc" ? "OBC" : key === "sc_st" ? "SC/ST" : key === "minority" ? "Minority" : key,
                  rate: data.conviction_rate || 0,
                  sentence: data.avg_sentence_months || 0,
                }))}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v, name) => name === "rate" ? `${v}%` : `${v} months`} />
                <Bar dataKey="rate" name="Conviction %" radius={[3, 3, 0, 0]}>
                  {Object.values(judge.demographic_patterns).map((d, i) => (
                    <Cell key={`dem-${i}`} fill={d.conviction_rate >= 85 ? "#991B1B" : d.conviction_rate >= 70 ? "#C5A059" : "#166534"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Sentence table */}
            <div className="border border-slate-200 rounded-sm overflow-hidden">
              <table className="w-full text-sm" data-testid="demographic-table">
                <thead>
                  <tr className="bg-[#0B192C]">
                    <th className="text-left px-3 py-2 text-xs uppercase text-slate-300 font-medium">Community</th>
                    <th className="text-center px-3 py-2 text-xs uppercase text-slate-300 font-medium">Conviction</th>
                    <th className="text-center px-3 py-2 text-xs uppercase text-slate-300 font-medium">Avg Sentence</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(judge.demographic_patterns).map(([key, data], i) => (
                    <tr key={key} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-3 py-2 text-xs font-medium text-slate-700">
                        {key === "general_upper_caste" ? "General/Upper Caste" : key === "obc" ? "OBC" : key === "sc_st" ? "SC/ST" : key === "minority" ? "Minority" : key}
                      </td>
                      <td className="px-3 py-2 text-center text-xs font-bold" style={{ color: data.conviction_rate >= 85 ? "#991B1B" : "#166534" }}>
                        {data.conviction_rate}%
                      </td>
                      <td className="px-3 py-2 text-center text-xs font-bold text-slate-900">
                        {data.avg_sentence_months} mo
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ComparableCasesSection({ cases }) {
  if (!cases?.length) return null;
  const BIAS_META = {
    caste_religious: { label: "Caste/Religious", color: "#7C3AED" },
    socioeconomic: { label: "Socioeconomic", color: "#C5A059" },
    gender: { label: "Gender", color: "#0E7490" },
    recidivism: { label: "Recidivism", color: "#B45309" },
    geographic: { label: "Geographic", color: "#166534" },
  };

  return (
    <div>
      <SectionTitle>Comparable Cases</SectionTitle>
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-sm text-xs text-amber-800 flex gap-2 mb-4">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Outcome differences highlight potential bias patterns, not definitive judicial misconduct.</span>
      </div>
      <div className="space-y-4">
        {cases.map((c, i) => {
          const bt = BIAS_META[c.bias_type] || { label: c.bias_type, color: "#64748B" };
          return (
            <div key={`cc-${i}`} className="border border-slate-200 overflow-hidden rounded-sm" data-testid={`comparable-case-${i}`}>
              <div className="bg-[#0B192C] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-white">{c.crime}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Year: {c.year}</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 whitespace-nowrap self-start sm:self-auto rounded-sm" style={{ color: bt.color, backgroundColor: bt.color + "25", border: `1px solid ${bt.color}60` }}>
                  {bt.label} Bias
                </span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-200">
                {[["Defendant A", c.defendant_a], ["Defendant B", c.defendant_b]].map(([label, def]) => {
                  const os = OUTCOME_STYLES[def?.outcome] || { color: "#64748B", bg: "#F1F5F9" };
                  return (
                    <div key={label} className="p-4">
                      <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-3 border-b border-slate-100 pb-2">{label}</p>
                      <div className="space-y-1 text-xs text-slate-700 mb-3">
                        {[["Community", def?.community], ["Gender", def?.gender], ["Class", def?.economic_class], ["Counsel", def?.counsel]].map(([k, v]) => (
                          <div key={k} className="flex gap-1"><span className="text-slate-400 w-16 shrink-0">{k}</span><span className="font-medium">{v}</span></div>
                        ))}
                      </div>
                      <span className="inline-block text-xs font-bold px-2 py-0.5 border" style={{ color: os.color, backgroundColor: os.bg, borderColor: os.color + "50" }}>{def?.outcome}</span>
                      {def?.sentence && def.sentence !== "N/A" && <p className="text-xs text-slate-600 font-medium mt-1">{def.sentence}</p>}
                    </div>
                  );
                })}
              </div>
              {c.observation && (
                <div className="bg-amber-50 border-t border-amber-200 px-4 py-3">
                  <p className="text-xs text-amber-900 leading-relaxed"><span className="font-bold uppercase text-amber-800">Observation — </span>{c.observation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineSection({ timeline }) {
  if (!timeline?.length) return null;
  return (
    <div>
      <SectionTitle>Ruling Timeline</SectionTitle>
      <div className="bg-white border border-slate-200 p-5 rounded-sm mb-4">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={timeline} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
            <Tooltip formatter={(v, name) => [`${v}%`, name === "conviction_rate" ? "Conviction Rate" : "Bail Denial Rate"]} />
            <Legend iconType="circle" iconSize={8} />
            <Line type="monotone" dataKey="conviction_rate" stroke="#0B192C" strokeWidth={2.5} name="Conviction Rate" dot={{ r: 3 }} />
            <Line type="monotone" dataKey="bail_denial_rate" stroke="#C5A059" strokeWidth={2} name="Bail Denial Rate" strokeDasharray="5 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
     
    </div>
  );
}

function TemporalSection({ tp }) {
  if (!tp) return null;
  const dowData = tp.day_of_week || [];
  const todData = tp.time_of_day || [];
  const ee = tp.election_year_effect;
  const me = tp.media_effect;
  const maxDow = Math.max(...dowData.map((d) => d.conviction_rate), 1);

  return (
    <div >
      
    </div>
  );
}

function NotableCasesSection({ cases }) {
  if (!cases?.length) return null;
  return (
    <div>
      <SectionTitle>Notable Cases</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-3">
        {cases.map((c, i) => (
          <div key={`nc-${i}`} className="bg-white border border-slate-200 p-4 rounded-sm">
            <p className="text-sm font-medium text-slate-900">{c.name}</p>
            <p className="text-xs text-[#C5A059] mt-0.5">{c.type}</p>
            <p className="text-xs text-slate-700 mt-1">{c.outcome}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────── */

export default function JudgeDetailPage() {
  const { judgeId } = useParams();
  const navigate = useNavigate();
  const [judge, setJudge] = useState(null);
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

        const merged = detailed.map((j) => {
          const match = summaries.find(
            (s) =>
              s.judge_name.toLowerCase().includes(j.name.toLowerCase()) ||
              j.name.toLowerCase().includes(s.judge_name.toLowerCase())
          );
          return match ? { ...j, summary_stats: match } : j;
        });

        const detailedLower = detailed.map((j) => j.name.toLowerCase());
        const summaryOnly = summaries
          .filter((s) => !detailedLower.some((n) => n.includes(s.judge_name.toLowerCase()) || s.judge_name.toLowerCase().includes(n)))
          .map((s) => ({
            id: `summary-${s.judge_name.replace(/\s+/g, "-")}`,
            name: s.judge_name,
            court: s.unique_courts > 1 ? `${s.unique_courts} courts` : "1 court",
            summary_stats: s,
            is_summary_only: true,
          }));

        const found = [...merged, ...summaryOnly].find((j) => j.id === judgeId);
        if (found) setJudge(found);
        else setError("Judge not found");
      })
      .catch(() => setError("Failed to load judge profile"))
      .finally(() => setLoading(false));
  }, [judgeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#0B192C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !judge) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-playfair text-slate-900 mb-2">Profile Not Found</h2>
          <p className="text-slate-600 text-sm mb-6">{error}</p>
          <button onClick={() => navigate("/judges")} className="px-5 py-2 bg-[#0B192C] text-white hover:bg-[#C5A059] transition-colors inline-flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Judges
          </button>
        </div>
      </div>
    );
  }

  const isDetailed = !judge.is_summary_only;
  const stats = judge.summary_stats;
  const rb = judge.ruling_breakdown;
  const os = judge.outlier_score;
  const biasScore = judge.bias_score;
  const biasColor = biasScore >= 67 ? "#991B1B" : biasScore >= 34 ? "#C5A059" : "#166534";

  return (
    <div className="min-h-screen bg-[#FAF9F6]" data-testid="judge-detail-page">
      {/* Sticky header */}
      <div className="bg-gradient-to-br from-[#0A1428] via-[#0B192C] to-[#11233D] py-6 px-4 sticky top-0 z-20 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#C5A059]/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="max-w-5xl mx-auto flex items-center gap-4 relative z-10">
          <button onClick={() => navigate("/judges")} className="p-2 text-white hover:text-[#C5A059] transition-colors" data-testid="back-to-judges-btn">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-playfair text-xl sm:text-2xl text-white tracking-tight">{judge.name}</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {judge.court}
              {judge.jurisdiction && judge.jurisdiction !== "Summary Data" ? ` · ${judge.jurisdiction}` : ""}
              {judge.location ? ` · ${judge.location}` : ""}
            </p>
          </div>
          {/* Quick bias badge in header for detailed judges */}
          {judge.bias_risk && (
            <span className="hidden sm:inline-flex text-xs font-bold uppercase px-2 py-1 border whitespace-nowrap" style={{ color: biasColor, borderColor: biasColor + "40", backgroundColor: biasColor + "15" }} data-testid="header-bias-badge">
              {judge.bias_risk} risk
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">

        {/* Key Stats Hero — for detailed judges */}
        {isDetailed && (
          <div className="bg-white border border-slate-200 rounded-sm p-5" data-testid="key-stats-hero">
            <SectionTitle>Key Statistics</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatBox label="Total Cases" value={judge.total_cases?.toLocaleString()} />
              <StatBox label="Years on Bench" value={judge.years_on_bench} />
              {rb && <StatBox label="Prosecution Win" value={`${rb.prosecution_win_pct}%`} color="text-red-700" />}
              {rb && <StatBox label="Defense Win" value={`${rb.defense_win_pct}%`} color="text-blue-700" />}
              {rb && <StatBox label="Appeals Reversed" value={`${rb.appeals_reversed_pct}%`} color="text-amber-700" />}
              {biasScore != null && (
                <StatBox label="Bias Score" value={`${biasScore}/100`} sub={judge.bias_risk} color={`${biasScore >= 67 ? "text-red-700" : biasScore >= 34 ? "text-amber-600" : "text-emerald-700"}`} />
              )}
            </div>
            {/* Outlier + report card row */}
            {(os || judge.report_card) && (
              <div className="mt-4 flex flex-wrap items-center gap-4">
                {os && (
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-sm" data-testid="hero-outlier">
                    <span className="text-xs text-slate-500">Outlier:</span>
                    <span className="text-sm font-bold" style={{ color: os.direction === "above" ? "#991B1B" : "#166534" }}>
                      {os.direction === "above" ? "+" : ""}{os.score}pp
                    </span>
                    <span className="text-[10px] text-slate-400">({os.percentile}th pct)</span>
                    <span className="text-[10px] text-slate-500 hidden md:inline">— {os.label}</span>
                  </div>
                )}
                {judge.report_card && (
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-sm" data-testid="hero-report-card">
                    <span className="text-xs text-slate-500">Report Card:</span>
                    {["overall", "caste_religious", "gender", "socioeconomic", "recidivism", "geographic"].map((dim) => {
                      const g = judge.report_card[dim];
                      if (!g) return null;
                      const gs = GRADE_STYLES[g] || {};
                      return (
                        <span key={dim} className="text-[10px] font-bold w-5 h-5 inline-flex items-center justify-center border" style={{ color: gs.color, backgroundColor: gs.bg, borderColor: gs.border }} title={dim.replace("_", "/")}>
                          {g}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Summary stats (from CSV) */}
        {stats && <SummaryStatsSection stats={stats} />}

        {/* Detailed profile sections */}
        {isDetailed && (
          <>
            {(judge.bio_summary || judge.education || judge.years_on_bench) && <BiographySection judge={judge} />}
            <RulingBreakdownSection rb={rb} />
            <BiasAnalysisSection judge={judge} />
            <ComparableCasesSection cases={judge.comparable_cases} />
            <TimelineSection timeline={judge.timeline} />
            <TemporalSection tp={judge.temporal_patterns} />
            <NotableCasesSection cases={judge.notable_cases} />
          </>
        )}

        {/* If summary-only and no detailed data */}
        {!isDetailed && !stats && (
          <div className="text-center py-16 text-slate-400">
            <Scale className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No detailed data available for this judge.</p>
          </div>
        )}
      </div>
    </div>
  );
}
