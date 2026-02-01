import {
  hasPermission,
  type OrganizationContext,
  type Plan,
  type PlanRepositoryPort,
  type Role,
  type Subscription,
  type SubscriptionRepositoryPort,
} from '@strenly/core'
import { errAsync, okAsync, type ResultAsync } from 'neverthrow'

export type GetSubscriptionInput = OrganizationContext & {
  memberRole: Role
}

export type GetSubscriptionResult = {
  subscription: Subscription
  plan: Plan
}

export type GetSubscriptionError =
  | { type: 'forbidden'; message: string }
  | { type: 'subscription_not_found'; organizationId: string }
  | { type: 'plan_not_found'; planId: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  subscriptionRepository: SubscriptionRepositoryPort
  planRepository: PlanRepositoryPort
}

export const makeGetSubscription =
  (deps: Dependencies) =>
  (input: GetSubscriptionInput): ResultAsync<GetSubscriptionResult, GetSubscriptionError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'billing:read')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to view subscription',
      })
    }

    // 2. Get subscription
    return deps.subscriptionRepository
      .findByOrganizationId(input)
      .mapErr((e): GetSubscriptionError => {
        if (e.type === 'NOT_FOUND') {
          return { type: 'subscription_not_found', organizationId: input.organizationId }
        }
        return { type: 'repository_error', message: e.message }
      })
      .andThen((subscription) =>
        // 3. Get plan
        deps.planRepository
          .findById(subscription.planId)
          .mapErr((e): GetSubscriptionError => ({ type: 'repository_error', message: e.message }))
          .andThen((plan) => {
            // Check if plan was found
            if (plan === null) {
              return errAsync({ type: 'plan_not_found', planId: subscription.planId } as GetSubscriptionError)
            }
            return okAsync({ subscription, plan })
          }),
      )
  }
