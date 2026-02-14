import type { Plan } from '@strenly/core/domain/entities/plan'
import type { Subscription } from '@strenly/core/domain/entities/subscription'
import { createSubscription as createSubscriptionEntity } from '@strenly/core/domain/entities/subscription'
import type { PlanRepositoryPort } from '@strenly/core/ports/plan-repository.port'
import type { SubscriptionRepositoryPort } from '@strenly/core/ports/subscription-repository.port'
import { errAsync, okAsync, type ResultAsync } from 'neverthrow'

export type CreateSubscriptionInput = {
  organizationId: string
  planId: string
}

export type CreateSubscriptionResult = {
  subscription: Subscription
  plan: Plan
}

export type CreateSubscriptionError =
  | { type: 'plan_not_found'; planId: string }
  | { type: 'validation_error'; message: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  subscriptionRepository: SubscriptionRepositoryPort
  planRepository: PlanRepositoryPort
  generateId: () => string
}

/**
 * Create a subscription for an organization during onboarding.
 *
 * PUBLIC: No authorization needed -- this is called during onboarding
 * when the user is creating their own organization. The procedure-level
 * session guard ensures the caller is authenticated.
 */
export const makeCreateSubscription =
  (deps: Dependencies) =>
  (input: CreateSubscriptionInput): ResultAsync<CreateSubscriptionResult, CreateSubscriptionError> => {
    // 1. Validate plan exists
    return deps.planRepository
      .findById(input.planId)
      .mapErr((error): CreateSubscriptionError => ({ type: 'repository_error', message: error.message }))
      .andThen((plan) => {
        // Check if plan was found
        if (plan === null) {
          return errAsync<CreateSubscriptionResult, CreateSubscriptionError>({
            type: 'plan_not_found',
            planId: input.planId,
          })
        }

        // 2. Create subscription entity with 30-day period
        const now = new Date()
        const periodEnd = new Date(now)
        periodEnd.setDate(periodEnd.getDate() + 30)

        const subscriptionResult = createSubscriptionEntity({
          id: deps.generateId(),
          organizationId: input.organizationId,
          planId: plan.id,
          status: 'active',
          athleteCount: 0,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          createdAt: now,
        })

        if (subscriptionResult.isErr()) {
          return errAsync<CreateSubscriptionResult, CreateSubscriptionError>({
            type: 'validation_error',
            message: subscriptionResult.error.message,
          })
        }

        // 3. Persist via repository
        return deps.subscriptionRepository
          .create(subscriptionResult.value)
          .mapErr((error): CreateSubscriptionError => {
            const message =
              error.type === 'DATABASE_ERROR' ? error.message : `Organization ${error.organizationId} not found`
            return { type: 'repository_error', message }
          })
          .andThen((subscription) => okAsync({ subscription, plan }))
      })
  }
