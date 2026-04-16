# eCourts MCP Integration Guide

## Overview

The application uses **eCourts MCP tools** to fetch comprehensive case data. This approach provides rich case information including AI analysis without requiring API subscriptions.

## Architecture

```
Agent (MCP Tools) → Fetch from eCourts → Store in MongoDB Cache
                                              ↓
User → Frontend → Backend → Cache → Display (Fast < 100ms)
                              ↓
                    Indian Kanoon Fallback (if cache miss)
```

## How to Populate eCourts Data

### Method 1: Request from Agent (Recommended)

Simply ask the agent to fetch eCourts data for specific CNRs:

**Example:**
```
"Fetch eCourts data for CNR DLHC010127602024"
```

The agent will:
1. Use MCP tool `mcp___custom__get_case_with_latest_order`
2. Transform data to unified format
3. Store in MongoDB cache via `/api/admin/ecourts/store-case`
4. Data is now available for all users

### Method 2: Bulk Population

For multiple cases:

**Example:**
```
"Fetch eCourts data for these CNRs:
- DLHC010127602024
- DLHC020345672023
- KAHC030456782024"
```

The agent will fetch and cache all cases.

## Available MCP Tools

The agent has access to these eCourts MCP tools:

1. **`mcp___custom__get_case_brief`**
   - Quick case summary
   - Basic information
   - Fast response

2. **`mcp___custom__get_case_with_latest_order`** ⭐ Recommended
   - Complete case details
   - Latest order AI analysis
   - Comprehensive data

3. **`mcp___custom__get_case_details`**
   - Full case information
   - All orders and judgments
   - Hearing history

4. **`mcp___custom__search_cases`**
   - Search multiple cases
   - Filter by various criteria

5. **`mcp___custom__batch_get_case_details`**
   - Fetch 2-8 cases simultaneously
   - Bulk operations

## Data Caching

### Cache Structure
```javascript
{
  "cnr": "DLHC010127602024",
  "data": {
    "title": "...",
    "cnr": "...",
    "case_status": "PENDING",
    "filing_date": "...",
    "judges": [...],
    "petitioners": [...],
    "respondents": [...],
    "acts_and_sections": [...],
    "latest_order_analysis": {...},
    // ... complete case data
  },
  "cached_at": "2024-04-16T17:00:00.000Z",
  "source": "ecourts"
}
```

### Cache Duration
- Default: 24 hours
- Disposed cases: Can be cached indefinitely
- Pending cases: Refresh when needed

### Check Cache
```bash
# Connect to MongoDB
mongo legal_intelligence_db

# View cached cases
db.ecourts_cache.find().pretty()

# Count cached cases
db.ecourts_cache.count()

# Check specific CNR
db.ecourts_cache.findOne({"cnr": "DLHC010127602024"})
```

## User Flow

### First Request (Cache Miss)
```
1. User enters CNR → Frontend → Backend
2. Backend checks cache → NOT FOUND
3. Backend tries eCourts API → DISABLED (MCP mode)
4. Backend falls back to Indian Kanoon → SUCCESS
5. Returns Indian Kanoon data
```

### After Agent Populates Cache
```
1. User enters CNR → Frontend → Backend  
2. Backend checks cache → FOUND (< 24h old)
3. Returns eCourts data (< 100ms) ✅
```

### With Stale Cache
```
1. User enters CNR → Frontend → Backend
2. Backend checks cache → FOUND but > 24h old
3. Backend tries eCourts API → DISABLED
4. Backend falls back to Indian Kanoon → SUCCESS
5. Returns Indian Kanoon data
```

**Solution:** Ask agent to refresh: "Update eCourts data for CNR DLHC010127602024"

## Pre-populate Strategy

### For Production
Pre-populate cache with commonly accessed cases:

1. **High-Profile Cases**
   - Landmark judgments
   - Frequently referenced cases

2. **Recent Cases**
   - Current year filings
   - Active pending cases

3. **User Requests**
   - Cases users are likely to search
   - Specific court/judge combinations

