import { organizationTypeSchema, planSchema } from "@strenly/contracts/subscriptions/plan";
import { z } from "zod";
import { createPlanRepository } from "../../infrastructure/repositories/plan.repository";
import { publicProcedure } from "../../lib/orpc";

const listPlansInputSchema = z
	.object({
		organizationType: organizationTypeSchema.optional(),
	})
	.optional();

const listPlansOutputSchema = z.object({
	plans: z.array(planSchema),
	totalCount: z.number(),
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
		const planRepository = createPlanRepository(context.db);

		const result = await planRepository.findAll({
			organizationType: input?.organizationType,
			activeOnly: true,
		});

		if (result.isErr()) {
			// Log and throw generic error for public endpoint
			console.error("Failed to list plans:", result.error);
			throw new Error("Failed to load subscription plans");
		}

		return {
			plans: result.value.items.map((p) => ({
				id: p.id,
				name: p.name,
				slug: p.slug,
				organizationType: p.organizationType,
				athleteLimit: p.athleteLimit,
				coachLimit: p.coachLimit,
				features: p.features,
				priceMonthly: p.priceMonthly,
				priceYearly: p.priceYearly,
				isActive: p.isActive,
			})),
			totalCount: result.value.totalCount,
		};
	});
