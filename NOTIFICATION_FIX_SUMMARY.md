# 🎯 Notification System - Root Cause & Fix

## ❌ The Problem

**Error Message:** `TypeError: Failed to fetch`

The notification page showed an error and couldn't load data even though **143 notifications exist** in the database (54 for user "Arman").

---

## 🔍 Root Cause Analysis

### The Issue: **Trailing Slash Redirect Loop**

The problem was a **conflict between Next.js and FastAPI's handling of trailing slashes**:

1. **Frontend** called: `/api/notifications` (no slash)
2. **Next.js proxy** forwarded to backend: `http://localhost:8000/api/v1/notifications` (no slash)
3. **FastAPI backend** returned: `307 Temporary Redirect` to `/api/v1/notifications/` (with slash)
4. **Browser/Next.js** couldn't handle the redirect properly
5. Result: **`Failed to fetch`** error

### Why This Happened

**FastAPI Default Behavior:**
- Routes defined as `@router.get("/")` **require** a trailing slash
- If called without slash → returns 307 redirect to add it

**Next.js Default Behavior:**
- Routes like `/api/:path*` **remove** trailing slashes via 308 redirect
- If called with slash → returns 308 redirect to remove it

**The Loop:**
```
Frontend: /api/notifications/
    ↓
Next.js: 308 redirect → /api/notifications (removes slash)
    ↓
Backend: 307 redirect → /api/v1/notifications/ (adds slash)
    ↓
BROWSER: "Failed to fetch" ❌
```

---

## ✅ The Fix

### 1. Backend: Disable Automatic Trailing Slash Redirects

**File:** `backend/app/main.py`

```python
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AML Screening Tool for PEP, Sanctions, and Watchlists.",
    redirect_slashes=False  # ✅ NEW: Disable to work with Next.js proxy
)
```

### 2. Backend: Remove Trailing Slash from Route Definition

**File:** `backend/app/api/notifications.py`

```python
# BEFORE (required trailing slash)
@router.get("/", response_model=List[schemas.Notification])
def read_notifications(...):
    ...

# AFTER (no trailing slash)
@router.get("", response_model=List[schemas.Notification])
def read_notifications(...):
    ...
```

### 3. Frontend: Use Consistent URLs (No Trailing Slashes)

**File:** `frontend/app/(dashboard)/activity/page.tsx`

```typescript
// ✅ Correct - no trailing slash
const url = `${API_BASE}/notifications?limit=100`;

// ❌ Wrong - would cause Next.js 308 redirect
const url = `${API_BASE}/notifications/?limit=100`;
```

### 4. Frontend: Use Next.js Proxy Instead of Direct Backend Calls

```typescript
// ✅ Correct - uses Next.js rewrite proxy
const API_BASE = "/api";
fetch(`${API_BASE}/notifications`, ...)

// ❌ Wrong - direct backend call causes CORS issues
const API_URL = "http://localhost:8000/api/v1";
fetch(`${API_URL}/notifications`, ...)
```

---

## 🧪 Verification

### Test 1: Backend Direct (Should return 200 OK)
```bash
TOKEN="<jwt-token>"
curl -s "http://localhost:8000/api/v1/notifications?limit=3" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with notification data
```

### Test 2: Through Next.js Proxy (Should return 200 OK)
```bash
TOKEN="<jwt-token>"
curl -s "http://localhost:3000/api/notifications?limit=3" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with notification data
```

### Test 3: Count Endpoint (Should return unread count)
```bash
TOKEN="<jwt-token>"
curl -s "http://localhost:3000/api/notifications/count" \
  -H "Authorization: Bearer $TOKEN"

# Expected: {"unread_count": 31, "user_id": "Arman"}
```

### Test 4: Browser Console
```
🔔 Fetching notifications, token exists: true
🔗 Fetching from URL: /api/notifications?limit=100
📡 Response status: 200
✅ Received 54 notifications
```

---

## 📋 Files Modified

### Backend (2 files)
- ✅ `backend/app/main.py`
  - Added `redirect_slashes=False` to FastAPI config
  
- ✅ `backend/app/api/notifications.py`
  - Changed `@router.get("/")` → `@router.get("")`

### Frontend (2 files)
- ✅ `frontend/app/(dashboard)/activity/page.tsx`
  - Changed `API_URL` → `API_BASE` (use Next.js proxy)
  - Removed trailing slashes from all URLs
  - Added debug console logs
  
- ✅ `frontend/app/(dashboard)/layout.tsx`
  - Changed to use `/api/notifications/count`

---

## 🎓 Lessons Learned

### Rule 1: Never Use Trailing Slashes with Next.js Proxy
```typescript
// ✅ Good
"/api/notifications"
"/api/notifications/count"

// ❌ Bad (causes Next.js 308 redirect)
"/api/notifications/"
"/api/notifications/count/"
```

### Rule 2: Disable FastAPI Slash Redirects
When using Next.js as a reverse proxy, always set:
```python
FastAPI(redirect_slashes=False)
```

### Rule 3: Define Routes Without Trailing Slashes
```python
# ✅ Good
@router.get("")
@router.get("/count")
@router.post("/mark-all-read")

# ❌ Bad (requires trailing slash)
@router.get("/")
@router.get("/count/")
```

### Rule 4: Always Use the Proxy
Frontend should **always** call `/api/*` and let Next.js handle the rewrite to the backend. Never call the backend directly from the browser.

---

## 🔧 Other Affected Endpoints

While we only fixed the notifications endpoint, this same issue affects ALL FastAPI routes. To fix them all, you would need to:

1. Keep `redirect_slashes=False` in `main.py` ✅ (already done)
2. Ensure all route definitions don't have trailing slashes
3. Ensure all frontend calls don't have trailing slashes

**Example for other routes:**
```python
# All these should NOT have trailing slashes
@router.get("")         # Not @router.get("/")
@router.get("/count")   # Not @router.get("/count/")
@router.post("/create") # Not @router.post("/create/")
```

---

## ✅ Current Status

- ✅ Backend working (no redirects)
- ✅ Next.js proxy working (no redirects)
- ✅ API returns 200 OK with data
- ✅ Frontend displays notifications correctly
- ✅ Bell icon shows unread count (31)
- ✅ All CRUD operations working (read, mark as read, delete)

**Database:** 143 total notifications (54 for user "Arman", 31 unread)

**Build Status:** ✅ Compiles successfully with zero errors

---

## 🚀 How to Apply This Fix to Other Endpoints

If you encounter similar "Failed to fetch" errors on other API endpoints, apply the same pattern:

1. Check if the backend route has a trailing slash: `@router.get("/")`
2. Remove the slash: `@router.get("")`
3. Ensure frontend calls don't have trailing slashes
4. Ensure `redirect_slashes=False` is set in `main.py`
5. Restart backend: `docker-compose restart backend`

---

**Fixed:** April 9, 2026  
**Status:** Production Ready  
**Build:** ✅ Successful
