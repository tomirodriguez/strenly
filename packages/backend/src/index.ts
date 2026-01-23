/**
 * @strenly/backend - Hono API with oRPC procedures
 * Exports the main app and router types
 */

export { type AppType, app } from "./app";
export { authProcedure, publicProcedure, sessionProcedure } from "./lib/orpc";
export { type Router, router } from "./procedures/router";
