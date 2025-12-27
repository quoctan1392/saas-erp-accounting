#!/bin/bash

# Web App Dev Server - Auto-restart on crash
# Usage: ./start-dev.sh

set -e

PORT=5173
MAX_RETRIES=3
RETRY_COUNT=0

echo "🚀 Starting Web App Dev Server..."

# Kill any existing process on port
kill_existing() {
    PID=$(lsof -tiTCP:$PORT -sTCP:LISTEN 2>/dev/null || true)
    if [ -n "$PID" ]; then
        echo "⚠️  Killing existing process on port $PORT (PID: $PID)"
        kill -9 $PID 2>/dev/null || true
        sleep 1
    fi
}

# Check Node.js memory
check_memory() {
    echo "📊 Node.js version: $(node --version)"
    echo "💾 Setting Node memory limit to 4GB"
    export NODE_OPTIONS="--max-old-space-size=4096"
}

# Start server with retry logic
start_server() {
    cd "$(dirname "$0")"
    
    kill_existing
    check_memory
    
    echo "✅ Starting Vite on http://localhost:$PORT"
    echo "📝 Logs: vite.log"
    echo "🔄 Auto-restart enabled (Ctrl+C to stop)"
    echo ""
    
    # Run in loop with auto-restart
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        node_modules/.bin/vite --port $PORT --host 0.0.0.0 2>&1 | tee vite.log
        EXIT_CODE=$?
        
        if [ $EXIT_CODE -eq 0 ]; then
            echo "✅ Server stopped gracefully"
            break
        else
            RETRY_COUNT=$((RETRY_COUNT + 1))
            echo "❌ Server crashed (exit code: $EXIT_CODE)"
            
            if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
                echo "🔄 Restarting in 2 seconds... (attempt $RETRY_COUNT/$MAX_RETRIES)"
                sleep 2
                kill_existing
            else
                echo "🛑 Max retries reached. Please check the logs."
                exit 1
            fi
        fi
    done
}

# Handle Ctrl+C
trap 'echo ""; echo "🛑 Stopping server..."; kill_existing; exit 0' INT TERM

start_server
