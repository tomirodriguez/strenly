/**
 * @strenly/backend - Hono API with oRPC procedures
 * Exports the main app and router types
 */

export { app, type AppType } from './app'
export { router, type Router } from './procedures/router'
export { publicProcedure, sessionProcedure, authProcedure } from './lib/orpc'