### Example Pre-population Request
```
"Pre-populate eCourts data for:
1. All Delhi High Court cases filed in 2024
2. All Supreme Court cases with status PENDING
3. All cases involving specific acts (e.g., IPC Section 302)"
```

## Advantages of MCP Approach

✅ **No API Costs** - Free eCourts data access
✅ **Rich Data** - Includes AI analysis
✅ **Flexible** - Fetch on-demand as needed
✅ **Fast** - Cache provides < 100ms response
✅ **Reliable** - Indian Kanoon fallback always works
✅ **Comprehensive** - Complete case details + orders + analysis

## Limitations

⚠️ **Not Real-time** - Requires agent to fetch and cache
⚠️ **Cache Management** - Need to refresh stale data
⚠️ **Initial Delay** - First request may use fallback
⚠️ **Manual Process** - Requires agent intervention for new cases

## Solutions to Limitations

### 1. Cache Pre-warming
Pre-fetch popular cases before users request them

### 2. Scheduled Refresh
Agent can refresh pending cases daily/weekly

### 3. Webhook Integration (Future)
Auto-fetch when case is accessed for first time

### 4. Background Processing
Queue new CNRs for batch processing

## Testing

### Test 1: Check If Data Cached
```bash
curl -X POST "http://localhost:8001/api/cases/search-by-cnr" \
  -H "Content-Type: application/json" \
  -d '{"cnr": "DLHC010127602024"}' | jq .source
```

**Expected:**
- `"ecourts"` - Data from cache ✅
- `"indian_kanoon"` - Fallback (cache miss)

### Test 2: Request Agent to Cache
```
Agent request: "Fetch eCourts data for CNR DLHC010127602024"
```

### Test 3: Verify Cache
```bash
curl -X POST "http://localhost:8001/api/cases/search-by-cnr" \
  -H "Content-Type: application/json" \
  -d '{"cnr": "DLHC010127602024"}' | jq .
```

Should return eCourts data now.

## Integration with LLM Legal Council

The cached eCourts data automatically flows to the Legal Council:

```
User → Fetch Case (eCourts) → Display → "Convene Council" 
                                              ↓
                                    Complete eCourts metadata
                                              ↓
                                    LLM Legal Council Analysis
                                    (with timeline, parties, AI analysis)
```

## Monitoring

### Check Cache Size
```javascript
db.ecourts_cache.stats()
```

### Recent Additions
```javascript
db.ecourts_cache.find().sort({cached_at: -1}).limit(10)
```

### Cache Hit Rate
Monitor backend logs for:
- "Using fresh cached eCourts data" - Hit ✅
- "falling back to Indian Kanoon" - Miss ⚠️

## Best Practices

1. **Pre-populate Important Cases**
   - Reduces Indian Kanoon API load
   - Provides richer data to users

2. **Refresh Pending Cases Weekly**
   - Keep hearing dates up to date
   - Track case progress

3. **Monitor Cache Usage**
   - Track hit/miss rates
   - Identify popular CNRs

4. **Clean Old Cache**
   - Remove disposed cases > 6 months
   - Archive historical data

## Example Usage

### Scenario 1: New Case Search
```
User: "Search CNR DLHC010001232024"
       ↓
System: Returns Indian Kanoon data (cache miss)
       ↓
User to Agent: "Can you get eCourts data for this case?"
       ↓
Agent: Fetches and caches eCourts data
       ↓
User: Searches again
       ↓
System: Returns eCourts data (cache hit) ✅
```

### Scenario 2: Bulk Pre-population
```
Admin to Agent: "Populate all 2024 Delhi HC cases"
       ↓
Agent: Fetches 100s of cases using batch tools
       ↓
All Users: Get eCourts data instantly (cached) ✅
```

## Summary

**Current Setup:**
- ✅ eCourts MCP tools available
- ✅ Cache system working
- ✅ Indian Kanoon fallback operational
- ✅ No API subscription needed

**To Get eCourts Data:**
Simply ask the agent: "Fetch eCourts data for CNR [your_cnr]"

**Result:**
Fast, comprehensive case data with AI analysis, available to all users! 🎉
