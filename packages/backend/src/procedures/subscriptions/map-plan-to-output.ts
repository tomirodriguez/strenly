import type { Plan } from '@strenly/core/domain/entities/plan'

/**
 * Shared helper: Map Plan domain entity to contract output
 */
export function mapPlanToOutput(plan: Plan) {
  return {
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    organizationType: plan.organizationType,
    athleteLimit: plan.athleteLimit,
    coachLimit: plan.coachLimit,
    features: plan.features,
    priceMonthly: plan.priceMonthly,
    priceYearly: plan.priceYearly,
    isActive: plan.isActive,
  }
}
