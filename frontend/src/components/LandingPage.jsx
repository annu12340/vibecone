import { Link } from "react-router-dom";
import { Scale, Search, BookOpen, Users, Shield, Brain, ArrowRight, CheckCircle2, Gavel, TrendingUp, AlertTriangle } from "lucide-react";

const FEATURES = [
  { icon: Brain, title: "AI Legal Council", desc: "5 specialized AI attorneys deliberate your case — Prosecution, Defense, Legal Scholar, Bias Detector, and Chief Justice synthesize a final verdict.", color: "#0B192C" },
  { icon: Search, title: "Similar Cases Finder", desc: "Instantly surface precedent cases with matching fact patterns, outcomes, and applicable legal standards from across jurisdictions.", color: "#1E40AF" },
  { icon: BookOpen, title: "Laws & Statutes", desc: "Automatically identifies relevant federal and state statutes, constitutional provisions, and regulatory codes applicable to your case.", color: "#0B192C" },
  { icon: Users, title: "Judge Pattern Analysis", desc: "Deep profiles of judges including historical ruling patterns, sentencing tendencies, and demographic data across case types.", color: "#1E40AF" },
  { icon: AlertTriangle, title: "Bias Detection", desc: "Uncover unconscious bias in judicial decision-making. Statistical analysis of sentencing disparities, conviction rates, and demographic patterns.", color: "#991B1B" },
  { icon: Shield, title: "Rights Protection", desc: "Understand your constitutional rights, potential procedural defenses, and legal protections — explained in plain language.", color: "#166534" },
];

const STEPS = [
  { num: "01", title: "Submit Your Case", desc: "Describe the case facts, charges, jurisdiction, and presiding judge. Upload supporting documents or enter details directly." },
  { num: "02", title: "Council Deliberates", desc: "4 specialized AI analysts examine the case simultaneously from different legal perspectives — prosecution, defense, scholarship, and bias analysis." },
  { num: "03", title: "Verdict & Insights", desc: "The Chief Justice synthesizes all analyses into a comprehensive assessment with probabilities, bias risks, and actionable next steps." },
];

const STATS = [
  { value: "5", label: "AI Legal Analysts" },
  { value: "6+", label: "Judge Profiles" },
  { value: "15+", label: "Laws Catalogued" },
  { value: "3", label: "Deliberation Stages" },
];

