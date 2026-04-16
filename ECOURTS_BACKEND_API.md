# eCourts API Backend Integration

## Overview
The application now uses direct backend endpoints to fetch case data from eCourts API instead of relying on MCP tools. This makes the integration more scalable and production-ready.

## Architecture

### Previous Architecture (MCP-based)
```
User → Frontend → Backend (cache check) → MCP Tool (agent-level) → eCourts
                                ↓
                         Indian Kanoon (fallback)
```

### New Architecture (Backend API)
```
User → Frontend → Backend API Endpoint → eCourts API Client → eCourts Service
                           ↓                                         ↓
                    Cache Check                              Live API Call
                           ↓
                  Indian Kanoon (fallback)
```

## Implementation

### 1. eCourts API Client (`ecourts_api_client.py`)

**Purpose:** Handles direct HTTP communication with eCourts India API

**Key Methods:**
- `get_case_details(cnr)` - Fetch basic case details
- `get_case_with_latest_order(cnr)` - Fetch case with order analysis
- `search_cases(**filters)` - Search cases with filters

**Configuration:**
```python
# Environment Variables
ECOURTS_API_URL=https://api.ecourtsindia.com
ECOURTS_API_KEY=your_api_key_here
```

**Features:**
- Automatic timeout handling (30 seconds)
- Error logging and graceful degradation
- Bearer token authentication support
- Connection pooling via requests library

### 2. Backend Endpoints

#### A. Direct Fetch Endpoint
**Endpoint:** `POST /api/ecourts/fetch-case/{cnr}`

**Purpose:** Fetch case directly from eCourts API (bypasses cache)

**Use Case:** When you need the most up-to-date information

**Response:**
```json
{
  "success": true,
  "source": "ecourts_live",
  "message": "Case fetched from eCourts API",
  "data": { /* transformed case data */ },
  "cached": false
}
```

**Behavior:**
1. Makes live API call to eCourts
2. Transforms data to unified format
3. Caches result for future use
4. Returns fresh data

#### B. Merged Search Endpoint (Updated)
**Endpoint:** `POST /api/cases/search-by-cnr`

**Purpose:** Smart case search with 3-tier fallback strategy

**Search Strategy:**
1. **Tier 1 - Cache** (Fastest, < 100ms)
   - Check MongoDB cache
   - If found and fresh (< 24h), return immediately

2. **Tier 2 - Live eCourts API** (Medium, 1-3s)
   - If cache miss or stale
   - Make live API call to eCourts
   - Cache result and return

3. **Tier 3 - Indian Kanoon** (Fallback, 2-5s)
   - If eCourts unavailable or case not found
   - Fall back to Indian Kanoon API
   - Return with fallback indicator

**Response:**
```json
{
  "success": true,
  "source": "ecourts_live|ecourts|indian_kanoon",
  "message": "Case found successfully",
  "data": { /* case data */ },
  "fallback_attempted": false,
  "cached": false
}
```

## Configuration

### Environment Variables

Add to `/app/backend/.env`:
```bash
# eCourts API Configuration
ECOURTS_API_URL=https://api.ecourtsindia.com
ECOURTS_API_KEY=your_api_key_here
```

### API URL Options

**Option 1: Official eCourts API** (if available)
```bash
ECOURTS_API_URL=https://services.ecourts.gov.in/api
```

**Option 2: Third-party eCourts Data Provider**
```bash
ECOURTS_API_URL=https://api.ecourtsindia.com
```

**Option 3: Your Own eCourts Scraper Service**
```bash
ECOURTS_API_URL=http://your-ecourts-service.com/api
```

## API Key Setup

### If you have an eCourts API key:
1. Add key to `.env`:
   ```bash
   ECOURTS_API_KEY=your_actual_key_here
   ```

2. Restart backend:
   ```bash
   sudo supervisorctl restart backend
   ```

### If you don't have an API key:
- The system will still work but may have limited access
- Consider using Indian Kanoon as primary source
- Or set up your own eCourts data collection service

## Data Flow

### Example: User Searches CNR "DLHC010127602024"

