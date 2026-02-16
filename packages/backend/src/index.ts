/**
 * @strenly/backend - Hono API with oRPC procedures
 * Exports the main app and router types
 */

// Export RouterClient type for frontend consumption
export type { RouterClient } from '@orpc/server'
export { type AppType, app } from './app'
export { app as railwayApp } from './app-railway'
export { env } from './lib/env'
export { authProcedure, publicProcedure, sessionProcedure } from './lib/orpc'
export { type Router, router } from './procedures/router'

// Default export for Cloudflare Workers
import { app } from './app'
export default app
