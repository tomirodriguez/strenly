import { describe, expect, it } from 'vitest'
import {
  acceptInvitation,
  createAthleteInvitation,
  isAccepted,
  isExpired,
  isRevoked,
  isValid,
  reconstituteAthleteInvitation,
  revokeInvitation,
} from '../athlete-invitation'

const validInput = {
  id: 'invitation-123',
  athleteId: 'athlete-456',
  organizationId: 'org-789',
  createdByUserId: 'user-111',
  token: 'test-token-abc123-xyz789-secure-value',
}

describe('createAthleteInvitation', () => {
  it('creates invitation with all required fields', () => {
    const result = createAthleteInvitation(validInput)

    expect(result.isOk()).toBe(true)
    const invitation = result._unsafeUnwrap()
    expect(invitation.id).toBe('invitation-123')
    expect(invitation.athleteId).toBe('athlete-456')
    expect(invitation.organizationId).toBe('org-789')
    expect(invitation.createdByUserId).toBe('user-111')
  })

  it('uses provided token', () => {
    const result = createAthleteInvitation(validInput)

    expect(result.isOk()).toBe(true)
    const invitation = result._unsafeUnwrap()
    expect(invitation.token).toBe('test-token-abc123-xyz789-secure-value')
  })

  it('sets expiresAt to 7 days from creation', () => {
    const before = new Date()
    const result = createAthleteInvitation(validInput)
    const after = new Date()

    expect(result.isOk()).toBe(true)
    const invitation = result._unsafeUnwrap()

    // Calculate expected expiry range (7 days in milliseconds)
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    const expectedMinExpiry = new Date(before.getTime() + sevenDays)
    const expectedMaxExpiry = new Date(after.getTime() + sevenDays)

    expect(invitation.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMinExpiry.getTime())
    expect(invitation.expiresAt.getTime()).toBeLessThanOrEqual(expectedMaxExpiry.getTime())
  })

  it('defaults acceptedAt to null', () => {
    const result = createAthleteInvitation(validInput)
    expect(result._unsafeUnwrap().acceptedAt).toBeNull()
  })

  it('defaults revokedAt to null', () => {
    const result = createAthleteInvitation(validInput)
    expect(result._unsafeUnwrap().revokedAt).toBeNull()
  })

  it('sets createdAt to now', () => {
    const before = new Date()
    const result = createAthleteInvitation(validInput)
    const after = new Date()

    const invitation = result._unsafeUnwrap()
    expect(invitation.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(invitation.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })
})

describe('reconstituteAthleteInvitation', () => {
  it('reconstitutes an invitation from database props', () => {
    const dbProps = {
      id: 'inv-1',
      athleteId: 'athlete-1',
      organizationId: 'org-1',
      createdByUserId: 'user-1',
      token: 'stored-token',
      expiresAt: new Date('2026-02-20'),
      acceptedAt: null,
      revokedAt: null,
      createdAt: new Date('2026-02-13'),
    }

    const invitation = reconstituteAthleteInvitation(dbProps)
    expect(invitation.id).toBe('inv-1')
    expect(invitation.token).toBe('stored-token')
    expect(invitation.expiresAt).toEqual(new Date('2026-02-20'))
  })
})

describe('acceptInvitation', () => {
  it('accepts a valid invitation', () => {
    const invitation = createAthleteInvitation(validInput)._unsafeUnwrap()
    const result = acceptInvitation(invitation)

    expect(result.isOk()).toBe(true)
    const accepted = result._unsafeUnwrap()
    expect(accepted.acceptedAt).toBeInstanceOf(Date)
  })

  it('returns error when already accepted', () => {
    const invitation = createAthleteInvitation(validInput)._unsafeUnwrap()
    const accepted = { ...invitation, acceptedAt: new Date() }
    const result = acceptInvitation(accepted)

    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().type).toBe('ALREADY_ACCEPTED')
  })

  it('returns error when revoked', () => {
    const invitation = createAthleteInvitation(validInput)._unsafeUnwrap()
    const revoked = { ...invitation, revokedAt: new Date() }
    const result = acceptInvitation(revoked)

    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().type).toBe('ALREADY_REVOKED')
  })

  it('returns error when expired', () => {
    const invitation = createAthleteInvitation(validInput)._unsafeUnwrap()
    const expired = { ...invitation, expiresAt: new Date(Date.now() - 1000) }
    const result = acceptInvitation(expired)

    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().type).toBe('EXPIRED')
  })
})

