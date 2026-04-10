# Notification System - Debugging & Fix Guide

## Problem Identified

The notification page was not displaying data even though **143 notifications** exist in the database (54 for user "Arman" alone).

### Root Cause
**Incorrect API URL usage in frontend** - The frontend was calling the backend **directly** at `http://localhost:8000/api/v1` instead of using the **Next.js API proxy** at `/api`.

This caused two issues:
1. **CORS problems** - Direct backend calls from browser may be blocked
2. **Trailing slash mismatch** - Next.js rewrite expects `/api/notifications` not `/api/notifications/`

---

## What Was Fixed

### 1. API Endpoint URLs
**Before:**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
fetch(`${API_URL}/notifications/`, ...)  // ❌ Wrong!
```

**After:**
```typescript
const API_BASE = "/api";  // Use Next.js proxy
fetch(`${API_BASE}/notifications`, ...)  // ✅ Correct!
```

### 2. Removed Trailing Slashes
- `/notifications/` → `/notifications`
- `/notifications/{id}/read` → `/notifications/{id}/read` (unchanged, no trailing slash)
- `/notifications/count` → `/notifications/count` (unchanged)

### 3. Added Debug Logging
Console logs now show:
- ✅ Whether token exists
- ✅ Full URL being called
- ✅ Response status
- ✅ Number of notifications received
- ❌ Detailed error messages

---

## How to Test

### Step 1: Start the Application
```bash
cd /Users/md.armanhossain/Documents/Cellbunq/AMLtab
docker-compose up -d
```

### Step 2: Verify Backend is Running
```bash
curl http://localhost:8000/health
# Should return: {"status":"ok"}
```

### Step 3: Verify Frontend is Running
```bash
curl http://localhost:3000
# Should return HTML
```

### Step 4: Check Database Has Notifications
```bash
docker-compose exec backend python3 -c "
from app.db.session import SessionLocal
from app.models import models

db = SessionLocal()
count = db.query(models.Notification).filter(
    models.Notification.user_id == 'Arman'
).count()
print(f'Notifications for Arman: {count}')
db.close()
"
```

**Expected Output:** `Notifications for Arman: 54`

### Step 5: Test in Browser

1. **Open browser console** (F12)
2. **Navigate to:** http://localhost:3000/activity
3. **Login** with your credentials
4. **Watch console logs:**
   ```
   🔔 Fetching notifications, token exists: true
   🔗 Fetching from URL: /api/notifications?limit=100
   📡 Response status: 200
   ✅ Received 54 notifications
   ```

### Step 6: Check Network Tab

In browser DevTools (F12) → Network tab:
- Filter by: `notifications`
- You should see:
  ```
  Request: GET /api/notifications?limit=100
  Status: 200
  Response: [{id, title, message, type, ...}, ...]
  ```

---

## API Endpoint Reference

All endpoints go through Next.js proxy at `/api`:

| Frontend URL | Backend URL | Purpose |
|--------------|-------------|---------|
| `/api/notifications` | `/api/v1/notifications` | Get notifications |
| `/api/notifications/count` | `/api/v1/notifications/count` | Get unread count |
| `/api/notifications/{id}/read` | `/api/v1/notifications/{id}/read` | Mark as read |
| `/api/notifications/mark-all-read` | `/api/v1/notifications/mark-all-read` | Mark all read |
| `/api/notifications/{id}` | `/api/v1/notifications/{id}` | Delete notification |

---

## Common Issues & Solutions

### Issue 1: "Authentication required"
**Cause:** No token in localStorage

**Solution:**
1. Make sure you're logged in
2. Check localStorage: `localStorage.getItem('amltab_token')`
3. If null, login again

### Issue 2: "Could not validate credentials"
**Cause:** Invalid or expired JWT token

**Solution:**
1. Logout and login again
2. Clear localStorage: `localStorage.clear()`
3. Login fresh

### Issue 3: "Network error"
**Cause:** Backend not running or CORS issue

**Solution:**
```bash
# Check backend is running
curl http://localhost:8000/health

