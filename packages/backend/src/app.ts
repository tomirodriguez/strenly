import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { RPCHandler } from '@orpc/server/fetch'
import { router } from './procedures/router'
import { createDb } from '@strenly/database'
import { createAuth } from '@strenly/auth'
import type { BaseContext } from './lib/context'

type Env = {
  DATABASE_URL: string
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
}

type Variables = {
  db: ReturnType<typeof createDb>
  auth: ReturnType<typeof createAuth>
}

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// CORS must be first - allows credentials for cookie-based auth
app.use(
  '/api/*',
  cors({
    origin: (origin) => {
      // Allow localhost for development
      if (origin.includes('localhost')) return origin
      // Allow production domains
      if (origin.endsWith('.strenly.com.ar')) return origin
      return null
    },
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization', 'X-Organization-Slug'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
  })
)

// CORS for RPC endpoints
app.use(
  '/rpc/*',
  cors({
    origin: (origin) => {
      // Allow localhost for development
      if (origin.includes('localhost')) return origin
      // Allow production domains
      if (origin.endsWith('.strenly.com.ar')) return origin
      return null
    },
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization', 'X-Organization-Slug'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
  })
)

// Infrastructure middleware - creates db and auth per request
app.use('/api/*', async (c, next) => {
  const db = createDb(c.env.DATABASE_URL)
  c.set('db', db)

  const auth = createAuth(
    {
      BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: c.env.BETTER_AUTH_URL,
      GOOGLE_CLIENT_ID: c.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: c.env.GOOGLE_CLIENT_SECRET,
    },
    db
  )
  c.set('auth', auth)

  await next()
})

// Infrastructure middleware for RPC endpoints
app.use('/rpc/*', async (c, next) => {
  const db = createDb(c.env.DATABASE_URL)
  c.set('db', db)

  const auth = createAuth(
    {
      BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: c.env.BETTER_AUTH_URL,
      GOOGLE_CLIENT_ID: c.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: c.env.GOOGLE_CLIENT_SECRET,
    },
    db
  )
  c.set('auth', auth)

  await next()
})

// Mount Better-Auth handler
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  const auth = c.get('auth')
  return auth.handler(c.req.raw)
})

// Mount oRPC handler
const rpcHandler = new RPCHandler(router)

app.use('/rpc/*', async (c) => {
  const db = c.get('db')
  const auth = c.get('auth')

  const context: BaseContext = {
    db,
    auth,
    headers: c.req.raw.headers,
  }

  const response = await rpcHandler.handle(c.req.raw, {
    prefix: '/rpc',
    context,
  })

  return response ?? c.notFound()
})

export { app }
export type AppType = typeof app
