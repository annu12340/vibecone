# PRD — LexAI Legal Intelligence System

## Original Problem Statement
Build a legal system app for common users that:
- Given a case, shows similar cases, existing laws and articles, and patterns on judges
- Integrates eCourts data (via MCP and mocked fallback)
- Frontend shows timelines, acts, and AI analysis
- InLegalBERT semantic search for similar cases and related laws from MongoDB
- Judge Profiles with comprehensive statistics from CSV and detailed bias analysis

## Core Features

### 1. Case Analysis (CNR Lookup)
- Submit case by CNR number
- eCourts data fetching (mocked for DLHC010127602024 with 10s delay)
- LLM Legal Council analysis (OpenAI/Claude via Emergent LLM Key)
- Similar cases & related laws via InLegalBERT semantic search

### 2. Judge Profiles
- 6 detailed judges with full bias intelligence profiles (seed data)
- 128+ judges from judge_summary.csv with case statistics
- Unified listing page with search/sort
- Detail page showing ALL data from both APIs
- Key Statistics hero, Case Outcomes, Weekday Distribution, Demographic Context
- Bias Analysis, Comparable Cases, Timeline, Temporal Patterns, Notable Cases

### 3. Case Map
- Geographical case distribution visualization

### 4. Case History
- User's previously analyzed cases

### 5. Authority Features
- Fine Management, Prisoner Management, Reward Fund Dashboard

## Architecture
- **Frontend**: React + Tailwind CSS + Recharts + react-router-dom
- **Backend**: FastAPI + Motor (MongoDB async)
- **Database**: MongoDB (`legal_intelligence_db`)
- **ML**: InLegalBERT (Hugging Face) for semantic search
- **LLM**: OpenAI/Claude via Emergent LLM Key

## What's Been Implemented

### Feb 2026 - Session 1-4
- Full case analysis pipeline with LLM council
- eCourts integration with mocked fallback
- InLegalBERT semantic DB search (similar_cases, related_laws)
- Judge summary CSV import (128 rows)
- Judge Profiles with CSV stats + detailed profiles

### Feb 2026 - Current Session
- Updated seed data with corrected total_cases (247, 223, 134, 112, 91, 56)
- Rewrote JudgeProfiles.jsx: unified listing, enriched cards with bias/outlier/grades/case types
- Rewrote JudgeDetailPage.jsx: full-page layout with Key Stats hero, all CSV fields, charts, demographic tables
- Removed JudgeModal approach, proper full-page routing
- All 134 judges display uniformly across both APIs

## Prioritized Backlog

### P0
- Expose similar_cases and related_laws from BERT to frontend analysis UI

### P1
- Fix code quality: React hook dependencies (stale closures)
- Fix code quality: Array index as key
- Add breadcrumbs/navigation to Judge Detail Page

### P2
- Refactor server.py (extreme function complexity)
- Component refactoring (CaseSubmission.jsx 719 lines, PrisonerManagement.jsx 492 lines)
- Judge listing pagination at scale
- Server.py decomposition into route modules

## Key Files
- `/app/backend/seed_data.py` - Judge seed data (6 detailed profiles)
- `/app/backend/server.py` - All API endpoints
- `/app/backend/inlegal_bert_service.py` - BERT semantic search
- `/app/frontend/src/components/JudgeProfiles.jsx` - Judge listing page
- `/app/frontend/src/components/JudgeDetailPage.jsx` - Judge detail page
- `/app/frontend/src/App.js` - Routes

## Key API Endpoints
- `GET /api/judges` - 6 detailed judge profiles
- `GET /api/judge-summary?limit=200` - 128+ judges from CSV
- `GET /api/judge-summary/{judge_name}` - Single judge stats
- `POST /api/cases/{case_id}/analyze` - LLM analysis with BERT
