import { useState, useEffect } from "react";
import axios from "axios";
import { Search, AlertCircle, ChevronRight, TrendingUp, TrendingDown, Minus, Users, Scale, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BIAS_COLORS = { low: "#166534", "low-medium": "#4D7C0F", medium: "#C5A059", high: "#991B1B" };

function BiasRiskBadge({ risk }) {
  const color = BIAS_COLORS[risk] || "#64748B";
  return (
    <span className="text-xs font-bold uppercase px-2 py-0.5 border" style={{ color, borderColor: color + "40", backgroundColor: color + "15" }}>
      {risk?.replace("-", " ")} RISK
    </span>
  );
}

function JudgeCard({ judge, onClick }) {
  const biasScore = judge.bias_score || 0;
  const biasWidth = `${biasScore}%`;
  const biasColor = biasScore >= 67 ? "#991B1B" : biasScore >= 34 ? "#C5A059" : "#166534";

  return (
    <div
      className="bg-white border border-slate-200 hover:border-slate-400 transition-all cursor-pointer hover:shadow-sm"
      onClick={() => onClick(judge)}
      data-testid={`judge-card-${judge.id}`}
    >
      <div className="h-1 bg-[#0B192C]" />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-playfair text-lg text-slate-900">{judge.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{judge.court}</p>
            <p className="text-xs text-slate-400">{judge.jurisdiction} · {judge.location}</p>
          </div>
          <BiasRiskBadge risk={judge.bias_risk} />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center border border-slate-100 py-2">
            <p className="font-playfair text-xl text-slate-900">{judge.total_cases?.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Total Cases</p>
          </div>
          <div className="text-center border border-slate-100 py-2">
            <p className="font-playfair text-xl text-slate-900">{judge.years_on_bench}</p>
            <p className="text-xs text-slate-500">Years on Bench</p>
          </div>
          <div className="text-center border border-slate-100 py-2">
            <p className="font-playfair text-xl" style={{ color: biasColor }}>{biasScore}</p>
            <p className="text-xs text-slate-500">Bias Score</p>
          </div>
        </div>

        {/* Bias bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Bias Indicator</span>
            <span>{biasScore}/100</span>
          </div>
          <div className="h-1.5 bg-slate-100 relative overflow-hidden">
            <div className="absolute inset-0 bias-gauge" />
            <div className="absolute h-full w-full bg-slate-100" style={{ clipPath: `inset(0 ${100 - biasScore}% 0 0)`, display: "none" }} />
            <div className="absolute top-0 h-full w-0.5 bg-[#0B192C]" style={{ left: `calc(${biasScore}% - 1px)` }} />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex gap-1 flex-wrap">
            {judge.case_types?.slice(0, 2).map((t) => (
              <span key={t} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200">{t}</span>
            ))}
          </span>
          <span className="flex items-center gap-1 text-[#0B192C] font-medium">
            View Profile <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

function JudgeModal({ judge, onClose }) {
  if (!judge) return null;
  const dp = judge.demographic_patterns || {};
  const demographics = Object.entries(dp).map(([race, data]) => ({
    name: race.charAt(0).toUpperCase() + race.slice(1),
    convictionRate: data.conviction_rate || data.favorable_outcome || 0,
    avgSentence: data.avg_sentence_months || 0,
  }));

  const rulingData = judge.ruling_breakdown || {};
  const prosecutionPct = rulingData.prosecution_win_pct || rulingData.plaintiff_win_pct || 0;
  const defensePct = rulingData.defense_win_pct || rulingData.defendant_win_pct || 0;
  const biasScore = judge.bias_score || 0;
  const biasColor = biasScore >= 67 ? "#991B1B" : biasScore >= 34 ? "#C5A059" : "#166534";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto" data-testid="judge-modal">
      <div className="bg-white border border-slate-200 shadow-2xl w-full max-w-4xl">
        {/* Modal header */}
        <div className="bg-[#0B192C] px-6 py-5 flex items-start justify-between">
          <div>
            <p className="text-xs tracking-widest uppercase text-[#C5A059] mb-1">Judge Profile</p>
            <h2 className="font-playfair text-2xl text-white">{judge.name}</h2>
            <p className="text-slate-400 text-sm mt-0.5">{judge.court}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1" data-testid="close-judge-modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Key stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Years on Bench", value: judge.years_on_bench },
              { label: "Total Cases", value: judge.total_cases?.toLocaleString() },
              { label: "Education", value: judge.education },
              { label: "Appointed By", value: judge.appointed_by },
            ].map((s) => (
              <div key={s.label} className="border border-slate-200 p-3">
                <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">{s.label}</p>
                <p className="text-sm font-medium text-slate-900">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Bio */}
          <div className="border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Biography</p>
            <p className="text-sm text-slate-700 leading-relaxed">{judge.bio_summary}</p>
          </div>

          {/* Bias score + indicators */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">Bias Assessment</p>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-playfair text-4xl font-bold" style={{ color: biasColor }}>{biasScore}</span>
                <div>
                  <p className="text-xs text-slate-500">out of 100</p>
                  <BiasRiskBadge risk={judge.bias_risk} />
                </div>
              </div>
              <div className="h-3 bg-slate-100 relative overflow-hidden mb-3">
                <div className="absolute inset-0 bias-gauge opacity-60" />
                <div className="absolute top-0 h-full w-1 bg-[#0B192C]" style={{ left: `calc(${biasScore}% - 2px)` }} />
              </div>
              <div className="space-y-1.5">
                {judge.bias_indicators?.map((ind, i) => (
                  <div key={i} className="flex gap-2 text-xs text-slate-600">
                    <span style={{ color: biasColor }} className="shrink-0">›</span>
                    {ind}
                  </div>
                ))}
              </div>
            </div>

            {/* Ruling breakdown */}
            <div className="border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">Ruling Breakdown</p>
              <div className="space-y-3">
                {prosecutionPct > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Prosecution / Plaintiff wins</span><span>{prosecutionPct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100"><div className="h-full bg-[#991B1B]" style={{ width: `${prosecutionPct}%` }} /></div>
                  </div>
                )}
                {defensePct > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Defense / Defendant wins</span><span>{defensePct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100"><div className="h-full bg-[#1E40AF]" style={{ width: `${defensePct}%` }} /></div>
                  </div>
                )}
                {rulingData.appeals_reversed_pct > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Appeals Reversed</span><span>{rulingData.appeals_reversed_pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100"><div className="h-full bg-amber-500" style={{ width: `${rulingData.appeals_reversed_pct}%` }} /></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Demographic patterns chart */}
          {demographics.length > 0 && (
            <div className="border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-4">Conviction Rate by Defendant Race</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={demographics} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="convictionRate" radius={0}>
                    {demographics.map((entry, i) => (
                      <Cell key={i} fill={entry.convictionRate >= 85 ? "#991B1B" : entry.convictionRate >= 75 ? "#C5A059" : "#166534"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-slate-400 text-center mt-1">Higher bars indicate potential over-prosecution bias</p>
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
                    <p className="text-xs text-slate-500 mt-0.5">{c.type}</p>
                    <p className="text-xs text-slate-700 mt-1">{c.outcome}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JudgeProfiles() {
  const [judges, setJudges] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [selectedJudge, setSelectedJudge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API}/judges`)
      .then((res) => { setJudges(res.data); setFiltered(res.data); })
      .catch(() => setError("Failed to load judge profiles"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = judges;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((j) => j.name.toLowerCase().includes(q) || j.court.toLowerCase().includes(q) || j.jurisdiction.toLowerCase().includes(q));
    }
    if (riskFilter !== "all") {
      result = result.filter((j) => j.bias_risk === riskFilter);
    }
    setFiltered(result);
  }, [search, riskFilter, judges]);

  return (
    <div className="min-h-screen bg-[#F8F9FA]" data-testid="judge-profiles-page">
      {/* Header */}
      <div className="bg-[#0B192C] py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs tracking-[0.2em] uppercase text-[#C5A059] mb-2 font-medium">Intelligence Database</p>
          <h1 className="font-playfair text-3xl sm:text-4xl text-white">Judge Pattern Analysis</h1>
          <p className="text-slate-400 text-sm mt-2">Comprehensive profiles with bias detection, demographic patterns, and ruling history.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3">
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
                className={`px-3 py-2 text-xs font-medium uppercase border transition-colors ${riskFilter === r ? "bg-[#0B192C] text-white border-[#0B192C]" : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"}`}
                data-testid={`filter-${r}`}
              >
                {r === "all" ? "All" : `${r} Risk`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="bg-white border border-slate-200 h-64 shimmer" />
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
            <p className="text-xs text-slate-500 mb-4">{filtered.length} judge{filtered.length !== 1 ? "s" : ""} found</p>
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

      {/* Judge modal */}
      {selectedJudge && <JudgeModal judge={selectedJudge} onClose={() => setSelectedJudge(null)} />}
    </div>
  );
}
