import {
	invitationRoleSchema,
	invitationStatusSchema,
	inviteMemberInputSchema,
	inviteMemberOutputSchema,
} from "@strenly/contracts/organizations/invite-member";
import { plans, subscriptions } from "@strenly/database/schema";
import { eq } from "drizzle-orm";
import { authProcedure } from "../../lib/orpc";

/**
 * Invite member procedure
 * Owner and admin can invite new members to the organization
 *
 * Checks:
 * 1. Caller is owner or admin
 * 2. Coach limit not exceeded (for gym orgs)
 * 3. Email not already invited
 */
export const inviteMember = authProcedure
	.errors({
		FORBIDDEN: { message: "No tienes permisos para invitar miembros" },
		COACH_LIMIT_EXCEEDED: {
			message: "Has alcanzado el limite de coaches de tu plan",
		},
		ALREADY_INVITED: {
			message: "Este email ya tiene una invitacion pendiente",
		},
	})
	.input(inviteMemberInputSchema)
	.output(inviteMemberOutputSchema)
	.handler(async ({ input, context, errors }) => {
		// Only owner and admin can invite
		if (context.membership.role === "member") {
			throw errors.FORBIDDEN();
		}

		// Check coach limit for gym organizations
		const [subscription] = await context.db
			.select({
				subscription: subscriptions,
				plan: plans,
			})
			.from(subscriptions)
			.innerJoin(plans, eq(subscriptions.planId, plans.id))
			.where(eq(subscriptions.organizationId, context.organization.id));

		if (subscription?.plan.coachLimit !== null) {
			const fullOrg = await context.auth.api.getFullOrganization({
				headers: context.headers,
				query: { organizationId: context.organization.id },
			});
			const currentCoaches = fullOrg?.members?.length ?? 0;

			if (currentCoaches >= (subscription?.plan.coachLimit ?? 0)) {
				throw errors.COACH_LIMIT_EXCEEDED();
			}
		}

		// Create invitation via Better-Auth
		const result = await context.auth.api.createInvitation({
			body: {
				organizationId: context.organization.id,
				email: input.email,
				role: input.role,
			},
			headers: context.headers,
		});

		if (!result) {
			throw errors.ALREADY_INVITED();
		}

		// Safely parse role and status from result
		const roleResult = invitationRoleSchema.safeParse(result.role);
		const statusResult = invitationStatusSchema.safeParse(result.status);

		return {
			invitation: {
				id: result.id,
				email: result.email,
				role: roleResult.success ? roleResult.data : "member",
				status: statusResult.success ? statusResult.data : "pending",
				expiresAt: result.expiresAt.toISOString(),
			},
		};
	});
