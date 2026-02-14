import type { ResultAsync } from 'neverthrow'
import type { Subscription } from '../domain/entities/subscription'
import type { OrganizationContext } from '../types/organization-context'

export type SubscriptionRepositoryError =
  | { type: 'NOT_FOUND'; organizationId: string }
  | { type: 'DATABASE_ERROR'; message: string; cause?: unknown }

export type SubscriptionRepositoryPort = {
  findByOrganizationId(ctx: OrganizationContext): ResultAsync<Subscription | null, SubscriptionRepositoryError>
  save(ctx: OrganizationContext, subscription: Subscription): ResultAsync<Subscription, SubscriptionRepositoryError>
  updateAthleteCount(ctx: OrganizationContext, count: number): ResultAsync<void, SubscriptionRepositoryError>
  /**
   * Create a new subscription for an organization.
   * Used during onboarding when organizationId is provided directly (no context).
   */
  create(subscription: Subscription): ResultAsync<Subscription, SubscriptionRepositoryError>
}
