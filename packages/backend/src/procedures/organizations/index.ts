import { acceptInvitation } from "./accept-invitation";
import { createOrganization } from "./create-organization";
import { getOrganization } from "./get-organization";
import { inviteMember } from "./invite-member";
import { listMembers } from "./list-members";
import { listUserOrganizations } from "./list-user-organizations";
import { removeMember } from "./remove-member";
import { updateMemberRole } from "./update-member-role";
import { updateOrganization } from "./update-organization";

/**
 * Organizations router
 * Aggregates all organization management procedures
 *
 * Procedures:
 * - create: Create new organization (sessionProcedure)
 * - update: Update organization details (owner only)
 * - get: Get current organization info (any member)
 * - listUserOrgs: List all orgs user belongs to (sessionProcedure)
 * - inviteMember: Invite new member (owner/admin)
 * - acceptInvitation: Accept invite (sessionProcedure)
 * - updateMemberRole: Change member role (owner only)
 * - removeMember: Remove member (owner only)
 * - listMembers: List org members (any member)
 */
export const organizationsRouter = {
	create: createOrganization,
	update: updateOrganization,
	get: getOrganization,
	listUserOrgs: listUserOrganizations,
	inviteMember,
	acceptInvitation,
	updateMemberRole,
	removeMember,
	listMembers,
};
