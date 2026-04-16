#!/bin/bash

# AMLtab Development Server Startup Script
# This script starts both backend and frontend servers

echo "🚀 Starting AMLtab Development Environment..."
echo ""

# Function to check if a port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# Start Backend Server
echo "📡 Starting Backend Server on port 8000..."
if check_port 8000; then
    echo "⚠️  Port 8000 is already in use. Backend may already be running."
else
    cd backend
    python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
    BACKEND_PID=$!
    cd ..
    echo "✅ Backend server started (PID: $BACKEND_PID)"
fi

echo ""

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 3

# Check if backend is healthy
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy and running!"
else
    echo "❌ Backend failed to start. Check the logs above."
    exit 1
fi

echo ""

# Start Frontend Server
echo "🎨 Starting Frontend Server on port 3000..."
if check_port 3000; then
    echo "⚠️  Port 3000 is already in use. Frontend may already be running."
else
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    echo "✅ Frontend server started (PID: $FRONTEND_PID)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Development servers are running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📡 Backend:  http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🎨 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user interrupt
wait
