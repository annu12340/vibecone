import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AlertCircle, Plus, X, Scale, ChevronDown } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CASE_TYPES = [
  "Criminal (IPC)", "Civil / Property", "Constitutional / Writ", "Family / Matrimonial",
  "NDPS / Drug Offence", "Domestic Violence", "Corporate / Financial Fraud", "Labour / Employment",
  "Cyber / IT Act", "POCSO / Child Protection", "Anti-Corruption / CBI", "UAPA / National Security",
  "Consumer / RERA", "Land Acquisition", "Juvenile Justice",
];
const JURISDICTIONS = [
  "Supreme Court of India",
  "Delhi High Court", "Bombay High Court", "Madras High Court",
  "Calcutta High Court", "Allahabad High Court", "Karnataka High Court",
  "Gujarat High Court", "Rajasthan High Court", "Punjab & Haryana High Court",
  "Andhra Pradesh High Court", "Telangana High Court", "Kerala High Court",
  "Madhya Pradesh High Court", "Patna High Court", "Gauhati High Court",
  "District & Sessions Court", "Fast Track Court", "Other",
];

export default function CaseSubmission() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    case_type: "",
    jurisdiction: "",
    judge_name: "",
    charges: [],
    defendant_race: "",
    defendant_gender: "",
    defendant_age: "",
  });
  const [chargeInput, setChargeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const addCharge = () => {
    const trimmed = chargeInput.trim();
    if (trimmed && !form.charges.includes(trimmed)) {
      setForm((f) => ({ ...f, charges: [...f.charges, trimmed] }));
      setChargeInput("");
    }
  };

  const removeCharge = (c) => {
    setForm((f) => ({ ...f, charges: f.charges.filter((x) => x !== c) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.case_type || !form.jurisdiction) {
      setError("Please fill in all required fields.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const demographics = {};
      if (form.defendant_race) demographics.race = form.defendant_race;
      if (form.defendant_gender) demographics.gender = form.defendant_gender;
      if (form.defendant_age) demographics.age = form.defendant_age;

      const payload = {
        title: form.title,
        description: form.description,
        case_type: form.case_type,
        jurisdiction: form.jurisdiction,
        judge_name: form.judge_name || null,
        charges: form.charges,
        defendant_demographics: Object.keys(demographics).length ? demographics : null,
      };

      const { data } = await axios.post(`${API}/cases`, payload);
      navigate(`/analysis/${data.id}`);
    } catch (err) {
      setError("Failed to submit case. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]" data-testid="case-submission-page">
      {/* Header */}
      <div className="bg-[#0B192C] py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.2em] uppercase text-[#C5A059] mb-2 font-medium">New Case</p>
          <h1 className="font-playfair text-3xl sm:text-4xl text-white">Submit Case for Analysis</h1>
          <p className="text-slate-400 text-sm mt-2">The AI Legal Council will analyze your case from all perspectives.</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <form onSubmit={handleSubmit} className="space-y-6" data-testid="case-form">

          {/* Case Title */}
          <div className="bg-white border border-slate-200 p-6">
            <label className="block text-xs tracking-widest uppercase text-slate-500 font-semibold mb-2">
              Case Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., State v. Sharma — IPC § 302 / Murder Charges, Delhi Sessions Court"
              className="w-full px-4 py-3 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0B192C] focus:ring-1 focus:ring-[#0B192C]"
              data-testid="input-case-title"
              required
            />
          </div>

          {/* Type + Jurisdiction */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 p-6">
              <label className="block text-xs tracking-widest uppercase text-slate-500 font-semibold mb-2">
                Case Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="case_type"
                  value={form.case_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 text-sm text-slate-900 appearance-none bg-white focus:outline-none focus:border-[#0B192C] focus:ring-1 focus:ring-[#0B192C]"
                  data-testid="select-case-type"
                  required
                >
                  <option value="">Select case type...</option>
                  {CASE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-6">
              <label className="block text-xs tracking-widest uppercase text-slate-500 font-semibold mb-2">
                Jurisdiction <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="jurisdiction"
                  value={form.jurisdiction}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 text-sm text-slate-900 appearance-none bg-white focus:outline-none focus:border-[#0B192C] focus:ring-1 focus:ring-[#0B192C]"
                  data-testid="select-jurisdiction"
                  required
                >
                  <option value="">Select jurisdiction...</option>
                  {JURISDICTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Judge Name */}
          <div className="bg-white border border-slate-200 p-6">
            <label className="block text-xs tracking-widest uppercase text-slate-500 font-semibold mb-2">
              Presiding Judge <span className="text-slate-400">(optional — enables bias analysis)</span>
            </label>
            <input
              type="text"
              name="judge_name"
              value={form.judge_name}
              onChange={handleChange}
              placeholder="e.g., Justice D.Y. Chandrachud"
              className="w-full px-4 py-3 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0B192C] focus:ring-1 focus:ring-[#0B192C]"
              data-testid="input-judge-name"
            />
          </div>

          {/* Charges */}
          <div className="bg-white border border-slate-200 p-6">
            <label className="block text-xs tracking-widest uppercase text-slate-500 font-semibold mb-2">
              Charges / Claims
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={chargeInput}
                onChange={(e) => setChargeInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCharge(); }}}
                placeholder="Add a charge or claim..."
                className="flex-1 px-4 py-2.5 border border-slate-300 text-sm focus:outline-none focus:border-[#0B192C] focus:ring-1 focus:ring-[#0B192C]"
                data-testid="input-charge"
              />
              <button
                type="button"
                onClick={addCharge}
                className="px-4 py-2.5 bg-[#0B192C] text-white text-sm hover:bg-[#1E293B] transition-colors flex items-center gap-1"
                data-testid="add-charge-button"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.charges.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-sm text-slate-700" data-testid="charge-tag">
                  {c}
                  <button type="button" onClick={() => removeCharge(c)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Defendant Demographics */}
          <div className="bg-white border border-slate-200 p-6">
            <label className="block text-xs tracking-widest uppercase text-slate-500 font-semibold mb-1">
              Defendant Demographics <span className="text-slate-400">(optional — enables bias analysis)</span>
            </label>
            <p className="text-xs text-slate-500 mb-4">This information is used solely to analyze potential judicial bias patterns.</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Caste / Community</label>
                <select name="defendant_race" value={form.defendant_race} onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#0B192C]"
                  data-testid="select-defendant-race">
                  <option value="">Not specified</option>
                  <option>General / Upper Caste</option><option>OBC (Other Backward Class)</option>
                  <option>SC (Scheduled Caste)</option><option>ST (Scheduled Tribe)</option>
                  <option>Muslim</option><option>Christian</option><option>Other Minority</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Gender</label>
                <select name="defendant_gender" value={form.defendant_gender} onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#0B192C]"
                  data-testid="select-defendant-gender">
                  <option value="">Not specified</option>
                  <option>Male</option><option>Female</option><option>Non-binary</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Age Range</label>
                <select name="defendant_age" value={form.defendant_age} onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#0B192C]"
                  data-testid="select-defendant-age">
                  <option value="">Not specified</option>
                  <option>Under 18</option><option>18–25</option><option>26–35</option>
                  <option>36–50</option><option>51–65</option><option>Over 65</option>
                </select>
              </div>
            </div>
          </div>

          {/* Case Description */}
          <div className="bg-white border border-slate-200 p-6">
            <label className="block text-xs tracking-widest uppercase text-slate-500 font-semibold mb-2">
              Case Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={8}
              placeholder="Describe the case facts in detail. Include: timeline of events, key parties involved, what IPC sections or Acts are invoked, evidence available, how the FIR was filed, any bail status, prior court orders, and anything else relevant to the case..."
              className="w-full px-4 py-3 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0B192C] focus:ring-1 focus:ring-[#0B192C] resize-none leading-relaxed"
              data-testid="textarea-description"
              required
            />
            <p className="text-xs text-slate-400 mt-1.5">{form.description.length} characters — more detail = better analysis</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700" data-testid="form-error">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#0B192C] text-white font-semibold text-base hover:bg-[#1E293B] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            data-testid="submit-case-button"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting Case...
              </>
            ) : (
              <>
                <Scale className="w-4 h-4" />
                Convene the AI Legal Council
              </>
            )}
          </button>
          <p className="text-center text-xs text-slate-500">
            Analysis typically takes 30–60 seconds. You will be redirected automatically.
          </p>
        </form>
      </div>
    </div>
  );
}
