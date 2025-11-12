#!/bin/bash

echo "========================================="
echo "🌱 Starting Farm2Future Dashboard"
echo "========================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🚀 Starting server..."
echo ""
echo "✅ Server will start on: http://localhost:5000"
echo "📊 Dashboard: http://localhost:5000/dashboard.html"
echo "🔐 Login: http://localhost:5000/login.html"
echo ""
echo "Login credentials:"
echo "  Email: farmer@test.com"
echo "  Password: password123"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================="
echo ""

npm start
