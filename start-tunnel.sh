#!/bin/bash

# AMLtab Localtunnel Startup Script
# This script starts backend, frontend, and localtunnel (no auth required)

echo "🚀 Starting AMLtab with Localtunnel..."

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID $LT_BACKEND_PID $LT_FRONTEND_PID 2>/dev/null
    # Restore .env.local
    if [ -f frontend/.env.local.bak ]; then
        mv frontend/.env.local.bak frontend/.env.local
    fi
    exit
}

trap cleanup SIGINT SIGTERM

# 0. Kill existing processes on ports 3000 and 8000
echo "🧹 Clearing existing processes on ports 3000 and 8000..."
lsof -ti :8000 | xargs kill -9 2>/dev/null
lsof -ti :3000 | xargs kill -9 2>/dev/null
sleep 1

# 1. Start Backend in background
echo "📡 Starting Backend..."
cd backend
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "✅ Backend PID: $BACKEND_PID"

# 2. Start Localtunnel for Backend
echo "🌐 Starting Localtunnel for Backend (8000)..."
npx localtunnel --port 8000 > backend_tunnel.log 2>&1 &
LT_BACKEND_PID=$!

# Wait for URL to be generated
echo "⏳ Waiting for Backend URL..."
MAX_RETRIES=15
RETRY_COUNT=0
BACKEND_URL=""

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    sleep 2
    BACKEND_URL=$(grep -o 'https://[^ ]*\.loca\.lt' backend_tunnel.log | head -n 1)
    if [ ! -z "$BACKEND_URL" ]; then
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT+1))
    echo "  (Waiting for URL... $RETRY_COUNT/$MAX_RETRIES)"
done

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Failed to get Localtunnel backend URL."
    cat backend_tunnel.log
    cleanup
fi

echo "✅ Backend URL: $BACKEND_URL"

# 3. Update Frontend .env.local
echo "📝 Updating frontend/.env.local with Tunnel URL..."
cp frontend/.env.local frontend/.env.local.bak
# Replace the API URLs
# Note: Localtunnel sometimes requires a bypass header for the first request, 
# but for API calls it's usually okay if the client has opened the URL once.
sed -i '' "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$BACKEND_URL/api/v1|g" frontend/.env.local
sed -i '' "s|BACKEND_API_URL=.*|BACKEND_API_URL=$BACKEND_URL/api/v1|g" frontend/.env.local

# 4. Start Localtunnel for Frontend
echo "🌐 Starting Localtunnel for Frontend (3000)..."
npx localtunnel --port 3000 > frontend_tunnel.log 2>&1 &
LT_FRONTEND_PID=$!

# Wait for URL
echo "⏳ Waiting for Frontend URL..."
RETRY_COUNT=0
FRONTEND_URL=""

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    sleep 2
    FRONTEND_URL=$(grep -o 'https://[^ ]*\.loca\.lt' frontend_tunnel.log | head -n 1)
    if [ ! -z "$FRONTEND_URL" ]; then
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT+1))
    echo "  (Waiting for URL... $RETRY_COUNT/$MAX_RETRIES)"
done

echo "✅ Frontend URL: $FRONTEND_URL"

# 5. Start Frontend
echo "🎨 Starting Frontend..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "✅ Frontend PID: $FRONTEND_PID"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ AMLtab is now live on Localtunnel!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📡 Public Backend:  $BACKEND_URL"
echo "🎨 Public Frontend: $FRONTEND_URL"
echo ""
echo "⚠️  IMPORTANT - ACTION REQUIRED:"
echo "1. Open the BACKEND URL first: $BACKEND_URL"
echo "2. Click 'Click to Continue' on the landing page."
echo "3. Open the FRONTEND URL: $FRONTEND_URL"
echo "4. Click 'Click to Continue' on that landing page too."
echo ""
echo "If you don't do step 1 & 2, the UI will not load data!"
echo ""
echo "Logs:"
echo "  - Backend:  backend.log"
echo "  - Frontend: frontend.log"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Keep script running
wait
