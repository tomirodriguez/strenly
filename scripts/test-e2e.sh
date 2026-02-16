#!/bin/bash
# Full E2E test pipeline: start DB → reset → seed → run tests → cleanup.
#
# Usage:
#   ./scripts/test-e2e.sh          # Run headless tests
#   ./scripts/test-e2e.sh --ui     # Open Playwright UI mode
#
# Playwright webServer config handles starting/stopping dev servers (API + coach-web).

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

UI_MODE=false
if [ "$1" = "--ui" ]; then
  UI_MODE=true
fi

cleanup() {
  echo ""
  echo "Stopping test database..."
  docker compose -f docker-compose.test.yml down 2>/dev/null || true
}
trap cleanup EXIT

echo "Starting test database..."
docker compose -f docker-compose.test.yml up -d

echo "Waiting for PostgreSQL to be ready..."
until docker compose -f docker-compose.test.yml exec -T postgres-test pg_isready -U strenly -d strenly_test > /dev/null 2>&1; do
  sleep 1
done
echo "Database ready."

echo "Pushing schema..."
npx dotenv-cli -e .env.test -- pnpm --filter @strenly/database db:push 2>&1 | tail -1

echo "Seeding test data..."
npx dotenv-cli -e .env.test -- pnpm --filter @strenly/database db:seed 2>&1 | tail -3

echo ""
if [ "$UI_MODE" = true ]; then
  echo "Opening Playwright UI..."
  pnpm --filter coach-web test:e2e:ui
else
  echo "Running E2E tests..."
  pnpm --filter coach-web test:e2e
fi
