import {
  canAddAthlete,
  hasPermission,
  type OrganizationContext,
  type PlanRepositoryPort,
  type Role,
  type SubscriptionRepositoryPort,
} from '@strenly/core'
import { errAsync, okAsync, type ResultAsync } from 'neverthrow'

export type CheckAthleteLimitInput = OrganizationContext & {
  memberRole: Role
}

export type CheckAthleteLimitResult = {
  canAdd: boolean
  currentCount: number
  limit: number
  remaining: number
}

export type CheckAthleteLimitError =
  | { type: 'forbidden'; message: string }
  | { type: 'subscription_not_found'; organizationId: string }
  | { type: 'plan_not_found'; planId: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  subscriptionRepository: SubscriptionRepositoryPort
  planRepository: PlanRepositoryPort
}

export const makeCheckAthleteLimit =
  (deps: Dependencies) =>
  (input: CheckAthleteLimitInput): ResultAsync<CheckAthleteLimitResult, CheckAthleteLimitError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'athletes:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to add athletes',
      })
    }

    // 2. Get subscription
    return deps.subscriptionRepository
      .findByOrganizationId(input)
      .mapErr((): CheckAthleteLimitError => ({ type: 'repository_error', message: 'Failed to fetch subscription' }))
      .andThen((subscription) => {
        if (subscription === null) {
          return errAsync<CheckAthleteLimitResult, CheckAthleteLimitError>({
            type: 'subscription_not_found',
            organizationId: input.organizationId,
          })
        }

        // 3. Get plan for limit
        return deps.planRepository
          .findById(subscription.planId)
          .mapErr((e): CheckAthleteLimitError => ({ type: 'repository_error', message: e.message }))
          .andThen((plan) => {
            // Check if plan was found
            if (plan === null) {
              return errAsync({ type: 'plan_not_found' as const, planId: subscription.planId })
            }

            // 4. Use domain helper
            const canAdd = canAddAthlete(plan, subscription.athleteCount)
            const remaining = plan.athleteLimit - subscription.athleteCount

            return okAsync({
              canAdd,
              currentCount: subscription.athleteCount,
              limit: plan.athleteLimit,
              remaining: Math.max(0, remaining),
            })
          })
      })
  }
