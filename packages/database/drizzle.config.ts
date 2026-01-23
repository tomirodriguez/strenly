import { defineConfig } from 'drizzle-kit'

/**
 * Drizzle Kit configuration
 *
 * Uses DATABASE_URL for connection:
 * - Local: PostgreSQL via Docker
 * - Production: Neon PostgreSQL
 */
const databaseUrl = process.env.DATABASE_URL ?? ''

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required')
}

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
})
