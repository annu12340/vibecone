import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  AlertCircle, ArrowLeft, Award, BookOpen, Building2, Calendar, CheckCircle,
  ChevronDown, ChevronRight, Clock, Code2, FileText, Gavel, Scale, User, Users
} from "lucide-react";
import VoiceNarrator from "./sarvam/VoiceNarrator";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/* -------------------------- small UI helpers -------------------------- */
const Section = ({ icon: Icon, title, children, right }) => (
  <div className="bg-white border border-slate-200 rounded-sm shadow-sm">
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#FAF9F6]">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-sm flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#C5A059]" />
          </div>
        )}
        <h3 className="font-playfair text-lg text-[#0B192C]">{title}</h3>
      </div>
      {right}
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

const Field = ({ label, value }) => {
  const display =
    value === null || value === undefined || value === "" ? (
      <span className="text-slate-400 italic">—</span>
    ) : typeof value === "boolean" ? (
      <span className={value ? "text-emerald-700 font-medium" : "text-slate-500"}>{value ? "Yes" : "No"}</span>
    ) : (
      String(value)
    );
  return (
    <div>
      <p className="text-[10px] tracking-[0.15em] uppercase text-slate-500 font-semibold mb-1">{label}</p>
      <p className="text-sm text-slate-900 leading-relaxed break-words">{display}</p>
    </div>
  );
};

const Chip = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    gold: "bg-[#C5A059]/10 text-[#8B6914] border-[#C5A059]/30",
    red: "bg-red-50 text-red-700 border-red-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs border rounded-sm ${variants[variant]}`}>
      {children}
    </span>
  );
};

const ListOrEmpty = ({ items, renderItem, emptyText = "No records" }) => {
  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-400 italic">{emptyText}</p>;
  }
  return <div className="space-y-2">{items.map(renderItem)}</div>;
};

