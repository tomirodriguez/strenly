import {
  createSubscription as createSubscriptionEntity,
  type PlanRepositoryPort,
  type Subscription,
  type SubscriptionRepositoryPort,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

type CreateSubscriptionInput = {
  organizationId: string
  planId: string
}

type CreateSubscriptionError =
  | { type: 'plan_not_found'; planId: string }
  | { type: 'validation_error'; message: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  subscriptionRepository: SubscriptionRepositoryPort
  planRepository: PlanRepositoryPort
}

/**
 * Create a subscription for an organization during onboarding.
 *
 * No authorization check needed as this is called during onboarding
 * when the user is creating their own organization.
 */
export function makeCreateSubscription(deps: Dependencies) {
  return (input: CreateSubscriptionInput): ResultAsync<Subscription, CreateSubscriptionError> => {
    // 1. Validate plan exists
    return deps.planRepository
      .findById(input.planId)
      .mapErr((error) => ({ type: 'repository_error', message: error.message }) as const)
      .andThen((plan) => {
        // Check if plan was found
        if (plan === null) {
          return errAsync({ type: 'plan_not_found', planId: input.planId } as const)
        }

        // 2. Create subscription entity with 30-day period
        const now = new Date()
        const periodEnd = new Date(now)
        periodEnd.setDate(periodEnd.getDate() + 30)

        const subscriptionResult = createSubscriptionEntity({
          id: crypto.randomUUID(),
          organizationId: input.organizationId,
          planId: plan.id,
          status: 'active',
          athleteCount: 0,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          createdAt: now,
        })

        if (subscriptionResult.isErr()) {
          return errAsync({ type: 'validation_error', message: subscriptionResult.error.message } as const)
        }

        // 3. Persist via repository
        return deps.subscriptionRepository.create(subscriptionResult.value).mapErr((error) => {
          const message =
            error.type === 'DATABASE_ERROR' ? error.message : `Organization ${error.organizationId} not found`
          return { type: 'repository_error', message } as const
        })
      })
  }
}
