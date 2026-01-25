# Quick Task 017: Add Dev Latency Middleware - Summary

## Completed

Added development-only latency simulation middleware to API requests.

## Changes

### `packages/backend/src/app.ts`
- Added latency middleware before oRPC handler on `/rpc/*` routes
- Random delay 200-500ms when `BETTER_AUTH_URL` contains "localhost"

## How It Works

No configuration needed. The middleware automatically:
- Detects dev environment via `BETTER_AUTH_URL.includes('localhost')`
- Adds random 200-500ms delay to all `/rpc/*` API calls
- Does nothing in production (no localhost in URL)

Useful for:
- Testing loading states and skeletons
- Ensuring UI handles slow network conditions
- Reproducing race conditions

## Verification

1. Run `pnpm dev`
2. Navigate to any page making API calls
3. Observe 200-500ms random delay in network tab
