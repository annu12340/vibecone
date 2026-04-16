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
- `App.js` — React Router (6 routes: /, /submit, /analysis/:id, /judges, /map, /history)
- `components/Navbar.jsx` — Sticky nav with glassmorphism
- `components/LandingPage.jsx` — Hero, features, how-it-works, CTA
- `components/CaseSubmission.jsx` — Case submission form with Judge dropdown
- `components/AnalysisDashboard.jsx` — Tabbed analysis view with 4 tabs
- `components/analysis/` — Extracted dashboard components
- `components/CaseMap.jsx` — India case distribution map
- `components/map/` — Map sub-components (StatePanel, stateData)
- `components/JudgeProfiles.jsx` — Tabbed judge modal with bias analytics
- `components/CaseHistory.jsx` — Past cases management

### Design System
- Background: #FAF9F6 (warm off-white)
- Primary: #0B192C (navy) with gradients to #12223A
- Accent: #C5A059 (gold)
- Fonts: Playfair Display (headings) + IBM Plex Sans (body)
- Ambient shadows, soft borders, glassmorphism navbar

## What's Been Implemented

### India Case Map (April 2026)
- [x] New page at /map with SVG India map showing case distribution by state
- [x] Backend endpoint GET /api/cases/by-state aggregates filed cases + precedent cases from analyses
- [x] State markers colored/sized by case density (gold→red gradient)
- [x] Click marker → slide-out side panel with full case details
- [x] Panel shows Filed Cases (with status, judge, View Analysis links) and Precedent Cases (with court, year, outcome)
- [x] Legend, stats strip, empty state markers for all 30 Indian states
- [x] Nav link added to navbar

### Judge Profile Tab in Analysis (April 2026)
- [x] 4th tab "Judge Profile" added between Cross-Review and Final Verdict
- [x] Shows judge grade, name, court, bias risk, experience, education, ruling split
- [x] Key observations and "View Full Judge Profile" CTA button

### Color & Professional Polish (April 2026)
- [x] Warmer background, gradient headers, ambient shadows, glassmorphism navbar
- [x] Consistent across all 6 pages

### Analysis Dashboard Redesign (April 2026)
- [x] Tabbed interface (Council Analysis | Cross-Review | Judge Profile | Final Verdict)
- [x] Stage stepper, accordion sidebar, auto-tab selection

### Core Features (All Complete)
- [x] Landing page, case submission, 3-stage LLM Council analysis
- [x] Cross-review deliberation, judge profile integration
- [x] Deep judge bias detection, real-time polling
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
