import { serve } from '@hono/node-server'
import { env, railwayApp } from '@strenly/backend'

console.log('🚂 Starting Railway server...')
console.log(`📊 Environment: ${env.ENVIRONMENT}`)
console.log(`🔌 Port: ${env.PORT}`)

serve({
  fetch: railwayApp.fetch,
  port: env.PORT,
  hostname: '0.0.0.0', // Required for Railway
})

console.log(`✅ Server running at http://0.0.0.0:${env.PORT}`)
