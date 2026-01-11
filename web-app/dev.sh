#!/bin/bash
# Reliable dev server - run this in a dedicated terminal
# Or use: ./dev.sh > /tmp/vite.log 2>&1 & to run in background

cd "$(dirname "$0")"

# Clean up any existing servers
echo "🧹 Cleaning up old processes..."
lsof -tiTCP:5173 -sTCP:LISTEN | xargs kill -9 2>/dev/null || true
sleep 0.5

echo "🚀 Starting Vite dev server on http://localhost:5173"
echo ""

exec env PORT=5173 pnpm dev
