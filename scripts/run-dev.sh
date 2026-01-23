#!/usr/bin/env bash

# Kill any existing dev servers first
pkill -f "pnpm dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 1

cd "$(dirname "$0")/../web-app" || exit 1

echo "[run-dev] Starting web-app dev server in $(pwd) ..."
echo "[run-dev] Server will be available at http://localhost:5173"
echo "[run-dev] Press Ctrl+C to stop"

# Trap to cleanup on exit
cleanup() {
    echo ""
    echo "[run-dev] Shutting down gracefully..."
    # kill background typecheck watcher if running
    if [ -n "$TC_PID" ]; then
        kill "$TC_PID" 2>/dev/null || true
    fi
    pkill -P $$ 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

# Start TypeScript typecheck in watch mode in background so it runs continuously.
# Write output to a log file so developers can inspect errors without killing Vite.
# This keeps type errors visible without blocking the dev server; it's restarted
# each time the script starts and will be killed on cleanup.
mkdir -p "$(pwd)/web-app/.logs"
pnpm run typecheck:watch > "$(pwd)/web-app/.logs/typecheck.log" 2>&1 &
TC_PID=$!
echo "[run-dev] Typecheck watcher started with PID $TC_PID (logs: web-app/.logs/typecheck.log)"

while true; do
    PORT=5173 pnpm dev
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 130 ]; then
        # User pressed Ctrl+C
        break
    fi
    
    echo "[run-dev] Dev server exited with code $EXIT_CODE, restarting in 2 seconds..."
    sleep 2
done
