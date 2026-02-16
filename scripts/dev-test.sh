#!/bin/bash
# Start coach-web and API server for E2E tests on isolated ports.
# Uses .env.test (port 5434 DB, port 8788 API, port 5174 coach-web).
#
# Usage: ./scripts/dev-test.sh

set -e

# Load test environment variables
if [ -f ".env.test" ]; then
  export $(grep -v '^#' .env.test | xargs)
fi

# Copy env vars to .dev.vars for wrangler (API server)
if [ -f ".env.test" ]; then
  cp .env.test apps/api/.dev.vars 2>/dev/null || true
fi

# Run API (port 8788) and coach-web (port 5174) concurrently
pnpm exec concurrently \
  --names "api,coach" \
  --prefix-colors "blue,green" \
  "pnpm --filter api exec wrangler dev --port 8788" \
  "VITE_API_URL=http://localhost:8788 pnpm --filter coach-web exec vite --port 5174"
