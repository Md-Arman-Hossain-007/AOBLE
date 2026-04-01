# AMLtab API Documentation

## Overview

AMLtab provides a REST API for AML (Anti-Money Laundering) screening against PEP (Politically Exposed Persons), Sanctions, and Watchlists.

**Base URL:** `http://your-server:8000/api`

**Data Sources:**
- OpenSanctions Default Collection: ~3M names
- OpenSanctions Sanctions: ~266K names
- Updated daily from OpenSanctions

---

## Authentication

Currently, AMLtab runs without authentication in local/trusted environments. For production deployment, add authentication middleware.

---

## Endpoints

### 1. Screen Individual

Screen a single person against all watchlists.

**Endpoint:** `POST /screen`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1992-02-22",
  "threshold": 80
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| first_name | string | Yes | First name to screen |
| last_name | string | Yes | Last name to screen |
| date_of_birth | string (YYYY-MM-DD) | No | Date of birth for additional matching |
| threshold | integer (0-100) | No | Minimum fuzzy match score (default: 80) |

**Response:**
```json
{
  "screening_id": "a1b2c3d4",
  "query": {
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1992-02-22"
  },
  "timestamp": "2026-02-09T08:30:00",
  "overall_status": "Review",
  "matches": [
    {
      "name": "John Doe",
      "source": "OpenSanctions",
      "match_score": 95.5,
      "match_type": "fuzzy",
      "list_type": "Sanctions"
    }
  ],
  "summary": {
    "total_matches": 3,
    "pep_matches": 1,
    "sanction_matches": 1,
    "watchlist_matches": 1,
    "highest_score": 95.5
  }
}
```

**Status Values:**
- `Clear` - No matches above threshold
- `Review` - Matches found but below 95% confidence
- `Match` - High confidence match (95%+) found

---

### 2. Batch Screening

Upload a CSV file to screen multiple individuals.

**Endpoint:** `POST /screen/batch`

**Content-Type:** `multipart/form-data`

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | CSV file with screening data |
| threshold | integer | No | Match threshold (default: 80) |

**CSV Format:**
```csv
first_name,last_name,date_of_birth
John,Doe,1992-02-22
Jane,Smith,1985-06-15
Bob,Johnson,
```

**Response:**
```json
{
  "batch_id": "e5f6g7h8",
  "total_screened": 150,
  "results": [
    {
      "screening_id": "a1b2c3d4",
      "overall_status": "Clear",
      ...
    }
  ]
}
```

---

### 3. Get Screening Result

Retrieve a specific screening by ID.

**Endpoint:** `GET /screen/{screening_id}`

**Response:**
```json
{
  "screening_id": "a1b2c3d4",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1992-02-22",
  "timestamp": "2026-02-09T08:30:00",
  "status": "Review",
  "results": [...],
  "match_count": 3
}
```

---

### 4. List Reports

Get recent screening reports.

**Endpoint:** `GET /reports`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 100 | Maximum number of results |

**Response:**
```json
[
  {
    "screening_id": "a1b2c3d4",
    "name": "John Doe",
    "timestamp": "2026-02-09T08:30:00",
    "status": "Review",
    "matches": 3
  }
]
```

---

### 5. System Statistics

Get database and screening statistics.

**Endpoint:** `GET /stats`

**Response:**
```json
{
  "total_screenings": 1250,
  "total_matches": 45,
  "database_names": 3324018,
  "version": "1.0.0"
}
```

---

## Match Scoring

### Fuzzy Matching Algorithm

AMLtab uses **rapidfuzz's WRatio** algorithm for name matching:

- **100%**: Exact match
- **95-99%**: Very high confidence (likely same person)
- **85-94%**: High confidence (review recommended)
- **80-84%**: Medium confidence (possible match)
- **<80%**: Low confidence (filtered by default)

### Name Normalization

Before matching, names are normalized:
- Converted to lowercase
- Extra whitespace removed
- Special characters preserved for matching

---

## List Types

### PEP (Politically Exposed Persons)
Current and former government officials, senior politicians, judicial/military officials, senior executives of state-owned corporations, and their family members.

### Sanctions
Entities and individuals on official sanctions lists including:
- OFAC (US Office of Foreign Assets Control)
- UN Security Council
- EU Consolidated List
- UK HM Treasury
- And 300+ other sources

### Watchlists
Additional watchlists including:
- Law enforcement wanted lists
- Regulatory enforcement actions
- Disqualified directors
- Terrorist watchlists

---

## Error Handling

All errors return JSON with `detail` field:

```json
{
  "detail": "Screening not found"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad request (invalid parameters)
- `404` - Not found
- `422` - Validation error
- `500` - Server error

---

## Rate Limits

Currently no rate limits are enforced. Recommended for production:
- 100 requests/minute for screening endpoints
- 10 batch uploads/hour

---

## Example Usage

### cURL Examples

**Single Screening:**
```bash
curl -X POST http://localhost:8000/api/screen \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Vladimir",
    "last_name": "Putin",
    "threshold": 85
  }'
```

**Batch Upload:**
```bash
curl -X POST http://localhost:8000/api/screen/batch \
  -F "file=@customers.csv" \
  -F "threshold=80"
```

**Get Stats:**
```bash
curl http://localhost:8000/api/stats
```

### Python Example

```python
import requests

# Screen an individual
response = requests.post('http://localhost:8000/api/screen', json={
    'first_name': 'John',
    'last_name': 'Doe',
    'date_of_birth': '1992-02-22',
    'threshold': 80
})

result = response.json()
print(f"Status: {result['overall_status']}")
print(f"Matches: {result['summary']['total_matches']}")

for match in result['matches']:
    print(f"  - {match['name']} ({match['list_type']}: {match['match_score']}%)")
```

---

## Report Downloads

*Coming in v1.1:*
- `GET /reports/{id}/download?format=pdf` - Download PDF report
- `GET /reports/{id}/download?format=csv` - Download CSV report

Report includes:
- Query details
- All matches found
- Match confidence scores
- Source list information
- Timestamp and screening ID
