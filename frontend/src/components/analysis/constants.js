export const GRADE_STYLES = {
  A: { color: "#166534", bg: "#DCFCE7", border: "#166534" },
  B: { color: "#3F6212", bg: "#ECFCCB", border: "#3F6212" },
  C: { color: "#92400E", bg: "#FEF3C7", border: "#92400E" },
  D: { color: "#C2410C", bg: "#FFEDD5", border: "#C2410C" },
  F: { color: "#991B1B", bg: "#FEE2E2", border: "#991B1B" },
};

export const COUNCIL_CONFIG = {
  prosecution: { name: "Counsel Maximus", title: "Prosecution Analyst", color: "#991B1B" },
  defense: { name: "Counsel Veridicus", title: "Defense Analyst", color: "#1E40AF" },
  legal_scholar: { name: "Professor Lexis", title: "Legal Scholar", color: "#0B192C" },
  bias_detector: { name: "Analyst Veritas", title: "Judicial Bias Analyst", color: "#7C3AED" },
};

export const MEMBER_ORDER = ["prosecution", "defense", "legal_scholar", "bias_detector"];

export const STAGE_LABELS = ["", "Individual Analyses", "Cross-Review Deliberation", "Chief Justice Synthesis", "Complete"];
