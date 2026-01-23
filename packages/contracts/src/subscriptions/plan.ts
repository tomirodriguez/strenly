import { z } from "zod";

/**
 * Organization type schema
 * Distinguishes between solo coaches and gym organizations
 * Defined here since organizations module was removed in favor of Better-Auth
 */
export const organizationTypeSchema = z.enum(["coach_solo", "gym"]);
export type OrganizationType = z.infer<typeof organizationTypeSchema>;

/**
 * Plan features schema
 * Boolean flags for feature availability per plan
 */
export const planFeaturesSchema = z.object({
	templates: z.boolean(),
	analytics: z.boolean(),
	exportData: z.boolean(),
	customExercises: z.boolean(),
	multipleCoaches: z.boolean(),
});

export type PlanFeatures = z.infer<typeof planFeaturesSchema>;

/**
 * Plan schema
 * Defines subscription plan with limits and pricing
 */
export const planSchema = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
	organizationType: organizationTypeSchema,
	athleteLimit: z.number(),
	coachLimit: z.number().nullable(), // null = unlimited
	features: planFeaturesSchema,
	priceMonthly: z.number(), // cents
	priceYearly: z.number(), // cents
	isActive: z.boolean(),
});

export type Plan = z.infer<typeof planSchema>;
