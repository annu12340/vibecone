import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, AlertCircle } from "lucide-react";

// Import the JudgeModal component from JudgeProfiles
import { JudgeModal } from "./JudgeProfiles";

const API = process.env.REACT_APP_BACKEND_URL;

export default function JudgeDetailPage() {
  const { judgeId } = useParams();
  const navigate = useNavigate();
  const [judge, setJudge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch both detailed judges and summary judges
    Promise.all([
      axios.get(`${API}/judges`),
      axios.get(`${API}/judge-summary?limit=200`)
    ])
      .then(([detailedRes, summaryRes]) => {
        const detailedJudges = detailedRes.data;
        const summaryJudges = summaryRes.data.judges;
        
        // Merge detailed with summary stats
        const mergedJudges = detailedJudges.map(judge => {
          const summary = summaryJudges.find(s => 
            s.judge_name.toLowerCase().includes(judge.name.toLowerCase()) ||
            judge.name.toLowerCase().includes(s.judge_name.toLowerCase())
          );
          return summary ? { ...judge, summary_stats: summary } : judge;
        });
        
        // Add summary-only judges
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
        
        const allJudges = [...mergedJudges, ...summaryOnlyJudges];
        
        // Find the judge by ID
        const foundJudge = allJudges.find(j => j.id === judgeId);
        
        if (foundJudge) {
          setJudge(foundJudge);
        } else {
          setError("Judge not found");
        }
      })
      .catch(() => setError("Failed to load judge profile"))
      .finally(() => setLoading(false));
  }, [judgeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0B192C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading judge profile...</p>
        </div>
      </div>
    );
  }

  if (error || !judge) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-playfair text-slate-900 mb-2">Profile Not Found</h2>
          <p className="text-slate-600 mb-6">{error || "The requested judge profile could not be found."}</p>
          <button
            onClick={() => navigate("/judges")}
            className="px-6 py-2.5 bg-[#0B192C] text-white hover:bg-[#C5A059] transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Judge Profiles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header with back button */}
      <div className="bg-[#0B192C] py-6 px-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/judges")}
            className="p-2 text-white hover:text-[#C5A059] transition-colors"
            title="Back to Judge Profiles"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="font-playfair text-2xl sm:text-3xl text-white">{judge.name}</h1>
            <p className="text-slate-400 text-sm mt-1">{judge.court}</p>
          </div>
        </div>
      </div>

      {/* Judge details - reuse modal content but as full page */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <JudgeModal 
          judge={judge} 
          onClose={() => navigate("/judges")}
          isFullPage={true}
        />
      </div>
    </div>
  );
}
