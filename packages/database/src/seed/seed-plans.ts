import type { DbClient } from '../client'
import { plans } from '../schema/plans'
import { subscriptions } from '../schema/subscriptions'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required')
  process.exit(1)
}

const defaultPlans = [
  // Coach Solo Plans
  {
    id: crypto.randomUUID(),
    name: 'Coach Starter',
    slug: 'coach-starter',
    organizationType: 'coach_solo' as const,
    athleteLimit: 10,
    coachLimit: 1,
    features: {
      templates: true,
      analytics: false,
      exportData: false,
      customExercises: true,
      multipleCoaches: false,
    },
    priceMonthly: 0, // Free tier
    priceYearly: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: crypto.randomUUID(),
    name: 'Coach Pro',
    slug: 'coach-pro',
    organizationType: 'coach_solo' as const,
    athleteLimit: 50,
    coachLimit: 1,
    features: {
      templates: true,
      analytics: true,
      exportData: true,
      customExercises: true,
      multipleCoaches: false,
    },
    priceMonthly: 2900, // $29/mo
    priceYearly: 29000, // $290/yr (~17% discount)
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Gym Plans
  {
    id: crypto.randomUUID(),
    name: 'Gym Starter',
    slug: 'gym-starter',
    organizationType: 'gym' as const,
    athleteLimit: 50,
    coachLimit: 3,
    features: {
      templates: true,
      analytics: false,
      exportData: false,
      customExercises: true,
      multipleCoaches: true,
    },
    priceMonthly: 4900, // $49/mo
    priceYearly: 49000, // $490/yr
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: crypto.randomUUID(),
    name: 'Gym Pro',
    slug: 'gym-pro',
    organizationType: 'gym' as const,
    athleteLimit: 200,
    coachLimit: 10,
    features: {
      templates: true,
      analytics: true,
      exportData: true,
      customExercises: true,
      multipleCoaches: true,
    },
    priceMonthly: 9900, // $99/mo
    priceYearly: 99000, // $990/yr
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: crypto.randomUUID(),
    name: 'Gym Enterprise',
    slug: 'gym-enterprise',
    organizationType: 'gym' as const,
    athleteLimit: 1000,
    coachLimit: null, // Unlimited coaches
    features: {
      templates: true,
      analytics: true,
      exportData: true,
      customExercises: true,
      multipleCoaches: true,
    },
    priceMonthly: 19900, // $199/mo
    priceYearly: 199000, // $1990/yr
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export async function seedPlans(db: DbClient): Promise<void> {
  console.log('Seeding subscription plans...')

  // Delete subscriptions first (FK constraint: subscriptions reference plans)
  await db.delete(subscriptions)

  // Delete existing plans (for clean re-seed)
  await db.delete(plans)

  // Insert new plans
  await db.insert(plans).values(defaultPlans)

  console.log(`Seeded ${defaultPlans.length} subscription plans:`)
  for (const plan of defaultPlans) {
    console.log(`  - ${plan.name} (${plan.organizationType}): ${plan.athleteLimit} athletes`)
  }
}
