import { and, eq, type SQL } from "drizzle-orm";
import { z } from "zod";
import { plans } from "@strenly/database/schema";
import {
	organizationTypeSchema,
	planFeaturesSchema,
	planSchema,
	type OrganizationType,
} from "@strenly/contracts/subscriptions/plan";
import { publicProcedure } from "../../lib/orpc";

const listPlansInputSchema = z
	.object({
		organizationType: organizationTypeSchema.optional(),
	})
	.optional();

const listPlansOutputSchema = z.object({
	plans: z.array(planSchema),
});

/**
 * List available subscription plans
 * Public endpoint - no authentication required
 * Can filter by organization type (coach_solo or gym)
 */
export const listPlans = publicProcedure
	.input(listPlansInputSchema)
	.output(listPlansOutputSchema)
	.handler(async ({ input, context }) => {
		const conditions: SQL[] = [eq(plans.isActive, true)];

		// Parse and validate organization type from input
		const orgTypeResult = organizationTypeSchema.safeParse(
			input?.organizationType,
		);
		if (orgTypeResult.success) {
			const orgType: OrganizationType = orgTypeResult.data;
			conditions.push(eq(plans.organizationType, orgType));
		}

		const result = await context.db
			.select()
			.from(plans)
			.where(and(...conditions))
			.orderBy(plans.priceMonthly);

		return {
			plans: result.map((p) => {
				// Safely parse organization type using Zod safeParse (no 'as' casting)
				const typeResult = organizationTypeSchema.safeParse(p.organizationType);
				const orgType = typeResult.success ? typeResult.data : "coach_solo";

				// Safely parse features using Zod safeParse
				const featuresResult = planFeaturesSchema.safeParse(p.features);
				const features = featuresResult.success
					? featuresResult.data
					: {
							templates: false,
							analytics: false,
							exportData: false,
							customExercises: false,
							multipleCoaches: false,
						};

				return {
					id: p.id,
					name: p.name,
					slug: p.slug,
					organizationType: orgType,
					athleteLimit: p.athleteLimit,
					coachLimit: p.coachLimit,
					features,
					priceMonthly: p.priceMonthly,
					priceYearly: p.priceYearly,
					isActive: p.isActive,
				};
			}),
		};
	});
