import type { ResultAsync } from 'neverthrow'
import type { OrganizationType, Plan } from '../domain/entities/plan'

export type PlanRepositoryError = { type: 'NOT_FOUND'; planId: string } | { type: 'DATABASE_ERROR'; message: string }

export type ListPlansOptions = {
  organizationType?: OrganizationType
  activeOnly?: boolean
}

export type PlanRepositoryPort = {
  findById(id: string): ResultAsync<Plan, PlanRepositoryError>
  findBySlug(slug: string): ResultAsync<Plan, PlanRepositoryError>
  findAll(options?: ListPlansOptions): ResultAsync<{ items: Plan[]; totalCount: number }, PlanRepositoryError>
}
