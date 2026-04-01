# AMLtab API Documentation

## Base URL
```
https://amltab.com
```

## Authentication
All API requests require an API key in the header:
```
X-API-Key: your_api_key_here
```

## Cellbunq API Credentials
- **Username:** cellbunq
- **API Key:** `amltab_z2CwmUHRWU0112FizNuqCK2bflnShDJWKigNlhSZuqk`

---

## API Endpoints

### 1. Single Screening
Screen an individual or company against watchlists.

**Endpoint:** `POST /api/screen`

**Headers:**
```bash
Content-Type: application/json
X-API-Key: amltab_z2CwmUHRWU0112FizNuqCK2bflnShDJWKigNlhSZuqk
```

**Request Body - Individual:**
```json
{
  "screening_type": "individual",
  "first_name": "Vladimir",
  "last_name": "Putin",
  "date_of_birth": "1952-10-07",
  "country": "RU",
  "threshold": 80
}
```

**Request Body - Company:**
```json
{
  "screening_type": "company",
  "company_name": "ACME Corporation",
  "country": "US",
  "registration_number": "123456789",
  "threshold": 80
}
```

**cURL Example:**
```bash
curl -X POST https://amltab.com/api/screen \
  -H "Content-Type: application/json" \
  -H "X-API-Key: amltab_z2CwmUHRWU0112FizNuqCK2bflnShDJWKigNlhSZuqk" \
  -d '{
    "screening_type": "individual",
    "first_name": "John",
    "last_name": "Smith",
    "date_of_birth": "1980-01-15",
    "country": "US",
    "threshold": 80
  }'
```

**Response:**
```json
{
  "screening_id": "scr_abc123xyz",
  "query": {
    "screening_type": "individual",
    "first_name": "John",
    "last_name": "Smith",
    "country": "US"
  },
  "timestamp": "2026-02-11T10:30:00",
  "overall_status": "Clear",
  "matches": [
    {
      "name": "John Smith",
      "source": "OpenSanctions",
      "match_score": 85.5,
      "match_type": "fuzzy",
      "list_type": "PEP",
      "details": {
        "countries": "US",
        "birth_date": "1980-01-15"
      }
    }
  ],
  "summary": {
    "pep_matches": 1,
    "sanction_matches": 0,
    "watchlist_matches": 0,
    "total_matches": 1
  }
}
```

---

### 2. Batch Screening
Screen multiple names at once via CSV upload.

**Endpoint:** `POST /api/screen/batch`

**Headers:**
```bash
X-API-Key: amltab_z2CwmUHRWU0112FizNuqCK2bflnShDJWKigNlhSZuqk
```

**cURL Example:**
```bash
curl -X POST https://amltab.com/api/screen/batch \
  -H "X-API-Key: amltab_z2CwmUHRWU0112FizNuqCK2bflnShDJWKigNlhSZuqk" \
  -F "file=@screening_list.csv" \
  -F "threshold=80"
```

**CSV Format:**
```csv
first_name,last_name,date_of_birth
John,Smith,1980-01-15
Jane,Doe,1985-03-20
```

---

### 3. Get Screening Results
Retrieve results of a previous screening.

**Endpoint:** `GET /api/screen/{screening_id}`

**cURL Example:**
```bash
curl https://amltab.com/api/screen/scr_abc123xyz \
  -H "X-API-Key: amltab_z2CwmUHRWU0112FizNuqCK2bflnShDJWKigNlhSZuqk"
```

---

### 4. Download Report
Download a screening report as PDF or CSV.

**Endpoint:** `GET /api/reports/{screening_id}/download?format=pdf`

**cURL Example:**
```bash
curl "https://amltab.com/api/reports/scr_abc123xyz/download?format=pdf" \
  -H "X-API-Key: amltab_z2CwmUHRWU0112FizNuqCK2bflnShDJWKigNlhSZuqk" \
  -o report.pdf
```

---

### 5. List All Reports
Get a list of all screening reports.

**Endpoint:** `GET /api/reports`

**cURL Example:**
```bash
curl https://amltab.com/api/reports \
  -H "X-API-Key: amltab_z2CwmUHRWU0112FizNuqCK2bflnShDJWKigNlhSZuqk"
```

