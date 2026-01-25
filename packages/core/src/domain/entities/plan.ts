import { err, ok, type Result } from 'neverthrow'

// Domain types (not Zod - pure TypeScript)
export type OrganizationType = 'coach_solo' | 'gym'

export type PlanFeatures = {
  templates: boolean
  analytics: boolean
  exportData: boolean
  customExercises: boolean
  multipleCoaches: boolean
}

export type Plan = {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly organizationType: OrganizationType
  readonly athleteLimit: number
  readonly coachLimit: number | null // null = unlimited
  readonly features: PlanFeatures
  readonly priceMonthly: number // cents
  readonly priceYearly: number // cents
  readonly isActive: boolean
}

export type PlanError =
  | { type: 'INVALID_NAME'; message: string }
  | { type: 'INVALID_SLUG'; message: string }
  | { type: 'INVALID_ATHLETE_LIMIT'; message: string }
  | { type: 'INVALID_COACH_LIMIT'; message: string }
  | { type: 'INVALID_PRICE'; message: string }
  | { type: 'INVALID_YEARLY_DISCOUNT'; message: string }

type CreatePlanInput = {
  id: string
  name: string
  slug: string
  organizationType: OrganizationType
  athleteLimit: number
  coachLimit: number | null
  features: PlanFeatures
  priceMonthly: number
  priceYearly: number
  isActive: boolean
}

export function createPlan(input: CreatePlanInput): Result<Plan, PlanError> {
  // Validate name
  if (!input.name || input.name.trim().length < 2) {
    return err({ type: 'INVALID_NAME', message: 'Plan name must be at least 2 characters' })
  }
  if (input.name.length > 50) {
    return err({ type: 'INVALID_NAME', message: 'Plan name must not exceed 50 characters' })
  }

  // Validate slug
  const slugRegex = /^[a-z0-9-]+$/
  if (!slugRegex.test(input.slug)) {
    return err({ type: 'INVALID_SLUG', message: 'Slug must be lowercase alphanumeric with hyphens' })
  }

  // Validate athlete limit
  if (input.athleteLimit < 1) {
    return err({ type: 'INVALID_ATHLETE_LIMIT', message: 'Athlete limit must be at least 1' })
  }
  if (input.athleteLimit > 10000) {
    return err({ type: 'INVALID_ATHLETE_LIMIT', message: 'Athlete limit cannot exceed 10000' })
  }

  // Validate coach limit (null means unlimited)
  if (input.coachLimit !== null && input.coachLimit < 1) {
    return err({ type: 'INVALID_COACH_LIMIT', message: 'Coach limit must be at least 1 or null for unlimited' })
  }

  // Validate prices (must be non-negative)
  if (input.priceMonthly < 0) {
    return err({ type: 'INVALID_PRICE', message: 'Monthly price cannot be negative' })
  }
  if (input.priceYearly < 0) {
    return err({ type: 'INVALID_PRICE', message: 'Yearly price cannot be negative' })
  }

  // Validate yearly discount makes sense (yearly should be <= 12 * monthly)
  if (input.priceMonthly > 0 && input.priceYearly > input.priceMonthly * 12) {
    return err({
      type: 'INVALID_YEARLY_DISCOUNT',
      message: 'Yearly price should not exceed 12 months of monthly price',
    })
  }

  return ok({
    id: input.id,
    name: input.name.trim(),
    slug: input.slug,
    organizationType: input.organizationType,
    athleteLimit: input.athleteLimit,
    coachLimit: input.coachLimit,
    features: input.features,
    priceMonthly: input.priceMonthly,
    priceYearly: input.priceYearly,
    isActive: input.isActive,
  })
}

// Helper to check if athlete can be added to a plan
export function canAddAthlete(plan: Plan, currentCount: number): boolean {
  return currentCount < plan.athleteLimit
}

// Helper to check feature access
export function hasFeature(plan: Plan, feature: keyof PlanFeatures): boolean {
  return plan.features[feature]
}
