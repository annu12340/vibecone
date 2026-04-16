import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, AlertCircle, RefreshCw, Users, MessageSquare, Scale, CheckCircle2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CouncilCard } from "./analysis/CouncilCard";
import { CrossReviewSection } from "./analysis/CrossReviewSection";
import { ChiefJusticeCard } from "./analysis/ChiefJusticeCard";
import { JudgeIntelligencePanel } from "./analysis/JudgeIntelligencePanel";
import { SidebarPanels } from "./analysis/SidebarPanels";
import { STAGE_LABELS, MEMBER_ORDER } from "./analysis/constants";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function StageStep({ number, label, isActive, isComplete }) {
  return (
    <div className="flex items-center gap-2" data-testid={`stage-step-${number}`}>
      <div className={`w-7 h-7 flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${
        isComplete ? "bg-emerald-600 border-emerald-600 text-white" :
        isActive ? "bg-[#C5A059] border-[#C5A059] text-[#0B192C]" :
        "bg-transparent border-white/20 text-white/40"
      }`}>
        {isComplete ? <CheckCircle2 className="w-3.5 h-3.5" /> : number}
      </div>
      <span className={`text-xs tracking-wider uppercase transition-colors hidden sm:block ${
        isComplete ? "text-emerald-400" :
        isActive ? "text-[#C5A059]" :
        "text-white/30"
      }`}>{label}</span>
    </div>
  );
}

function StageConnector({ isComplete }) {
  return (
    <div className={`flex-1 h-px max-w-12 transition-colors ${isComplete ? "bg-emerald-500" : "bg-white/10"}`} />
  );
}

