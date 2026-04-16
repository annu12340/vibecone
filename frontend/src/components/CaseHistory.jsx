import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FileText, Clock, CheckCircle2, AlertCircle, Scale, ArrowRight, Trash2, RefreshCw } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TYPE_COLORS = {
  Criminal: "#991B1B", Civil: "#1E40AF", Family: "#7C3AED",
  Constitutional: "#0B192C", "Corporate / Financial": "#166534",
  Employment: "#C5A059", Immigration: "#0891B2", "Drug Offense": "#DC2626",
  "Domestic Violence": "#9D174D", Juvenile: "#6D28D9",
};

function CaseStatusBadge({ status }) {
  if (status === "complete") return (
    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5">
      <CheckCircle2 className="w-3 h-3" /> Analyzed
    </span>
  );
  if (status === "analyzing") return (
    <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5">
      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" /> In Progress
    </span>
  );
  if (status === "failed") return (
    <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-200 px-2 py-0.5">
      <AlertCircle className="w-3 h-3" /> Failed
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function CaseHistory() {
  const [cases, setCases] = useState([]);
  const [analyses, setAnalyses] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await axios.get(`${API}/cases`);
        setCases(res.data);

        // Fetch analysis status for each case
        const statusMap = {};
        await Promise.all(
          res.data.map(async (c) => {
            try {
              const a = await axios.get(`${API}/cases/${c.id}/analysis`);
              statusMap[c.id] = a.data.status;
            } catch {
              statusMap[c.id] = "not_started";
            }
          })
        );
        setAnalyses(statusMap);
      } catch (err) {
        console.error("Failed to load cases", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const filtered = filter === "all" ? cases : cases.filter((c) => {
    const status = analyses[c.id] || "not_started";
    return filter === "analyzed" ? status === "complete" : filter === "pending" ? (status === "pending" || status === "not_started") : filter === "in-progress" ? status === "analyzing" : true;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA]" data-testid="case-history-page">
      {/* Header */}
      <div className="bg-[#0B192C] py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-[#C5A059] mb-2 font-medium">Case Management</p>
            <h1 className="font-playfair text-3xl sm:text-4xl text-white">Case History</h1>
            <p className="text-slate-400 text-sm mt-1">{cases.length} case{cases.length !== 1 ? "s" : ""} submitted</p>
          </div>
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#C5A059] text-[#0B192C] font-semibold text-sm hover:bg-[#D4AF70] transition-colors self-start sm:self-auto"
            data-testid="new-case-button"
          >
            <Scale className="w-4 h-4" />
            New Case Analysis
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex gap-2">
          {[
            { id: "all", label: "All Cases" },
            { id: "analyzed", label: "Analyzed" },
            { id: "in-progress", label: "In Progress" },
            { id: "pending", label: "Pending" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-medium border transition-colors ${filter === f.id ? "bg-[#0B192C] text-white border-[#0B192C]" : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"}`}
              data-testid={`filter-${f.id}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map((i) => <div key={i} className="h-24 bg-white border border-slate-200 shimmer" />)}
          </div>
        )}

        {!loading && cases.length === 0 && (
          <div className="text-center py-20" data-testid="no-cases-message">
            <Scale className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="font-playfair text-xl text-slate-900 mb-2">No Cases Yet</h3>
            <p className="text-slate-500 text-sm mb-6">Submit your first case for AI legal analysis.</p>
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#0B192C] text-white font-medium text-sm hover:bg-[#1E293B] transition-colors"
              data-testid="submit-first-case-button"
            >
              Submit a Case <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {!loading && filtered.length === 0 && cases.length > 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No cases match the current filter.</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((c) => {
              const status = analyses[c.id] || "not_started";
              const typeColor = TYPE_COLORS[c.case_type] || "#64748B";
              return (
                <div
                  key={c.id}
                  className="bg-white border border-slate-200 hover:border-slate-400 transition-all"
                  data-testid={`case-row-${c.id}`}
                >
                  <div className="flex items-center">
                    {/* Left color accent */}
                    <div className="w-1 self-stretch shrink-0" style={{ backgroundColor: typeColor }} />

                    <div className="flex-1 px-5 py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-playfair text-base text-slate-900">{c.title}</h3>
                            <CaseStatusBadge status={status} />
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: typeColor }} />
                              {c.case_type}
                            </span>
                            <span>·</span>
                            <span>{c.jurisdiction}</span>
                            {c.judge_name && <><span>·</span><span>Hon. {c.judge_name.replace("Hon.", "").trim()}</span></>}
                            <span>·</span>
                            <span>{formatDate(c.created_at)}</span>
                          </div>
                          {c.charges?.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {c.charges.slice(0, 3).map((ch) => (
                                <span key={ch} className="text-xs px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600">{ch}</span>
                              ))}
                              {c.charges.length > 3 && <span className="text-xs text-slate-400">+{c.charges.length - 3} more</span>}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {status === "complete" && (
                            <Link
                              to={`/analysis/${c.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#0B192C] text-white text-xs font-medium hover:bg-[#1E293B] transition-colors"
                              data-testid={`view-analysis-${c.id}`}
                            >
                              View Analysis <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                          {(status === "not_started" || status === "pending") && (
                            <Link
                              to={`/analysis/${c.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 text-xs font-medium hover:border-slate-500 transition-colors"
                              data-testid={`start-analysis-${c.id}`}
                            >
                              Start Analysis <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                          {status === "analyzing" && (
                            <Link
                              to={`/analysis/${c.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 border border-blue-300 text-blue-700 bg-blue-50 text-xs font-medium"
                              data-testid={`watch-analysis-${c.id}`}
                            >
                              <RefreshCw className="w-3 h-3 animate-spin" /> Watch Live
                            </Link>
                          )}
                          {status === "failed" && (
                            <Link
                              to={`/analysis/${c.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 text-red-700 bg-red-50 text-xs font-medium"
                              data-testid={`retry-analysis-${c.id}`}
                            >
                              <RefreshCw className="w-3 h-3" /> Retry
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
