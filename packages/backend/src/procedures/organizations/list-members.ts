import {
	memberRoleSchema,
	memberSchema,
} from "@strenly/contracts/organizations/member";
import { z } from "zod";
import { authProcedure } from "../../lib/orpc";

/**
 * List members procedure
 * Returns all members of the current organization
 *
 * Any member can view the member list
 */
export const listMembers = authProcedure
	.output(z.object({ members: z.array(memberSchema) }))
	.handler(async ({ context }) => {
		const fullOrg = await context.auth.api.getFullOrganization({
			headers: context.headers,
			query: { organizationId: context.organization.id },
		});

		return {
			members: (fullOrg?.members ?? []).map((m) => {
				// Safely parse role from Better-Auth response
				const roleResult = memberRoleSchema.safeParse(m.role);
				const role = roleResult.success ? roleResult.data : "member";

				return {
					id: m.id,
					userId: m.userId,
					organizationId: m.organizationId,
					role,
					user: {
						id: m.user.id,
						name: m.user.name ?? "",
						email: m.user.email,
						image: m.user.image ?? null,
					},
					createdAt: m.createdAt.toISOString(),
				};
			}),
		};
	});
