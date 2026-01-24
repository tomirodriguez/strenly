import {
  hasFeature,
  hasPermission,
  type OrganizationContext,
  type PlanFeatures,
  type PlanRepositoryPort,
  type Role,
  type SubscriptionRepositoryPort,
} from '@strenly/core'
import { errAsync, okAsync, type ResultAsync } from 'neverthrow'

export type CheckFeatureAccessInput = OrganizationContext & {
  memberRole: Role
  feature: keyof PlanFeatures
}

export type CheckFeatureAccessError =
  | { type: 'forbidden'; message: string }
  | { type: 'subscription_not_found'; organizationId: string }
  | { type: 'plan_not_found'; planId: string }
  | { type: 'feature_not_available'; feature: keyof PlanFeatures }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  subscriptionRepository: SubscriptionRepositoryPort
  planRepository: PlanRepositoryPort
}

export const makeCheckFeatureAccess =
  (deps: Dependencies) =>
  (input: CheckFeatureAccessInput): ResultAsync<boolean, CheckFeatureAccessError> => {
    // 1. Authorization FIRST (read permission sufficient for checking access)
    if (!hasPermission(input.memberRole, 'organization:read')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to check feature access',
      })
    }

    // 2. Get subscription
    return deps.subscriptionRepository
      .findByOrganizationId(input)
      .mapErr((e): CheckFeatureAccessError => {
        if (e.type === 'NOT_FOUND') {
          return { type: 'subscription_not_found', organizationId: input.organizationId }
        }
        return { type: 'repository_error', message: e.message }
      })
      .andThen((subscription) =>
        // 3. Get plan
        deps.planRepository
          .findById(subscription.planId)
          .mapErr((e): CheckFeatureAccessError => {
            if (e.type === 'NOT_FOUND') {
              return { type: 'plan_not_found', planId: subscription.planId }
            }
            return { type: 'repository_error', message: e.message }
          })
          .andThen((plan) => {
            // 4. Use domain helper
            if (!hasFeature(plan, input.feature)) {
              return errAsync({
                type: 'feature_not_available',
                feature: input.feature,
              } as const)
            }
            return okAsync(true)
          }),
      )
  }
