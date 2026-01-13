#!/bin/bash
# Stop the dev server

cd "$(dirname "$0")"

PID_FILE="./vite.pid"

echo "🛑 Stopping dev server..."

# Kill by PID file first (most reliable)
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "   Stopping process $PID..."
        kill "$PID" 2>/dev/null || kill -9 "$PID" 2>/dev/null
    fi
    rm -f "$PID_FILE"
fi

# Kill Vite processes on port 5173
lsof -tiTCP:5173 -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null || true

# Kill pnpm dev processes
pkill -f "pnpm dev" 2>/dev/null || true

sleep 1

# Force kill if still running
if lsof -iTCP:5173 -sTCP:LISTEN > /dev/null 2>&1; then
    echo "⚠️  Server still running, force killing..."
    lsof -tiTCP:5173 -sTCP:LISTEN | xargs kill -9 2>/dev/null || true
fi

echo "✅ Dev server stopped"
