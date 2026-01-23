import { memberRoleSchema } from "@strenly/contracts/organizations/member";
import {
	organizationSchema,
	organizationTypeSchema,
} from "@strenly/contracts/organizations/organization";
import { z } from "zod";
import { sessionProcedure } from "../../lib/orpc";

const userOrganizationSchema = z.object({
	organization: organizationSchema,
	role: memberRoleSchema,
});

/**
 * List user organizations procedure
 * Returns all organizations the authenticated user belongs to
 * Supports multi-organization membership
 *
 * Note: We use getFullOrganization for each org to get the member's role
 * since listOrganizations doesn't include members by default
 */
export const listUserOrganizations = sessionProcedure
	.output(z.object({ organizations: z.array(userOrganizationSchema) }))
	.handler(async ({ context }) => {
		const orgs = await context.auth.api.listOrganizations({
			headers: context.headers,
		});

		const organizationsWithRole = await Promise.all(
			(orgs ?? []).map(async (org) => {
				// Get full organization with members to determine user's role
				const fullOrg = await context.auth.api.getFullOrganization({
					headers: context.headers,
					query: { organizationId: org.id },
				});

				// Safely parse type from metadata
				const typeResult = organizationTypeSchema.safeParse(
					fullOrg?.metadata?.type,
				);
				const orgType = typeResult.success ? typeResult.data : "coach_solo";

				// Find current user's membership and get role
				const membership = fullOrg?.members?.find(
					(m) => m.userId === context.user.id,
				);
				const roleResult = memberRoleSchema.safeParse(membership?.role);
				const role = roleResult.success ? roleResult.data : "member";

				return {
					organization: {
						id: org.id,
						name: org.name,
						slug: org.slug,
						logo: org.logo ?? null,
						type: orgType,
						createdAt: org.createdAt.toISOString(),
					},
					role,
				};
			}),
		);

		return { organizations: organizationsWithRole };
	});
