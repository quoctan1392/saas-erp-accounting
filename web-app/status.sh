#!/bin/bash
# Check Vite dev server status

cd "$(dirname "$0")"

PID_FILE="./vite.pid"
LOG_FILE="./vite.log"

echo "📊 Vite Dev Server Status"
echo "========================="

# Check PID file
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "✅ Status: RUNNING"
        echo "   PID: $PID"
    else
        echo "⚠️  Status: STOPPED (stale PID file)"
        rm -f "$PID_FILE"
    fi
else
    echo "❌ Status: NOT RUNNING (no PID file)"
fi

# Check port
if lsof -iTCP:5173 -sTCP:LISTEN > /dev/null 2>&1; then
    echo ""
    echo "Port 5173:"
    lsof -iTCP:5173 -sTCP:LISTEN | grep LISTEN
    echo ""
    echo "🌐 URL: http://localhost:5173"
else
    echo ""
    echo "❌ Port 5173: Not in use"
fi

# Show recent logs
if [ -f "$LOG_FILE" ]; then
    echo ""
    echo "📝 Recent logs (last 10 lines):"
    echo "--------------------------------"
    tail -10 "$LOG_FILE"
fi
