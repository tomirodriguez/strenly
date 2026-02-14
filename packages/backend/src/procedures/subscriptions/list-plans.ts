import { listPlansInputSchema, listPlansOutputSchema } from '@strenly/contracts/subscriptions/plan'
import { createPlanRepository } from '../../infrastructure/repositories/plan.repository'
import { logger } from '../../lib/logger'
import { publicProcedure } from '../../lib/orpc'
import { makeListPlans } from '../../use-cases/subscriptions/list-plans'

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
    const listPlansUseCase = makeListPlans({
      planRepository: createPlanRepository(context.db),
    })

    const result = await listPlansUseCase({
      organizationType: input?.organizationType,
    })

    if (result.isErr()) {
      logger.error('Failed to list plans', { error: result.error.message, procedure: 'listPlans' })
      throw errors.INTERNAL_ERROR()
    }

    return {
      items: result.value.items.map((p) => ({
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
