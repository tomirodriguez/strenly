#!/bin/bash
# Start just the API server
# This script runs only the API server for backend development

set -e

# Load environment variables from root .env
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Copy env vars to .dev.vars for Cloudflare apps
if [ -f ".env" ]; then
  cp .env apps/api/.dev.vars 2>/dev/null || true
fi

# Run API server
pnpm --filter backend dev
