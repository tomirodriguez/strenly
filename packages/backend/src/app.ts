import { RPCHandler } from '@orpc/server/fetch'
import { createAuth } from '@strenly/auth'
import { createDb } from '@strenly/database'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { BaseContext } from './lib/context'
import { router } from './procedures/router'

type Env = {
  DATABASE_URL: string
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  /** Dev-only: Simulated latency in milliseconds for API requests */
  DEV_LATENCY_MS?: string
}

const app = new Hono<{ Bindings: Env }>()

// Trusted origins for CORS
const TRUSTED_ORIGINS = ['http://localhost:5173', 'http://localhost:5174']

// Single CORS middleware for all routes
app.use(
  '*',
  cors({
    origin: TRUSTED_ORIGINS,
    allowHeaders: ['Content-Type', 'Authorization', 'X-Organization-Slug'],
    allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
)

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Better Auth handler - creates db/auth inline per request
app.on(['POST', 'GET'], '/api/auth/*', async (c) => {
  const db = createDb(c.env.DATABASE_URL)
  const auth = createAuth(
    {
      BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: c.env.BETTER_AUTH_URL,
      GOOGLE_CLIENT_ID: c.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: c.env.GOOGLE_CLIENT_SECRET,
    },
    db,
  )
  return auth.handler(c.req.raw)
})

// oRPC handler
const rpcHandler = new RPCHandler(router)

// Dev-only latency simulation middleware
app.use('/rpc/*', async (c, next) => {
  const latencyMs = c.env.DEV_LATENCY_MS ? parseInt(c.env.DEV_LATENCY_MS, 10) : 0
  if (latencyMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, latencyMs))
  }
  await next()
})

app.use('/rpc/*', async (c, next) => {
  const db = createDb(c.env.DATABASE_URL)
  const auth = createAuth(
    {
      BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: c.env.BETTER_AUTH_URL,
      GOOGLE_CLIENT_ID: c.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: c.env.GOOGLE_CLIENT_SECRET,
    },
    db,
  )

  const context: BaseContext = {
    db,
    auth,
    headers: c.req.raw.headers,
  }

  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: '/rpc',
    context,
  })

  if (matched) {
    return c.newResponse(response.body, response)
  }

  await next()
})

export { app }
export type AppType = typeof app
