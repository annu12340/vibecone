# PRD — LexAI Legal Intelligence System

## Original Problem Statement
Build a legal system app for common users that:
- Given a case, shows similar cases, existing laws and articles, and patterns on judges
- Uncovers judges' decision patterns and unconscious bias
- Uses multi-model AI deliberation (inspired by karpathy/llm-council)
- Looks professional and well thought out

## Architecture

### Backend (FastAPI + Motor + MongoDB)
- `server.py` — Main FastAPI app with all routes
- `llm_council.py` — LLM Council logic (5 AI personas using Claude Sonnet 4.5)
- `seed_data.py` — Sample data (6 judges, 15 laws) with full bias intelligence profiles

### Frontend (React + Tailwind + Shadcn)
- `App.js` — React Router (5 routes)
- `components/Navbar.jsx` — Sticky nav with glassmorphism
- `components/LandingPage.jsx` — Hero, features, how-it-works, CTA
- `components/CaseSubmission.jsx` — Case submission form with Judge dropdown
- `components/AnalysisDashboard.jsx` — Tabbed analysis view with gradient header
- `components/analysis/` — Extracted components:
  - `CouncilCard.jsx` — Analyst cards with ambient shadows
  - `CrossReviewSection.jsx` — Cross-review deliberation cards
  - `ChiefJusticeCard.jsx` — Gradient verdict card
  - `JudgeIntelligencePanel.jsx` — Judge bias intelligence display
  - `SidebarPanels.jsx` — Accordion sidebar (Case Facts, Similar Cases, Laws)
  - `constants.js` — Shared config/styles
- `components/JudgeProfiles.jsx` — Tabbed judge modal with bias analytics
- `components/CaseHistory.jsx` — Past cases management

### Design System
- **Background**: #FAF9F6 (warm off-white)
- **Primary**: #0B192C (navy) with gradients to #12223A
- **Accent**: #C5A059 (gold)
- **Fonts**: Playfair Display (headings) + IBM Plex Sans (body)
- **Surfaces**: Ambient shadows, soft borders (border-slate-200/60), glassmorphism navbar
- **Archetype**: Jewel & Luxury / Premium Legal Authority

## What's Been Implemented

### Color & Professional Polish (April 2026)
- [x] Warmer global background (#F8F9FA → #FAF9F6) across all pages
- [x] Gradient dashboard header (from-[#0A1428] via-[#0B192C] to-[#11233D]) with warm gold glow orb
- [x] Refined stage stepper with rounded circles, glow on active state, softer connectors
- [x] Polished tab bar with subtle shadows, warmer active background
- [x] Ambient card shadows (shadow-[0_4px_24px_-8px_rgba(11,25,44,0.06)])
- [x] Thicker accent bars (h-1 → h-1.5) on council cards
- [x] Gradient Chief Justice card with warm glow overlay
- [x] Gradient Judge Intelligence panel header
- [x] Refined Navbar glassmorphism (bg-white/80, backdrop-blur-2xl, shadow-sm)
- [x] Gradient CTA button in navbar
- [x] Warmer text tones (slate-300 → slate-200) in dark cards

### Analysis Dashboard Redesign (April 2026)
- [x] Tabbed interface (Council Analysis | Cross-Review | Final Verdict)
- [x] Stage stepper visualization
- [x] Sidebar with accordion panels
- [x] Smart Judge Intelligence positioning (sidebar vs main content)
- [x] Auto-tab selection, tab badges
- [x] Component extraction (~900 lines → 6 focused files)

### Core Features (All Complete)
- [x] Landing page with hero, features, council overview, CTA
- [x] Case submission form with Judge dropdown
- [x] 3-stage LLM Council analysis pipeline
- [x] Cross-review deliberation (Stage 2)
- [x] Judge profile integration into synthesis
- [x] Deep judge bias detection (report cards, timelines, temporal patterns)
- [x] Real-time analysis polling
- [x] Case history management
- [x] 6 Indian judge profiles, 15 Indian laws auto-seeded

## Prioritized Backlog

### P0
- [ ] Handle LLM analysis timeout gracefully (502 risk)

### P1
- [ ] PDF/document upload for case evidence
- [ ] User authentication (save analyses to account)
- [ ] Search/filter case history

### P2
- [ ] Export analysis as PDF
- [ ] Share analysis link
- [ ] Compare two judges side-by-side
- [ ] Legal chatbot powered by council
- [ ] Dark mode
