import type { Subscription, SubscriptionStatus } from '@strenly/core/domain/entities/subscription'
import { reconstituteSubscription } from '@strenly/core/domain/entities/subscription'
import type {
  SubscriptionRepositoryError,
  SubscriptionRepositoryPort,
} from '@strenly/core/ports/subscription-repository.port'
import type { OrganizationContext } from '@strenly/core/types/organization-context'
import type { DbClient } from '@strenly/database'
import { subscriptions } from '@strenly/database/schema'
import { eq } from 'drizzle-orm'
import { err, ok, ResultAsync } from 'neverthrow'

function wrapDbError(error: unknown): SubscriptionRepositoryError {
  return {
    type: 'DATABASE_ERROR',
    message: error instanceof Error ? error.message : 'Database operation failed',
    cause: error,
  }
}

/**
 * Safely parse subscription status from database
 * Returns a valid SubscriptionStatus or defaults to 'active'
 */
function parseStatus(value: string): SubscriptionStatus {
  if (value === 'active' || value === 'canceled' || value === 'past_due') {
    return value
  }
  return 'active'
}

/**
 * Maps a database row to a Subscription domain entity.
 * Uses reconstitute since DB data is already validated.
 */
function mapToDomain(row: typeof subscriptions.$inferSelect): Subscription {
  return reconstituteSubscription({
    id: row.id,
    organizationId: row.organizationId,
    planId: row.planId,
    status: parseStatus(row.status),
    athleteCount: row.athleteCount,
    currentPeriodStart: row.currentPeriodStart ?? new Date(),
    currentPeriodEnd: row.currentPeriodEnd ?? new Date(),
    createdAt: row.createdAt,
  })
}

export function createSubscriptionRepository(db: DbClient): SubscriptionRepositoryPort {
  return {
    findByOrganizationId(ctx: OrganizationContext): ResultAsync<Subscription | null, SubscriptionRepositoryError> {
      return ResultAsync.fromPromise(
        db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.organizationId, ctx.organizationId))
          .then((rows) => rows[0]),
        wrapDbError,
      ).map((row) => (row ? mapToDomain(row) : null))
    },

    save(ctx: OrganizationContext, subscription: Subscription): ResultAsync<Subscription, SubscriptionRepositoryError> {
      return ResultAsync.fromPromise(
        db
          .update(subscriptions)
          .set({
            status: subscription.status,
            athleteCount: subscription.athleteCount,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.organizationId, ctx.organizationId))
          .returning()
          .then((rows) => rows[0]),
        wrapDbError,
      ).andThen((row) => {
        if (!row) {
          return err({ type: 'NOT_FOUND', organizationId: ctx.organizationId } as const)
        }
        return ok(mapToDomain(row))
      })
    },

    updateAthleteCount(ctx: OrganizationContext, count: number): ResultAsync<void, SubscriptionRepositoryError> {
      return ResultAsync.fromPromise(
        db
          .update(subscriptions)
          .set({
            athleteCount: count,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.organizationId, ctx.organizationId))
          .then(() => undefined),
        wrapDbError,
      )
    },

    create(subscription: Subscription): ResultAsync<Subscription, SubscriptionRepositoryError> {
      return ResultAsync.fromPromise(
        db
          .insert(subscriptions)
          .values({
            id: subscription.id,
            organizationId: subscription.organizationId,
            planId: subscription.planId,
            status: subscription.status,
            athleteCount: subscription.athleteCount,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            createdAt: subscription.createdAt,
          })
          .returning()
          .then((rows) => rows[0]),
        wrapDbError,
      ).andThen((row) => {
        if (!row) {
          return err({ type: 'DATABASE_ERROR', message: 'Failed to create subscription' } as const)
        }
        return ok(mapToDomain(row))
      })
    },
  }
}
