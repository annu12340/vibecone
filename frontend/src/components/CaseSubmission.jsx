import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AlertCircle, Scale, FileText, CheckCircle, Mic, Search } from "lucide-react";
import VoiceNarrator from "./sarvam/VoiceNarrator";


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CaseSubmission() {
  const navigate = useNavigate();
  const [cnr, setCnr] = useState("");
  const [cnrLoading, setCnrLoading] = useState(false);
  const [cnrError, setCnrError] = useState(null);
  const [voiceNarrative, setVoiceNarrative] = useState("");

  const fetchCaseFromIndianKanoon = async () => {
    if (!cnr.trim()) {
      setCnrError("Please enter a CNR number");
      return;
    }
    
    setCnrError(null);
    setCnrLoading(true);

    try {
      const { data } = await axios.post(`${API}/cases/search-by-cnr`, { cnr: cnr.trim() });
      
      if (!data.success) {
        setCnrError(data.message || "Case not found");
        setCnrLoading(false);
        return;
      }

      navigate(`/case-details/${cnr.trim()}`, {
        state: {
          caseData: data.data,
          source: data.source,
          fallback_attempted: data.fallback_attempted,
          mocked: data.mocked,
          message: data.message,
          voiceNarrative: voiceNarrative
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
    <div className="min-h-screen bg-[#F8F9FA]" data-testid="case-submission-page">
      
      {/* Hero Section - Massive Navy Block */}
      <div 
        className="relative bg-[#0B192C] py-24 px-4 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1589994965851-a8f479c573a9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHw0fHxhYnN0cmFjdCUyMGp1c3RpY2UlMjBzY2FsZXN8ZW58MHx8fHwxNzc2Mzk0OTQzfDA&ixlib=rb-4.1.0&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-[#0B192C]/95"></div>
        
        <div className="relative max-w-5xl mx-auto">
          {/* Label */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px w-12 bg-[#C5A059]"></div>
            <p className="text-xs tracking-[0.2em] uppercase text-[#C5A059] font-sans font-semibold">AI Legal Intelligence</p>
          </div>
          
          {/* Heading */}
          <h1 className="font-serif text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-none">
            Case Lookup & Analysis
          </h1>
          
          <p className="text-lg text-gray-300 max-w-3xl mb-12 font-sans leading-relaxed">
            Enter CNR to fetch comprehensive case details from eCourts and Indian Kanoon. 
            Our 5-member AI Legal Council will analyze prosecution strength, defense opportunities, 
            judicial bias risks, and provide Supreme Court precedents.
          </p>

          {/* CNR Search Input - Dominant Element */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-3 px-4 py-1">
                <FileText className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                <input
                  type="text"
                  value={cnr}
                  onChange={(e) => setCnr(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter CNR (e.g., DLHC010127602024)"
                  data-testid="input-cnr"
                  className="flex-1 text-lg font-sans text-[#0B192C] placeholder-gray-400 focus:outline-none bg-transparent py-3"
                />
              </div>
              
              <button
                onClick={fetchCaseFromIndianKanoon}
                disabled={cnrLoading}
                data-testid="fetch-cnr-button"
                className="px-8 py-4 bg-[#C5A059] text-white font-sans font-semibold hover:bg-[#b08d4b] transition-all rounded-md disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#C5A059]/20 flex items-center gap-2"
              >
                {cnrLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" strokeWidth={1.5} />
                    Fetch Case
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {cnrError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div className="flex-1">
                <p className="text-sm font-sans font-medium text-red-900">{cnrError}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Voice Narrator Section */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <Mic className="w-6 h-6 text-[#C5A059]" strokeWidth={1.5} />
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#0B192C] tracking-tight">Voice Input (Optional)</h2>
              <p className="text-sm font-sans text-gray-600 mt-1">Add voice context in Hindi or regional languages via Sarvam AI</p>
            </div>
          </div>

          <VoiceNarrator onTranscript={(text) => setVoiceNarrative(text)} />
          
          {voiceNarrative && (
            <div className="mt-4 flex items-start justify-between gap-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-sans font-medium text-green-900">Voice narrative captured</p>
                  <p className="text-xs font-sans text-green-700 mt-1">
                    Will be included in case analysis when you fetch the case
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVoiceNarrative("")}
                className="text-sm font-sans font-medium text-red-600 hover:text-red-700 hover:underline"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Instructions Card */}
        {!cnrLoading && !cnrError && (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-[#0B192C]" strokeWidth={1.5} />
              <h3 className="text-xl font-serif font-bold text-[#0B192C] tracking-tight">How It Works</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-[#0B192C] text-white rounded-md flex items-center justify-center font-serif font-bold text-lg">
                  1
                </div>
                <h4 className="font-sans font-semibold text-[#0B192C]">Enter CNR</h4>
                <p className="text-sm font-sans text-gray-600 leading-relaxed">
                  Provide the Case Number Reference from your court documents
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="w-10 h-10 bg-[#0B192C] text-white rounded-md flex items-center justify-center font-serif font-bold text-lg">
                  2
                </div>
                <h4 className="font-sans font-semibold text-[#0B192C]">Review Case Details</h4>
                <p className="text-sm font-sans text-gray-600 leading-relaxed">
                  View complete case information fetched from eCourts/Indian Kanoon
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="w-10 h-10 bg-[#0B192C] text-white rounded-md flex items-center justify-center font-serif font-bold text-lg">
                  3
                </div>
                <h4 className="font-sans font-semibold text-[#0B192C]">Get AI Analysis</h4>
                <p className="text-sm font-sans text-gray-600 leading-relaxed">
                  Convene the AI Legal Council for comprehensive legal intelligence
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
