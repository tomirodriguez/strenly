import { acceptInvitation } from "./accept-invitation";
import { archiveAthlete } from "./archive-athlete";
import { createAthlete } from "./create-athlete";
import { generateInvitation } from "./generate-invitation";
import { getAthlete } from "./get-athlete";
import { getInvitationInfo } from "./get-invitation-info";
import { listAthletes } from "./list-athletes";
import { updateAthlete } from "./update-athlete";

/**
 * Athletes router
 * Handles athlete CRUD and invitation operations
 *
 * Procedures:
 * - create: Create a new athlete
 * - list: List athletes with filtering and pagination
 * - get: Get an athlete by ID
 * - update: Update an athlete
 * - archive: Archive an athlete (soft delete)
 * - generateInvitation: Generate an invitation for an athlete
 * - acceptInvitation: Accept an invitation (session auth)
 * - invitationInfo: Get invitation info (public)
 */
export const athletes = {
	create: createAthlete,
	list: listAthletes,
	get: getAthlete,
	update: updateAthlete,
	archive: archiveAthlete,
	generateInvitation,
	acceptInvitation,
	invitationInfo: getInvitationInfo,
};
