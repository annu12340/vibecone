# Analysis Data Storage and Retrieval

## Overview
All case analysis information from the LLM Legal Council is automatically saved to MongoDB and retrieved when viewing case history.

## Current Implementation

### ✅ Analysis Storage (Already Working)

**When User Clicks "Convene the AI Legal Council":**

1. **Case Created** → Stored in `cases` collection
   ```javascript
   {
     id: "unique-case-id",
     title: "Case title",
     description: "Case details",
     case_type: "Criminal/Civil",
     jurisdiction: "Court name",
     judge_name: "Justice Name",
     charges: [...],
     ecourts_metadata: {...},  // eCourts data
     status: "pending",
     created_at: "ISO timestamp"
   }
   ```

2. **Analysis Started** → Record created in `analyses` collection
   ```javascript
   {
     case_id: "unique-case-id",
     status: "analyzing",  // pending → analyzing → complete/failed
     stage: 1,  // 1-4 (member analysis → cross-review → chief justice → complete)
     members: {},
     cross_reviews: {},
     chief_justice: {},
     similar_cases: [],
     relevant_laws: [],
     judge_profile_snapshot: {},
     created_at: "ISO timestamp",
     updated_at: "ISO timestamp"
   }
   ```

3. **Stage 1: Member Analysis** (4 members in parallel)
   ```javascript
   members: {
     prosecution: {
       status: "complete",
       analysis: {
         key_strengths: [...],
         weaknesses: [...],
         verdict_forecast: "...",
         recommended_strategy: "...",
         // ... full prosecution analysis
       }
     },
     defense: {
       status: "complete",
       analysis: {
         defense_strengths: [...],
         case_weaknesses: [...],
         // ... full defense analysis
       }
     },
     legal_scholar: {
       status: "complete",
       analysis: {
         precedent_cases: [
           {
             case_name: "...",
             court: "...",
             year: 2020,
             outcome: "...",
             relevance: "..."
           }
         ],
         applicable_laws: [
           {
             statute: "IPC Section 302",
             provision: "...",
             applicability: "..."
           }
         ],
         legal_interpretation: "..."
       }
     },
     bias_detector: {
       status: "complete",
       analysis: {
         cognitive_biases: [...],
         procedural_fairness: "...",
         bias_mitigation: [...]
       }
     }
   }
   ```

4. **Stage 2: Cross-Review**
   ```javascript
   cross_reviews: {
     prosecution: {
       status: "complete",
       analysis: {
         agreements: [...],
         disagreements: [...],
         synthesis: "..."
       }
     },
     // ... similar for other members
   }
   ```

5. **Stage 3: Chief Justice Synthesis**
   ```javascript
   chief_justice: {
     status: "complete",
     synthesis: {
       final_verdict: "GUILTY/NOT GUILTY/etc",
       verdict_confidence: 85,
       key_reasoning: "...",
       sentencing_recommendation: "...",
       minority_opinions: [...],
       procedural_recommendations: [...]
     }
   }
   ```

6. **Judge Profile Snapshot** (if available)
   ```javascript
   judge_profile_snapshot: {
     id: "judge-id",
     name: "Justice Name",
     court: "High Court",
     bias_score: 35,
     bias_risk: "LOW",
     report_card: {
       conviction_rate: 65,
       acquittal_rate: 30
     },
     outlier_score: 42,
     bias_indicators: [...],
     temporal_patterns: {...}
   }
   ```

### ✅ Analysis Retrieval (Already Working)

**Case History Page:**

1. **Fetches All Cases**
   - GET `/api/cases` → Returns all submitted cases

2. **Fetches Analysis Status for Each Case**
   - GET `/api/cases/{case_id}/analysis` → Returns full analysis

3. **Displays Status Badge**
   - ✅ **Complete** (green) - Analysis finished
   - 🔵 **In Progress** (blue) - Currently analyzing
   - ⏱️ **Pending** (gray) - Not started
   - ❌ **Failed** (red) - Error occurred

4. **Click "View Analysis"**
   - Navigates to `/analysis/{case_id}`
   - Fetches complete analysis data from database
   - Displays all 4 stages with full details

### ✅ Analysis Display Page

**Route:** `/analysis/{case_id}`

