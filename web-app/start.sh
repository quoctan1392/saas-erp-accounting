#!/bin/bash

# Simple, reliable dev server starter for web-app
# Usage: ./start.sh (run in foreground) or ./start.sh & (run in background)

echo "🚀 Starting Vite dev server..."

# Kill any existing servers on port 5173
EXISTING_PID=$(lsof -tiTCP:5173 -sTCP:LISTEN 2>/dev/null)
if [ -n "$EXISTING_PID" ]; then
    echo "⚠️  Killing existing process on port 5173 (PID: $EXISTING_PID)..."
    kill -9 $EXISTING_PID 2>/dev/null || true
    sleep 1
fi

# Start the server with explicit port
PORT=5173 pnpm dev
