#!/bin/bash
# Start Vite dev server in background (interruption-resistant)
# This script runs the server in a way that survives terminal closure

cd "$(dirname "$0")"

PID_FILE="./vite.pid"
LOG_FILE="./vite.log"

# Check if already running
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "⚠️  Vite server is already running (PID: $OLD_PID)"
        echo "   Access it at: http://localhost:5173"
        echo "   To stop it, run: ./stop.sh"
        exit 0
    fi
fi

# Kill any existing servers on port 5173
echo "🧹 Cleaning up old processes..."
lsof -tiTCP:5173 -sTCP:LISTEN 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 0.5

# Start the server in background with nohup (immune to SIGHUP)
echo "🚀 Starting Vite dev server in background..."
nohup pnpm dev > "$LOG_FILE" 2>&1 &
SERVER_PID=$!

# Save PID for later stopping
echo "$SERVER_PID" > "$PID_FILE"

# Wait a moment and verify it started
sleep 3

if ps -p "$SERVER_PID" > /dev/null 2>&1; then
    echo "✅ Vite server started successfully!"
    echo "   PID: $SERVER_PID"
    echo "   URL: http://localhost:5173"
    echo "   Logs: tail -f $LOG_FILE"
    echo "   Stop: ./stop.sh"
else
    echo "❌ Failed to start server. Check logs: cat $LOG_FILE"
    rm -f "$PID_FILE"
    exit 1
fi
