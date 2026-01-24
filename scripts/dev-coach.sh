#!/bin/bash
# Start coach-web and API server concurrently
# This script runs both the coach web app and the API server together

set -e

# Load environment variables from root .env
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Copy env vars to .dev.vars for Cloudflare apps
if [ -f ".env" ]; then
  cp .env apps/api/.dev.vars 2>/dev/null || true
fi

# Run API and coach-web concurrently
pnpm exec concurrently \
  --names "api,coach" \
  --prefix-colors "blue,green" \
  "pnpm --filter api dev" \
  "pnpm --filter coach-web dev"
