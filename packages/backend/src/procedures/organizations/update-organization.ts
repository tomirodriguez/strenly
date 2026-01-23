import { organizationTypeSchema } from "@strenly/contracts/organizations/organization";
import {
	updateOrganizationInputSchema,
	updateOrganizationOutputSchema,
} from "@strenly/contracts/organizations/update-organization";
import { authProcedure } from "../../lib/orpc";

/**
 * Update organization procedure
 * Only owner can update organization details (name, logo)
 */
export const updateOrganization = authProcedure
	.errors({
		FORBIDDEN: {
			message: "Solo el propietario puede actualizar la organizacion",
		},
	})
	.input(updateOrganizationInputSchema)
	.output(updateOrganizationOutputSchema)
	.handler(async ({ input, context, errors }) => {
		// Only owner can update organization
		if (context.membership.role !== "owner") {
			throw errors.FORBIDDEN();
		}

		await context.auth.api.updateOrganization({
			body: {
				organizationId: context.organization.id,
				data: {
					name: input.name,
					// Convert null to undefined since Better-Auth API expects string | undefined
					logo: input.logo ?? undefined,
				},
			},
			headers: context.headers,
		});

		// Get org type from metadata with Zod validation
		const fullOrg = await context.auth.api.getFullOrganization({
			headers: context.headers,
			query: { organizationId: context.organization.id },
		});

		// Safely parse the type from metadata - default to coach_solo if invalid
		const typeResult = organizationTypeSchema.safeParse(
			fullOrg?.metadata?.type,
		);
		const orgType = typeResult.success ? typeResult.data : "coach_solo";

		return {
			organization: {
				id: fullOrg?.id ?? context.organization.id,
				name: fullOrg?.name ?? context.organization.name,
				slug: fullOrg?.slug ?? context.organization.slug,
				logo: fullOrg?.logo ?? null,
				type: orgType,
				createdAt:
					fullOrg?.createdAt?.toISOString() ?? new Date().toISOString(),
			},
		};
	});
