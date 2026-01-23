import { z } from "zod";
import { authProcedure } from "../../lib/orpc";

/**
 * Remove member procedure
 * Only owner can remove members from the organization
 *
 * Restrictions:
 * - Only owner can perform this action
 * - Owner cannot remove themselves (would require delete org or transfer ownership)
 */
export const removeMember = authProcedure
	.errors({
		FORBIDDEN: { message: "No tienes permisos para eliminar miembros" },
		CANNOT_REMOVE_OWNER: { message: "No puedes eliminar al propietario" },
		MEMBER_NOT_FOUND: { message: "Miembro no encontrado" },
	})
	.input(z.object({ memberIdOrEmail: z.string() }))
	.output(z.object({ success: z.boolean() }))
	.handler(async ({ input, context, errors }) => {
		// Only owner can remove members
		if (context.membership.role !== "owner") {
			throw errors.FORBIDDEN();
		}

		// Cannot remove self (owner)
		if (
			input.memberIdOrEmail === context.user.id ||
			input.memberIdOrEmail === context.user.email
		) {
			throw errors.CANNOT_REMOVE_OWNER();
		}

		try {
			await context.auth.api.removeMember({
				body: {
					memberIdOrEmail: input.memberIdOrEmail,
					organizationId: context.organization.id,
				},
				headers: context.headers,
			});
			return { success: true };
		} catch {
			throw errors.MEMBER_NOT_FOUND();
		}
	});
