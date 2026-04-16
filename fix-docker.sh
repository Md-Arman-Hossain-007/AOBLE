#!/bin/bash

# Fix Docker Environment and Restart
echo "🔧 Fixing frontend API URL configuration..."
echo ""

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

echo ""
echo "🏗️  Rebuilding frontend container with correct API URL..."
docker-compose build frontend

echo ""
echo "🚀 Starting all services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Docker services restarted!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📡 Backend:  http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🎨 Frontend: http://localhost:3000"
echo ""
echo "🔍 Checking service health..."
echo ""

# Check backend
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend failed to start"
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend failed to start"
fi

echo ""
echo "📝 To view logs: docker-compose logs -f frontend"
echo "📝 To stop: docker-compose down"
echo ""
