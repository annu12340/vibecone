import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { COUNCIL_CONFIG } from "./constants";

function StatusBadge({ status }) {
  if (status === "complete") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200" data-testid="status-complete">
      <CheckCircle2 className="w-3 h-3" /> Complete
    </span>
  );
  if (status === "analyzing") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-blue-700 bg-blue-50 border border-blue-200" data-testid="status-analyzing">
      <div className="flex gap-0.5">
        <div className="w-1 h-1 bg-blue-600 rounded-full dot-1" />
        <div className="w-1 h-1 bg-blue-600 rounded-full dot-2" />
        <div className="w-1 h-1 bg-blue-600 rounded-full dot-3" />
      </div>
      Analyzing
    </span>
  );
  if (status === "failed") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-red-700 bg-red-50 border border-red-200" data-testid="status-failed">
      <AlertCircle className="w-3 h-3" /> Failed
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-slate-500 bg-slate-100 border border-slate-200" data-testid="status-pending">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

function ProsecutionContent({ a }) {
  if (!a) return null;
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700 leading-relaxed">{a.summary}</p>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Win Probability</span>
          <span className="text-sm font-semibold text-slate-900">{a.win_probability || 50}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-sm overflow-hidden">
          <div className="h-full bg-[#991B1B] rounded-sm transition-all duration-700" style={{ width: `${a.win_probability || 50}%` }} />
        </div>
      </div>
      {a.key_arguments?.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Key Arguments</p>
          <ul className="space-y-1.5">
            {a.key_arguments.slice(0, 3).map((arg, i) => (
              <li key={i} className="text-xs text-slate-600 flex gap-2 leading-relaxed">
                <span className="text-[#991B1B] mt-0.5 shrink-0">›</span>{arg}
              </li>
            ))}
          </ul>
        </div>
      )}
      {a.key_legal_principle && (
        <p className="text-xs italic text-slate-500 border-l-2 border-[#991B1B] pl-3 py-1">"{a.key_legal_principle}"</p>
      )}
    </div>
  );
}

function DefenseContent({ a }) {
  if (!a) return null;
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700 leading-relaxed">{a.summary}</p>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Acquittal Probability</span>
          <span className="text-sm font-semibold text-slate-900">{a.acquittal_probability || 35}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-sm overflow-hidden">
          <div className="h-full bg-[#1E40AF] rounded-sm transition-all duration-700" style={{ width: `${a.acquittal_probability || 35}%` }} />
        </div>
      </div>
      {a.constitutional_issues?.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Constitutional Issues</p>
          <ul className="space-y-1.5">
            {a.constitutional_issues.slice(0, 3).map((issue, i) => (
              <li key={i} className="text-xs text-slate-600 flex gap-2 leading-relaxed">
                <span className="text-[#1E40AF] mt-0.5 shrink-0">›</span>{issue}
              </li>
            ))}
          </ul>
        </div>
      )}
      {a.key_legal_principle && (
        <p className="text-xs italic text-slate-500 border-l-2 border-[#1E40AF] pl-3 py-1">"{a.key_legal_principle}"</p>
      )}
    </div>
  );
}

function ScholarContent({ a }) {
  if (!a) return null;
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700 leading-relaxed">{a.summary}</p>
      {a.applicable_laws?.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Applicable Laws</p>
          <div className="space-y-1.5">
            {a.applicable_laws.slice(0, 3).map((law, i) => (
              <div key={i} className="text-xs bg-slate-50 border border-slate-100 px-3 py-2">
                <span className="font-mono text-[#0B192C] font-medium">{law.code}</span>
                <span className="text-slate-500 ml-1.5">— {law.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {a.legal_standard && (
        <p className="text-xs text-slate-500"><span className="font-medium text-slate-700">Standard:</span> {a.legal_standard}</p>
      )}
    </div>
  );
}

function BiasContent({ a }) {
  if (!a) return null;
  const score = a.bias_score || 0;
  const riskColor = score >= 67 ? "#991B1B" : score >= 34 ? "#C5A059" : "#166534";
  const riskLabel = score >= 67 ? "HIGH" : score >= 34 ? "MEDIUM" : "LOW";
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700 leading-relaxed">{a.summary}</p>
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs uppercase tracking-wider text-slate-400">Bias Risk Score</span>
          <span className="text-xs font-bold px-2 py-0.5" style={{ color: riskColor, backgroundColor: riskColor + "15" }}>{riskLabel}</span>
        </div>
        <div className="h-2.5 bg-slate-100 relative overflow-hidden rounded-sm">
          <div className="h-full bias-gauge absolute inset-0" />
          <div className="absolute top-0 bottom-0 w-1 bg-[#0B192C]" style={{ left: `calc(${score}% - 2px)` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>Low</span><span>{score}/100</span><span>High</span>
        </div>
      </div>
      {a.unconscious_bias_indicators?.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Bias Indicators</p>
          <ul className="space-y-1.5">
            {a.unconscious_bias_indicators.slice(0, 3).map((ind, i) => (
              <li key={i} className="text-xs text-slate-600 flex gap-2 leading-relaxed">
                <span style={{ color: riskColor }} className="mt-0.5 shrink-0">›</span>{ind}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const CONTENT_MAP = {
  prosecution: ProsecutionContent,
  defense: DefenseContent,
  legal_scholar: ScholarContent,
  bias_detector: BiasContent,
};

export function CouncilCard({ memberId, memberData }) {
  const config = COUNCIL_CONFIG[memberId];
  const status = memberData?.status || "pending";
  const analysis = memberData?.analysis;
  const isAnalyzing = status === "analyzing";
  const ContentComponent = CONTENT_MAP[memberId];

  return (
    <div
      className={`bg-white border overflow-hidden transition-all duration-500 hover:border-[#C5A059]/50 ${isAnalyzing ? "council-analyzing" : "border-slate-200"}`}
      data-testid={`council-card-${memberId}`}
    >
      <div className="h-1" style={{ backgroundColor: config.color }} />

      <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex items-start justify-between">
        <div>
          <p className="text-xs tracking-[0.15em] uppercase font-semibold text-slate-400">{config.title}</p>
          <h3 className="font-playfair text-lg text-slate-900 mt-0.5">{config.name}</h3>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="p-5 min-h-[180px]">
        {status === "pending" && (
          <div className="flex flex-col items-center justify-center h-36 text-slate-400">
            <Clock className="w-6 h-6 mb-2 opacity-40" />
            <p className="text-xs">Awaiting assignment...</p>
          </div>
        )}
        {status === "analyzing" && (
          <div className="flex flex-col items-center justify-center h-36">
            <div className="flex gap-1.5 mb-3">
              <div className="w-2 h-2 rounded-full bg-slate-400 dot-1" />
              <div className="w-2 h-2 rounded-full bg-slate-400 dot-2" />
              <div className="w-2 h-2 rounded-full bg-slate-400 dot-3" />
            </div>
            <p className="text-xs text-slate-500">Analyzing case...</p>
          </div>
        )}
        {status === "complete" && ContentComponent && (
          <div className="animate-fade-in-up">
            <ContentComponent a={analysis} />
          </div>
        )}
        {status === "failed" && (
          <div className="flex items-center gap-2 text-red-600 text-xs">
            <AlertCircle className="w-4 h-4" />
            <span>Analysis failed. Please retry.</span>
          </div>
        )}
      </div>
    </div>
  );
}
