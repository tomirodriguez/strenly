#!/bin/bash
# Start coach-web and API server concurrently
# This script runs both the coach web app and the API server together

set -e

# Run API and coach-web concurrently
pnpm exec concurrently \
  --names "api,coach" \
  --prefix-colors "blue,green" \
  "pnpm --filter api dev" \
  "pnpm --filter coach-web dev"
