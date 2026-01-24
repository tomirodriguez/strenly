import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

/**
 * Creates a database client using postgres-js.
 * Works with local Docker PostgreSQL and any standard PostgreSQL connection.
 *
 * @param connectionString - PostgreSQL connection string
 * @returns Drizzle database client
 */
export function createDb(connectionString: string) {
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to create database client')
  }

  const sql = postgres(connectionString)
  return drizzle({ client: sql, schema })
}

// biome-ignore lint/suspicious/noExplicitAny: Required for database type compatibility
export type DbClient = PostgresJsDatabase<any>
