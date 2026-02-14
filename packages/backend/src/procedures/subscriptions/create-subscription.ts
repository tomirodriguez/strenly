import { createSubscriptionInputSchema, subscriptionSchema } from '@strenly/contracts/subscriptions/subscription'
import { createPlanRepository } from '../../infrastructure/repositories/plan.repository'
import { createSubscriptionRepository } from '../../infrastructure/repositories/subscription.repository'
import { logger } from '../../lib/logger'
import { sessionProcedure } from '../../lib/orpc'
import { makeCreateSubscription } from '../../use-cases/subscriptions/create-subscription'
import { mapPlanToOutput } from './map-plan-to-output'

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
      generateId: crypto.randomUUID,
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
          logger.error('Repository error', { error: result.error.message, procedure: 'createSubscription' })
          throw new Error('Internal error')
      }
    }

    const { subscription, plan } = result.value

    return {
      id: subscription.id,
      organizationId: subscription.organizationId,
      plan: mapPlanToOutput(plan),
      status: subscription.status,
      athleteCount: subscription.athleteCount,
      athleteLimit: plan.athleteLimit,
      currentPeriodStart: subscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      createdAt: subscription.createdAt.toISOString(),
    }
  })
