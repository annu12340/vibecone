# eCourts Web API Setup Guide

## Overview
The application now integrates with the official eCourts Web API for real-time case data retrieval.

**API Provider:** https://webapi.ecourtsindia.com

## Getting Your API Key

### Step 1: Visit eCourts Web API
Go to: **https://webapi.ecourtsindia.com**

### Step 2: Sign Up / Login
- Create an account or login to your existing account
- Complete the registration process

### Step 3: Get API Key
- Navigate to your dashboard/API settings
- Copy your API key
- Format: `eci_live_your_token_here` (live) or `eci_test_your_token_here` (test)

### Step 4: Configure Backend
Add your API key to `/app/backend/.env`:

```bash
ECOURTS_API_KEY=eci_live_your_actual_token_here
```

### Step 5: Restart Backend
```bash
sudo supervisorctl restart backend
```

## API Usage

### Endpoint Format
```
GET https://webapi.ecourtsindia.com/api/partner/case/{CNR}
Authorization: Bearer eci_live_your_token_here
```

### Example Request
```bash
curl -X GET "https://webapi.ecourtsindia.com/api/partner/case/DLHC010001232024" \
  -H "Authorization: Bearer eci_live_your_token_here"
```

### Expected Response
```json
{
  "data": {
    "courtCaseData": {
      "cnr": "DLHC010001232024",
      "caseNumber": "...",
      "state": "DL",
      "caseType": "...",
      "filingDate": "...",
      "judges": [...],
      "petitioners": [...],
      "respondents": [...]
      // ... more fields
    }
  }
}
```

## Application Integration

### How It Works

**Without API Key:**
```
User searches CNR → Cache check → Indian Kanoon fallback
```

**With API Key:**
```
User searches CNR → Cache check (Tier 1)
                        ↓ (miss/stale)
                  eCourts Live API (Tier 2)
                        ↓ (unavailable)
                  Indian Kanoon (Tier 3)
```

### Backend Endpoints

#### 1. Smart Search (Recommended)
```bash
POST /api/cases/search-by-cnr
Body: {"cnr": "DLHC010001232024"}
```

**Behavior:**
- Checks cache first (< 24h)
- Calls eCourts API if cache miss/stale
- Falls back to Indian Kanoon if eCourts fails
- Automatically caches eCourts results

#### 2. Force Fresh Fetch
```bash
POST /api/ecourts/fetch-case/DLHC010001232024
```

**Behavior:**
- Bypasses cache
- Always calls eCourts API (requires key)
- Returns 404 if no API key configured
- Caches result for future use

## Testing Your Setup

### Test 1: Check API Key Configuration
```bash
# View backend logs
tail -f /var/log/supervisor/backend.err.log
```

Look for:
- ✅ `eCourts API key configured successfully`
- ❌ `eCourts API key not configured`

### Test 2: Test API Connection
```bash
# Test with a real CNR
curl -X POST "http://localhost:8001/api/ecourts/fetch-case/DLHC010127602024" \
  -H "Content-Type: application/json"
```

**Expected Success Response:**
```json
{
  "success": true,
  "source": "ecourts_live",
  "message": "Case fetched from eCourts API",
  "data": { /* case details */ },
  "cached": false
}
```

**Expected Error (No API Key):**
```json
{
  "detail": "Case not found in eCourts for CNR: ..."
}
```

### Test 3: Test Smart Search
```bash
curl -X POST "http://localhost:8001/api/cases/search-by-cnr" \
  -H "Content-Type: application/json" \
  -d '{"cnr": "DLHC010127602024"}'
```

Check the `source` field in response:
- `"ecourts_live"` - Fresh from API ✅
- `"ecourts"` - From cache ✅
- `"indian_kanoon"` - Fallback used ⚠️

## Troubleshooting

### Issue: "eCourts API key not configured"
**Solution:**
1. Check `.env` file has `ECOURTS_API_KEY=eci_live_...`
2. Key should start with `eci_live_` or `eci_test_`
3. Restart backend after adding key

### Issue: "401 Unauthorized"
**Solution:**
- API key is invalid or expired
- Get a new key from webapi.ecourtsindia.com
- Check key is copied correctly (no extra spaces)

### Issue: "404 Case Not Found"
**Solution:**
- CNR might not exist in eCourts database
- Verify CNR format: 16 characters (e.g., DLHC010001232024)
- System will automatically fallback to Indian Kanoon

### Issue: API calls are slow
**Solution:**
- First call is always slower (API + cache write)
- Subsequent calls use cache (< 100ms)
- Cache TTL is 24 hours
- Consider increasing cache TTL for older cases

## API Limits & Costs

### Rate Limits
Check with eCourts Web API provider for:
- Requests per minute
- Requests per day
- Concurrent request limits

### Cost Optimization
1. **Use Cache Aggressively**
   - Default 24h cache reduces API calls
   - Increase TTL for disposed cases

2. **Batch Requests**
   - Process multiple CNRs during off-peak hours
   - Pre-cache frequently accessed cases

3. **Monitor Usage**
   - Track API calls in logs
   - Set up alerts for high usage

## Security Best Practices

### 1. Protect API Key
```bash
# Never commit .env to git
echo ".env" >> .gitignore

# Use environment variables in production
export ECOURTS_API_KEY="eci_live_..."
```

### 2. Key Rotation
- Rotate keys every 90 days
- Use different keys for dev/staging/production

### 3. Access Control
- Limit backend API access
- Use authentication for your frontend
- Monitor for unusual usage patterns

## Production Deployment

### Environment Variables
```bash
# Production .env
ECOURTS_API_URL=https://webapi.ecourtsindia.com
ECOURTS_API_KEY=eci_live_production_key_here
```

### Health Check
Add monitoring for:
- API response times
- Success/failure rates
- Cache hit ratios
- Fallback frequency

### Logging
```bash
# Monitor eCourts API calls
tail -f /var/log/supervisor/backend.err.log | grep -i ecourts

# Count API calls per hour
grep "Fetching case details" /var/log/supervisor/backend.err.log | \
  tail -1000 | wc -l
```

## Support

### eCourts Web API Support
- Website: https://webapi.ecourtsindia.com
- Documentation: Check their API docs
- Support: Contact their support team

### Application Support
- Check backend logs: `/var/log/supervisor/backend.err.log`
- Test endpoints with cURL
- Verify .env configuration
- Review cache in MongoDB: `db.ecourts_cache.find()`

## Next Steps

1. ✅ Get API key from webapi.ecourtsindia.com
2. ✅ Add to `.env` file
3. ✅ Restart backend
4. ✅ Test with a real CNR
5. ✅ Monitor logs for success
6. ✅ Enjoy real-time eCourts data! 🎉

## Benefits of eCourts API

✅ **Real-time Data** - Fresh case information
✅ **Official Source** - Direct from eCourts database
✅ **Comprehensive** - All case details + orders + timeline
✅ **AI Analysis** - Includes order analysis when available
✅ **Automatic Cache** - Reduces API calls
✅ **Smart Fallback** - Indian Kanoon ensures reliability
✅ **Production Ready** - Proper error handling

---

**Note:** Without an API key, the system will work normally using the cache and Indian Kanoon fallback. The API key is only needed for real-time eCourts data fetching.
