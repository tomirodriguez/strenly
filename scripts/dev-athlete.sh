#!/bin/bash
# Start athlete-pwa and API server concurrently
# This script runs both the athlete PWA and the API server together

set -e

# Load environment variables from root .env
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Copy env vars to .dev.vars for Railway apps
if [ -f ".env" ]; then
  cp .env apps/api/.dev.vars 2>/dev/null || true
fi

# Run API and athlete-pwa concurrently
pnpm exec concurrently \
  --names "api,athlete" \
  --prefix-colors "blue,magenta" \
  "pnpm --filter api dev" \
  "pnpm --filter athlete-pwa dev"
