import { hashPassword } from 'better-auth/crypto'
import { eq } from 'drizzle-orm'
import type { DbClient } from '../client'
import { accounts, members, organizations, users } from '../schema/auth'
import { plans } from '../schema/plans'
import { subscriptions } from '../schema/subscriptions'

/**
 * Test user seed data
 * Creates a complete test environment with user, organization, and subscription
 *
 * Test Credentials:
 * - Email: test@strenly.app
 * - Password: test123
 */

// Fixed IDs for consistent seeding (exported for use in other seeds)
export const SEED_USER_ID = 'user-seed-test-001'
export const SEED_ORGANIZATION_ID = 'org-seed-test-001'
export const SEED_ACCOUNT_ID = 'acc-seed-test-001'
export const SEED_MEMBER_ID = 'member-seed-test-001'
export const SEED_SUBSCRIPTION_ID = 'sub-seed-test-001'

/**
 * Seeds a test user with organization and subscription
 *
 * Creates:
 * - User: test@strenly.app / test123
 * - Organization: "Gimnasio Test" (slug: test)
 * - Member: Links user to organization as owner
 * - Account: Credential account for email/password login
 * - Subscription: Active subscription on Coach Pro plan
 */
export async function seedTestUser(db: DbClient): Promise<void> {
  console.log('Seeding test user and organization...')

  // Hash the password using Better Auth's algorithm
  const hashedPassword = await hashPassword('test123')

  // Delete existing seed data (in reverse order of dependencies)
  await db.delete(subscriptions).where(eq(subscriptions.id, SEED_SUBSCRIPTION_ID))
  await db.delete(members).where(eq(members.id, SEED_MEMBER_ID))
  await db.delete(accounts).where(eq(accounts.id, SEED_ACCOUNT_ID))
  await db.delete(organizations).where(eq(organizations.id, SEED_ORGANIZATION_ID))
  await db.delete(users).where(eq(users.id, SEED_USER_ID))

  // Create user
  await db.insert(users).values({
    id: SEED_USER_ID,
    name: 'Test Coach',
    email: 'test@strenly.app',
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  console.log('  Created user: test@strenly.app')

  // Create account (for email/password authentication)
  await db.insert(accounts).values({
    id: SEED_ACCOUNT_ID,
    accountId: SEED_USER_ID,
    providerId: 'credential',
    userId: SEED_USER_ID,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  console.log('  Created credential account')

  // Create organization
  await db.insert(organizations).values({
    id: SEED_ORGANIZATION_ID,
    name: 'Gimnasio Test',
    slug: 'test',
    logo: null,
    metadata: null,
    createdAt: new Date(),
  })
  console.log('  Created organization: Gimnasio Test (slug: test)')

  // Create member (link user to organization as owner)
  await db.insert(members).values({
    id: SEED_MEMBER_ID,
    organizationId: SEED_ORGANIZATION_ID,
    userId: SEED_USER_ID,
    role: 'owner',
    createdAt: new Date(),
    notificationPreferences: {
      workoutCompleted: true,
      prDetected: true,
      athleteInactive: true,
      programExpiring: true,
    },
  })
  console.log('  Linked user to organization as owner')

  // Get the Coach Pro plan for the subscription
  const coachProPlans = await db.select().from(plans).where(eq(plans.slug, 'coach-pro')).limit(1)
  const plan = coachProPlans[0]

  if (!plan) {
    console.warn('  Warning: Coach Pro plan not found. Skipping subscription creation.')
    console.warn('  Run the seed again after plans are seeded.')
  } else {
    const now = new Date()
    const oneYearFromNow = new Date(now)
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

    // Create subscription
    await db.insert(subscriptions).values({
      id: SEED_SUBSCRIPTION_ID,
      organizationId: SEED_ORGANIZATION_ID,
      planId: plan.id,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: oneYearFromNow,
      athleteCount: 0,
      createdAt: now,
      updatedAt: now,
    })
    console.log(`  Created active subscription on plan: ${plan.name}`)
  }

  console.log('Test user seed complete!')
  console.log('')
  console.log('Test Credentials:')
  console.log('  Email: test@strenly.app')
  console.log('  Password: test123')
  console.log('  Organization: Gimnasio Test (slug: test)')
}
