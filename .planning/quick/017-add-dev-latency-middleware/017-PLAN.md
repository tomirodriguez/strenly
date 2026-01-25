# Quick Task 017: Add Dev Latency Middleware

## Goal

Add a development-only latency middleware to simulate network latency on API requests.

## Approach

Add the latency at the Hono middleware level (in `app.ts`) rather than oRPC level because:
1. It simulates real network latency more accurately (affects all API endpoints)
2. The environment variable is accessible at the Hono handler level via `c.env`
3. Cloudflare Workers use environment bindings, not `process.env`

## Tasks

### Task 1: Add DEV_LATENCY_MS to Env type and wrangler.jsonc

**Files:**
- `packages/backend/src/app.ts` - Add `DEV_LATENCY_MS` to Env type
- `apps/api/wrangler.jsonc` - Add dev latency env var (commented for production safety)

**Changes:**
1. Add `DEV_LATENCY_MS?: string` to Env type (optional, only set in dev)
2. Add commented config in wrangler.jsonc

### Task 2: Add dev latency middleware to Hono

**Files:**
- `packages/backend/src/app.ts` - Add middleware before RPC handler

**Implementation:**
```typescript
// Dev-only latency simulation middleware
app.use('/rpc/*', async (c, next) => {
  const latencyMs = c.env.DEV_LATENCY_MS ? parseInt(c.env.DEV_LATENCY_MS, 10) : 0
  if (latencyMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, latencyMs))
  }
  await next()
})
```

The middleware:
- Only applies to `/rpc/*` routes (API calls)
- Reads `DEV_LATENCY_MS` from environment
- Adds delay only if value > 0
- Runs before the oRPC handler

## Verification

1. Set `DEV_LATENCY_MS=500` in `.dev.vars`
2. Start dev server
3. Make API call
4. Observe ~500ms added latency in network tab
