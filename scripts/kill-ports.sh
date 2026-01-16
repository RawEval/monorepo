#!/bin/bash

# Script to kill processes using ports 3001-3004
# Usage: ./scripts/kill-ports.sh

PORTS=(3001 3002 3003 3004)

echo "🔍 Checking for processes on ports 3001-3004..."

for port in "${PORTS[@]}"; do
  PIDS=$(lsof -ti:$port 2>/dev/null)
  if [ -n "$PIDS" ]; then
    echo "⚠️  Port $port is in use by PIDs: $PIDS"
    echo "$PIDS" | xargs kill -9 2>/dev/null
    echo "✅ Killed processes on port $port"
  else
    echo "✅ Port $port is free"
  fi
done

echo ""
echo "🎉 All ports cleared! You can now run 'pnpm start'"
