# Docker Configuration Fix - Quick Guide

## The Problem

Your frontend was configured to connect to `http://backend:8000/api/v1/compliance/` which caused "Failed to fetch" errors.

**Why?**
- `backend:8000` is a Docker internal hostname
- Browsers run outside Docker and cannot resolve internal service names
- Only Docker containers can communicate using service names like `backend`

## The Fix

**Changed in `docker-compose.yml`:**

```yaml
# BEFORE (❌ WRONG)
frontend:
  environment:
    - NEXT_PUBLIC_API_URL=http://localhost:3000/api  # Points to itself!
    - BACKEND_API_URL=http://backend:8000/api/v1

# AFTER (✅ CORRECT)
frontend:
  environment:
    - NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1  # Points to backend
    - BACKEND_API_URL=http://backend:8000/api/v1
```

## How to Apply the Fix

### Option 1: Quick Fix Script (Recommended)

```bash
./fix-docker.sh
```

This will:
1. Stop all containers
2. Rebuild the frontend with correct configuration
3. Restart everything
4. Verify services are healthy

### Option 2: Manual Steps

```bash
# 1. Stop containers
docker-compose down

# 2. Rebuild frontend
docker-compose build frontend

# 3. Start everything
docker-compose up -d

# 4. Check logs
docker-compose logs -f frontend
```

### Option 3: Non-Docker Development (Alternative)

If you don't want to use Docker, run locally:

```bash
# Terminal 1 - Backend
cd backend
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Verification

After applying the fix:

1. **Check browser network tab:**
   - Open DevTools → Network tab
   - Requests should go to `http://localhost:8000/api/v1/...`
   - NOT `http://backend:8000/...`

2. **Test the compliance endpoint:**
   ```bash
   curl http://localhost:8000/api/v1/compliance/ \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Check service health:**
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"healthy","version":"2.0.0"}
   ```

## Why This Happened

The original `docker-compose.yml` had:
- `NEXT_PUBLIC_API_URL=http://localhost:3000/api` - This made the frontend try to call itself
- `BACKEND_API_URL=http://backend:8000/api/v1` - This is correct for server-side, but `NEXT_PUBLIC_API_URL` is used by the browser

**Key difference:**
- `NEXT_PUBLIC_API_URL` → Used by **browser** (needs `localhost`)
- `BACKEND_API_URL` → Used by **server-side code** (can use `backend`)

## Files Changed

- ✅ `docker-compose.yml` - Fixed `NEXT_PUBLIC_API_URL`
- ✅ `fix-docker.sh` - Created helper script
- ✅ `TROUBLESHOOTING.md` - Added this issue to docs

## Next Steps

1. Run `./fix-docker.sh` to apply the fix
2. Refresh your browser (Cmd+Shift+R to clear cache)
3. The "Failed to fetch" error should be gone!

---

**Need more help?** See `TROUBLESHOOTING.md` for complete troubleshooting guide.
