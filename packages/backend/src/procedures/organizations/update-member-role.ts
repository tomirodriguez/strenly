import { invitationRoleSchema } from "@strenly/contracts/organizations/invite-member";
import { z } from "zod";
import { authProcedure } from "../../lib/orpc";

/**
 * Update member role procedure
 * Only owner can change member roles
 *
 * Restrictions:
 * - Only owner can perform this action
 * - Cannot assign owner role (would require ownership transfer flow)
 */
export const updateMemberRole = authProcedure
	.errors({
		FORBIDDEN: { message: "Solo el propietario puede cambiar roles" },
		MEMBER_NOT_FOUND: { message: "Miembro no encontrado" },
		CANNOT_CHANGE_OWNER: {
			message: "No puedes cambiar el rol del propietario",
		},
	})
	.input(
		z.object({
			memberId: z.string(),
			role: invitationRoleSchema, // Cannot assign owner role
		}),
	)
	.output(z.object({ success: z.boolean() }))
	.handler(async ({ input, context, errors }) => {
		// Only owner can change roles
		if (context.membership.role !== "owner") {
			throw errors.FORBIDDEN();
		}

		try {
			await context.auth.api.updateMemberRole({
				body: {
					memberId: input.memberId,
					role: input.role,
					organizationId: context.organization.id,
				},
				headers: context.headers,
			});
			return { success: true };
		} catch {
			throw errors.MEMBER_NOT_FOUND();
		}
	});
