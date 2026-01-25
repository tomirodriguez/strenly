# Quick Task 017: Add Dev Latency Middleware

## Goal

Add a development-only latency middleware to simulate network latency on API requests.

## Approach

Add random latency (200-500ms) at the Hono middleware level, detecting dev environment by checking if `BETTER_AUTH_URL` contains "localhost".

## Tasks

### Task 1: Add dev latency middleware to Hono

**Files:**
- `packages/backend/src/app.ts` - Add middleware before RPC handler

**Implementation:**
```typescript
// Dev-only: random latency 200-500ms to simulate network conditions
app.use('/rpc/*', async (c, next) => {
  const isDev = c.env.BETTER_AUTH_URL.includes('localhost')
  if (isDev) {
    const latencyMs = Math.floor(Math.random() * 300) + 200
    await new Promise((resolve) => setTimeout(resolve, latencyMs))
  }
  await next()
})
```

The middleware:
- Only applies to `/rpc/*` routes (API calls)
- Detects dev by checking BETTER_AUTH_URL for "localhost"
- Adds random delay 200-500ms only in dev
- No configuration needed - works automatically

## Verification

1. Start dev server (`pnpm dev`)
2. Make API calls
3. Observe 200-500ms latency in network tab
