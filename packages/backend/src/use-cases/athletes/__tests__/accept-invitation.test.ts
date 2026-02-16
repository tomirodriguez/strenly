import type { AthleteInvitationRepositoryPort } from '@strenly/core/ports/athlete-invitation-repository.port'
import type { AthleteRepositoryPort } from '@strenly/core/ports/athlete-repository.port'
import { errAsync, okAsync } from 'neverthrow'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAthleteEntity } from '../../../__tests__/factories/athlete-factory'
import {
  createAcceptedInvitation,
  createExpiredInvitation,
  createInvitationData,
  createRevokedInvitation,
} from '../../../__tests__/factories/invitation-factory'
import { makeAcceptInvitation } from '../accept-invitation'

describe('acceptInvitation use case', () => {
  let mockInvitationRepository: AthleteInvitationRepositoryPort
  let mockAthleteRepository: AthleteRepositoryPort

  beforeEach(() => {
    mockInvitationRepository = {
      create: vi.fn(),
      findByToken: vi.fn(),
      findByAthleteId: vi.fn(),
      markAccepted: vi.fn(),
      revoke: vi.fn(),
    }

    mockAthleteRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByLinkedUserId: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
    } as unknown as AthleteRepositoryPort
  })

  describe('Happy Path', () => {
    it('should accept invitation successfully', async () => {
      const invitation = createInvitationData({
        token: 'valid-token',
        athleteId: 'athlete-123',
        organizationId: 'org-456',
      })

      const athlete = createAthleteEntity({
        id: 'athlete-123',
        organizationId: 'org-456',
        name: 'John Doe',
        email: 'john@example.com',
        linkedUserId: 'user-789',
      })

      // Mock invitation lookup
      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(invitation))

      // Mock mark accepted
      vi.mocked(mockInvitationRepository.markAccepted).mockReturnValue(okAsync(undefined))

      // Mock athlete lookup
      vi.mocked(mockAthleteRepository.findById).mockReturnValue(okAsync(athlete))

      const acceptInvitation = makeAcceptInvitation({
        invitationRepository: mockInvitationRepository,
        athleteRepository: mockAthleteRepository,
      })

      const result = await acceptInvitation({
        token: 'valid-token',
        userId: 'user-789',
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        const { athlete: resultAthlete, organizationId } = result.value
        expect(resultAthlete.id).toBe('athlete-123')
        expect(resultAthlete.name).toBe('John Doe')
        expect(organizationId).toBe('org-456')
      }

      // Verify invitation marked as accepted
      expect(mockInvitationRepository.markAccepted).toHaveBeenCalledWith('valid-token', 'user-789')
    })
  })

  describe('Invalid Token', () => {
    it('should return invalid_token when token not found', async () => {
      // Mock token not found
      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(null))

      const acceptInvitation = makeAcceptInvitation({
        invitationRepository: mockInvitationRepository,
        athleteRepository: mockAthleteRepository,
      })

      const result = await acceptInvitation({
        token: 'invalid-token',
        userId: 'user-123',
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('invalid_token')
        if (result.error.type === 'invalid_token') {
          expect(result.error.message).toContain('Invalid invitation token')
        }
      }

      // markAccepted should NOT be called
      expect(mockInvitationRepository.markAccepted).not.toHaveBeenCalled()
    })

    it('should return invalid_token when repository returns TOKEN_NOT_FOUND', async () => {
      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(
        errAsync({
          type: 'TOKEN_NOT_FOUND',
          token: 'bad-token',
        }),
      )

      const acceptInvitation = makeAcceptInvitation({
        invitationRepository: mockInvitationRepository,
        athleteRepository: mockAthleteRepository,
      })

      const result = await acceptInvitation({
        token: 'bad-token',
        userId: 'user-123',
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('invalid_token')
      }
    })
  })

  describe('Expired Invitation', () => {
    it('should return expired error when invitation has expired', async () => {
      const expiredInvitation = createExpiredInvitation({
        token: 'expired-token',
      })

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(expiredInvitation))

      const acceptInvitation = makeAcceptInvitation({
        invitationRepository: mockInvitationRepository,
        athleteRepository: mockAthleteRepository,
      })

      const result = await acceptInvitation({
        token: 'expired-token',
        userId: 'user-123',
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('expired')
        if (result.error.type === 'expired') {
          expect(result.error.message).toContain('expired')
        }
      }

      expect(mockInvitationRepository.markAccepted).not.toHaveBeenCalled()
    })
  })

  describe('Revoked Invitation', () => {
    it('should return already_revoked error when invitation was revoked', async () => {
      const revokedInvitation = createRevokedInvitation({
        token: 'revoked-token',
      })

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(revokedInvitation))

      const acceptInvitation = makeAcceptInvitation({
        invitationRepository: mockInvitationRepository,
        athleteRepository: mockAthleteRepository,
      })

      const result = await acceptInvitation({
        token: 'revoked-token',
        userId: 'user-123',
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('already_revoked')
        if (result.error.type === 'already_revoked') {
          expect(result.error.message).toContain('revoked')
        }
      }

      expect(mockInvitationRepository.markAccepted).not.toHaveBeenCalled()
    })
  })

  describe('Already Accepted', () => {
    it('should return already_accepted error when invitation was already accepted', async () => {
      const acceptedInvitation = createAcceptedInvitation({
        token: 'accepted-token',
      })

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(acceptedInvitation))

      const acceptInvitation = makeAcceptInvitation({
        invitationRepository: mockInvitationRepository,
        athleteRepository: mockAthleteRepository,
      })

      const result = await acceptInvitation({
        token: 'accepted-token',
        userId: 'user-123',
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('already_accepted')
        if (result.error.type === 'already_accepted') {
          expect(result.error.message).toContain('already been accepted')
        }
      }

      expect(mockInvitationRepository.markAccepted).not.toHaveBeenCalled()
    })
  })

  describe('Athlete Not Found', () => {
    it('should return athlete_not_found when athlete does not exist', async () => {
      const invitation = createInvitationData({
        token: 'valid-token',
        athleteId: 'athlete-123',
      })

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(invitation))
      vi.mocked(mockInvitationRepository.markAccepted).mockReturnValue(okAsync(undefined))

      // Mock athlete not found
      vi.mocked(mockAthleteRepository.findById).mockReturnValue(okAsync(null))

      const acceptInvitation = makeAcceptInvitation({
        invitationRepository: mockInvitationRepository,
        athleteRepository: mockAthleteRepository,
      })

      const result = await acceptInvitation({
        token: 'valid-token',
        userId: 'user-123',
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('athlete_not_found')
        if (result.error.type === 'athlete_not_found') {
          expect(result.error.athleteId).toBe('athlete-123')
        }
      }
    })
  })

  describe('Repository Errors', () => {
    it('should return repository error when findByToken fails', async () => {
      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(
        errAsync({
          type: 'DATABASE_ERROR',
          message: 'Connection lost',
        }),
      )

      const acceptInvitation = makeAcceptInvitation({
        invitationRepository: mockInvitationRepository,
        athleteRepository: mockAthleteRepository,
      })

      const result = await acceptInvitation({
        token: 'some-token',
        userId: 'user-123',
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('repository_error')
      }
    })

    it('should return repository error when markAccepted fails', async () => {
      const invitation = createInvitationData({
        token: 'valid-token',
      })

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(invitation))
      vi.mocked(mockInvitationRepository.markAccepted).mockReturnValue(
        errAsync({
          type: 'DATABASE_ERROR',
          message: 'Update failed',
        }),
      )

      const acceptInvitation = makeAcceptInvitation({
        invitationRepository: mockInvitationRepository,
        athleteRepository: mockAthleteRepository,
      })

      const result = await acceptInvitation({
        token: 'valid-token',
        userId: 'user-123',
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('repository_error')
      }
    })

    it('should return repository error when athlete fetch fails', async () => {
      const invitation = createInvitationData({
        token: 'valid-token',
      })

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(invitation))
      vi.mocked(mockInvitationRepository.markAccepted).mockReturnValue(okAsync(undefined))
      vi.mocked(mockAthleteRepository.findById).mockReturnValue(
        errAsync({
          type: 'DATABASE_ERROR',
          message: 'Query timeout',
        }),
      )

      const acceptInvitation = makeAcceptInvitation({
        invitationRepository: mockInvitationRepository,
        athleteRepository: mockAthleteRepository,
      })

      const result = await acceptInvitation({
        token: 'valid-token',
        userId: 'user-123',
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('repository_error')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle invitation state validation in correct order', async () => {
      // Test that validation happens in order: expired → revoked → accepted

      const invitation = createInvitationData({
        token: 'multi-state-token',
        expiresAt: new Date('2020-01-01'), // Expired
        revokedAt: new Date('2021-01-01'), // Also revoked
        acceptedAt: new Date('2022-01-01'), // Also accepted
      })

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(invitation))

      const acceptInvitation = makeAcceptInvitation({
        invitationRepository: mockInvitationRepository,
        athleteRepository: mockAthleteRepository,
      })

      const result = await acceptInvitation({
        token: 'multi-state-token',
        userId: 'user-123',
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        // Should fail on expired first (first check)
        expect(result.error.type).toBe('expired')
      }
    })
  })
})