describe('revokeInvitation', () => {
  it('revokes a valid invitation', () => {
    const invitation = createAthleteInvitation(validInput)._unsafeUnwrap()
    const result = revokeInvitation(invitation)

    expect(result.isOk()).toBe(true)
    const revoked = result._unsafeUnwrap()
    expect(revoked.revokedAt).toBeInstanceOf(Date)
  })

  it('returns error when already accepted', () => {
    const invitation = createAthleteInvitation(validInput)._unsafeUnwrap()
    const accepted = { ...invitation, acceptedAt: new Date() }
    const result = revokeInvitation(accepted)

    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().type).toBe('ALREADY_ACCEPTED')
  })

  it('returns error when already revoked', () => {
    const invitation = createAthleteInvitation(validInput)._unsafeUnwrap()
    const revoked = { ...invitation, revokedAt: new Date() }
    const result = revokeInvitation(revoked)

    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().type).toBe('ALREADY_REVOKED')
  })
})

describe('helper functions', () => {
  describe('isExpired', () => {
    it('returns false for non-expired invitation', () => {
      const invitation = createAthleteInvitation(validInput)._unsafeUnwrap()
      expect(isExpired(invitation)).toBe(false)
    })

    it('returns true for expired invitation', () => {
      const invitation = createAthleteInvitation(validInput)._unsafeUnwrap()
      const expiredInvitation = {
        ...invitation,
        expiresAt: new Date(Date.now() - 1000),
      }
      expect(isExpired(expiredInvitation)).toBe(true)
    })
  })

  describe('isRevoked', () => {
    it('returns false when revokedAt is null', () => {
      const invitation = createAthleteInvitation(validInput)._unsafeUnwrap()
      expect(isRevoked(invitation)).toBe(false)
    })

    it('returns true when revokedAt is set', () => {
      const invitation = createAthleteInvitation(validInput)._unsafeUnwrap()
      const revokedInvitation = {
        ...invitation,
        revokedAt: new Date(),
      }
      expect(isRevoked(revokedInvitation)).toBe(true)
    })
  })

  describe('isAccepted', () => {
    it('returns false when acceptedAt is null', () => {
      const invitation = createAthleteInvitation(validInput)._unsafeUnwrap()
      expect(isAccepted(invitation)).toBe(false)
    })

    it('returns true when acceptedAt is set', () => {
      const invitation = createAthleteInvitation(validInput)._unsafeUnwrap()
      const acceptedInvitation = {
        ...invitation,
        acceptedAt: new Date(),
      }
      expect(isAccepted(acceptedInvitation)).toBe(true)
    })
  })

  describe('isValid', () => {
    it('returns true for fresh invitation', () => {
      const invitation = createAthleteInvitation(validInput)._unsafeUnwrap()
      expect(isValid(invitation)).toBe(true)
    })

    it('returns false for expired invitation', () => {
      const invitation = createAthleteInvitation(validInput)._unsafeUnwrap()
      const expiredInvitation = {
        ...invitation,
        expiresAt: new Date(Date.now() - 1000),
      }
      expect(isValid(expiredInvitation)).toBe(false)
    })

    it('returns false for revoked invitation', () => {
      const invitation = createAthleteInvitation(validInput)._unsafeUnwrap()
      const revokedInvitation = {
        ...invitation,
        revokedAt: new Date(),
      }
      expect(isValid(revokedInvitation)).toBe(false)
    })

    it('returns false for accepted invitation', () => {
      const invitation = createAthleteInvitation(validInput)._unsafeUnwrap()
      const acceptedInvitation = {
        ...invitation,
        acceptedAt: new Date(),
      }
      expect(isValid(acceptedInvitation)).toBe(false)
    })

    it('returns false when both expired and revoked', () => {
      const invitation = createAthleteInvitation(validInput)._unsafeUnwrap()
      const invalidInvitation = {
        ...invitation,
        expiresAt: new Date(Date.now() - 1000),
        revokedAt: new Date(),
      }
      expect(isValid(invalidInvitation)).toBe(false)
    })
  })
})
