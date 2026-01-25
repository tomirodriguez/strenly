/**
 * Database seed script
 * Run with: pnpm db:seed
 */
import { createDb } from '../src/client'
import { seed } from '../src/seed'

async function main() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('Error: DATABASE_URL environment variable is required')
    process.exit(1)
  }

  const db = createDb(databaseUrl)

  try {
    await seed(db)
    console.log('\nSeed completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

main()
