import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

/**
 * Creates a database client using postgres-js.
 * Works with local Docker PostgreSQL and any standard PostgreSQL connection.
 *
 * Connection pooling is configured for Railway (long-running Node.js process):
 * - max: 10 connections
 * - idle_timeout: 20 seconds
 * - connect_timeout: 10 seconds
 *
 * @param connectionString - PostgreSQL connection string
 * @returns Drizzle database client
 */
export function createDb(connectionString: string) {
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to create database client')
  }

  const sql = postgres(connectionString, {
    max: 10, // Connection pool size
    idle_timeout: 20, // Seconds before idle connection closes
    connect_timeout: 10, // Connection timeout
  })

  return drizzle({ client: sql, schema })
}

// biome-ignore lint/suspicious/noExplicitAny: Required for database type compatibility
export type DbClient = PostgresJsDatabase<any>
