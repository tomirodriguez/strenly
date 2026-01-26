/**
 * Data migration runner script
 * Transforms existing data to new series-based structure
 *
 * Run with: npx tsx scripts/migrate-to-series.ts
 */
import { createDb } from '../src/client'
import { migrateToSeriesStructure, verifyMigration } from '../src/seed/migrate-to-series'

async function main() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('Error: DATABASE_URL environment variable is required')
    process.exit(1)
  }

  const db = createDb(databaseUrl)

  try {
    // Run migration
    await migrateToSeriesStructure(db)

    // Verify results
    await verifyMigration(db)

    console.log('\nMigration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

main()
