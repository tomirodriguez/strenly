import { neon } from '@neondatabase/serverless'
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { drizzle } from 'drizzle-orm/neon-http'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

/**
 * Database Client Configuration
 *
 * Uses @neondatabase/serverless for all environments:
 * - Production: Connects to Neon cloud via HTTPS
 * - Local: Connects to PostgreSQL via Docker
 *
 * @param connectionString - Database connection URL
 * @returns Configured Drizzle database client
 */
export const createDb = (connectionString: string) => {
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to create database client')
  }

  const sql = neon(connectionString)
  return drizzle(sql)
}

/**
 * Database client type
 * Union type allows both Neon HTTP (production) and postgres.js (testing) clients
 * Both share compatible query builder interfaces
 */
// biome-ignore lint/suspicious/noExplicitAny: Required for database type compatibility between drivers
export type DbClient = NeonHttpDatabase<any> | PostgresJsDatabase<any>
