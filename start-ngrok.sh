#!/bin/bash

# AMLtab Ngrok Startup Script
# This script starts backend, frontend, and ngrok tunnels

echo "🚀 Starting AMLtab with Ngrok..."

# 1. Start Backend in background
echo "📡 Starting Backend..."
cd backend
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "✅ Backend PID: $BACKEND_PID"

# 2. Start Ngrok in background
echo "🌐 Starting Ngrok tunnels..."
# Use --config with absolute path just in case
NGROK_CONFIG=$(pwd)/ngrok.yml
ngrok start --config "$NGROK_CONFIG" --all > ngrok.log 2>&1 &
NGROK_PID=$!
sleep 2

# Check if ngrok is still running
if ! kill -0 $NGROK_PID > /dev/null 2>&1; then
    echo "❌ Ngrok failed to start. Check ngrok.log for details."
    cat ngrok.log
    kill $BACKEND_PID > /dev/null 2>&1
    exit 1
fi
echo "✅ Ngrok PID: $NGROK_PID"

# 3. Wait for Ngrok to initialize and get URLs
echo "⏳ Waiting for Ngrok URLs (this may take 10s)..."
MAX_RETRIES=10
RETRY_COUNT=0
BACKEND_NGROK_URL=""
FRONTEND_NGROK_URL=""

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    sleep 2
    # Try to fetch tunnels from local API
    TUNNELS_JSON=$(curl -s http://localhost:4040/api/tunnels)
    
    if [ ! -z "$TUNNELS_JSON" ] && echo "$TUNNELS_JSON" | grep -q "tunnels"; then
        BACKEND_NGROK_URL=$(echo "$TUNNELS_JSON" | python3 -c "import sys, json; data=json.load(sys.stdin); print(next((t['public_url'] for t in data['tunnels'] if t['name'] == 'backend'), ''))")
        FRONTEND_NGROK_URL=$(echo "$TUNNELS_JSON" | python3 -c "import sys, json; data=json.load(sys.stdin); print(next((t['public_url'] for t in data['tunnels'] if t['name'] == 'frontend'), ''))")
        
        if [ ! -z "$BACKEND_NGROK_URL" ] && [ ! -z "$FRONTEND_NGROK_URL" ]; then
            break
        fi
    fi
    
    RETRY_COUNT=$((RETRY_COUNT+1))
    echo "  (Retry $RETRY_COUNT/$MAX_RETRIES...)"
done

if [ -z "$BACKEND_NGROK_URL" ]; then
    echo "❌ Failed to get Ngrok URLs after $MAX_RETRIES attempts."
    echo "Check if you have added your authtoken: 'ngrok config add-authtoken <TOKEN>'"
    kill $BACKEND_PID > /dev/null 2>&1
    kill $NGROK_PID > /dev/null 2>&1
    exit 1
fi

echo "✅ Backend Ngrok URL: $BACKEND_NGROK_URL"
echo "✅ Frontend Ngrok URL: $FRONTEND_NGROK_URL"

# 4. Update Frontend .env.local
echo "📝 Updating frontend/.env.local with Ngrok URL..."
# Backup existing .env.local
cp frontend/.env.local frontend/.env.local.bak
# Update the URL
sed -i '' "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$BACKEND_NGROK_URL/api/v1|g" frontend/.env.local
sed -i '' "s|BACKEND_API_URL=.*|BACKEND_API_URL=$BACKEND_NGROK_URL/api/v1|g" frontend/.env.local

# 5. Start Frontend
echo "🎨 Starting Frontend..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "✅ Frontend PID: $FRONTEND_PID"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ AMLtab is now live on Ngrok!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📡 Public Backend:  $BACKEND_NGROK_URL"
echo "🎨 Public Frontend: $FRONTEND_NGROK_URL"
echo ""
echo "Logs:"
echo "  - Backend:  backend.log"
echo "  - Frontend: frontend.log"
echo "  - Ngrok:    ngrok.log"
echo ""
echo "Press Ctrl+C to stop all (Note: background processes will stay, use 'pkill -P $$' to cleanup if needed)"
echo ""

# Wait and trap Ctrl+C
cleanup() {
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID $NGROK_PID
    # Restore .env.local
    mv frontend/.env.local.bak frontend/.env.local
    exit
}

trap cleanup SIGINT SIGTERM

# Keep script running
wait