```
1. Frontend sends POST /api/cases/search-by-cnr
   ↓
2. Backend checks MongoDB cache
   ↓ (cache miss or stale)
3. Backend calls ecourts_client.get_case_with_latest_order()
   ↓
4. ECourtsAPIClient makes GET https://api.ecourtsindia.com/api/case/DLHC010127602024/with-latest-order
   ↓
5. eCourts API returns raw data
   ↓
6. Backend transforms using transform_ecourts_to_unified_format()
   ↓
7. Backend caches in MongoDB
   ↓
8. Backend returns to frontend with source="ecourts_live"
```

## Error Handling

### eCourts API Errors

**404 - Case Not Found**
- Returns None, triggers Indian Kanoon fallback

**500 - Server Error**
- Logs error, triggers Indian Kanoon fallback

**Timeout**
- After 30 seconds, triggers Indian Kanoon fallback

**Connection Error**
- Network issues trigger Indian Kanoon fallback

### Graceful Degradation

The system ensures service continuity:
```
eCourts API Error → Indian Kanoon → Success (with fallback indicator)
                         ↓
                    Both Failed → 404 with error details
```

## Testing

### Test with cURL

**Test Direct Fetch:**
```bash
curl -X POST "http://localhost:8001/api/ecourts/fetch-case/DLHC010127602024" \
  -H "Content-Type: application/json"
```

**Test Merged Search:**
```bash
curl -X POST "http://localhost:8001/api/cases/search-by-cnr" \
  -H "Content-Type: application/json" \
  -d '{"cnr": "DLHC010127602024"}'
```

### Expected Response Times

| Source | Response Time | Use Case |
|--------|--------------|----------|
| Cache (Tier 1) | < 100ms | Repeated queries |
| Live eCourts (Tier 2) | 1-3s | First query or stale cache |
| Indian Kanoon (Tier 3) | 2-5s | eCourts unavailable |

## Monitoring

### Check Backend Logs

```bash
# Real-time monitoring
tail -f /var/log/supervisor/backend.err.log | grep -i ecourts

# Check for errors
tail -100 /var/log/supervisor/backend.err.log | grep ERROR
```

### Log Messages

**Success:**
```
INFO - Fetching case details for CNR: DLHC010127602024
INFO - Successfully fetched case data for CNR: DLHC010127602024
INFO - Cached fresh eCourts data for CNR: DLHC010127602024
```

**Fallback:**
```
WARNING - Live eCourts fetch failed for CNR DLHC010127602024: Connection timeout
INFO - eCourts data not available, falling back to Indian Kanoon
```

## Production Considerations

### 1. API Rate Limiting
- Implement rate limiting in client
- Cache aggressively to reduce API calls
- Consider using queue for batch requests

### 2. API Key Management
- Store keys securely (use secrets manager)
- Rotate keys periodically
- Monitor usage and costs

### 3. Performance Optimization
- Set appropriate cache TTL (currently 24h)
- Use Redis for faster cache (instead of MongoDB)
- Implement request queuing for high traffic

### 4. Monitoring & Alerts
- Track API success/failure rates
- Monitor response times
- Set up alerts for service degradation

## Troubleshooting

### Issue: "eCourts API not responding"
**Solution:**
1. Check ECOURTS_API_URL is correct
2. Verify network connectivity
3. Check API key validity
4. Review backend logs for details

### Issue: "All cases returning Indian Kanoon fallback"
**Solution:**
1. Verify eCourts API credentials
2. Check API endpoint URLs
3. Test API directly with cURL
4. Review rate limits

### Issue: "Slow response times"
**Solution:**
1. Check network latency to eCourts API
2. Increase cache TTL to reduce API calls
3. Use Redis for faster caching
4. Implement connection pooling

## Next Steps

1. **Get eCourts API Access**
   - Contact eCourts India for API credentials
   - Or use a certified data provider

2. **Configure Production URL**
   - Update ECOURTS_API_URL in production .env
   - Add production API key

3. **Optimize Caching**
   - Consider Redis for cache
   - Tune cache TTL based on usage patterns

4. **Add Monitoring**
   - Set up APM (Application Performance Monitoring)
   - Track API usage and costs
   - Monitor error rates

## Benefits of Backend Integration

✅ **No Agent Dependency** - Works without MCP tools
✅ **Scalable** - Can handle multiple concurrent requests
✅ **Production-Ready** - Proper error handling and logging
✅ **Cacheable** - Reduces API calls and improves speed
✅ **Testable** - Can be tested independently
✅ **Maintainable** - Clean separation of concerns
✅ **Configurable** - Easy to switch API providers
