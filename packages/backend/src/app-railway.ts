import { RPCHandler } from '@orpc/server/fetch'
import { createAuth } from '@strenly/auth'
import { createDb } from '@strenly/database'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { BaseContext } from './lib/context'
import { env } from './lib/env'
import { router } from './procedures/router'

// Environment validated automatically by t3-env on import
// Application fails fast if any required env vars are missing

// Create database connection once at module load
// postgres-js handles connection pooling automatically
const db = createDb(env.DATABASE_URL)

// Create auth instance once at module load
const auth = createAuth(
  {
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: env.BETTER_AUTH_URL,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    ENVIRONMENT: env.ENVIRONMENT,
  },
  db,
)

const app = new Hono()

const TRUSTED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://strenly-coach-web.vercel.app',
  ...(env.ENVIRONMENT === 'production' ? ['https://app.strenly.com.ar', 'https://athlete.strenly.com.ar'] : []),
]

app.use(
  '*',
  cors({
    origin: TRUSTED_ORIGINS,
    allowHeaders: ['Content-Type', 'Authorization', 'X-Organization-Slug'],
    allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
)

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    runtime: 'railway',
  })
})

app.on(['POST', 'GET'], '/api/auth/*', async (c) => {
  return auth.handler(c.req.raw)
})

const rpcHandler = new RPCHandler(router)

app.use('/rpc/*', async (_c, next) => {
  if (env.ENVIRONMENT === 'development') {
    const latencyMs = Math.floor(Math.random() * 300) + 200
    await new Promise((resolve) => setTimeout(resolve, latencyMs))
  }
  await next()
})

app.use('/rpc/*', async (c, next) => {
  const context: BaseContext = {
    db,
    auth,
    headers: c.req.raw.headers,
    appUrl: env.APP_URL ?? 'http://localhost:3000',
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
