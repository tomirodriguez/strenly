import { z } from "zod";
import { organizationSchema, organizationTypeSchema } from "./organization";

/**
 * Create organization input schema
 * Used during onboarding to create a new organization
 */
export const createOrganizationInputSchema = z.object({
	name: z
		.string()
		.min(2, "El nombre debe tener al menos 2 caracteres")
		.max(100, "El nombre es muy largo"),
	slug: z
		.string()
		.min(2, "El slug debe tener al menos 2 caracteres")
		.max(50, "El slug es muy largo")
		.regex(
			/^[a-z0-9-]+$/,
			"El slug solo puede contener letras minusculas, numeros y guiones",
		),
	type: organizationTypeSchema,
	planId: z.string(), // Selected subscription plan (required before org creation)
});

export const createOrganizationOutputSchema = z.object({
	organization: organizationSchema,
});

export type CreateOrganizationInput = z.infer<
	typeof createOrganizationInputSchema
>;
