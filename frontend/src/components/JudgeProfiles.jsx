import { useState, useEffect } from "react";
import axios from "axios";
import {
  Search, AlertCircle, ChevronRight, Users, X,
  Award, TrendingUp, TrendingDown, Clock, BarChart2, Scale, FileText
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid, Legend
} from "recharts";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// --- Helpers ---
const GRADE_STYLES = {
  A: { color: "#166534", bg: "#DCFCE7", border: "#166534" },
  B: { color: "#3F6212", bg: "#ECFCCB", border: "#3F6212" },
  C: { color: "#92400E", bg: "#FEF3C7", border: "#92400E" },
  D: { color: "#C2410C", bg: "#FFEDD5", border: "#C2410C" },
  F: { color: "#991B1B", bg: "#FEE2E2", border: "#991B1B" },
};

const OUTCOME_STYLES = {
  CONVICTED: { color: "#991B1B", bg: "#FEE2E2" },
  ACQUITTED: { color: "#166534", bg: "#DCFCE7" },
  "BAIL DENIED": { color: "#991B1B", bg: "#FEE2E2" },
  "BAIL GRANTED": { color: "#166534", bg: "#DCFCE7" },
  PROTECTED: { color: "#166534", bg: "#DCFCE7" },
  "NOT PROTECTED": { color: "#991B1B", bg: "#FEE2E2" },
  "PETITION DISMISSED": { color: "#991B1B", bg: "#FEE2E2" },
};

const BIAS_TYPE_META = {
  caste_religious: { label: "Caste / Religious", color: "#7C3AED" },
  socioeconomic: { label: "Socioeconomic", color: "#C5A059" },
  gender: { label: "Gender", color: "#0E7490" },
  recidivism: { label: "Recidivism", color: "#B45309" },
  geographic: { label: "Geographic", color: "#166534" },
};

const BIAS_DIMENSIONS = [
  { key: "caste_religious", label: "Caste/Religious" },
  { key: "gender", label: "Gender" },
  { key: "socioeconomic", label: "Socioeconomic" },
  { key: "recidivism", label: "Recidivism" },
  { key: "geographic", label: "Geographic" },
];

// --- Small Components ---

function GradeBadge({ grade, size = "sm" }) {
  if (!grade) return null;
  const s = GRADE_STYLES[grade] || { color: "#64748B", bg: "#F1F5F9", border: "#64748B" };
  const cls = size === "lg"
    ? "text-3xl font-bold w-16 h-16 text-center leading-none"
    : "text-sm font-bold w-8 h-8 text-center leading-none";
  return (
    <span
      className={`inline-flex items-center justify-center border-2 ${cls}`}
      style={{ color: s.color, backgroundColor: s.bg, borderColor: s.border }}
    >
      {grade}
    </span>
  );
}

function StatusPill({ status }) {
  const cfg = {
    pass: { color: "#166534", label: "Pass", icon: "✓" },
    warn: { color: "#B45309", label: "Warn", icon: "!" },
    fail: { color: "#991B1B", label: "Fail", icon: "✗" },
  };
  const c = cfg[status] || cfg.warn;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5"
      style={{ color: c.color, backgroundColor: c.color + "15", border: `1px solid ${c.color}40` }}
    >
      {c.icon} {c.label}
    </span>
  );
}

function OutcomePill({ outcome }) {
  const s = OUTCOME_STYLES[outcome] || { color: "#64748B", bg: "#F1F5F9" };
  return (
    <span
      className="inline-block text-xs font-bold px-2 py-0.5 border"
      style={{ color: s.color, backgroundColor: s.bg, borderColor: s.color + "50" }}
    >
      {outcome}
    </span>
  );
}

function BiasRiskBadge({ risk }) {
  const C = { low: "#166534", medium: "#C5A059", high: "#991B1B" };
  const color = C[risk] || "#64748B";
  return (
    <span
      className="text-xs font-bold uppercase px-2 py-0.5 border"
      style={{ color, borderColor: color + "40", backgroundColor: color + "15" }}
    >
      {risk?.replace("-", " ")} RISK
    </span>
  );
}

// --- MODAL TABS ---

