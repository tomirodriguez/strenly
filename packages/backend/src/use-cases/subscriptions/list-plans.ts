import type { OrganizationType, Plan } from '@strenly/core/domain/entities/plan'
import type { PlanRepositoryPort } from '@strenly/core/ports/plan-repository.port'
import type { ResultAsync } from 'neverthrow'

export type ListPlansInput = {
  organizationType?: OrganizationType
}

export type ListPlansError = { type: 'repository_error'; message: string }

type Dependencies = {
  planRepository: PlanRepositoryPort
}

/**
 * List available subscription plans.
 *
 * PUBLIC: No authorization needed -- plans are public reference data
 * used during onboarding and pricing display before the user has
 * an organization or membership context.
 */
export const makeListPlans =
  (deps: Dependencies) =>
  (input: ListPlansInput): ResultAsync<{ items: Plan[]; totalCount: number }, ListPlansError> => {
    return deps.planRepository
      .findAll({
        organizationType: input.organizationType,
        activeOnly: true,
        limit: 100,
        offset: 0,
      })
      .mapErr((e): ListPlansError => ({ type: 'repository_error', message: e.message }))
  }