export default function AnalysisDashboard() {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [pageStatus, setPageStatus] = useState("loading");
  const [activeTab, setActiveTab] = useState("analysis");
  const pollingRef = useRef(null);

  const stopPolling = () => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
  };

  const startPolling = () => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/cases/${caseId}/analysis`);
        setAnalysis(res.data);
        if (res.data.status === "complete" || res.data.status === "failed") {
          stopPolling();
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 2500);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [caseRes, analysisRes] = await Promise.all([
          axios.get(`${API}/cases/${caseId}`),
          axios.get(`${API}/cases/${caseId}/analysis`),
        ]);
        setCaseData(caseRes.data);
        setAnalysis(analysisRes.data);
        setPageStatus("ready");

        if (analysisRes.data.status === "not_started") {
          await axios.post(`${API}/cases/${caseId}/analyze`);
          const fresh = await axios.get(`${API}/cases/${caseId}/analysis`);
          setAnalysis(fresh.data);
          startPolling();
        } else if (analysisRes.data.status === "analyzing") {
          startPolling();
        }
      } catch (err) {
        console.error("Init error", err);
        setPageStatus("error");
      }
    };
    init();
    return () => stopPolling();
    // eslint-disable-next-line
  }, [caseId]);

  const handleRetry = async () => {
    stopPolling();
    setActiveTab("analysis");
    await axios.post(`${API}/cases/${caseId}/analyze`);
    const fresh = await axios.get(`${API}/cases/${caseId}/analysis`);
    setAnalysis(fresh.data);
    startPolling();
  };

  // Auto-advance tab based on stage progress
  const stage = analysis?.stage || 0;
  const overallStatus = analysis?.status || "pending";

  useEffect(() => {
    if (stage >= 3 && overallStatus === "complete") {
      setActiveTab("verdict");
    } else if (stage >= 2) {
      setActiveTab("crossreview");
    } else {
      setActiveTab("analysis");
    }
  }, [stage, overallStatus]);

  // Count complete members for tab badges
  const members = analysis?.members || {};
  const crossReviews = analysis?.cross_reviews || {};
  const completedAnalysts = useMemo(
    () => MEMBER_ORDER.filter(id => members[id]?.status === "complete").length,
    [members]
  );
  const completedReviews = useMemo(
    () => MEMBER_ORDER.filter(id => crossReviews[id]?.status === "complete").length,
    [crossReviews]
  );

  if (pageStatus === "loading") {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="flex gap-2 justify-center mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0B192C] dot-1" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#0B192C] dot-2" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#0B192C] dot-3" />
          </div>
          <p className="font-playfair text-lg text-slate-900">Convening the Legal Council...</p>
        </div>
      </div>
    );
  }

  if (pageStatus === "error" || !caseData) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-slate-900 font-medium">Case not found or failed to load.</p>
          <Link to="/history" className="text-sm text-blue-600 hover:underline mt-2 block">Back to Case History</Link>
        </div>
      </div>
    );
  }

  const chiefData = analysis?.chief_justice || {};

  return (
    <div className="min-h-screen bg-[#F8F9FA]" data-testid="analysis-dashboard">
      {/* Header */}
      <div className="bg-[#0B192C] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-8">
          <Link to="/history" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-5 transition-colors" data-testid="back-to-history">
            <ArrowLeft className="w-3.5 h-3.5" /> Case History
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-[#C5A059] mb-1.5">{caseData.case_type} · {caseData.jurisdiction}</p>
              <h1 className="font-playfair text-2xl sm:text-3xl lg:text-4xl text-white" data-testid="case-title">{caseData.title}</h1>
              {caseData.judge_name && (
                <p className="text-slate-400 text-sm mt-2">Presiding: {caseData.judge_name}</p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-xs px-3 py-1.5 border font-medium uppercase tracking-wider ${
                overallStatus === "complete" ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" :
                overallStatus === "failed" ? "text-red-400 border-red-400/30 bg-red-400/10" :
                "text-[#C5A059] border-[#C5A059]/30 bg-[#C5A059]/10"
              }`} data-testid="analysis-status">
                {overallStatus === "analyzing" ? "Council in Session" : overallStatus === "complete" ? "Verdict Ready" : overallStatus === "failed" ? "Analysis Failed" : "Pending"}
              </span>
              {overallStatus === "failed" && (
                <button onClick={handleRetry} className="flex items-center gap-1 px-3 py-1.5 border border-white/20 text-white text-xs hover:bg-white/10 transition-colors" data-testid="retry-button">
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              )}
            </div>
          </div>

          {/* Stage progress stepper */}
          {overallStatus !== "not_started" && (
            <div className="flex items-center gap-2 sm:gap-3">
              <StageStep number={1} label="Analysis" isActive={stage === 1} isComplete={stage > 1} />
              <StageConnector isComplete={stage > 1} />
              <StageStep number={2} label="Cross-Review" isActive={stage === 2} isComplete={stage > 2} />
              <StageConnector isComplete={stage > 2} />
              <StageStep number={3} label="Synthesis" isActive={stage === 3} isComplete={stage > 3} />
              <StageConnector isComplete={stage >= 4} />
              <StageStep number={4} label="Complete" isActive={stage >= 4} isComplete={overallStatus === "complete"} />
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-white border border-slate-200 rounded-none h-auto p-0 justify-start" data-testid="analysis-tabs">
                <TabsTrigger
                  value="analysis"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C5A059] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-5 py-3.5 text-sm data-[state=active]:text-[#0B192C] text-slate-500"
                  data-testid="tab-stage-1"
                >
                  <Users className="w-3.5 h-3.5 mr-2" />
                  Council Analysis
                  {completedAnalysts > 0 && (
                    <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5">{completedAnalysts}/4</span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="crossreview"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C5A059] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-5 py-3.5 text-sm data-[state=active]:text-[#0B192C] text-slate-500"
                  disabled={stage < 2}
                  data-testid="tab-stage-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-2" />
                  Cross-Review
                  {completedReviews > 0 && (
                    <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5">{completedReviews}/4</span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="verdict"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C5A059] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-5 py-3.5 text-sm data-[state=active]:text-[#0B192C] text-slate-500"
                  disabled={stage < 3}
                  data-testid="tab-stage-3"
                >
                  <Scale className="w-3.5 h-3.5 mr-2" />
                  Final Verdict
                  {chiefData?.status === "complete" && (
                    <span className="ml-2 text-xs bg-[#C5A059]/15 text-[#C5A059] px-1.5 py-0.5">Ready</span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Individual Analyses */}
              <TabsContent value="analysis" className="mt-6" data-testid="tab-content-analysis">
                <div className="grid sm:grid-cols-2 gap-5">
                  {MEMBER_ORDER.map((id) => (
                    <CouncilCard key={id} memberId={id} memberData={members[id]} />
                  ))}
                </div>
              </TabsContent>

              {/* Tab 2: Cross-Review */}
              <TabsContent value="crossreview" className="mt-6" data-testid="tab-content-crossreview">
                <CrossReviewSection crossReviews={analysis?.cross_reviews} stage={stage} />
              </TabsContent>

              {/* Tab 3: Verdict */}
              <TabsContent value="verdict" className="mt-6 space-y-6" data-testid="tab-content-verdict">
                {/* Judge Intelligence above verdict */}
                {analysis?.judge_profile_snapshot && (
                  <JudgeIntelligencePanel
                    judgeSnapshot={analysis.judge_profile_snapshot}
                    stage={stage}
                  />
                )}
                <ChiefJusticeCard chiefData={chiefData} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Judge Intelligence in sidebar when not on verdict tab */}
            {activeTab !== "verdict" && analysis?.judge_profile_snapshot && (
              <JudgeIntelligencePanel
                judgeSnapshot={analysis.judge_profile_snapshot}
                stage={stage}
              />
            )}

            <SidebarPanels
              similarCases={analysis?.similar_cases}
              relevantLaws={analysis?.relevant_laws}
              caseData={caseData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
