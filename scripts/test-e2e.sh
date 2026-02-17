#!/bin/bash
# E2E test runner - uses mocked API calls (no database needed).
#
# Usage:
#   ./scripts/test-e2e.sh          # Run headless tests
#   ./scripts/test-e2e.sh --ui     # Open Playwright UI mode
#
# Playwright webServer config handles starting/stopping the Vite dev server.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

UI_MODE=false
if [ "$1" = "--ui" ]; then
  UI_MODE=true
fi

echo ""
if [ "$UI_MODE" = true ]; then
  echo "Opening Playwright UI..."
  pnpm --filter coach-web test:e2e:ui
else
  echo "Running E2E tests..."
  pnpm --filter coach-web test:e2e
fi