**Data Retrieved from Database:**
```javascript
// GET /api/cases/{case_id}/analysis
{
  case_id: "...",
  status: "complete",
  stage: 4,
  
  // All member analyses
  members: {
    prosecution: { analysis: {...} },
    defense: { analysis: {...} },
    legal_scholar: { analysis: {...} },
    bias_detector: { analysis: {...} }
  },
  
  // Cross-review discussions
  cross_reviews: {
    prosecution: { analysis: {...} },
    // ...
  },
  
  // Final verdict
  chief_justice: {
    synthesis: {
      final_verdict: "...",
      key_reasoning: "...",
      sentencing_recommendation: "..."
    }
  },
  
  // Similar cases (from legal scholar)
  similar_cases: [
    {
      case_name: "Landmark Case v. State",
      court: "Supreme Court",
      year: 2020,
      outcome: "...",
      relevance: "..."
    }
  ],
  
  // Relevant laws (from legal scholar)
  relevant_laws: [
    {
      statute: "IPC Section 302",
      provision: "...",
      applicability: "..."
    }
  ],
  
  // Judge insights (if available)
  judge_profile_snapshot: {
    name: "Justice Name",
    bias_score: 35,
    bias_risk: "LOW",
    // ...
  }
}
```

## Data Persistence

### Collections Used

1. **`cases`** - All submitted cases
   - Fields: id, title, description, case_type, jurisdiction, charges, ecourts_metadata, etc.

2. **`analyses`** - All analysis results
   - Fields: case_id, status, stage, members, cross_reviews, chief_justice, similar_cases, relevant_laws

3. **`judges`** - Judge profiles (for bias analysis)
   - Fields: id, name, court, bias_score, report_card, etc.

4. **`laws`** - Legal references database
   - Fields: statute, description, penalties, etc.

### Data Flow Diagram

```
User Submits Case → cases collection
       ↓
Clicks "Analyze" → analyses collection (status: pending)
       ↓
Stage 1 Analysis → analyses.members.* updated
       ↓
Stage 2 Cross-Review → analyses.cross_reviews.* updated
       ↓
Stage 3 Chief Justice → analyses.chief_justice updated
       ↓
Status: complete → analyses.status = "complete"
       ↓
User Views History → Fetches from analyses collection
       ↓
User Clicks "View Analysis" → Displays all saved data
```

## Verification

### Check Cases
```bash
mongosh legal_intelligence_db --eval "db.cases.find({}, {id: 1, title: 1, _id: 0}).pretty()"
```

### Check Analyses
```bash
mongosh legal_intelligence_db --eval "db.analyses.find({}, {case_id: 1, status: 1, stage: 1, _id: 0}).pretty()"
```

### Check Complete Analysis
```bash
mongosh legal_intelligence_db --eval "db.analyses.findOne({status: 'complete'}, {_id: 0})" | jq
```

### Via API
```bash
# Get all cases
curl http://localhost:8001/api/cases | jq

# Get specific case analysis
curl http://localhost:8001/api/cases/{case_id}/analysis | jq
```

## Current Status

### ✅ What's Working

1. **Case Storage** - All submitted cases saved to database
2. **Analysis Creation** - Analysis record created when started
3. **Progressive Updates** - Each stage updates database in real-time
4. **Member Analyses** - All 4 member analyses saved
5. **Cross-Reviews** - Cross-review discussions saved
6. **Chief Justice Synthesis** - Final verdict saved
7. **Similar Cases** - Precedent cases saved
8. **Relevant Laws** - Applicable laws saved
9. **Judge Profile** - Judge insights saved (if available)
10. **Status Tracking** - Real-time status updates

### ✅ Data Retrieved in Case History

1. **Case List** - Shows all submitted cases
2. **Analysis Status** - Real-time status for each case
3. **View Button** - Links to full analysis page
4. **Filter Options** - Filter by analysis status
5. **Statistics** - Total cases, analyzed cases, pending cases

### ✅ Full Analysis Display

When user clicks "View Analysis":
1. Fetches complete analysis from database
2. Shows all 4 council members' analyses
3. Shows cross-review discussions
4. Shows chief justice final verdict
5. Shows similar cases sidebar
6. Shows relevant laws sidebar
7. Shows judge profile insights (if available)

## Data Retention

### Current Configuration
- **Cases**: Permanent storage
- **Analyses**: Permanent storage
- **No automatic deletion** - All data retained

### Recommendations for Production

1. **Archive Old Cases**
   - Move cases older than 1 year to archive collection
   - Keep summary for historical reference

2. **Compress Large Analyses**
   - Store full text in compressed format
   - Keep summary for quick access

3. **Index Important Fields**
   - Add indexes on case_id, status, created_at
   - Improves query performance

4. **Backup Strategy**
   - Daily backups of cases and analyses
   - Point-in-time recovery enabled

## Summary

✅ **All analysis information IS saved to the database**
✅ **Case history DOES pull from the database**
✅ **Full analysis data is available for all cases**
✅ **No data is lost - everything is persisted**

The system is already configured to:
1. Save all analysis data progressively during processing
2. Store complete results including all stages
3. Retrieve data from database when viewing history
4. Display comprehensive analysis on detail pages

**No changes needed** - The system is working as designed! 🎉
