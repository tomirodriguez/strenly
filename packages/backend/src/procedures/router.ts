import { health } from './health/health'

/**
 * Main oRPC router
 * Aggregates all procedure groups for the API
 *
 * In oRPC, a router is a plain object with procedures.
 * The RPCHandler handles routing based on the object keys.
 */
export const router = {
  health,
  // Future procedure groups will be added here:
  // auth: authRouter,
  // organizations: organizationsRouter,
  // programs: programsRouter,
  // etc.
}

export type Router = typeof router
