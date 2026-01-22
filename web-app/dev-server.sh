#!/bin/bash
#
# Resilient Vite Dev Server
# - Auto-restarts on crash
# - Health monitoring
# - Clean shutdown with Ctrl+C
#
# Usage: ./dev-server.sh
#

set -e

cd "$(dirname "$0")"

PORT=${VITE_PORT:-5173}
MAX_RESTARTS=10
RESTART_COUNT=0
RESTART_DELAY=2
HEALTH_CHECK_INTERVAL=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${BLUE}[INFO]${NC} $(date '+%H:%M:%S') $1"
}

log_success() {
  echo -e "${GREEN}[OK]${NC} $(date '+%H:%M:%S') $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $(date '+%H:%M:%S') $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $(date '+%H:%M:%S') $1"
}

cleanup() {
  log_info "Shutting down..."
  
  # Kill background health check if running
  if [ ! -z "$HEALTH_PID" ]; then
    kill $HEALTH_PID 2>/dev/null || true
  fi
  
  # Kill Vite process
  if [ ! -z "$VITE_PID" ]; then
    kill $VITE_PID 2>/dev/null || true
    wait $VITE_PID 2>/dev/null || true
  fi
  
  # Clean up port
  lsof -tiTCP:$PORT -sTCP:LISTEN | xargs kill -9 2>/dev/null || true
  
  log_success "Cleanup complete"
  exit 0
}

# Trap signals for clean shutdown
trap cleanup SIGINT SIGTERM EXIT

kill_port() {
  local pids=$(lsof -tiTCP:$PORT -sTCP:LISTEN 2>/dev/null || true)
  if [ ! -z "$pids" ]; then
    log_warn "Killing existing process on port $PORT"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
}

check_health() {
  # Simple health check - see if port is responding
  curl -s --connect-timeout 2 "http://127.0.0.1:$PORT" > /dev/null 2>&1
  return $?
}

start_vite() {
  log_info "Starting Vite dev server on http://127.0.0.1:$PORT"
  
  # Kill any existing process on port
  kill_port
  
  # Start Vite in background
  pnpm exec vite --host 127.0.0.1 --port $PORT &
  VITE_PID=$!
  
  # Wait for Vite to start
  local wait_count=0
  while [ $wait_count -lt 30 ]; do
    if check_health; then
      log_success "Vite is ready at http://127.0.0.1:$PORT"
      return 0
    fi
    sleep 0.5
    wait_count=$((wait_count + 1))
  done
  
  log_warn "Vite started but health check not passing yet"
  return 0
}

monitor_vite() {
  while true; do
    # Check if Vite process is still running
    if ! kill -0 $VITE_PID 2>/dev/null; then
      log_error "Vite process died!"
      return 1
    fi
    
    sleep $HEALTH_CHECK_INTERVAL
    
    # Periodic health check
    if ! check_health; then
      log_warn "Health check failed, but process is running"
    fi
  done
}

# Main loop with auto-restart
main() {
  echo ""
  echo "╔══════════════════════════════════════════════════════╗"
  echo "║       🚀 Resilient Vite Dev Server                    ║"
  echo "║       Press Ctrl+C to stop                            ║"
  echo "╚══════════════════════════════════════════════════════╝"
  echo ""
  
  while [ $RESTART_COUNT -lt $MAX_RESTARTS ]; do
    start_vite
    
    # Monitor in background
    monitor_vite &
    HEALTH_PID=$!
    
    # Wait for Vite to exit
    wait $VITE_PID 2>/dev/null || true
    EXIT_CODE=$?
    
    # Kill health monitor
    kill $HEALTH_PID 2>/dev/null || true
    
    if [ $EXIT_CODE -eq 0 ]; then
      log_info "Vite exited normally"
      break
    fi
    
    RESTART_COUNT=$((RESTART_COUNT + 1))
    
    if [ $RESTART_COUNT -lt $MAX_RESTARTS ]; then
      log_warn "Vite crashed (exit code: $EXIT_CODE). Restarting in ${RESTART_DELAY}s... (attempt $RESTART_COUNT/$MAX_RESTARTS)"
      sleep $RESTART_DELAY
      # Exponential backoff (max 10s)
      RESTART_DELAY=$((RESTART_DELAY * 2))
      if [ $RESTART_DELAY -gt 10 ]; then
        RESTART_DELAY=10
      fi
    else
      log_error "Max restarts ($MAX_RESTARTS) reached. Giving up."
      exit 1
    fi
  done
}

main
