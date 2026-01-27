import type { DbClient } from '../client'
import { seedAthletesAndPrograms } from './athletes-programs'
import { seedExercises } from './exercises'
import { seedMuscleGroups } from './muscle-groups'
import { seedPlans } from './seed-plans'
import { seedTestUser } from './test-user'

/**
 * Main seed function
 * Seeds all database tables in correct dependency order
 *
 * @param db - Database client instance
 */
export async function seed(db: DbClient): Promise<void> {
  console.log('Starting database seed...\n')

  // 1. Seed plans first (required for subscriptions)
  await seedPlans(db)

  // 2. Seed test user, organization, and subscription
  await seedTestUser(db)

  // 3. Seed in order (muscle groups before exercises due to FK dependency)
  await seedMuscleGroups(db)
  await seedExercises(db)

  // 4. Seed athletes and programs for workout logging testing
  // Uses the organization created by seedTestUser
  await seedAthletesAndPrograms(db)

  console.log('\nDatabase seed complete!')
}

// Re-export individual seed functions for granular use
export { SEED_ORGANIZATION_ID, seedAthletesAndPrograms } from './athletes-programs'
export { seedExercises } from './exercises'
export { seedMuscleGroups } from './muscle-groups'
export { SEED_USER_ID, seedTestUser } from './test-user'
