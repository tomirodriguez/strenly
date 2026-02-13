import type { ResultAsync } from 'neverthrow'
import type { OrganizationType, Plan } from '../domain/entities/plan'

export type PlanRepositoryError = { type: 'DATABASE_ERROR'; message: string }

export type ListPlansOptions = {
  organizationType?: OrganizationType
  activeOnly?: boolean
  limit: number
  offset: number
}

export type PlanRepositoryPort = {
  findById(id: string): ResultAsync<Plan | null, PlanRepositoryError>
  findBySlug(slug: string): ResultAsync<Plan | null, PlanRepositoryError>
  findAll(options: ListPlansOptions): ResultAsync<{ items: Plan[]; totalCount: number }, PlanRepositoryError>
}
