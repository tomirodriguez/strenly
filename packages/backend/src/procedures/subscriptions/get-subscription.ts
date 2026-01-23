import { z } from "zod";
import { eq } from "@strenly/database";
import { plans, subscriptions } from "@strenly/database/schema";
import {
	organizationTypeSchema,
	planFeaturesSchema,
} from "@strenly/contracts/subscriptions/plan";
import {
	subscriptionSchema,
	subscriptionStatusSchema,
} from "@strenly/contracts/subscriptions/subscription";
import { authProcedure } from "../../lib/orpc";

const getSubscriptionOutputSchema = z.object({
	subscription: subscriptionSchema,
});

/**
 * Get current organization's subscription
 * Requires authentication and organization context
 * Returns subscription with full plan details
 */
export const getSubscription = authProcedure
	.errors({
		SUBSCRIPTION_NOT_FOUND: { message: "Subscription not found" },
	})
	.output(getSubscriptionOutputSchema)
	.handler(async ({ context, errors }) => {
		const [result] = await context.db
			.select({
				subscription: subscriptions,
				plan: plans,
			})
			.from(subscriptions)
			.innerJoin(plans, eq(subscriptions.planId, plans.id))
			.where(eq(subscriptions.organizationId, context.organization.id));

		if (!result) {
			throw errors.SUBSCRIPTION_NOT_FOUND();
		}

		const { subscription, plan } = result;

		// Safely parse all enum/complex types using Zod safeParse (no 'as' casting)
		const typeResult = organizationTypeSchema.safeParse(plan.organizationType);
		const orgType = typeResult.success ? typeResult.data : "coach_solo";

		const featuresResult = planFeaturesSchema.safeParse(plan.features);
		const features = featuresResult.success
			? featuresResult.data
			: {
					templates: false,
					analytics: false,
					exportData: false,
					customExercises: false,
					multipleCoaches: false,
				};

		const statusResult = subscriptionStatusSchema.safeParse(subscription.status);
		const status = statusResult.success ? statusResult.data : "active";

		// Handle nullable period dates
		const currentPeriodStart = subscription.currentPeriodStart
			? subscription.currentPeriodStart.toISOString()
			: new Date().toISOString();
		const currentPeriodEnd = subscription.currentPeriodEnd
			? subscription.currentPeriodEnd.toISOString()
			: new Date().toISOString();

		return {
			subscription: {
				id: subscription.id,
				organizationId: subscription.organizationId,
				plan: {
					id: plan.id,
					name: plan.name,
					slug: plan.slug,
					organizationType: orgType,
					athleteLimit: plan.athleteLimit,
					coachLimit: plan.coachLimit,
					features,
					priceMonthly: plan.priceMonthly,
					priceYearly: plan.priceYearly,
					isActive: plan.isActive,
				},
				status,
				athleteCount: subscription.athleteCount,
				athleteLimit: plan.athleteLimit,
				currentPeriodStart,
				currentPeriodEnd,
				createdAt: subscription.createdAt.toISOString(),
			},
		};
	});
