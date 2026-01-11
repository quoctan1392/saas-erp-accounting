#!/bin/bash
# Stop the dev server

echo "🛑 Stopping dev server..."

# Kill Vite processes
lsof -tiTCP:5173 -sTCP:LISTEN | xargs kill 2>/dev/null || true

# Kill pnpm dev processes
pkill -f "pnpm dev" 2>/dev/null || true

sleep 1

if lsof -iTCP:5173 -sTCP:LISTEN > /dev/null 2>&1; then
    echo "⚠️  Server still running, force killing..."
    lsof -tiTCP:5173 -sTCP:LISTEN | xargs kill -9 2>/dev/null || true
fi

echo "✅ Dev server stopped"
