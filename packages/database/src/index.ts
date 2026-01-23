/**
 * @strenly/database - Drizzle ORM schemas and client
 * Exports factory functions for Cloudflare Workers compatibility
 */

export type { DbClient } from "./client";
export { createDb } from "./client";

/**
 * Re-export drizzle-orm operators for type consistency
 * This ensures all packages use the same drizzle-orm instance
 */
export { eq, and, or, sql, desc, asc } from "drizzle-orm";
