import type { SubscriptionRepositoryError, SubscriptionRepositoryPort } from "@strenly/core";
import {
	createSubscription,
	type OrganizationContext,
	type Subscription,
	type SubscriptionStatus,
} from "@strenly/core";
import type { DbClient } from "@strenly/database";
import { subscriptions } from "@strenly/database/schema";
import { eq } from "drizzle-orm";
import { err, ok, ResultAsync } from "neverthrow";

function wrapDbError(error: unknown): SubscriptionRepositoryError {
	console.error("Subscription repository error:", error);
	return { type: "DATABASE_ERROR", message: "Database operation failed" };
}

/**
 * Safely parse subscription status from database
 * Returns a valid SubscriptionStatus or defaults to 'active'
 */
function parseStatus(value: string): SubscriptionStatus {
	if (value === "active" || value === "canceled" || value === "past_due") {
		return value;
	}
	return "active";
}

function mapToDomain(row: typeof subscriptions.$inferSelect): Subscription | null {
	// Handle nullable dates - use current date as fallback
	const currentPeriodStart = row.currentPeriodStart ?? new Date();
	const currentPeriodEnd = row.currentPeriodEnd ?? new Date();

	const result = createSubscription({
		id: row.id,
		organizationId: row.organizationId,
		planId: row.planId,
		status: parseStatus(row.status),
		athleteCount: row.athleteCount,
		currentPeriodStart,
		currentPeriodEnd,
		createdAt: row.createdAt,
	});

	return result.isOk() ? result.value : null;
}

export function createSubscriptionRepository(db: DbClient): SubscriptionRepositoryPort {
	return {
		findByOrganizationId(ctx: OrganizationContext): ResultAsync<Subscription, SubscriptionRepositoryError> {
			return ResultAsync.fromPromise(
				db
					.select()
					.from(subscriptions)
					.where(eq(subscriptions.organizationId, ctx.organizationId))
					.then((rows) => rows[0]),
				wrapDbError,
			).andThen((row) => {
				if (!row) {
					return err({ type: "NOT_FOUND", organizationId: ctx.organizationId } as const);
				}
				const subscription = mapToDomain(row);
				if (!subscription) {
					return err({ type: "DATABASE_ERROR", message: "Invalid subscription data" } as const);
				}
				return ok(subscription);
			});
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
					return err({ type: "NOT_FOUND", organizationId: ctx.organizationId } as const);
				}
				const updated = mapToDomain(row);
				if (!updated) {
					return err({ type: "DATABASE_ERROR", message: "Invalid subscription data" } as const);
				}
				return ok(updated);
			});
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
			);
		},
	};
}
