import { authRouter } from "./auth";
import { health } from "./health/health";
import { organizationsRouter } from "./organizations";

/**
 * Main oRPC router
 * Aggregates all procedure groups for the API
 *
 * In oRPC, a router is a plain object with procedures.
 * The RPCHandler handles routing based on the object keys.
 */
export const router = {
	health,
	auth: authRouter,
	organizations: organizationsRouter,
};

export type Router = typeof router;
