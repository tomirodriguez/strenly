import { randomBytes } from "node:crypto";

export type AthleteInvitation = {
	readonly id: string;
	readonly athleteId: string;
	readonly organizationId: string;
	readonly createdByUserId: string;
	readonly token: string;
	readonly expiresAt: Date;
	readonly acceptedAt: Date | null;
	readonly revokedAt: Date | null;
	readonly createdAt: Date;
};

type CreateAthleteInvitationInput = {
	id: string;
	athleteId: string;
	organizationId: string;
	createdByUserId: string;
};

const INVITATION_EXPIRY_DAYS = 7;

/**
 * Generates a cryptographically secure invitation token.
 * Uses 32 bytes (256 bits) of random data encoded as base64url.
 * Result is a 43-character string.
 */
export function generateInvitationToken(): string {
	return randomBytes(32).toString("base64url");
}

/**
 * Creates a new athlete invitation with a secure token and 7-day expiry.
 * This always succeeds - no validation errors possible.
 */
export function createAthleteInvitation(input: CreateAthleteInvitationInput): AthleteInvitation {
	const now = new Date();
	const expiresAt = new Date(now.getTime() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

	return {
		id: input.id,
		athleteId: input.athleteId,
		organizationId: input.organizationId,
		createdByUserId: input.createdByUserId,
		token: generateInvitationToken(),
		expiresAt,
		acceptedAt: null,
		revokedAt: null,
		createdAt: now,
	};
}

/**
 * Checks if the invitation has expired.
 */
export function isExpired(invitation: AthleteInvitation): boolean {
	return invitation.expiresAt < new Date();
}

/**
 * Checks if the invitation has been revoked.
 */
export function isRevoked(invitation: AthleteInvitation): boolean {
	return invitation.revokedAt !== null;
}

/**
 * Checks if the invitation has been accepted.
 */
export function isAccepted(invitation: AthleteInvitation): boolean {
	return invitation.acceptedAt !== null;
}

/**
 * Checks if the invitation is still valid (not expired, not revoked, not accepted).
 */
export function isValid(invitation: AthleteInvitation): boolean {
	return !isExpired(invitation) && !isRevoked(invitation) && !isAccepted(invitation);
}