---

### 6. Get Statistics
Get system statistics and database info.

**Endpoint:** `GET /api/stats`

**cURL Example:**
```bash
curl https://amltab.com/api/stats \
  -H "X-API-Key: amltab_z2CwmUHRWU0112FizNuqCK2bflnShDJWKigNlhSZuqk"
```

**Response:**
```json
{
  "total_screenings": 150,
  "total_matches": 45,
  "database_names": 1186792,
  "version": "1.0.0"
}
```

---

## Status Codes

| Status | Description |
|--------|-------------|
| Clear | No matches found above threshold |
| Review | Potential matches requiring manual review |
| Match | High-confidence matches found |

## Match Score Thresholds

| Score | Rating |
|-------|--------|
| 80-100% | High match - Review required |
| 60-79% | Medium match - Consider review |
| Below 60% | Low match - Generally safe |

## List Types

- **PEP** - Politically Exposed Persons
- **Sanctions** - Government sanctions lists (OFAC, EU, UN, etc.)
- **Watchlist** - Other watchlists and adverse media

## Data Sources
- OpenSanctions (3.3M+ names)
- OFAC SDN List
- EU Financial Sanctions
- UN Consolidated List
- UK HMT Sanctions
- And more...

## Rate Limits
- Standard: 100 requests/minute
- Batch: 10 files/hour

---

## Health Check

Monitor the system status including ongoing monitoring health.

**Endpoint:** `GET /api/health`

**No Authentication Required**

**cURL Example:**
```bash
curl https://amltab.com/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-19T08:30:00Z",
  "version": "1.0.0",
  "monitoring": {
    "status": "healthy",
    "active_monitors": 45,
    "cancelled_monitors": 3,
    "total_alerts": 12,
    "last_check": "2026-02-19T08:00:00Z",
    "next_scheduled_check": "2026-02-20T08:00:00Z",
    "overdue_monitors": 0,
    "failed_notifications_24h": 0
  },
  "database": {
    "watchlist_names": 3300000,
    "healthy": true
  }
}
```

**Status Values:**
- `healthy` - All systems operational
- `degraded` - Some issues detected (check `overdue_monitors`)
- Check `last_check` timestamp to verify monitoring is running

---

## Ongoing Monitoring (NEW)

Automatically re-screen entities daily and receive webhook notifications when new matches are detected.

### 1. Start Monitoring
Begin monitoring an individual or company for changes in sanctions/PEP status.

**Endpoint:** `POST /api/monitoring`

**cURL Example:**
```bash
curl -X POST https://amltab.com/api/monitoring \
  -H "Content-Type: application/json" \
  -H "X-API-Key: amltab_z2CwmUHRWU0112FizNuqCK2bflnShDJWKigNlhSZuqk" \
  -d '{
    "screening_type": "individual",
    "first_name": "John",
    "last_name": "Smith",
    "date_of_birth": "1980-01-15",
    "threshold": 80,
    "webhook_url": "https://cellbunq.com/webhooks/aml-alerts"
  }'
```

**Response:**
```json
{
  "monitoring_id": "mon_a1b2c3d4e5f6",
  "client_api_key": "amltab_z2CwmUHRWU0112FizNuqCK2bflnShDJWKigNlhSZuqk",
  "status": "active",
  "screening_type": "individual",
  "entity_name": "John Smith",
  "threshold": 80,
  "frequency": "daily",
  "webhook_url": "https://cellbunq.com/webhooks/aml-alerts",
  "created_at": "2026-02-19T08:30:00",
  "last_checked": "2026-02-19T08:30:00",
  "next_check": "2026-02-20T08:30:00",
  "total_alerts": 0,
  "last_alert_at": null
}
```

### 2. List All Monitoring Entries
Get all ongoing monitoring entries for your account.

**Endpoint:** `GET /api/monitoring`

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `cancelled`, `expired`)

**cURL Example:**
```bash
curl https://amltab.com/api/monitoring \
  -H "X-API-Key: amltab_z2CwmUHRWU0112FizNuqCK2bflnShDJWKigNlhSZuqk"
```

### 3. Get Monitoring Status
Get detailed status of a specific monitoring entry.

