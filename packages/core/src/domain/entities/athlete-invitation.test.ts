import { describe, expect, it } from "vitest";
import {
	createAthleteInvitation,
	generateInvitationToken,
	isAccepted,
	isExpired,
	isRevoked,
	isValid,
} from "./athlete-invitation";

const validInput = {
	id: "invitation-123",
	athleteId: "athlete-456",
	organizationId: "org-789",
	createdByUserId: "user-111",
};

describe("generateInvitationToken", () => {
	it("generates a 43-character base64url token", () => {
		const token = generateInvitationToken();
		expect(token.length).toBe(43);
	});

	it("generates unique tokens on each call", () => {
		const token1 = generateInvitationToken();
		const token2 = generateInvitationToken();
		const token3 = generateInvitationToken();
		expect(token1).not.toBe(token2);
		expect(token2).not.toBe(token3);
		expect(token1).not.toBe(token3);
	});

	it("generates tokens with valid base64url characters", () => {
		const token = generateInvitationToken();
		// base64url uses A-Za-z0-9-_
		expect(/^[A-Za-z0-9_-]+$/.test(token)).toBe(true);
	});
});

describe("createAthleteInvitation", () => {
	it("creates invitation with all required fields", () => {
		const invitation = createAthleteInvitation(validInput);

		expect(invitation.id).toBe("invitation-123");
		expect(invitation.athleteId).toBe("athlete-456");
		expect(invitation.organizationId).toBe("org-789");
		expect(invitation.createdByUserId).toBe("user-111");
	});

	it("generates token automatically", () => {
		const invitation = createAthleteInvitation(validInput);

		expect(invitation.token).toBeDefined();
		expect(invitation.token.length).toBe(43);
	});

	it("sets expiresAt to 7 days from creation", () => {
		const before = new Date();
		const invitation = createAthleteInvitation(validInput);
		const after = new Date();

		// Calculate expected expiry range (7 days in milliseconds)
		const sevenDays = 7 * 24 * 60 * 60 * 1000;
		const expectedMinExpiry = new Date(before.getTime() + sevenDays);
		const expectedMaxExpiry = new Date(after.getTime() + sevenDays);

		expect(invitation.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMinExpiry.getTime());
		expect(invitation.expiresAt.getTime()).toBeLessThanOrEqual(expectedMaxExpiry.getTime());
	});

	it("defaults acceptedAt to null", () => {
		const invitation = createAthleteInvitation(validInput);
		expect(invitation.acceptedAt).toBeNull();
	});

	it("defaults revokedAt to null", () => {
		const invitation = createAthleteInvitation(validInput);
		expect(invitation.revokedAt).toBeNull();
	});

	it("sets createdAt to now", () => {
		const before = new Date();
		const invitation = createAthleteInvitation(validInput);
		const after = new Date();

		expect(invitation.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
		expect(invitation.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
	});
});

describe("helper functions", () => {
	describe("isExpired", () => {
		it("returns false for non-expired invitation", () => {
			const invitation = createAthleteInvitation(validInput);
			expect(isExpired(invitation)).toBe(false);
		});

		it("returns true for expired invitation", () => {
			const invitation = createAthleteInvitation(validInput);
			// Create a copy with past expiry date
			const expiredInvitation = {
				...invitation,
				expiresAt: new Date(Date.now() - 1000), // 1 second ago
			};
			expect(isExpired(expiredInvitation)).toBe(true);
		});
	});

	describe("isRevoked", () => {
		it("returns false when revokedAt is null", () => {
			const invitation = createAthleteInvitation(validInput);
			expect(isRevoked(invitation)).toBe(false);
		});

		it("returns true when revokedAt is set", () => {
			const invitation = createAthleteInvitation(validInput);
			const revokedInvitation = {
				...invitation,
				revokedAt: new Date(),
			};
			expect(isRevoked(revokedInvitation)).toBe(true);
		});
	});

	describe("isAccepted", () => {
		it("returns false when acceptedAt is null", () => {
			const invitation = createAthleteInvitation(validInput);
			expect(isAccepted(invitation)).toBe(false);
		});

		it("returns true when acceptedAt is set", () => {
			const invitation = createAthleteInvitation(validInput);
			const acceptedInvitation = {
				...invitation,
				acceptedAt: new Date(),
			};
			expect(isAccepted(acceptedInvitation)).toBe(true);
		});
	});

	describe("isValid", () => {
		it("returns true for fresh invitation", () => {
			const invitation = createAthleteInvitation(validInput);
			expect(isValid(invitation)).toBe(true);
		});

		it("returns false for expired invitation", () => {
			const invitation = createAthleteInvitation(validInput);
			const expiredInvitation = {
				...invitation,
				expiresAt: new Date(Date.now() - 1000),
			};
			expect(isValid(expiredInvitation)).toBe(false);
		});

		it("returns false for revoked invitation", () => {
			const invitation = createAthleteInvitation(validInput);
			const revokedInvitation = {
				...invitation,
				revokedAt: new Date(),
			};
			expect(isValid(revokedInvitation)).toBe(false);
		});

		it("returns false for accepted invitation", () => {
			const invitation = createAthleteInvitation(validInput);
			const acceptedInvitation = {
				...invitation,
				acceptedAt: new Date(),
			};
			expect(isValid(acceptedInvitation)).toBe(false);
		});

		it("returns false when both expired and revoked", () => {
			const invitation = createAthleteInvitation(validInput);
			const invalidInvitation = {
				...invitation,
				expiresAt: new Date(Date.now() - 1000),
				revokedAt: new Date(),
			};
			expect(isValid(invalidInvitation)).toBe(false);
		});
	});
});
