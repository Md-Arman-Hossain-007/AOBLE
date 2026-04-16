# Troubleshooting Guide - Settings Page

## Common Issues and Solutions

### ❌ Error: "Failed to fetch" from `http://backend:8000/api/v1/...`

**What it means:** The frontend is trying to connect to `backend:8000` (Docker internal hostname) instead of `localhost:8000`. Browsers cannot resolve Docker service names.

**How to fix (Docker):**

1. **Run the fix script:**
   ```bash
   ./fix-docker.sh
   ```

2. **Or manually rebuild:**
   ```bash
   docker-compose down
   docker-compose build frontend
   docker-compose up -d
   ```

3. **Verify the fix:**
   - Check browser network tab - should show requests to `http://localhost:8000`
   - The error should disappear after container rebuild

**Root cause:** The `docker-compose.yml` had incorrect `NEXT_PUBLIC_API_URL` pointing to `http://localhost:3000/api` instead of `http://localhost:8000/api/v1`

---

### ❌ Error: "Failed to fetch" from `http://localhost:8000/...`

**What it means:** The frontend cannot connect to the backend server.

**How to fix:**

1. **Start the backend server:**
   ```bash
   # Option 1: Use the startup script (recommended)
   ./start-dev.sh
   
   # Option 2: Start manually
   cd backend
   python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

2. **Verify backend is running:**
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"healthy","version":"2.0.0"}
   ```

3. **Check if port 8000 is in use:**
   ```bash
   lsof -i :8000
   ```

4. **If port is blocked, kill the process:**
   ```bash
   kill -9 $(lsof -t -i:8000)
   ```

5. **Refresh the frontend page**

---

### ❌ Error: "Authentication session expired"

**What it means:** Your JWT token has expired or is missing.

**How to fix:**

1. Sign out and sign back in
2. Check if `amltab_token` exists in localStorage
3. Verify your token hasn't expired (default: 30 minutes)

---

### ❌ Error: "Admin privileges required"

**What it means:** You're trying to access admin-only features with a non-admin account.

**How to fix:**

1. Check your user role in the database
2. Use an admin account for billing and user management
3. Contact your system administrator

---

### ❌ Error: "403 Forbidden" on compliance settings

**What it means:** Your user role doesn't have permission to access compliance settings.

**Required roles:** `Compliance Officer` or `Admin`

**How to fix:**

1. Check your role: Call `GET /api/v1/auth/me`
2. Request role upgrade from admin
3. Use an account with proper permissions

---

### ❌ Modal not appearing when clicking buttons

**What it means:** JavaScript error or missing event handlers.

**How to fix:**

1. Check browser console for errors
2. Clear browser cache (Cmd+Shift+R on Mac)
3. Rebuild frontend: `cd frontend && npm run build`
4. Restart dev server: `npm run dev`

---

### ❌ CSS styles not loading correctly

**What it means:** CSS module compilation issue.

**How to fix:**

1. Verify `page.module.css` exists in settings folder
2. Check import: `import styles from "./page.module.css";`
3. Restart Next.js dev server
4. Clear `.next` cache: `rm -rf .next`

---

## Quick Diagnostic Commands

```bash
# Check if backend is running
curl http://localhost:8000/health

# Check if frontend is running
curl http://localhost:3000

# View running processes on ports
lsof -i :8000  # Backend
lsof -i :3000  # Frontend

# Check backend logs
cd backend && python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Check frontend logs
cd frontend && npm run dev

# Verify environment variables
cat frontend/.env.local
# Should show: NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## Environment Variables

### Backend (backend/.env)
```
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./amlapp.db
PROJECT_NAME=AMLtab
VERSION=2.0.0
```

### Frontend (frontend/.env.local)
```
BACKEND_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## API Endpoints Quick Reference

| Endpoint | Method | Description | Required Role |
|----------|--------|-------------|---------------|
| `/api/v1/auth/me` | GET | Get current user | Any authenticated |
| `/api/v1/auth/organizations` | GET, PUT | Organization info | Any authenticated |
| `/api/v1/compliance/` | GET, PUT | Compliance settings | Compliance Officer, Admin |
| `/api/v1/users/` | GET, POST | User management | Admin |
| `/api/v1/auth/sessions/active` | GET | Active sessions | Any authenticated |
| `/api/v1/auth/2fa/generate` | POST | Generate 2FA secret | Any authenticated |
| `/api/v1/auth/2fa/enable` | POST | Enable 2FA | Any authenticated |
| `/api/v1/auth/2fa/disable` | POST | Disable 2FA | Any authenticated |
| `/api/v1/integrations/configs` | GET, POST | Integration configs | Any authenticated |
| `/api/v1/billing/` | GET | Billing info | Admin |
| `/api/v1/billing/plan` | PUT | Change plan | Admin |

---

## Still Having Issues?

1. **Check the documentation:** See `SETTINGS_API_FIXES.md` for detailed API information
2. **Verify database:** Make sure SQLite database exists and is accessible
3. **Check CORS:** Backend allows all origins in development (see `backend/app/main.py`)
4. **Review logs:** Look for errors in browser console and terminal output
5. **Restart everything:** Use `./start-dev.sh` to start fresh

---

## Development Workflow

1. **Start servers:** `./start-dev.sh`
2. **Make changes** to frontend or backend
3. **Frontend auto-reloads** on file changes
4. **Backend auto-reloads** on file changes (--reload flag)
5. **Test changes** in browser at http://localhost:3000
6. **Check API docs** at http://localhost:8000/docs
7. **Stop servers:** Ctrl+C in terminal

---

## Need Help?

- Check browser console for JavaScript errors
- Check terminal for Python/Node errors
- Verify all environment variables are set correctly
- Ensure database file exists and is not corrupted
- Try clearing browser cache and cookies
