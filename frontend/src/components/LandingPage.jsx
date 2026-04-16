import { Link } from "react-router-dom";
import { ArrowRight, Scale, ArrowUpRight } from "lucide-react";

const COUNCIL_ROSTER = [
  {
    num: "01",
    role: "Prosecution Analyst",
    name: "Counsel Maximus",
    desc: "Evaluates evidence under IPC provisions, estimates conviction probability, and identifies the prosecution's strongest arguments in Indian courts.",
    color: "#991B1B",
  },
  {
    num: "02",
    role: "Defense Analyst",
    name: "Counsel Veridicus",
    desc: "Identifies constitutional defences under Articles 14, 19, 21, anticipatory bail prospects, and weaknesses in the state's case.",
    color: "#1E40AF",
  },
  {
    num: "03",
    role: "Legal Scholar",
    name: "Professor Lexis",
    desc: "Maps applicable IPC/CrPC sections, Supreme Court precedents, High Court orders, and constitutional provisions to the specific case.",
    color: "#0B192C",
  },
  {
    num: "04",
    role: "Judicial Bias Analyst",
    name: "Analyst Veritas",
    desc: "Examines caste, religion, economic class, and gender-based patterns in judicial outcomes. Flags systemic bias indicators.",
    color: "#7C3AED",
  },
  {
    num: "05",
    role: "Chief Justice Synthesizer",
    name: "The Council",
    desc: "Weighs all four analyses and delivers a unified verdict — outcome probability, bias risk, and your concrete next steps.",
    color: "#C5A059",
    isChief: true,
  },
];

const INDIA_STATS = [
  { number: "4.7 Cr", label: "Cases pending in Indian courts", sub: "As of 2024" },
  { number: "76%", label: "Prison inmates are undertrials", sub: "Not yet convicted" },
  { number: "21 Yrs", label: "Avg wait in some District Courts", sub: "For final judgment" },
  { number: "1:50K", label: "Judge-to-citizen ratio", sub: "vs. 1:500 in developed nations" },
];

const CAPABILITIES = [
  {
    tag: "Precedent Intelligence",
    title: "Find what happened in cases like yours",
    desc: "The Legal Scholar scans Supreme Court and High Court rulings to surface cases with similar facts, matching charges, and comparable defendants.",
  },
  {
    tag: "Statutory Mapping",
    title: "Every IPC section. Every applicable Act.",
    desc: "From IPC § 302 to POCSO to UAPA — automatically identifies every applicable law, its penalty range, and how courts have interpreted it.",
  },
  {
    tag: "Bias Intelligence",
    title: "Uncover what statistics reveal about your judge",
    desc: "Demographic conviction rates, sentencing disparities, bail denial patterns — quantified and contextualized for your specific matter.",
  },
];

