# Quick Task 017: Add Dev Latency Middleware - Summary

## Completed

Added development-only latency simulation middleware to API requests.

## Changes

### `packages/backend/src/app.ts`
- Added `DEV_LATENCY_MS?: string` to Env type
- Added latency middleware before oRPC handler on `/rpc/*` routes

### `apps/api/wrangler.jsonc`
- Added comment documenting the `DEV_LATENCY_MS` env var

## How to Use

Set `DEV_LATENCY_MS` in `.dev.vars` (not committed to repo):

```
DEV_LATENCY_MS=500
```

This adds 500ms delay to all API calls, useful for:
- Testing loading states and skeletons
- Ensuring UI handles slow network conditions
- Reproducing race conditions

## Verification

1. Create/edit `apps/api/.dev.vars` with `DEV_LATENCY_MS=500`
2. Run `pnpm dev`
3. Navigate to any page making API calls
4. Observe ~500ms delay in network tab

## Technical Notes

- Middleware runs only on `/rpc/*` routes (API calls only)
- Uses `parseInt` with fallback to 0 if not set
- No delay when `DEV_LATENCY_MS` is unset or 0
- Never set this in production wrangler.jsonc - use `.dev.vars` only