**Endpoint:** `GET /api/monitoring/{monitoring_id}`

**cURL Example:**
```bash
curl https://amltab.com/api/monitoring/mon_a1b2c3d4e5f6 \
  -H "X-API-Key: amltab_z2CwmUHRWU0112FizNuqCK2bflnShDJWKigNlhSZuqk"
```

### 4. Cancel Monitoring
Stop monitoring an entity. This will cancel all future screenings.

**Endpoint:** `DELETE /api/monitoring/{monitoring_id}`

**cURL Example:**
```bash
curl -X DELETE https://amltab.com/api/monitoring/mon_a1b2c3d4e5f6 \
  -H "X-API-Key: amltab_z2CwmUHRWU0112FizNuqCK2bflnShDJWKigNlhSZuqk"
```

**Response:**
```json
{
  "message": "Monitoring cancelled successfully",
  "monitoring_id": "mon_a1b2c3d4e5f6"
}
```

### 5. Update Webhook URL
Change the webhook URL for an existing monitoring entry.

**Endpoint:** `PUT /api/monitoring/{monitoring_id}/webhook`

**cURL Example:**
```bash
curl -X PUT "https://amltab.com/api/monitoring/mon_a1b2c3d4e5f6/webhook?webhook_url=https://new-domain.com/webhooks/aml" \
  -H "X-API-Key: amltab_z2CwmUHRWU0112FizNuqCK2bflnShDJWKigNlhSZuqk"
```

### 6. Get Alert History
Get historical alerts for a monitoring entry.

**Endpoint:** `GET /api/monitoring/{monitoring_id}/alerts`

**Query Parameters:**
- `limit` (optional): Number of alerts to return (default: 50)

**cURL Example:**
```bash
curl https://amltab.com/api/monitoring/mon_a1b2c3d4e5f6/alerts \
  -H "X-API-Key: amltab_z2CwmUHRWU0112FizNuqCK2bflnShDJWKigNlhSZuqk"
```

---

## Webhook Notifications

When new matches are detected during ongoing monitoring, AMLtab will POST to your webhook URL:

**Webhook Payload:**
```json
{
  "event": "aml_alert",
  "alert_id": "alt_20260219083045_mon_a1b2c3",
  "monitoring_id": "mon_a1b2c3d4e5f6",
  "timestamp": "2026-02-19T08:30:45Z",
  "entity_name": "John Smith",
  "screening_type": "individual",
  "alert_type": "new_match",
  "previous_status": "Clear",
  "current_status": "Review",
  "new_matches_count": 2,
  "message": "New match(es) found for John Smith",
  "new_matches": [
    {
      "name": "John Smith",
      "match_score": 92.5,
      "list_type": "Sanctions",
      "source": "US OFAC SDN List",
      "url": "https://www.opensanctions.org/entities/NK-12345/"
    }
  ],
  "all_matches": [...],
  "check_url": "https://amltab.com/api/monitoring/mon_a1b2c3d4e5f6"
}
```

**Alert Types:**
- `new_match` - New sanction/PEP match detected
- `status_change` - Overall status changed (Clear → Review/Match)

---

## Retry & Fallback Mechanisms

### Automatic Retry Logic
The monitoring system includes multiple layers of retry protection:

1. **Database Operations** - 3 retries with exponential backoff (5s, 10s, 20s)
2. **Webhook Notifications** - 3 retries with exponential backoff
3. **Failed Check Recovery** - Failed checks are logged and retried on next run

### Monitoring Health
- Daily checks run at 8:00 AM UTC
- Use `GET /api/health` to verify monitoring is running
- Check `last_check` timestamp in health response
- `overdue_monitors` indicates checks that should have run but didn't

### Manual Fallback
If the cron job fails, you can trigger monitoring manually:

```bash
# SSH to server and run manually
python3 /root/.openclaw/workspace/Projects/AMLtab/src/monitoring.py
```

Or via the API (future enhancement - contact support for manual trigger).

### Lock Mechanism
- Prevents concurrent monitoring runs
- Stale locks (older than 2 hours) are automatically cleared
- Lock file: `/tmp/amltab_monitoring.lock`

---

## Support
For questions or issues, contact: support@amltab.com
