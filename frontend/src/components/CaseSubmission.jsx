import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AlertCircle, Scale, FileText } from "lucide-react";


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CaseSubmission() {
  const navigate = useNavigate();
  const [cnr, setCnr] = useState("");
  const [cnrLoading, setCnrLoading] = useState(false);
  const [cnrError, setCnrError] = useState(null);

  const fetchCaseFromIndianKanoon = async () => {
    if (!cnr.trim()) {
      setCnrError("Please enter a CNR number");
      return;
    }
    
    setCnrError(null);
    setCnrLoading(true);

    try {
      // Use the new merged endpoint that tries eCourts first, then Indian Kanoon
      const { data } = await axios.post(`${API}/cases/search-by-cnr`, { cnr: cnr.trim() });
      
      if (!data.success) {
        setCnrError(data.message || "Case not found");
        setCnrLoading(false);
        return;
      }

      // Navigate to the Case Details page with the fetched data
      navigate(`/case-details/${cnr.trim()}`, {
        state: {
          caseData: data.data,
          source: data.source,
          fallback_attempted: data.fallback_attempted,
          mocked: data.mocked,
          message: data.message
        }
      });
    } catch (err) {
      setCnrError(err.response?.data?.detail?.message || err.response?.data?.detail || "Failed to fetch case information");
      setCnrLoading(false);
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
          <h1 className="font-playfair text-4xl sm:text-5xl text-white mb-3">Case Lookup</h1>
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
              placeholder="e.g., APNE000064092025"
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

        {/* Initial Instruction */}
        {!cnrError && !cnrLoading && (
          <div className="text-center py-16">
            <Scale className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Enter a CNR number above to begin</p>
          </div>
        )}
      </div>
    </div>
  );
}