export default function LandingPage() {
  return (
    <main className="font-ibmplex" data-testid="landing-page">
      {/* Hero Section */}
      <section
        className="relative min-h-[92vh] flex items-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0B192C 0%, #1E293B 60%, #0F2A3F 100%)",
        }}
      >
        {/* Background image overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(https://static.prod-images.emergentagent.com/jobs/792d018e-2fe0-470c-ad76-99601295bfeb/images/906d4151d98a0e722d7ff156088308d3880e1d8e0770e55d7c337eb33aa7bf29.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C5A059]/20 border border-[#C5A059]/30 mb-6">
              <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full" />
              <span className="text-[#C5A059] text-xs tracking-widest uppercase font-medium">AI-Powered Legal Intelligence</span>
            </div>
            <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl text-white leading-none tracking-tight mb-6">
              Justice Through<br />
              <span className="text-[#C5A059]">Collective AI</span><br />
              Deliberation
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-xl">
              A council of 5 specialized AI legal analysts examines your case from every angle — prosecution, defense, legal scholarship, and judicial bias detection. The Chief Justice synthesizes the verdict.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/submit"
                data-testid="hero-analyze-button"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#C5A059] text-[#0B192C] font-semibold hover:bg-[#D4AF70] transition-colors"
              >
                Analyze Your Case
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/judges"
                data-testid="hero-judges-button"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/30 text-white hover:bg-white/10 transition-colors"
              >
                Explore Judge Profiles
              </Link>
            </div>
          </div>

          {/* Stats panel */}
          <div className="lg:flex lg:justify-end">
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              {STATS.map((stat) => (
                <div key={stat.label} className="bg-white/5 border border-white/10 p-5">
                  <div className="font-playfair text-3xl text-[#C5A059] font-bold mb-1">{stat.value}</div>
                  <div className="text-slate-400 text-xs tracking-wider uppercase">{stat.label}</div>
                </div>
              ))}
              {/* AI Council visual */}
              <div className="col-span-2 bg-white/5 border border-white/10 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Scale className="w-4 h-4 text-[#C5A059]" />
                  <span className="text-white/80 text-xs tracking-wider uppercase">Council in Session</span>
                </div>
                <div className="space-y-1.5">
                  {["Prosecution Analyst", "Defense Analyst", "Legal Scholar", "Bias Detector", "Chief Justice"].map((role, i) => (
                    <div key={role} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${i < 4 ? "bg-emerald-400" : "bg-[#C5A059]"}`} />
                      <span className="text-slate-400 text-xs">{role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#F8F9FA] to-transparent" />
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white border-b border-slate-200" data-testid="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.2em] uppercase font-semibold text-slate-400 mb-3">The Process</p>
            <h2 className="font-playfair text-3xl sm:text-4xl text-slate-900">How LexAI Council Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.num} className="relative">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#0B192C] flex items-center justify-center shrink-0">
                    <span className="font-playfair text-[#C5A059] font-bold text-sm">{step.num}</span>
                  </div>
                  <div>
                    <h3 className="font-playfair text-xl text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#F8F9FA]" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="mb-14">
            <p className="text-xs tracking-[0.2em] uppercase font-semibold text-slate-400 mb-3">Capabilities</p>
            <h2 className="font-playfair text-3xl sm:text-4xl text-slate-900 max-w-xl">
              Comprehensive Legal Intelligence at Your Fingertips
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t border-slate-200">
            {FEATURES.map((f) => (
              <div key={f.title} className="border-r border-b border-slate-200 p-6 bg-white hover:bg-slate-50 transition-colors">
                <div
                  className="w-9 h-9 flex items-center justify-center mb-4"
                  style={{ backgroundColor: f.color }}
                >
                  <f.icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-playfair text-lg text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Council Section */}
      <section className="py-20 bg-white border-t border-slate-200" data-testid="council-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase font-semibold text-slate-400 mb-3">Inspired by LLM Council</p>
              <h2 className="font-playfair text-3xl sm:text-4xl text-slate-900 mb-5">
                Five AI Attorneys.<br />One Unified Verdict.
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Inspired by the concept of multi-model AI deliberation, LexAI convenes a council of specialized legal analysts. Each independently examines your case, then a Chief Justice synthesizes their findings into a comprehensive, actionable assessment.
              </p>
              <div className="space-y-3">
                {[
                  { role: "Prosecution Analyst", color: "#991B1B", desc: "Identifies charges, evidence strength, win probability" },
                  { role: "Defense Analyst", color: "#1E40AF", desc: "Constitutional defenses, mitigating factors, acquittal chances" },
                  { role: "Legal Scholar", color: "#0B192C", desc: "Applicable statutes, precedents, constitutional provisions" },
                  { role: "Bias Detector", color: "#7C3AED", desc: "Judicial patterns, demographic risks, bias indicators" },
                  { role: "Chief Justice", color: "#C5A059", desc: "Synthesizes all analyses into the final verdict" },
                ].map((item) => (
                  <div key={item.role} className="flex items-start gap-3 p-3 border border-slate-100 bg-slate-50">
                    <div className="w-2 h-full mt-1.5" style={{ backgroundColor: item.color }}>
                      <div className="w-2 h-5" style={{ backgroundColor: item.color }} />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-900">{item.role}</span>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img
                src="https://static.prod-images.emergentagent.com/jobs/792d018e-2fe0-470c-ad76-99601295bfeb/images/c3a254de8f526f322ea5847014a6a6b04b2dd7107e1729e586fef919dd0c996a.png"
                alt="AI Council deliberation"
                className="w-full border border-slate-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0B192C]" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Scale className="w-10 h-10 text-[#C5A059] mx-auto mb-6" />
          <h2 className="font-playfair text-3xl sm:text-4xl text-white mb-4">
            Ready to Understand Your Case?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Submit your case and receive a comprehensive legal analysis in minutes. No legal background required.
          </p>
          <Link
            to="/submit"
            data-testid="cta-analyze-button"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#C5A059] text-[#0B192C] font-semibold text-lg hover:bg-[#D4AF70] transition-colors"
          >
            Analyze Your Case Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#0B192C] border border-[#C5A059]/30 flex items-center justify-center">
              <Scale className="w-3 h-3 text-[#C5A059]" />
            </div>
            <span className="font-playfair text-white/80 text-sm">LexAI Legal Intelligence</span>
          </div>
          <p className="text-slate-500 text-xs">
            For informational purposes only. Not a substitute for professional legal advice.
          </p>
        </div>
      </footer>
    </main>
  );
}
