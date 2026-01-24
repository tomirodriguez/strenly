/**
 * @strenly/database - Drizzle ORM schemas and client
 * Exports factory functions for Cloudflare Workers compatibility
 */

/**
 * Re-export drizzle-orm operators for type consistency
 * This ensures all packages use the same drizzle-orm instance
 */
export { and, asc, desc, eq, or, sql } from 'drizzle-orm'
export type { DbClient } from './client'
export { createDb } from './client'