/* -------------------------- main component -------------------------- */
export default function CaseDetails() {
  const { cnr: cnrParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const stateData = location.state?.caseData || null;
  const stateMeta = {
    source: location.state?.source || null,
    fallback_attempted: !!location.state?.fallback_attempted,
    mocked: !!location.state?.mocked,
    message: location.state?.message || null,
  };

  const [caseData, setCaseData] = useState(stateData);
  const [meta, setMeta] = useState(stateMeta);
  const [loading, setLoading] = useState(!stateData);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [voiceNarrative, setVoiceNarrative] = useState("");
  const [rawOpen, setRawOpen] = useState(false);

  // Refetch if page was opened directly (no location.state, e.g. refresh)
  useEffect(() => {
    if (stateData) return;
    if (!cnrParam) {
      setError("No CNR provided in the URL.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.post(`${API}/cases/search-by-cnr`, { cnr: cnrParam });
        if (cancelled) return;
        if (!data.success) {
          setError(data.message || "Case not found.");
          setLoading(false);
          return;
        }
        setCaseData(data.data);
        setMeta({
          source: data.source,
          fallback_attempted: !!data.fallback_attempted,
          mocked: !!data.mocked,
          message: data.message,
        });
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError(e?.response?.data?.detail?.message || e?.response?.data?.detail || e.message || "Failed to fetch case.");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cnrParam]);

  /* -------------------------- derived display groups -------------------------- */
  const caseInfo = useMemo(() => {
    if (!caseData) return null;
    return {
      identity: [
        ["CNR", caseData.cnr],
        ["Title", caseData.title],
        ["Case Type", caseData.case_type_full || caseData.case_type],
        ["Case Status", caseData.case_status],
        ["Registration Number", caseData.registration_number],
        ["Court Code", caseData.court_code],
        ["Judicial Section", caseData.judicial_section],
        ["Stage of Case", caseData.stage_of_case],
      ],
      timeline: [
        ["Filing Date", caseData.filing_date],
        ["Registration Date", caseData.registration_date],
        ["First Hearing", caseData.first_hearing_date],
        ["Last Hearing", caseData.last_hearing_date],
        ["Next Hearing", caseData.next_hearing_date],
        ["Decision Date", caseData.decision_date],
      ],
      flags: [
        ["Has Orders", caseData.has_orders],
        ["Order Count", caseData.order_count],
        ["Source", caseData.source],
      ],
    };
  }, [caseData]);

  /* -------------------------- convene council -------------------------- */
  const handleConveneCouncil = async () => {
    if (!caseData) return;
    setSubmitting(true);
    setError(null);
    try {
      const baseDescription = caseData.doc_text || caseData.case_ai_summary || "No description available";
      const descriptionWithNarrative = voiceNarrative
        ? `${baseDescription}\n\n---\nVoice Narrative from Petitioner (via Sarvam AI):\n${voiceNarrative}`
        : baseDescription;

      const payload = {
        title: caseData.title || `Case: ${cnrParam}`,
        description: descriptionWithNarrative,
        case_type: caseData.case_type_full || caseData.case_type || "Unknown",
        jurisdiction: caseData.court || "Unknown",
        judge_name: caseData.judges?.join(", ") || null,
        charges: caseData.acts_and_sections || [],
        defendant_demographics: null,
        ecourts_metadata: {
          cnr: caseData.cnr || cnrParam,
          source: caseData.source,
          case_status: caseData.case_status,
          case_number: caseData.registration_number,
          filing_date: caseData.filing_date,
          registration_date: caseData.registration_date,
          first_hearing_date: caseData.first_hearing_date,
          next_hearing_date: caseData.next_hearing_date,
          last_hearing_date: caseData.last_hearing_date,
          decision_date: caseData.decision_date,
          petitioners: caseData.petitioners || [],
          respondents: caseData.respondents || [],
          petitioner_advocates: caseData.petitioner_advocates || [],
          respondent_advocates: caseData.respondent_advocates || [],
          court_code: caseData.court_code,
          judicial_section: caseData.judicial_section,
          stage_of_case: caseData.stage_of_case,
          order_count: caseData.order_count,
          has_orders: caseData.has_orders,
          interim_orders: caseData.interim_orders || [],
          case_ai_summary: caseData.case_ai_summary,
          case_ai_analysis: caseData.case_ai_analysis,
          latest_order_analysis: caseData.latest_order_analysis,
          subordinate_court: caseData.subordinate_court,
        },
      };
      const { data } = await axios.post(`${API}/cases`, payload);
      navigate(`/analysis/${data.id}`);
    } catch (e) {
      setError("Failed to submit case for analysis. Please try again.");
      setSubmitting(false);
    }
  };

  /* -------------------------- render states -------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-700">
          <div className="w-6 h-6 border-2 border-[#C5A059]/30 border-t-[#C5A059] rounded-full animate-spin" />
          Fetching case data for <span className="font-mono font-semibold">{cnrParam}</span>…
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]" data-testid="case-details-error">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <button
            type="button"
            onClick={() => navigate("/submit")}
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#0B192C]"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Case Lookup
          </button>
          <div className="bg-red-50 border-2 border-red-300 rounded-sm p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="font-playfair text-xl text-[#0B192C] mb-1">Unable to load case</h2>
                <p className="text-sm text-red-800 mb-4">{error || "Case data not available."}</p>
                <button
                  type="button"
                  onClick={() => navigate("/submit")}
                  className="px-4 py-2 bg-[#C5A059] text-white text-sm font-semibold rounded-sm hover:bg-[#B8954F]"
                >
                  Try another CNR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cnr = caseData.cnr || cnrParam;

  return (
    <div className="min-h-screen bg-[#FAF9F6]" data-testid="case-details-page">
      {/* Header */}
      <div className="bg-[#0B192C] py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <button
            type="button"
            onClick={() => navigate("/submit")}
            className="mb-4 inline-flex items-center gap-2 text-xs text-slate-400 hover:text-[#C5A059] tracking-wider"
            data-testid="case-details-back"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> BACK TO CASE LOOKUP
          </button>
          <p className="text-xs tracking-[0.2em] uppercase text-[#C5A059] mb-2 font-medium">Case Details</p>
          <h1 className="font-playfair text-3xl sm:text-4xl text-white mb-2 leading-tight">
            {caseData.title || "Untitled Case"}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="font-mono text-sm text-slate-300 bg-white/10 border border-white/20 px-3 py-1 rounded-sm">
              CNR: {cnr}
            </span>
            {meta.source && (
              <span
                className="text-[11px] tracking-[0.18em] uppercase font-semibold bg-[#C5A059]/15 text-[#F2D58B] border border-[#C5A059]/40 px-3 py-1 rounded-sm"
                data-testid="case-source-badge"
              >
                Source: {meta.source.replace("_", " ")}
              </span>
            )}
            {meta.mocked && (
              <span className="text-[11px] tracking-[0.18em] uppercase font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/40 px-3 py-1 rounded-sm">
                Mocked Data
              </span>
            )}
            {caseData.case_status && (
              <Chip variant="gold">Status: {caseData.case_status}</Chip>
            )}
          </div>
          {meta.message && <p className="text-xs text-slate-400 mt-3">{meta.message}</p>}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        {/* Success banner */}
        <div className="flex items-start gap-3 p-4 bg-emerald-50 border-2 border-emerald-500/70 rounded-sm">
          <Award className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-emerald-900">Case Information Retrieved Successfully</p>
            <p className="text-sm text-emerald-800 mt-0.5">
              Every field returned by the court-data API is shown below. Review, add optional voice narrative, and convene the AI Legal Council.
            </p>
          </div>
        </div>

        {/* ---------- CASE IDENTITY ---------- */}
        <Section icon={Scale} title="Case Identity">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {caseInfo.identity.map(([label, value]) => (
              <Field key={label} label={label} value={value} />
            ))}
          </div>
        </Section>

        {/* ---------- COURT ---------- */}
        <Section icon={Building2} title="Court">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Court" value={caseData.court} />
            <Field label="Judicial Section" value={caseData.judicial_section} />
          </div>
          <div className="mt-5">
            <p className="text-[10px] tracking-[0.15em] uppercase text-slate-500 font-semibold mb-2">Presiding Judges</p>
            <ListOrEmpty
              items={caseData.judges}
              emptyText="No judges listed"
              renderItem={(j, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-slate-900 bg-[#FAF9F6] border border-slate-200 rounded-sm px-3 py-2">
                  <Gavel className="w-3.5 h-3.5 text-[#C5A059]" />
                  {j}
                </div>
              )}
            />
          </div>
          {caseData.subordinate_court && (
            <div className="mt-5 pt-5 border-t border-slate-200">
              <p className="text-[10px] tracking-[0.15em] uppercase text-slate-500 font-semibold mb-2">Subordinate Court</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Court Name" value={caseData.subordinate_court.courtName} />
                <Field label="Case Number" value={caseData.subordinate_court.caseNumber} />
                <Field label="Filing Date" value={caseData.subordinate_court.filingDate} />
              </div>
            </div>
          )}
        </Section>

        {/* ---------- PARTIES ---------- */}
        <Section icon={Users} title="Parties & Advocates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] tracking-[0.15em] uppercase text-slate-500 font-semibold mb-2">Petitioner(s)</p>
              <ListOrEmpty
                items={caseData.petitioners}
                emptyText="No petitioners listed"
                renderItem={(p, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm bg-blue-50 border border-blue-200 rounded-sm px-3 py-2">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    {p}
                  </div>
                )}
              />
              <p className="text-[10px] tracking-[0.15em] uppercase text-slate-500 font-semibold mb-2 mt-4">Petitioner Advocates</p>
              <ListOrEmpty
                items={caseData.petitioner_advocates}
                emptyText="No advocates listed"
                renderItem={(a, idx) => <Chip key={idx} variant="blue">{a}</Chip>}
              />
            </div>
            <div>
              <p className="text-[10px] tracking-[0.15em] uppercase text-slate-500 font-semibold mb-2">Respondent(s)</p>
              <ListOrEmpty
                items={caseData.respondents}
                emptyText="No respondents listed"
                renderItem={(r, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm bg-red-50 border border-red-200 rounded-sm px-3 py-2">
                    <User className="w-3.5 h-3.5 text-red-600" />
                    {r}
                  </div>
                )}
              />
              <p className="text-[10px] tracking-[0.15em] uppercase text-slate-500 font-semibold mb-2 mt-4">Respondent Advocates</p>
              <ListOrEmpty
                items={caseData.respondent_advocates}
                emptyText="No advocates listed"
                renderItem={(a, idx) => <Chip key={idx} variant="red">{a}</Chip>}
              />
            </div>
          </div>
        </Section>

        {/* ---------- LEGAL PROVISIONS ---------- */}
        <Section icon={BookOpen} title="Acts & Sections">
          <ListOrEmpty
            items={caseData.acts_and_sections}
            emptyText="No acts/sections listed"
            renderItem={(s, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-sm px-3 py-2">
                <BookOpen className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                <span className="text-[#0B192C]">{s}</span>
              </div>
            )}
          />
        </Section>

        {/* ---------- TIMELINE ---------- */}
        <Section icon={Clock} title="Case Timeline">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {caseInfo.timeline.map(([label, value]) => (
              <div key={label} className="bg-[#FAF9F6] border border-slate-200 rounded-sm px-3 py-3">
                <p className="text-[9px] tracking-[0.15em] uppercase text-slate-500 font-semibold mb-1">{label}</p>
                <p className="text-sm text-slate-900 font-mono">{value || "—"}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ---------- INTERIM ORDERS ---------- */}
        <Section
          icon={FileText}
          title="Interim Orders"
          right={
            <Chip variant="gold">
              {caseData.order_count || (caseData.interim_orders?.length ?? 0)} order(s)
            </Chip>
          }
        >
          <ListOrEmpty
            items={caseData.interim_orders}
            emptyText="No interim orders on record"
            renderItem={(o, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#FAF9F6] border border-slate-200 rounded-sm px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-600 sm:w-32 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                  {o.orderDate || "—"}
                </div>
                <div className="text-sm text-slate-900 flex-1">{o.description || "—"}</div>
                {o.orderUrl && (
                  <Chip variant="default">
                    <FileText className="w-3 h-3 mr-1" /> {o.orderUrl}
                  </Chip>
                )}
              </div>
            )}
          />
        </Section>

        {/* ---------- AI SUMMARIES (if present) ---------- */}
        {(caseData.case_ai_summary || caseData.case_ai_analysis || caseData.latest_order_analysis || caseData.doc_text) && (
          <Section icon={FileText} title="AI Summaries & Document Text">
            <div className="space-y-4">
              {caseData.case_ai_summary && (
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-slate-500 font-semibold mb-2">Case AI Summary</p>
                  <p className="text-sm text-slate-800 leading-relaxed bg-[#FAF9F6] border border-slate-200 rounded-sm p-3 whitespace-pre-wrap">{caseData.case_ai_summary}</p>
                </div>
              )}
              {caseData.case_ai_analysis && (
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-slate-500 font-semibold mb-2">Case AI Analysis</p>
                  <p className="text-sm text-slate-800 leading-relaxed bg-[#FAF9F6] border border-slate-200 rounded-sm p-3 whitespace-pre-wrap">{caseData.case_ai_analysis}</p>
                </div>
              )}
              {caseData.latest_order_analysis && (
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-slate-500 font-semibold mb-2">Latest Order Analysis</p>
                  <p className="text-sm text-slate-800 leading-relaxed bg-[#FAF9F6] border border-slate-200 rounded-sm p-3 whitespace-pre-wrap">{caseData.latest_order_analysis}</p>
                </div>
              )}
              {caseData.doc_text && (
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-slate-500 font-semibold mb-2">Document Text (extract)</p>
                  <p className="text-xs text-slate-700 leading-relaxed bg-[#FAF9F6] border border-slate-200 rounded-sm p-3 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">{caseData.doc_text}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ---------- VOICE NARRATOR ---------- */}
        <VoiceNarrator onTranscript={(text) => setVoiceNarrative(text)} />
        {voiceNarrative && (
          <div className="flex items-center justify-between text-xs text-slate-600 bg-white border border-slate-200 rounded-sm px-3 py-2">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Voice narrative ready — will be included when you convene the Council
            </span>
            <button type="button" onClick={() => setVoiceNarrative("")} className="text-red-600 hover:underline">
              Remove
            </button>
          </div>
        )}

        {/* ---------- RAW API RESPONSE (collapsible) ---------- */}
        <div className="bg-white border border-slate-200 rounded-sm shadow-sm">
          <button
            type="button"
            onClick={() => setRawOpen((v) => !v)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
            data-testid="raw-response-toggle"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-sm flex items-center justify-center">
                <Code2 className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <h3 className="font-playfair text-lg text-[#0B192C]">Raw API Response</h3>
                <p className="text-xs text-slate-500">Complete JSON payload returned by /api/cases/search-by-cnr</p>
              </div>
            </div>
            {rawOpen ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
          </button>
          {rawOpen && (
            <div className="border-t border-slate-200 p-4 bg-[#0B192C]" data-testid="raw-response-json">
              <pre className="text-[11px] text-emerald-300 leading-relaxed overflow-x-auto font-mono max-h-[500px] overflow-y-auto">
                {JSON.stringify({ success: true, source: meta.source, fallback_attempted: meta.fallback_attempted, mocked: meta.mocked, data: caseData }, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* ---------- CONVENE COUNCIL CTA ---------- */}
        <div className="bg-gradient-to-br from-[#0B192C] to-[#1E293B] border-2 border-[#C5A059] rounded-sm p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-[#C5A059] font-medium mb-1">Next Step</p>
            <h3 className="font-playfair text-2xl text-white mb-1">Convene the AI Legal Council</h3>
            <p className="text-sm text-slate-300">
              Five specialized legal AI agents will analyze this case adversarially and deliver a synthesized verdict.
            </p>
          </div>
          <button
            type="button"
            onClick={handleConveneCouncil}
            disabled={submitting}
            className="px-6 py-3.5 bg-[#C5A059] hover:bg-[#B8954F] text-white text-sm font-bold rounded-sm shadow-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3 whitespace-nowrap"
            data-testid="convene-council-button"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Scale className="w-4 h-4" />
                Convene the AI Legal Council
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
