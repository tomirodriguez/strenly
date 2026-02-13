import { listPlansInputSchema, listPlansOutputSchema } from '@strenly/contracts/subscriptions/plan'
import { createPlanRepository } from '../../infrastructure/repositories/plan.repository'
import { publicProcedure } from '../../lib/orpc'

/**
 * List available subscription plans
 * Public endpoint - no authentication required
 * Can filter by organization type (coach_solo or gym)
 */
export const listPlans = publicProcedure
  .errors({
    INTERNAL_ERROR: { message: 'Failed to load subscription plans' },
  })
  .input(listPlansInputSchema)
  .output(listPlansOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const planRepository = createPlanRepository(context.db)

    const result = await planRepository.findAll({
      organizationType: input?.organizationType,
      activeOnly: true,
      limit: 100, // Plans are typically few, fetch all
      offset: 0,
    })

    if (result.isErr()) {
      // Log and throw typed error for public endpoint
      console.error('Failed to list plans:', result.error)
      throw errors.INTERNAL_ERROR()
    }

    return {
      plans: result.value.items.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        organizationType: p.organizationType,
        athleteLimit: p.athleteLimit,
        coachLimit: p.coachLimit,
        features: p.features,
        priceMonthly: p.priceMonthly,
        priceYearly: p.priceYearly,
        isActive: p.isActive,
      })),
      totalCount: result.value.totalCount,
    }
  })