function OverviewTab({ judge }) {
  const biasScore = judge.bias_score || 0;
  const biasColor = biasScore >= 67 ? "#991B1B" : biasScore >= 34 ? "#C5A059" : "#166534";
  const rb = judge.ruling_breakdown || {};
  const os = judge.outlier_score;

  const outlierColor = os
    ? os.direction === "above" ? "#991B1B" : "#166534"
    : "#64748B";

  const dp = judge.demographic_patterns || {};
  const demographics = Object.entries(dp).map(([key, data]) => {
    const label = key === "general_upper_caste" ? "General/UC"
      : key === "obc" ? "OBC"
      : key === "sc_st" ? "SC/ST"
      : key === "minority" ? "Minority"
      : key;
    return { name: label, convictionRate: data.conviction_rate || 0, avgSentence: data.avg_sentence_months || 0 };
  });

  return (
    <div className="space-y-4">
      {/* Bio */}
      {judge.bio_summary && (
        <div className="bg-slate-50 border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Biography</p>
          <p className="text-sm text-slate-700 leading-relaxed">{judge.bio_summary}</p>
        </div>
      )}

      {/* Key stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Years on Bench", value: judge.years_on_bench },
          { label: "Total Cases", value: judge.total_cases?.toLocaleString() },
          { label: "Education", value: judge.education },
          { label: "Appointed By", value: judge.appointed_by },
        ].map((s) => (
          <div key={s.label} className="border border-slate-200 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">{s.label}</p>
            <p className="text-sm font-medium text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Enhanced Data - Summary Statistics */}
      {judge.summary_stats && (
        <div className="bg-[#C5A059] bg-opacity-5 border border-[#C5A059] border-opacity-30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs uppercase tracking-wider text-[#C5A059] font-bold">Enhanced Data</p>
            <span className="text-[9px] px-2 py-0.5 bg-[#C5A059] text-white font-bold uppercase">
              CSV Statistics
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Unique Courts</p>
              <p className="text-lg font-playfair font-bold text-slate-900">{judge.summary_stats.unique_courts}</p>
            </div>
            <div className="bg-white border border-slate-200 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Caste Mention Rate</p>
              <p className="text-lg font-playfair font-bold text-purple-700">
                {(judge.summary_stats.caste_mention_rate * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-white border border-slate-200 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Female Context</p>
              <p className="text-lg font-playfair font-bold text-blue-700">
                {(judge.summary_stats.female_context_rate * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-white border border-slate-200 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Allowed Rate</p>
              <p className="text-lg font-playfair font-bold text-green-700">
                {(judge.summary_stats.allowed_rate * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Weekday distribution mini chart */}
          <div className="mt-3 bg-white border border-slate-200 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Case Distribution by Weekday</p>
            <div className="flex items-end justify-between gap-1 h-20">
              {Object.entries(judge.summary_stats.weekday_distribution).map(([day, count]) => {
                const maxCount = Math.max(...Object.values(judge.summary_stats.weekday_distribution));
                const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center" style={{ height: '60px' }}>
                      {count > 0 && (
                        <div 
                          className="w-full bg-[#C5A059] opacity-70 hover:opacity-100 transition-opacity"
                          style={{ height: `${heightPercent}%` }}
                          title={`${day}: ${count} cases`}
                        />
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 uppercase">{day.slice(0, 3)}</span>
                    <span className="text-[10px] font-bold text-slate-700">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 bg-white border border-slate-200 p-2">
              <span className="text-slate-500">Age Mention Cases:</span>
              <span className="font-bold text-slate-900">{judge.summary_stats.age_mention_cases}</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 p-2">
              <span className="text-slate-500">Dismissed Rate:</span>
              <span className="font-bold text-slate-900">{(judge.summary_stats.dismissed_rate * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Bias score + Outlier Score */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">Bias Assessment</p>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-playfair text-5xl font-bold" style={{ color: biasColor }}>{biasScore}</span>
            <div>
              <p className="text-xs text-slate-500 mb-1">out of 100</p>
              <BiasRiskBadge risk={judge.bias_risk} />
            </div>
          </div>
          <div className="h-3 bg-slate-100 relative overflow-hidden mb-3">
            <div className="absolute inset-0 bias-gauge opacity-60" />
            <div
              className="absolute top-0 h-full w-1 bg-[#0B192C]"
              style={{ left: `calc(${biasScore}% - 2px)` }}
            />
          </div>
          <div className="space-y-1.5 mt-2">
            {judge.bias_indicators?.map((ind, i) => (
              <div key={i} className="flex gap-2 text-xs text-slate-600">
                <span style={{ color: biasColor }} className="shrink-0 font-bold">›</span>
                {ind}
              </div>
            ))}
          </div>
        </div>

        {os && (
          <div className="border border-slate-200 p-4" data-testid="outlier-score-panel">
            <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">Outlier Score</p>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-playfair text-5xl font-bold" style={{ color: outlierColor }}>
                {os.direction === "above" ? "+" : ""}{os.score}
              </span>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">pp vs. peer avg</p>
                <span
                  className="text-xs font-bold px-1.5 py-0.5 uppercase"
                  style={{ color: outlierColor, backgroundColor: outlierColor + "15", border: `1px solid ${outlierColor}40` }}
                >
                  {os.percentile}th percentile
                </span>
              </div>
            </div>
            {/* Peer comparison bar */}
            <div className="space-y-2 mt-2">
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>This judge</span>
                  <span>{os.this_judge_conviction_rate}%</span>
                </div>
                <div className="h-2 bg-slate-100">
                  <div className="h-full" style={{ width: `${os.this_judge_conviction_rate}%`, backgroundColor: outlierColor }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Peer average</span>
                  <span>{os.peer_avg}%</span>
                </div>
                <div className="h-2 bg-slate-100">
                  <div className="h-full bg-slate-400" style={{ width: `${os.peer_avg}%` }} />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 italic mt-3 bg-slate-50 border border-slate-200 p-2">{os.label}</p>
          </div>
        )}
      </div>

      {/* Ruling breakdown */}
      <div className="border border-slate-200 p-4">
        <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">Ruling Breakdown</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Prosecution Wins", value: rb.prosecution_win_pct, color: "#991B1B" },
            { label: "Defense Wins", value: rb.defense_win_pct, color: "#1E40AF" },
            { label: "Appeals Reversed", value: rb.appeals_reversed_pct, color: "#B45309" },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>{item.label}</span><span>{item.value}%</span>
              </div>
              <div className="h-2 bg-slate-100">
                <div className="h-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demographic conviction chart */}
      {demographics.length > 0 && (
        <div className="border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-4">Conviction Rate by Defendant Community</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={demographics} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="convictionRate" radius={0}>
                {demographics.map((entry, i) => (
                  <Cell key={i} fill={entry.convictionRate >= 85 ? "#991B1B" : entry.convictionRate >= 70 ? "#C5A059" : "#166534"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 text-center mt-1">Higher bars indicate potential over-prosecution of that group</p>
        </div>
      )}

      {/* Notable cases */}
      {judge.notable_cases?.length > 0 && (
        <div className="border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">Notable Cases</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {judge.notable_cases.map((c, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-900">{c.name}</p>
                <p className="text-xs text-[#C5A059] mt-0.5">{c.type}</p>
                <p className="text-xs text-slate-700 mt-1">{c.outcome}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportCardTab({ judge }) {
  const rc = judge.report_card || {};
  const bb = judge.bias_breakdown || {};
  const [activeDim, setActiveDim] = useState(BIAS_DIMENSIONS[0].key);
  const active = bb[activeDim];

  return (
    <div className="space-y-4" data-testid="report-card-tab">
      {/* Overall + dimension grades */}
      <div className="bg-[#0B192C] p-5 flex items-center gap-6 flex-wrap">
        <div className="text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Overall Grade</p>
          <GradeBadge grade={rc.overall} size="lg" />
        </div>
        <div className="w-px h-16 bg-slate-700 hidden sm:block" />
        <div className="flex gap-4 flex-wrap">
          {BIAS_DIMENSIONS.map((d) => (
            <button
              key={d.key}
              onClick={() => setActiveDim(d.key)}
              className={`text-center transition-opacity ${activeDim === d.key ? "opacity-100" : "opacity-50 hover:opacity-80"}`}
              data-testid={`report-card-dim-${d.key}`}
            >
              <p className="text-xs text-slate-400 mb-1.5 whitespace-nowrap">{d.label}</p>
              <GradeBadge grade={rc[d.key]} />
            </button>
          ))}
        </div>
      </div>

      {/* Sub-dimension tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        {BIAS_DIMENSIONS.map((d) => (
          <button
            key={d.key}
            onClick={() => setActiveDim(d.key)}
            className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wide whitespace-nowrap border-b-2 transition-colors ${activeDim === d.key ? "border-[#C5A059] text-[#0B192C]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {active && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-playfair text-lg text-slate-900">{active.label}</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Score: {active.score}/100</span>
              <GradeBadge grade={active.grade} />
            </div>
          </div>

          {/* Data points table */}
          <div className="border border-slate-200 overflow-hidden">
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
                  <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                    <td className="px-3 py-2.5 text-xs text-slate-700 font-medium">{dp.metric}</td>
                    <td className="px-3 py-2.5 text-center text-xs font-bold text-slate-900">{dp.value}</td>
                    <td className="px-3 py-2.5 text-center text-xs text-slate-400 hidden sm:table-cell">{dp.benchmark}</td>
                    <td className="px-3 py-2.5 text-center"><StatusPill status={dp.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">Analysis Verdict</p>
            <p className="text-sm text-amber-900 leading-relaxed">{active.verdict}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ComparableCasesTab({ judge }) {
  const cases = judge.comparable_cases || [];

  if (!cases.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Scale className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No comparable cases available for this judge.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5" data-testid="comparable-cases-tab">
      <div className="bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>These cases present similar charges and evidence quality. Outcome differences highlight potential bias patterns, not definitive judicial misconduct.</span>
      </div>

      {cases.map((c, i) => {
        const bt = BIAS_TYPE_META[c.bias_type] || { label: c.bias_type, color: "#64748B" };
        return (
          <div key={i} className="border border-slate-200 overflow-hidden" data-testid={`comparable-case-${i}`}>
            {/* Case header */}
            <div className="bg-[#0B192C] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-white">{c.crime}</p>
                <p className="text-xs text-slate-400 mt-0.5">Year: {c.year}</p>
              </div>
              <span
                className="text-xs font-bold px-2 py-1 whitespace-nowrap self-start sm:self-auto"
                style={{ color: bt.color, backgroundColor: bt.color + "25", border: `1px solid ${bt.color}60` }}
              >
                {bt.label} Bias Type
              </span>
            </div>

            {/* Side-by-side comparison */}
            <div className="grid grid-cols-2 divide-x divide-slate-200">
              {[["Defendant A", c.defendant_a], ["Defendant B", c.defendant_b]].map(([label, def]) => (
                <div key={label} className="p-4">
                  <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-3 border-b border-slate-100 pb-2">{label}</p>
                  <div className="space-y-1.5 text-xs text-slate-700 mb-3">
                    <div className="flex gap-1"><span className="text-slate-400 w-16 shrink-0">Community</span><span className="font-medium">{def.community}</span></div>
                    <div className="flex gap-1"><span className="text-slate-400 w-16 shrink-0">Gender</span><span className="font-medium">{def.gender}</span></div>
                    <div className="flex gap-1"><span className="text-slate-400 w-16 shrink-0">Class</span><span className="font-medium">{def.economic_class}</span></div>
                    <div className="flex gap-1"><span className="text-slate-400 w-16 shrink-0">Counsel</span><span className="font-medium">{def.counsel}</span></div>
                  </div>
                  <div className="space-y-1.5">
                    <OutcomePill outcome={def.outcome} />
                    {def.sentence && def.sentence !== "N/A" && (
                      <p className="text-xs text-slate-600 font-medium">{def.sentence}</p>
                    )}
                    {def.bail_on_appeal && def.bail_on_appeal !== "N/A" && (
                      <p className="text-xs text-slate-400">Appeal: {def.bail_on_appeal}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Observation */}
            <div className="bg-amber-50 border-t border-amber-200 px-4 py-3">
              <p className="text-xs text-amber-900 leading-relaxed">
                <span className="font-bold uppercase text-amber-800">Observation — </span>
                {c.observation}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimelineTab({ judge }) {
  const timeline = judge.timeline || [];

  if (!timeline.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No timeline data available.</p>
      </div>
    );
  }

  const CustomActiveDot = (props) => {
    const { cx, cy, payload } = props;
    if (!payload.notable) return <circle cx={cx} cy={cy} r={3} fill="#0B192C" />;
    return <circle cx={cx} cy={cy} r={6} fill="#C5A059" stroke="#0B192C" strokeWidth={2} />;
  };

  return (
    <div className="space-y-5" data-testid="timeline-tab">
      {/* Line chart */}
      <div className="border border-slate-200 p-4">
        <p className="text-xs uppercase tracking-wider text-slate-400 mb-4">Conviction Rate &amp; Bail Denial Rate Over Time</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={timeline} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
            <Tooltip
              formatter={(v, name) => [
                `${v}%`,
                name === "conviction_rate" ? "Conviction Rate" : "Bail Denial Rate",
              ]}
              labelFormatter={(y) => {
                const entry = timeline.find(t => t.year === y);
                return entry?.notable ? `${y} — ${entry.notable}` : `${y}`;
              }}
            />
            <Legend iconType="circle" iconSize={8} />
            <Line
              type="monotone"
              dataKey="conviction_rate"
              stroke="#0B192C"
              strokeWidth={2.5}
              name="Conviction Rate"
              dot={<CustomActiveDot />}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="bail_denial_rate"
              stroke="#C5A059"
              strokeWidth={2}
              name="Bail Denial Rate"
              dot={false}
              strokeDasharray="5 3"
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-400 text-center mt-1">
          Gold markers = notable events — hover for details
        </p>
      </div>

      {/* Year-by-year events */}
      <div className="border border-slate-200">
        <div className="bg-[#0B192C] px-4 py-2.5">
          <p className="text-xs uppercase tracking-wider text-slate-300">Year-by-Year Events</p>
        </div>
        <div className="divide-y divide-slate-100">
          {[...timeline].reverse().map((t, i) => (
            <div key={i} className="px-4 py-3 flex items-start gap-4">
              <span className="font-playfair text-xl font-bold text-[#C5A059] w-14 shrink-0">{t.year}</span>
              <div className="flex-1 min-w-0">
                {t.notable && <p className="text-sm text-slate-800 mb-1">{t.notable}</p>}
                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#0B192C] inline-block" />
                    Conviction: <strong className="text-slate-700">{t.conviction_rate}%</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#C5A059] inline-block" />
                    Bail Denial: <strong className="text-slate-700">{t.bail_denial_rate}%</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    Avg Sentence: <strong className="text-slate-700">{t.avg_sentence_months} mo</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TemporalTab({ judge }) {
  const tp = judge.temporal_patterns;

  if (!tp) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No temporal pattern data available.</p>
      </div>
    );
  }

  const dowData = tp.day_of_week || [];
  const todData = tp.time_of_day || [];
  const ee = tp.election_year_effect;
  const me = tp.media_effect;

  const maxDow = Math.max(...dowData.map(d => d.conviction_rate));

  return (
    <div className="space-y-5" data-testid="temporal-tab">
      {/* Callout tiles */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-slate-200 p-4 bg-slate-50">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Monday Effect</p>
          <p className="font-playfair text-xl text-[#0B192C] font-bold">{tp.monday_effect}</p>
          <p className="text-xs text-slate-500 mt-1">vs. weekly average conviction rate</p>
        </div>
        <div className="border border-slate-200 p-4 bg-slate-50">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Lunch Effect</p>
          <p className="font-playfair text-xl text-[#0B192C] font-bold">{tp.lunch_effect}</p>
          <p className="text-xs text-slate-500 mt-1">bail denial rate change post-lunch</p>
        </div>
      </div>

      {/* Day of week chart */}
      <div className="border border-slate-200 p-4">
        <p className="text-xs uppercase tracking-wider text-slate-400 mb-4">Conviction Rate by Day of Week</p>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={dowData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis
              domain={[Math.max(0, Math.min(...dowData.map(d => d.conviction_rate)) - 8), Math.min(100, maxDow + 8)]}
              tick={{ fontSize: 11 }}
              unit="%"
            />
            <Tooltip formatter={(v, name) => [`${v}%`, name === "conviction_rate" ? "Conviction Rate" : "Bail Denial Rate"]} />
            <Bar dataKey="conviction_rate" name="conviction_rate" radius={0}>
              {dowData.map((entry, i) => (
                <Cell key={i} fill={entry.conviction_rate === maxDow ? "#0B192C" : "#94A3B8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-400 text-center mt-1">Dark bar = peak conviction day of the week</p>
      </div>

      {/* Time-of-day bars */}
      <div className="border border-slate-200 p-4">
        <p className="text-xs uppercase tracking-wider text-slate-400 mb-4">Bail Denial Rate by Time of Day</p>
        <div className="space-y-3">
          {todData.map((slot, i) => {
            const maxRate = Math.max(...todData.map(s => s.bail_denial_rate));
            const isMax = slot.bail_denial_rate === maxRate;
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-24 shrink-0">{slot.slot}</span>
                <div className="flex-1 h-7 bg-slate-100 relative overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${slot.bail_denial_rate}%`,
                      backgroundColor: isMax ? "#991B1B" : "#0B192C",
                      opacity: isMax ? 1 : 0.45,
                    }}
                  />
                  <span className="absolute inset-0 flex items-center pl-2 text-xs font-bold text-white mix-blend-difference" style={{ opacity: 0.9 }}>
                    {slot.label}
                  </span>
                </div>
                <span className={`text-xs font-bold w-8 text-right ${isMax ? "text-red-700" : "text-slate-600"}`}>
                  {slot.bail_denial_rate}%
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-2">Red = highest-risk time slot for bail denial</p>
      </div>

      {/* Election year + Media effect */}
      <div className="grid md:grid-cols-2 gap-4">
        {ee && (
          <div className="border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">Election Year Effect</p>
            <div className="flex items-end gap-5 mb-3">
              <div className="text-center">
                <p className="font-playfair text-3xl text-[#0B192C] font-bold">{ee.election_year_conviction_rate}%</p>
                <p className="text-xs text-slate-500">Election Year</p>
              </div>
              <div className="text-center mb-0.5">
                <p className="font-playfair text-2xl text-slate-400">{ee.normal_year_rate}%</p>
                <p className="text-xs text-slate-500">Normal Year</p>
              </div>
              <div className="text-center">
                <p
                  className="font-playfair text-2xl font-bold"
                  style={{ color: parseFloat(ee.difference) > 3 ? "#991B1B" : "#166534" }}
                >
                  {ee.difference}
                </p>
                <p className="text-xs text-slate-500">Difference</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 p-2 italic leading-relaxed">
              {ee.assessment}
            </p>
          </div>
        )}

        {me && (
          <div className="border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">High-Profile / Media Effect</p>
            <div className="flex items-end gap-5 mb-3">
              <div className="text-center">
                <p className="font-playfair text-3xl text-[#0B192C] font-bold">{me.high_profile_rate}%</p>
                <p className="text-xs text-slate-500">High-Profile</p>
              </div>
              <div className="text-center mb-0.5">
                <p className="font-playfair text-2xl text-slate-400">{me.routine_rate}%</p>
                <p className="text-xs text-slate-500">Routine</p>
              </div>
              <div className="text-center">
                <p
                  className="font-playfair text-2xl font-bold"
                  style={{ color: parseFloat(me.difference) > 5 ? "#991B1B" : "#166534" }}
                >
                  {me.difference}
                </p>
                <p className="text-xs text-slate-500">Difference</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 p-2 italic leading-relaxed">
              {me.assessment}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- FULL MODAL ---

const TABS = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "report_card", label: "Report Card", icon: Award },
  { id: "comparable", label: "Comparable Cases", icon: Scale },
  { id: "timeline", label: "Timeline", icon: TrendingUp },
  { id: "temporal", label: "Temporal", icon: Clock },
];

function JudgeModal({ judge, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  if (!judge) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-2 pt-10 pb-10 overflow-y-auto"
      data-testid="judge-modal"
    >
      <div className="bg-white border border-slate-200 shadow-2xl w-full max-w-4xl">
        {/* Modal header */}
        <div className="bg-[#0B192C] px-6 py-5 flex items-start justify-between sticky top-0 z-10">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-[#C5A059] mb-1">Judicial Intelligence Profile</p>
            <h2 className="font-playfair text-2xl text-white">{judge.name}</h2>
            <p className="text-slate-400 text-sm mt-0.5">{judge.court} · {judge.location}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1.5 mt-1"
            data-testid="close-judge-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="bg-white border-b border-slate-200 flex overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium uppercase tracking-wide whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-[#C5A059] text-[#0B192C] bg-amber-50/50"
                    : "border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="p-5 overflow-y-auto max-h-[70vh]">
          {activeTab === "overview" && <OverviewTab judge={judge} />}
          {activeTab === "report_card" && <ReportCardTab judge={judge} />}
          {activeTab === "comparable" && <ComparableCasesTab judge={judge} />}
          {activeTab === "timeline" && <TimelineTab judge={judge} />}
          {activeTab === "temporal" && <TemporalTab judge={judge} />}
        </div>
      </div>
    </div>
  );
}

// --- JUDGE CARD ---

function JudgeCard({ judge, onClick }) {
  const biasScore = judge.bias_score || 0;
  const biasColor = biasScore >= 67 ? "#991B1B" : biasScore >= 34 ? "#C5A059" : "#166534";
  const rc = judge.report_card || {};
  const hasSummary = judge.summary_stats;
  const isSummaryOnly = judge.is_summary_only;

  return (
    <div
      className="bg-white border border-slate-200 hover:border-[#0B192C] transition-all cursor-pointer hover:shadow-md group"
      onClick={() => onClick(judge)}
      data-testid={`judge-card-${judge.id}`}
    >
      <div className={`h-1 ${isSummaryOnly ? 'bg-[#C5A059]' : 'bg-[#0B192C]'} group-hover:bg-[#C5A059] transition-colors`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-playfair text-lg text-slate-900 group-hover:text-[#0B192C]">{judge.name}</h3>
              {hasSummary && !isSummaryOnly && (
                <span className="text-[9px] px-1.5 py-0.5 bg-[#C5A059] text-white font-bold uppercase">
                  Enhanced
                </span>
              )}
              {isSummaryOnly && (
                <span className="text-[9px] px-1.5 py-0.5 bg-slate-400 text-white font-bold uppercase">
                  Stats Only
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{judge.court}</p>
            {!isSummaryOnly && <p className="text-xs text-slate-400">{judge.jurisdiction} · {judge.location}</p>}
          </div>
          {!isSummaryOnly && <BiasRiskBadge risk={judge.bias_risk} />}
        </div>

        {/* Stats row - different for summary-only judges */}
        {isSummaryOnly && hasSummary ? (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center border border-slate-100 py-2">
              <p className="font-playfair text-xl text-slate-900">{hasSummary.total_cases}</p>
              <p className="text-xs text-slate-500">Cases</p>
            </div>
            <div className="text-center border border-slate-100 py-2">
              <p className="font-playfair text-xl text-slate-900">{(hasSummary.caste_mention_rate * 100).toFixed(0)}%</p>
              <p className="text-xs text-slate-500">Caste Rate</p>
            </div>
            <div className="text-center border border-slate-100 py-2">
              <p className="font-playfair text-xl text-slate-900">{(hasSummary.allowed_rate * 100).toFixed(0)}%</p>
              <p className="text-xs text-slate-500">Allowed</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center border border-slate-100 py-2">
              <p className="font-playfair text-xl text-slate-900">{judge.total_cases?.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Total Cases</p>
            </div>
            <div className="text-center border border-slate-100 py-2">
              <p className="font-playfair text-xl text-slate-900">{judge.years_on_bench}</p>
              <p className="text-xs text-slate-500">Years</p>
            </div>
            <div className="text-center border border-slate-100 py-2">
              <p className="font-playfair text-xl font-bold" style={{ color: biasColor }}>{biasScore}</p>
              <p className="text-xs text-slate-500">Bias Score</p>
            </div>
          </div>
        )}

        {/* Summary stats badges (when available) */}
        {hasSummary && !isSummaryOnly && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {hasSummary.caste_mention_rate > 0.5 && (
              <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                High Caste Mentions ({(hasSummary.caste_mention_rate * 100).toFixed(0)}%)
              </span>
            )}
            {hasSummary.female_context_rate > 0.3 && (
              <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                Female Context ({(hasSummary.female_context_rate * 100).toFixed(0)}%)
              </span>
            )}
            {hasSummary.allowed_rate > 0.6 && (
              <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 font-medium">
                High Allowed Rate ({(hasSummary.allowed_rate * 100).toFixed(0)}%)
              </span>
            )}
          </div>
        )}

        {/* Bias gauge - only for detailed profiles */}
        {!isSummaryOnly && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Bias Indicator</span>
              <span>{biasScore}/100</span>
            </div>
            <div className="h-1.5 bg-slate-100 relative overflow-hidden">
              <div className="absolute inset-0 bias-gauge" />
              <div className="absolute top-0 h-full w-0.5 bg-[#0B192C]" style={{ left: `calc(${biasScore}% - 1px)` }} />
            </div>
          </div>
        )}

        {/* Report card grades strip */}
        {rc.overall && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-slate-400">Report Card:</span>
            {["overall", "caste_religious", "gender", "socioeconomic", "recidivism"].map((dim) => {
              const g = rc[dim];
              if (!g) return null;
              const s = GRADE_STYLES[g] || {};
              return (
                <span
                  key={dim}
                  className="text-xs font-bold w-6 h-6 inline-flex items-center justify-center border"
                  style={{ color: s.color, backgroundColor: s.bg, borderColor: s.border }}
                  title={dim.replace("_", "/")}
                >
                  {g}
                </span>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex gap-1 flex-wrap">
            {judge.case_types?.slice(0, 2).map((t) => (
              <span key={t} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200">{t}</span>
            ))}
          </span>
          <span className="flex items-center gap-1 text-[#0B192C] font-medium group-hover:text-[#C5A059] transition-colors">
            View {isSummaryOnly ? 'Stats' : 'Profile'} <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE ---

export default function JudgeProfiles() {
  const [judges, setJudges] = useState([]);
  const [judgeSummaries, setJudgeSummaries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [selectedJudge, setSelectedJudge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("detailed"); // "detailed" or "all"

  useEffect(() => {
    // Fetch both detailed judge profiles AND judge summaries
    Promise.all([
      axios.get(`${API}/judges`),
      axios.get(`${API}/judge-summary?limit=200`)
    ])
      .then(([detailedRes, summaryRes]) => {
        const detailedJudges = detailedRes.data;
        const summaryJudges = summaryRes.data.judges;
        
        // Merge: If a judge exists in both, enhance detailed with summary stats
        const mergedJudges = detailedJudges.map(judge => {
          const summary = summaryJudges.find(s => 
            s.judge_name.toLowerCase().includes(judge.name.toLowerCase()) ||
            judge.name.toLowerCase().includes(s.judge_name.toLowerCase())
          );
          
          return summary ? { ...judge, summary_stats: summary } : judge;
        });
        
        // Add summary-only judges (those not in detailed profiles)
        const detailedNames = detailedJudges.map(j => j.name.toLowerCase());
        const summaryOnlyJudges = summaryJudges
          .filter(s => !detailedNames.some(name => 
            name.includes(s.judge_name.toLowerCase()) || 
            s.judge_name.toLowerCase().includes(name)
          ))
          .map(s => ({
            id: `summary-${s.judge_name.replace(/\s+/g, '-')}`,
            name: s.judge_name,
            court: `${s.unique_courts} court${s.unique_courts > 1 ? 's' : ''}`,
            jurisdiction: "Summary Data",
            total_cases: s.total_cases,
            summary_stats: s,
            is_summary_only: true
          }));
        
        setJudges(mergedJudges);
        setJudgeSummaries(summaryOnlyJudges);
        setFiltered(viewMode === "detailed" ? mergedJudges : [...mergedJudges, ...summaryOnlyJudges]);
      })
      .catch(() => setError("Failed to load judge profiles"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const allJudges = viewMode === "detailed" ? judges : [...judges, ...judgeSummaries];
    let result = allJudges;
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.name.toLowerCase().includes(q) ||
          (j.court && j.court.toLowerCase().includes(q)) ||
          (j.jurisdiction && j.jurisdiction.toLowerCase().includes(q))
      );
    }
    if (riskFilter !== "all") {
      result = result.filter((j) => j.bias_risk === riskFilter);
    }
    setFiltered(result);
  }, [search, riskFilter, judges, judgeSummaries, viewMode]);

  return (
    <div className="min-h-screen bg-[#FAF9F6]" data-testid="judge-profiles-page">
      {/* Header */}
      <div className="bg-[#0B192C] py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs tracking-[0.2em] uppercase text-[#C5A059] mb-2 font-medium">
            Intelligence Database
          </p>
          <h1 className="font-playfair text-3xl sm:text-4xl text-white">Judge Pattern Analysis</h1>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl">
            Deep-dive bias profiles: report cards, comparable cases, ruling timelines, and temporal
            patterns for Indian SC/HC judges.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search judges by name, court, or jurisdiction..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-[#0B192C] focus:ring-1 focus:ring-[#0B192C]"
                data-testid="judge-search-input"
              />
            </div>
            <div className="flex gap-2">
              {["all", "low", "medium", "high"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`px-3 py-2 text-xs font-medium uppercase border transition-colors ${
                    riskFilter === r
                      ? "bg-[#0B192C] text-white border-[#0B192C]"
                      : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                  }`}
                  data-testid={`filter-${r}`}
                >
                  {r === "all" ? "All" : `${r} Risk`}
                </button>
              ))}
            </div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode("detailed")}
                className={`px-4 py-1.5 border transition-colors ${
                  viewMode === "detailed"
                    ? "bg-[#0B192C] text-white border-[#0B192C]"
                    : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                }`}
              >
                Detailed Profiles ({judges.length})
              </button>
              <button
                onClick={() => setViewMode("all")}
                className={`px-4 py-1.5 border transition-colors ${
                  viewMode === "all"
                    ? "bg-[#0B192C] text-white border-[#0B192C]"
                    : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                }`}
              >
                All Judges ({judges.length + judgeSummaries.length})
              </button>
            </div>
            <span className="text-slate-500">
              Showing {filtered.length} judge{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-slate-200 h-72 shimmer" />
            ))}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {!loading && !error && (
          <>
            <p className="text-xs text-slate-500 mb-4">
              {filtered.length} judge{filtered.length !== 1 ? "s" : ""} found · Click any card for full bias analysis
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((judge) => (
                <JudgeCard key={judge.id} judge={judge} onClick={setSelectedJudge} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No judges match your search.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Judge detail modal */}
      {selectedJudge && (
        <JudgeModal judge={selectedJudge} onClose={() => setSelectedJudge(null)} />
      )}
    </div>
  );
}
