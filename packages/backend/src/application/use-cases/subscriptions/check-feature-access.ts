import { type PlanFeatures, planFeaturesSchema } from "@strenly/contracts/subscriptions/plan";
import type { DbClient } from "@strenly/database";
import { eq } from "@strenly/database";
import { plans, subscriptions } from "@strenly/database/schema";
import { err, ok, ResultAsync } from "neverthrow";

/**
 * Feature names available in subscription plans
 */
type FeatureName = keyof PlanFeatures;

/**
 * Error types for feature access checking
 */
type SubscriptionNotFoundError = { type: "SUBSCRIPTION_NOT_FOUND" };
type FeatureNotAvailableError = {
	type: "FEATURE_NOT_AVAILABLE";
	feature: FeatureName;
};
type CheckFeatureAccessError = SubscriptionNotFoundError | FeatureNotAvailableError;

/**
 * Check if organization has access to a specific feature
 * Returns true if feature is available, error otherwise
 */
export function checkFeatureAccess(
	db: DbClient,
	organizationId: string,
	feature: FeatureName,
): ResultAsync<boolean, CheckFeatureAccessError> {
	return ResultAsync.fromPromise(
		(async () => {
			const [result] = await db
				.select({
					features: plans.features,
				})
				.from(subscriptions)
				.innerJoin(plans, eq(subscriptions.planId, plans.id))
				.where(eq(subscriptions.organizationId, organizationId));

			if (!result) {
				return err<boolean, SubscriptionNotFoundError>({
					type: "SUBSCRIPTION_NOT_FOUND",
				});
			}

			// Safely parse features using Zod (no 'as' casting)
			const featuresResult = planFeaturesSchema.safeParse(result.features);
			if (!featuresResult.success) {
				// Features couldn't be parsed - deny access
				return err<boolean, FeatureNotAvailableError>({
					type: "FEATURE_NOT_AVAILABLE",
					feature,
				});
			}

			const features = featuresResult.data;
			const hasAccess = features[feature] ?? false;

			if (!hasAccess) {
				return err<boolean, FeatureNotAvailableError>({
					type: "FEATURE_NOT_AVAILABLE",
					feature,
				});
			}

			return ok<boolean, CheckFeatureAccessError>(true);
		})(),
		(): SubscriptionNotFoundError => ({ type: "SUBSCRIPTION_NOT_FOUND" }),
	).andThen((result) => result);
}
