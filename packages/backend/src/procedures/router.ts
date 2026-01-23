import { health } from "./health/health";

/**
 * Main oRPC router
 * Aggregates all procedure groups for the API
 *
 * Auth and organization endpoints are handled directly by Better-Auth at /api/auth/*
 * Only custom business logic procedures (subscriptions, etc.) go through oRPC.
 *
 * In oRPC, a router is a plain object with procedures.
 * The RPCHandler handles routing based on the object keys.
 */
export const router = {
	health,
	// Future custom procedures:
	// subscriptions: subscriptionsRouter,
};

export type Router = typeof router;