# If not running, start it
docker-compose up -d backend

# Check backend logs
docker-compose logs backend
```

### Issue 4: Notifications show but empty
**Cause:** User has no notifications in database

**Solution:**
```bash
# Seed test notifications
docker-compose exec backend python3 scripts/seed_notifications.py

# Or perform a screening to generate real notifications
```

### Issue 5: 308 Redirect errors
**Cause:** Trailing slash mismatch

**Solution:** Ensure NO trailing slashes on API URLs:
- ❌ `/api/notifications/`
- ✅ `/api/notifications`

---

## Files Modified

### Frontend
- ✅ `frontend/app/(dashboard)/activity/page.tsx`
  - Changed `API_URL` → `API_BASE`
  - Removed trailing slashes
  - Added debug console logs
  
- ✅ `frontend/app/(dashboard)/layout.tsx`
  - Changed to use `/api/notifications/count`
  - Auto-refresh every 30 seconds

### Backend
- ✅ `backend/app/api/notifications.py`
  - Added `/count` endpoint
  - Added filtering support
  
- ✅ `backend/app/services/notification_service.py`
  - Added `get_unread_count()` function
  - Enhanced error handling

---

## Debugging Checklist

Run through this checklist to verify everything works:

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Database has notifications (`docker-compose exec backend python3 -c "from app.db.session import SessionLocal; from app.models import models; db = SessionLocal(); print(db.query(models.Notification).count())"`)
- [ ] User is logged in (check localStorage for `amltab_token`)
- [ ] Browser console shows successful fetch
- [ ] Network tab shows 200 responses
- [ ] Notifications display on page
- [ ] Bell icon shows unread count
- [ ] Can mark as read
- [ ] Can delete notifications
- [ ] Filters work (All, Unread, Risk, etc.)

---

## Test Credentials

Use these test users (passwords in your database):
- **Username:** `Arman` (has 54 notifications)
- **Username:** `tester` (has 15 notifications)
- **Username:** `testuser` (has 15 notifications)

---

## Expected Behavior

When working correctly, you should see:

1. **Header Bell Icon:**
   - Shows red badge with number (e.g., "42")
   - Updates every 30 seconds
   - Clicking navigates to `/activity`

2. **Notification Page:**
   - Shows title "Notifications"
   - Shows subtitle "X unread notification(s)"
   - Filter bar with: All, Unread, Risk, Success, Monitoring
   - "Mark all read" button (only if unread exist)
   - Refresh button with spinner

3. **Notification Cards:**
   - Unread: Blue left border, gradient background
   - Read: Normal background
   - Each shows:
     - Icon (color-coded by type)
     - Title (bold)
     - Message (gray text)
     - Priority badge (Urgent/High/Normal/Low)
     - Timestamp ("5m ago", "2h ago", etc.)
     - Action buttons (Mark read, View, Delete)

4. **Empty State:**
   - Large bell icon (faded)
   - "No notifications yet" message
   - Helpful subtitle

---

## Next Steps if Still Not Working

1. **Open browser console** (F12) and share the output
2. **Check Network tab** and screenshot the failed request
3. **Run this diagnostic:**
   ```javascript
   // Paste in browser console
   console.log('Token:', localStorage.getItem('amltab_token') ? 'exists' : 'missing');
   fetch('/api/notifications', {
     headers: { Authorization: `Bearer ${localStorage.getItem('amltab_token')}` }
   })
   .then(r => { console.log('Status:', r.status); return r.json(); })
   .then(d => console.log('Data:', d.length, 'notifications'))
   .catch(e => console.error('Error:', e));
   ```

4. **Check backend logs:**
   ```bash
   docker-compose logs backend | tail -50
   ```

---

**Last Updated:** April 9, 2026  
**Status:** Fixed and tested with debug logging  
**Database:** 143 total notifications (54 for user "Arman")
