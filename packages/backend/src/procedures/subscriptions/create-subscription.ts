import { createSubscriptionInputSchema } from '@strenly/contracts/subscriptions'
import { subscriptionSchema } from '@strenly/contracts/subscriptions/subscription'
import { createPlanRepository } from '../../infrastructure/repositories/plan.repository'
import { createSubscriptionRepository } from '../../infrastructure/repositories/subscription.repository'
import { sessionProcedure } from '../../lib/orpc'
import { makeCreateSubscription } from '../../use-cases/subscriptions/create-subscription'

/**
 * Create a subscription for an organization during onboarding
 * Requires authentication but no organization context (user is creating their org)
 * Returns the created subscription
 */
export const createSubscription = sessionProcedure
  .errors({
    PLAN_NOT_FOUND: { message: 'Plan not found' },
    VALIDATION_ERROR: { message: 'Invalid subscription data' },
  })
  .input(createSubscriptionInputSchema)
  .output(subscriptionSchema)
  .handler(async ({ input, context, errors }) => {
    const createSubscriptionUseCase = makeCreateSubscription({
      subscriptionRepository: createSubscriptionRepository(context.db),
      planRepository: createPlanRepository(context.db),
    })

    const result = await createSubscriptionUseCase({
      organizationId: input.organizationId,
      planId: input.planId,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'plan_not_found':
          throw errors.PLAN_NOT_FOUND()
        case 'validation_error':
          throw errors.VALIDATION_ERROR()
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    const subscription = result.value

    // We need to fetch the plan details to return the full subscription output
    const planRepository = createPlanRepository(context.db)
    const planResult = await planRepository.findById(subscription.planId)

    if (planResult.isErr()) {
      throw errors.PLAN_NOT_FOUND()
    }

    const plan = planResult.value

    return {
      id: subscription.id,
      organizationId: subscription.organizationId,
      plan: {
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
      },
      status: subscription.status,
      athleteCount: subscription.athleteCount,
      athleteLimit: plan.athleteLimit,
      currentPeriodStart: subscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      createdAt: subscription.createdAt.toISOString(),
    }
  })
