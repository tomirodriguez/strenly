import type { DbClient } from '../client'
import { seedExercises } from './exercises'
import { seedMuscleGroups } from './muscle-groups'
import { seedPlans } from './seed-plans'

/**
 * Main seed function
 * Seeds all database tables in correct dependency order
 *
 * @param db - Database client instance
 */
export async function seed(db: DbClient): Promise<void> {
  console.log('Starting database seed...\n')

  await seedPlans(db)

  // Seed in order (muscle groups before exercises due to FK dependency)
  await seedMuscleGroups(db)
  await seedExercises(db)

  console.log('\nDatabase seed complete!')
}

// Re-export individual seed functions for granular use
export { seedExercises } from './exercises'
export { seedMuscleGroups } from './muscle-groups'
