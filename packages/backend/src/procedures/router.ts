import { exercises } from "./exercises";
import { health } from "./health/health";
import { subscriptions } from "./subscriptions";

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
	exercises,
	health,
	subscriptions,
};

export type Router = typeof router;
