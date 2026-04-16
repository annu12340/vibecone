import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AlertCircle, Scale, Award, FileText, Gavel, Calendar, User, Building2, BookOpen } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CaseSubmission() {
  const navigate = useNavigate();
  const [cnr, setCnr] = useState("");
  const [cnrLoading, setCnrLoading] = useState(false);
  const [cnrError, setCnrError] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCaseFromIndianKanoon = async () => {
    if (!cnr.trim()) {
      setCnrError("Please enter a CNR number");
      return;
    }
    
    setCnrError(null);
    setCaseData(null);
    setCnrLoading(true);

    try {
      // Use the new merged endpoint that tries eCourts first, then Indian Kanoon
      const { data } = await axios.post(`${API}/cases/search-by-cnr`, { cnr: cnr.trim() });
      
      if (!data.success) {
        setCnrError(data.message || "Case not found");
        setCnrLoading(false);
        return;
      }

      // Add source indicator to the case data
      const caseDataWithSource = {
        ...data.data,
        source: data.source,
        fallback_attempted: data.fallback_attempted
      };

      setCaseData(caseDataWithSource);
      setCnrLoading(false);
    } catch (err) {
      setCnrError(err.response?.data?.detail?.message || err.response?.data?.detail || "Failed to fetch case information");
      setCnrLoading(false);
    }
  };

  const handleConveneCouncil = async () => {
    if (!caseData) {
      setCnrError("Please fetch case information first");
      return;
    }

    setSubmitting(true);
    setCnrError(null);

    try {
      // Create case with Indian Kanoon data
      const payload = {
        title: caseData.title || `Case: ${cnr}`,
        description: caseData.doc_text || "No description available",
        case_type: "Criminal (IPC)", // Default, can be inferred from doc_text
        jurisdiction: caseData.court || "Unknown",
        judge_name: caseData.author || null,
        charges: caseData.referred_acts?.slice(0, 5) || [],
        defendant_demographics: null,
      };

      const { data } = await axios.post(`${API}/cases`, payload);
      navigate(`/analysis/${data.id}`);
    } catch (err) {
      setCnrError("Failed to submit case for analysis. Please try again.");
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !cnrLoading) {
      fetchCaseFromIndianKanoon();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]" data-testid="case-submission-page">
      {/* Header */}
      <div className="bg-[#0B192C] py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs tracking-[0.2em] uppercase text-[#C5A059] mb-2 font-medium">Case Analysis</p>
          <h1 className="font-playfair text-4xl sm:text-5xl text-white mb-3">eCourts Case Lookup</h1>
          <p className="text-slate-400 text-base max-w-2xl">
            Enter the Case Number Reference (CNR) to fetch complete case details from eCourts (official Indian judiciary database) with automatic fallback to Indian Kanoon.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        
        {/* CNR Search Section */}
        <div className="bg-gradient-to-br from-[#0B192C] to-[#1E293B] border-2 border-[#C5A059] p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-6 h-6 text-[#C5A059]" />
            <h2 className="text-xl font-semibold text-white">Enter Case Number Reference (CNR)</h2>
          </div>
          <p className="text-sm text-slate-300 mb-6">
            The CNR is a unique identifier assigned to each case filed in Indian courts. Enter it below to retrieve the complete case information.
          </p>
          <div className="flex gap-4">
            <input
              type="text"
              value={cnr}
              onChange={(e) => setCnr(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., DLCT020357252018"
              className="flex-1 px-5 py-4 border-2 border-slate-600 bg-white text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/30"
              data-testid="input-cnr"
              disabled={cnrLoading}
            />
            <button
              type="button"
              onClick={fetchCaseFromIndianKanoon}
              disabled={cnrLoading}
              className="px-8 py-4 bg-[#C5A059] text-white text-base font-bold hover:bg-[#B8954F] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3 whitespace-nowrap shadow-lg hover:shadow-xl"
              data-testid="fetch-cnr-button"
            >
              {cnrLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Fetch Case
                </>
              )}
            </button>
          </div>
          
          {/* Error Message */}
          {cnrError && (
            <div className="mt-4 flex items-start gap-3 p-4 bg-red-900/40 border-2 border-red-500/50 text-red-200" data-testid="cnr-error">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Error</p>
                <p className="text-sm mt-1">{cnrError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Case Information Display */}
        {caseData && (
          <div className="space-y-6">
            {/* Success Banner */}
            <div className="flex items-center justify-between gap-3 p-5 bg-green-50 border-2 border-green-500" data-testid="case-loaded">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-bold text-green-900">Case Information Retrieved Successfully</p>
                  <p className="text-sm text-green-700 mt-1">Review the details below and convene the AI Legal Council for analysis.</p>
                </div>
              </div>
              {/* Data Source Badge */}
              {caseData.source && (
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 ${
                    caseData.source === 'ecourts' 
                      ? 'bg-blue-50 border-blue-500 text-blue-700' 
                      : 'bg-amber-50 border-amber-500 text-amber-700'
                  }`}>
                    {caseData.source === 'ecourts' ? '⚖️ eCourts Official' : '📚 Indian Kanoon'}
                  </span>
                  {caseData.fallback_attempted && (
                    <span className="text-xs text-slate-500 italic">(Fallback)</span>
                  )}
                </div>
              )}
            </div>

            {/* Case Title */}
            <div className="bg-white border-2 border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Gavel className="w-5 h-5 text-[#C5A059]" />
                <h3 className="text-xs tracking-widest uppercase text-slate-500 font-bold">Case Title</h3>
              </div>
              <p className="text-lg font-semibold text-slate-900 leading-relaxed">{caseData.title || "Untitled Case"}</p>
            </div>

            {/* Case Metadata Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Court */}
              <div className="bg-white border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-[#C5A059]" />
                  <p className="text-xs tracking-widest uppercase text-slate-500 font-bold">Court</p>
                </div>
                <p className="text-sm font-medium text-slate-900">{caseData.court || "Not specified"}</p>
              </div>

              {/* Case Status (eCourts specific) */}
              {caseData.case_status && (
                <div className="bg-white border border-slate-200 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-4 h-4 text-[#C5A059]" />
                    <p className="text-xs tracking-widest uppercase text-slate-500 font-bold">Status</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{caseData.case_status}</p>
                </div>
              )}

              {/* Case Type (eCourts specific) */}
              {caseData.case_type_full && (
                <div className="bg-white border border-slate-200 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-[#C5A059]" />
                    <p className="text-xs tracking-widest uppercase text-slate-500 font-bold">Case Type</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{caseData.case_type_full}</p>
                </div>
              )}

              {/* Judge/Bench */}
              {(caseData.author || caseData.bench || caseData.judges?.length > 0) && (
                <div className="bg-white border border-slate-200 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-[#C5A059]" />
                    <p className="text-xs tracking-widest uppercase text-slate-500 font-bold">Judge / Bench</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    {caseData.judges?.join(', ') || caseData.author || caseData.bench || "Not specified"}
                  </p>
                </div>
              )}

              {/* Filing Date */}
              {(caseData.filing_date || caseData.date) && (
                <div className="bg-white border border-slate-200 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-[#C5A059]" />
                    <p className="text-xs tracking-widest uppercase text-slate-500 font-bold">Filing Date</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{caseData.filing_date || caseData.date}</p>
                </div>
              )}

              {/* Next Hearing Date (eCourts specific) */}
              {caseData.next_hearing_date && (
                <div className="bg-white border border-slate-200 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <p className="text-xs tracking-widest uppercase text-slate-500 font-bold">Next Hearing</p>
                  </div>
                  <p className="text-sm font-medium text-green-700">{caseData.next_hearing_date}</p>
                </div>
              )}
            </div>

            {/* Parties Information (eCourts specific) */}
            {(caseData.petitioners || caseData.respondents) && (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Petitioners */}
                {caseData.petitioners && caseData.petitioners.length > 0 && (
                  <div className="bg-white border border-slate-200 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-[#C5A059]" />
                      <p className="text-xs tracking-widest uppercase text-slate-500 font-bold">Petitioner(s)</p>
                    </div>
                    <ul className="space-y-1">
                      {caseData.petitioners.map((petitioner, idx) => (
                        <li key={idx} className="text-sm text-slate-700">• {petitioner}</li>
                      ))}
                    </ul>
                    {caseData.petitioner_advocates && caseData.petitioner_advocates.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">Advocate(s):</p>
                        {caseData.petitioner_advocates.map((adv, idx) => (
                          <p key={idx} className="text-xs text-slate-600 italic">{adv}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Respondents */}
                {caseData.respondents && caseData.respondents.length > 0 && (
                  <div className="bg-white border border-slate-200 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-[#C5A059]" />
                      <p className="text-xs tracking-widest uppercase text-slate-500 font-bold">Respondent(s)</p>
                    </div>
                    <ul className="space-y-1">
                      {caseData.respondents.map((respondent, idx) => (
                        <li key={idx} className="text-sm text-slate-700">• {respondent}</li>
                      ))}
                    </ul>
                    {caseData.respondent_advocates && caseData.respondent_advocates.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">Advocate(s):</p>
                        {caseData.respondent_advocates.map((adv, idx) => (
                          <p key={idx} className="text-xs text-slate-600 italic">{adv}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Document Text */}
            {caseData.doc_text && (
              <div className="bg-white border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-[#C5A059]" />
                  <h3 className="text-xs tracking-widest uppercase text-slate-500 font-bold">Case Document</h3>
                </div>
                <div className="prose prose-sm max-w-none">
                  <div 
                    className="text-sm text-slate-700 leading-relaxed max-h-96 overflow-y-auto border border-slate-200 p-4 bg-slate-50"
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {caseData.doc_text.substring(0, 5000)}
                    {caseData.doc_text.length > 5000 && (
                      <span className="text-slate-500 italic">... (truncated for display)</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Referred Acts/Laws */}
            {caseData.referred_acts && caseData.referred_acts.length > 0 && (
              <div className="bg-white border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-[#C5A059]" />
                  <h3 className="text-xs tracking-widest uppercase text-slate-500 font-bold">Referred Acts & Laws</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {caseData.referred_acts.slice(0, 10).map((act, idx) => (
                    <span 
                      key={idx} 
                      className="inline-block px-3 py-1.5 bg-[#0B192C] text-white text-xs font-medium border border-[#C5A059]"
                    >
                      {act}
                    </span>
                  ))}
                  {caseData.referred_acts.length > 10 && (
                    <span className="inline-block px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium">
                      +{caseData.referred_acts.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Citations */}
            {caseData.citations && caseData.citations.length > 0 && (
              <div className="bg-white border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="w-5 h-5 text-[#C5A059]" />
                  <h3 className="text-xs tracking-widest uppercase text-slate-500 font-bold">Citations</h3>
                </div>
                <ul className="space-y-2">
                  {caseData.citations.slice(0, 5).map((citation, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-[#C5A059] font-bold">•</span>
                      <span>{citation}</span>
                    </li>
                  ))}
                  {caseData.citations.length > 5 && (
                    <li className="text-sm text-slate-500 italic">
                      ... and {caseData.citations.length - 5} more citations
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Referred Cases */}
            {caseData.referred_cases && caseData.referred_cases.length > 0 && (
              <div className="bg-white border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Gavel className="w-5 h-5 text-[#C5A059]" />
                  <h3 className="text-xs tracking-widest uppercase text-slate-500 font-bold">Referred Cases</h3>
                </div>
                <ul className="space-y-2">
                  {caseData.referred_cases.slice(0, 5).map((refCase, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-[#C5A059] font-bold">•</span>
                      <span>{refCase}</span>
                    </li>
                  ))}
                  {caseData.referred_cases.length > 5 && (
                    <li className="text-sm text-slate-500 italic">
                      ... and {caseData.referred_cases.length - 5} more cases
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Document ID */}
            <div className="bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs text-slate-500">
                <span className="font-bold">Indian Kanoon Document ID:</span> {caseData.doc_id}
              </p>
            </div>

            {/* Convene Council Button */}
            <div className="bg-gradient-to-r from-[#0B192C] to-[#1E293B] border-2 border-[#C5A059] p-8 text-center">
              <h3 className="text-2xl font-playfair text-white mb-3">Ready for AI Legal Analysis?</h3>
              <p className="text-slate-300 text-sm mb-6 max-w-2xl mx-auto">
                The AI Legal Council will analyze this case from multiple perspectives including prosecution, defense, legal scholarship, and bias detection.
              </p>
              <button
                onClick={handleConveneCouncil}
                disabled={submitting}
                className="px-10 py-5 bg-[#C5A059] text-white text-lg font-bold hover:bg-[#B8954F] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto shadow-2xl hover:shadow-3xl hover:scale-105 transform"
                data-testid="convene-council-button"
              >
                {submitting ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Scale className="w-6 h-6" />
                    Convene the AI Legal Council
                  </>
                )}
              </button>
              <p className="text-slate-400 text-xs mt-4">
                Analysis typically takes 30–60 seconds. You will be redirected automatically.
              </p>
            </div>
          </div>
        )}

        {/* Initial Instruction */}
        {!caseData && !cnrError && !cnrLoading && (
          <div className="text-center py-16">
            <Scale className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Enter a CNR number above to begin</p>
          </div>
        )}
      </div>
    </div>
  );
}
