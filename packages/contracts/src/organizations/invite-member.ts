import { z } from "zod";

/**
 * Invitation role - excludes owner since you can't invite as owner
 */
export const invitationRoleSchema = z.enum(["admin", "member"]);
export type InvitationRole = z.infer<typeof invitationRoleSchema>;

/**
 * Invitation status enum
 */
export const invitationStatusSchema = z.enum([
	"pending",
	"accepted",
	"rejected",
	"canceled",
]);
export type InvitationStatus = z.infer<typeof invitationStatusSchema>;

/**
 * Invite member input schema
 * Used by owner/admin to invite new members
 */
export const inviteMemberInputSchema = z.object({
	email: z.string().email("Email invalido"),
	role: invitationRoleSchema, // Cannot invite as owner
});

export const inviteMemberOutputSchema = z.object({
	invitation: z.object({
		id: z.string(),
		email: z.string(),
		role: invitationRoleSchema,
		status: invitationStatusSchema,
		expiresAt: z.string(),
	}),
});

export type InviteMemberInput = z.infer<typeof inviteMemberInputSchema>;
