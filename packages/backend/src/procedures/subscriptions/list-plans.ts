import { z } from "zod";
import { and, eq } from "@strenly/database";
import { plans } from "@strenly/database/schema";
import {
	organizationTypeSchema,
	planFeaturesSchema,
	planSchema,
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
		// Parse and validate organization type from input
		const orgTypeResult = organizationTypeSchema.safeParse(
			input?.organizationType,
		);

		// Build where clause based on filters
		const whereClause = orgTypeResult.success
			? and(
					eq(plans.isActive, true),
					eq(plans.organizationType, orgTypeResult.data),
				)
			: eq(plans.isActive, true);

		const result = await context.db
			.select()
			.from(plans)
			.where(whereClause)
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
