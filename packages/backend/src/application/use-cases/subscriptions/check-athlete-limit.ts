import { ResultAsync, ok, err } from "neverthrow";
import { eq, sql } from "@strenly/database";
import { subscriptions, plans } from "@strenly/database/schema";
import type { DbClient } from "@strenly/database";

/**
 * Error types for athlete limit checking
 */
type SubscriptionNotFoundError = { type: "SUBSCRIPTION_NOT_FOUND" };
type AthleteLimitExceededError = {
	type: "ATHLETE_LIMIT_EXCEEDED";
	currentCount: number;
	limit: number;
};
type CheckAthleteLimitError =
	| SubscriptionNotFoundError
	| AthleteLimitExceededError;

/**
 * Result type for athlete limit check
 */
type CheckAthleteLimitResult = {
	canAdd: boolean;
	currentCount: number;
	limit: number;
	remaining: number;
};

/**
 * Check if organization can add another athlete
 * Returns current count, limit, and remaining capacity
 */
export function checkAthleteLimit(
	db: DbClient,
	organizationId: string,
): ResultAsync<CheckAthleteLimitResult, CheckAthleteLimitError> {
	return ResultAsync.fromPromise(
		(async () => {
			const [result] = await db
				.select({
					athleteCount: subscriptions.athleteCount,
					athleteLimit: plans.athleteLimit,
				})
				.from(subscriptions)
				.innerJoin(plans, eq(subscriptions.planId, plans.id))
				.where(eq(subscriptions.organizationId, organizationId));

			if (!result) {
				return err<CheckAthleteLimitResult, SubscriptionNotFoundError>({
					type: "SUBSCRIPTION_NOT_FOUND",
				});
			}

			const { athleteCount, athleteLimit } = result;
			const remaining = athleteLimit - athleteCount;
			const canAdd = remaining > 0;

			if (!canAdd) {
				return err<CheckAthleteLimitResult, AthleteLimitExceededError>({
					type: "ATHLETE_LIMIT_EXCEEDED",
					currentCount: athleteCount,
					limit: athleteLimit,
				});
			}

			return ok<CheckAthleteLimitResult, CheckAthleteLimitError>({
				canAdd: true,
				currentCount: athleteCount,
				limit: athleteLimit,
				remaining,
			});
		})(),
		(): SubscriptionNotFoundError => ({ type: "SUBSCRIPTION_NOT_FOUND" }),
	).andThen((result) => result);
}

/**
 * Increment athlete count for organization
 * Call after successfully adding an athlete
 */
export async function incrementAthleteCount(
	db: DbClient,
	organizationId: string,
): Promise<void> {
	await db
		.update(subscriptions)
		.set({
			athleteCount: sql`${subscriptions.athleteCount} + 1`,
			updatedAt: new Date(),
		})
		.where(eq(subscriptions.organizationId, organizationId));
}

/**
 * Decrement athlete count for organization
 * Call after successfully removing an athlete
 * Uses GREATEST to prevent negative counts
 */
export async function decrementAthleteCount(
	db: DbClient,
	organizationId: string,
): Promise<void> {
	await db
		.update(subscriptions)
		.set({
			athleteCount: sql`GREATEST(${subscriptions.athleteCount} - 1, 0)`,
			updatedAt: new Date(),
		})
		.where(eq(subscriptions.organizationId, organizationId));
}
