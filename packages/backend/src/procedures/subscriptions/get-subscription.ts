import { getSubscriptionOutputSchema } from '@strenly/contracts/subscriptions/subscription'
import { createPlanRepository } from '../../infrastructure/repositories/plan.repository'
import { createSubscriptionRepository } from '../../infrastructure/repositories/subscription.repository'
import { authProcedure } from '../../lib/orpc'
import { makeGetSubscription } from '../../use-cases/subscriptions/get-subscription'

/**
 * Get current organization's subscription
 * Requires authentication and organization context
 * Returns subscription with full plan details
 */
export const getSubscription = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to view subscription' },
    SUBSCRIPTION_NOT_FOUND: { message: 'Subscription not found' },
    PLAN_NOT_FOUND: { message: 'Plan not found' },
  })
  .output(getSubscriptionOutputSchema)
  .handler(async ({ context, errors }) => {
    const getSubscriptionUseCase = makeGetSubscription({
      subscriptionRepository: createSubscriptionRepository(context.db),
      planRepository: createPlanRepository(context.db),
    })

    const result = await getSubscriptionUseCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
    })

    if (result.isErr()) {
      // Exhaustive error mapping
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN()
        case 'subscription_not_found':
          throw errors.SUBSCRIPTION_NOT_FOUND()
        case 'plan_not_found':
          throw errors.PLAN_NOT_FOUND()
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    const { subscription, plan } = result.value

    return {
      subscription: {
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
      },
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
    }
  })