export default function LandingPage() {
  return (
    <main data-testid="landing-page" className="font-ibmplex bg-white">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-[#0B192C] min-h-screen flex flex-col justify-center relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#C5A059 1px,transparent 1px),linear-gradient(90deg,#C5A059 1px,transparent 1px)", backgroundSize: "80px 80px" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24 w-full">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">

            {/* Left — Editorial headline */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-3 mb-10">
                <div className="h-px w-10 bg-[#C5A059]" />
                <span className="text-[#C5A059] text-xs tracking-[0.25em] uppercase font-medium">AI Legal Intelligence for India</span>
              </div>

              <h1 className="font-playfair text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05] tracking-tight mb-8">
                Every Indian<br />
                Deserves<br />
                <span className="relative inline-block">
                  Equal Justice
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-[#C5A059]" />
                </span>
                <span className="text-[#C5A059]">.</span>
              </h1>

              <p className="text-slate-400 text-lg leading-relaxed max-w-lg mb-10">
                A council of five AI legal specialists deliberates your case — from IPC charges to SC precedents to judicial bias — and delivers a verdict you can act on.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link to="/submit" data-testid="hero-analyze-button"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#C5A059] text-[#0B192C] font-bold text-sm hover:bg-[#D4B86A] transition-colors">
                  Analyze Your Case <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/judges" data-testid="hero-judges-button"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/20 text-white text-sm hover:border-white/50 hover:bg-white/5 transition-all">
                  Judge Profiles
                </Link>
              </div>
            </div>

            {/* Right — Mock council panel */}
            <div className="lg:col-span-2 lg:pt-4">
              <div className="border border-white/10 bg-white/[0.03]">
                {/* Panel header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <span className="text-slate-500 text-xs ml-2 tracking-wider uppercase font-mono">Council — Live Session</span>
                </div>
                {/* Mock analysis rows */}
                <div className="p-4 space-y-2.5">
                  {[
                    { label: "Prosecution", value: 72, color: "#991B1B", status: "Complete" },
                    { label: "Defense", value: 61, color: "#1E40AF", status: "Complete" },
                    { label: "Legal Scholar", value: 88, color: "#0B192C", status: "Complete" },
                    { label: "Bias Analysis", value: 45, color: "#7C3AED", risk: "MEDIUM" },
                  ].map((r) => (
                    <div key={r.label} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-mono">{r.label}</span>
                        <span className="text-xs font-mono" style={{ color: r.color }}>
                          {r.risk ? `Risk: ${r.risk}` : `${r.value}% strength`}
                        </span>
                      </div>
                      <div className="h-1 bg-white/5">
                        <div className="h-full transition-all" style={{ width: `${r.value}%`, backgroundColor: r.color + "99" }} />
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#C5A059] font-mono uppercase tracking-wider">Chief Justice</span>
                      <span className="text-xs text-slate-500 font-mono">Synthesizing verdict...</span>
                    </div>
                    <div className="mt-2 flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] dot-1" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] dot-2" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] dot-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom border */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* ── INDIA STATS STRIP ──────────────────────────────────── */}
      <section className="bg-[#0F1F35] border-b border-white/5" data-testid="stats-strip">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
          {INDIA_STATS.map((s) => (
            <div key={s.label} className="px-6 py-8">
              <div className="font-playfair text-3xl sm:text-4xl text-[#C5A059] font-bold mb-1">{s.number}</div>
              <p className="text-white/80 text-sm leading-snug">{s.label}</p>
              <p className="text-slate-500 text-xs mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE COUNCIL ROSTER ──────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100" data-testid="council-section">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-20 pb-0">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-slate-400 mb-3">The AI Legal Council</p>
              <h2 className="font-playfair text-4xl sm:text-5xl text-slate-900 leading-tight">
                Five Specialists.<br />One Verdict.
              </h2>
            </div>
            <p className="hidden lg:block text-sm text-slate-500 max-w-xs text-right leading-relaxed">
              Each analyst independently examines your case. The Chief Justice synthesizes.
            </p>
          </div>
        </div>

        {/* Roster rows */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          {COUNCIL_ROSTER.map((m) => (
            <div key={m.num}
              className="group flex items-stretch border-t border-slate-100 hover:bg-slate-950 transition-colors duration-300 cursor-default"
            >
              {/* Number */}
              <div className="w-16 sm:w-20 flex items-center justify-center shrink-0 border-r border-slate-100 group-hover:border-white/10 py-7">
                <span className="font-playfair text-2xl sm:text-3xl font-bold text-slate-200 group-hover:text-[#C5A059] transition-colors">{m.num}</span>
              </div>

              {/* Content */}
              <div className="flex-1 grid sm:grid-cols-3 sm:divide-x divide-slate-100 group-hover:divide-white/10">
                <div className="px-5 py-7 sm:px-7">
                  <p className="text-xs uppercase tracking-widest text-slate-400 group-hover:text-[#C5A059]/70 mb-1.5 transition-colors">{m.role}</p>
                  <h3 className={`font-playfair text-xl sm:text-2xl transition-colors ${m.isChief ? "text-[#C5A059] group-hover:text-[#D4B86A]" : "text-slate-900 group-hover:text-white"}`}>
                    {m.name}
                  </h3>
                </div>
                <div className="px-5 py-7 sm:px-7 sm:col-span-2 flex items-center">
                  <p className="text-sm text-slate-500 group-hover:text-slate-400 leading-relaxed transition-colors">{m.desc}</p>
                </div>
              </div>

              {/* Role color bar */}
              <div className="w-1.5 shrink-0 transition-all duration-300 group-hover:w-3" style={{ backgroundColor: m.color }} />
            </div>
          ))}
          <div className="border-t border-slate-100" />
        </div>
      </section>

      {/* ── CAPABILITIES (Asymmetric) ───────────────────────────── */}
      <section className="py-24 bg-[#F8F7F3]" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left label */}
            <div className="lg:col-span-3 lg:pt-2">
              <p className="text-xs tracking-[0.25em] uppercase text-slate-400 mb-4">What LexAI Does</p>
              <h2 className="font-playfair text-3xl sm:text-4xl text-slate-900 leading-tight">
                Built for the Indian legal system.
              </h2>
              <div className="mt-6 h-px w-16 bg-[#C5A059]" />
            </div>

            {/* Right: 3 capability blocks */}
            <div className="lg:col-span-9 grid sm:grid-cols-3 gap-0 border-l border-t border-slate-200">
              {CAPABILITIES.map((c, i) => (
                <div key={c.tag}
                  className="border-r border-b border-slate-200 p-7 bg-white hover:bg-slate-900 group transition-colors duration-300"
                >
                  <p className="text-xs tracking-widest uppercase text-[#C5A059] mb-4">{c.tag}</p>
                  <h3 className="font-playfair text-xl text-slate-900 group-hover:text-white mb-3 transition-colors leading-snug">{c.title}</h3>
                  <p className="text-sm text-slate-500 group-hover:text-slate-400 leading-relaxed transition-colors">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="py-24 bg-white border-t border-slate-100" data-testid="how-it-works">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-4">
              <p className="text-xs tracking-[0.25em] uppercase text-slate-400 mb-4">The Process</p>
              <h2 className="font-playfair text-4xl text-slate-900 leading-tight">
                From filing to verdict in under 60 seconds.
              </h2>
              <div className="mt-8">
                <Link to="/submit" data-testid="how-it-works-cta"
                  className="inline-flex items-center gap-2 text-sm text-[#0B192C] font-semibold border-b border-[#0B192C] pb-0.5 hover:text-[#C5A059] hover:border-[#C5A059] transition-colors">
                  Start your case <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-0">
              {[
                {
                  n: "1",
                  title: "Describe your case",
                  body: "Fill in the case type, jurisdiction, presiding judge, charges, and defendant background. The more context you provide, the more precise the analysis.",
                },
                {
                  n: "2",
                  title: "Council convenes",
                  body: "All four analysts run simultaneously — Prosecution, Defense, Legal Scholar, and Bias Analyst. Each returns a structured assessment in parallel.",
                },
                {
                  n: "3",
                  title: "Chief Justice delivers the verdict",
                  body: "The Chief Justice reviews all four analyses, weighs the evidence, and produces your final assessment — complete with outcome probabilities and action steps.",
                },
              ].map((step, i) => (
                <div key={step.n} className="grid grid-cols-12 border-b border-slate-100 py-8 group">
                  <div className="col-span-2 sm:col-span-1">
                    <span className="font-playfair text-5xl text-slate-100 group-hover:text-[#C5A059] transition-colors font-bold leading-none">{step.n}</span>
                  </div>
                  <div className="col-span-10 sm:col-span-11 pl-4 sm:pl-8">
                    <h3 className="font-playfair text-2xl text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── JUDGE INTELLIGENCE TEASER ────────────────────────────── */}
      <section className="bg-[#0B192C] py-20" data-testid="judge-teaser">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-[#C5A059] mb-4">Judge Intelligence</p>
              <h2 className="font-playfair text-4xl sm:text-5xl text-white leading-tight mb-6">
                Who's on the bench matters more than you think.
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                LexAI profiles six Supreme Court and High Court judges with statistical data on conviction rates, sentencing disparities across caste/religion/gender, bail patterns, and reversal rates — giving you insight that was previously only available to senior advocates.
              </p>
              <Link to="/judges" data-testid="judge-teaser-link"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white text-sm hover:bg-white/10 hover:border-white/40 transition-all">
                Explore Judge Profiles <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Bias card preview */}
            <div className="space-y-3">
              {[
                { name: "Justice D.Y. Chandrachud", score: 15, risk: "LOW", color: "#166534" },
                { name: "Justice Arun Kumar Mishra", score: 81, risk: "HIGH", color: "#991B1B" },
                { name: "Justice Sanjiv Khanna", score: 32, risk: "LOW", color: "#166534" },
                { name: "Justice Hemant Gupta", score: 74, risk: "HIGH", color: "#991B1B" },
              ].map((j) => (
                <div key={j.name} className="bg-white/[0.04] border border-white/8 px-5 py-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{j.name}</p>
                    <div className="mt-2 h-1 bg-white/10">
                      <div className="h-full" style={{ width: `${j.score}%`, backgroundColor: j.color }} />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-xs font-bold uppercase" style={{ color: j.color }}>{j.risk}</span>
                    <p className="text-slate-500 text-xs">{j.score}/100</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-white border-t border-slate-100" data-testid="cta-section">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <h2 className="font-playfair text-4xl sm:text-5xl text-slate-900 leading-tight">
                Your case. Your rights.<br />
                <span className="text-[#C5A059]">Understood.</span>
              </h2>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <Link to="/submit" data-testid="cta-analyze-button"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#0B192C] text-white font-semibold text-base hover:bg-[#1E293B] transition-colors">
                Analyze Your Case <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-slate-400 text-xs mt-3">Free · No login required · Results in ~60s</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="bg-[#0B192C] border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white/5 border border-[#C5A059]/30 flex items-center justify-center">
              <Scale className="w-3.5 h-3.5 text-[#C5A059]" />
            </div>
            <span className="font-playfair text-white/80 text-sm">LexAI — Legal Intelligence for India</span>
          </div>
          <p className="text-slate-600 text-xs">
            Informational only. Not a substitute for professional legal advice. Always consult a qualified advocate.
          </p>
        </div>
      </footer>

    </main>
  );
}
