import { z } from "zod";
import { sessionProcedure } from "../../lib/orpc";

/**
 * Accept invitation procedure
 * User accepts their own invitation to join an organization
 *
 * Uses sessionProcedure since user is not yet a member of the organization
 */
export const acceptInvitation = sessionProcedure
	.errors({
		INVITATION_NOT_FOUND: { message: "Invitacion no encontrada o expirada" },
		ALREADY_MEMBER: { message: "Ya eres miembro de esta organizacion" },
	})
	.input(z.object({ invitationId: z.string() }))
	.output(z.object({ success: z.boolean() }))
	.handler(async ({ input, context, errors }) => {
		try {
			await context.auth.api.acceptInvitation({
				body: { invitationId: input.invitationId },
				headers: context.headers,
			});
			return { success: true };
		} catch {
			throw errors.INVITATION_NOT_FOUND();
		}
	});
