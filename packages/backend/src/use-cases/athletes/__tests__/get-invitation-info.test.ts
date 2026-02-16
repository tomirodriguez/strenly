import type { AthleteInvitationRepositoryPort } from '@strenly/core/ports/athlete-invitation-repository.port'
import { errAsync, okAsync } from 'neverthrow'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createAcceptedInvitation,
  createExpiredInvitation,
  createInvitationData,
  createRevokedInvitation,
} from '../../../__tests__/factories/invitation-factory'
import { makeGetInvitationInfo, type OrganizationLookup } from '../get-invitation-info'

describe('[1.9-UNIT] getInvitationInfo use case', () => {
  let mockInvitationRepository: AthleteInvitationRepositoryPort
  let mockOrganizationLookup: OrganizationLookup

  beforeEach(() => {
    // Mock all repository methods
    mockInvitationRepository = {
      findByToken: vi.fn(),
      findByAthleteId: vi.fn(),
      create: vi.fn(),
      markAccepted: vi.fn(),
      revoke: vi.fn(),
    }

    // Mock organization lookup service
    mockOrganizationLookup = {
      getOrganizationName: vi.fn(),
      getUserName: vi.fn(),
      getAthleteName: vi.fn(),
    }
  })

  describe('Happy Path', () => {
    it('[1.9-UNIT-001] @p0 should get invitation info successfully with all lookups', async () => {
      const token = 'valid-token-123'
      const athleteId = 'athlete-1'
      const organizationId = 'org-1'
      const createdByUserId = 'user-1'

      // Create expiry date 30 days in the future
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 30)

      const invitation = createInvitationData({
        athleteId,
        organizationId,
        createdByUserId,
        token,
        expiresAt: expiryDate,
        acceptedAt: null,
        revokedAt: null,
      })

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(invitation))
      vi.mocked(mockOrganizationLookup.getOrganizationName).mockReturnValue(okAsync('Test Organization'))
      vi.mocked(mockOrganizationLookup.getUserName).mockReturnValue(okAsync('Coach John'))
      vi.mocked(mockOrganizationLookup.getAthleteName).mockReturnValue(okAsync('Athlete Jane'))

      const getInvitationInfo = makeGetInvitationInfo({
        invitationRepository: mockInvitationRepository,
        organizationLookup: mockOrganizationLookup,
      })

      const result = await getInvitationInfo({ token })

      // Assert success
      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        const info = result.value
        expect(info.athleteName).toBe('Athlete Jane')
        expect(info.organizationName).toBe('Test Organization')
        expect(info.coachName).toBe('Coach John')
        expect(info.expiresAt).toEqual(invitation.expiresAt)
        expect(info.isValid).toBe(true) // Not expired, not revoked, not accepted
      }

      // Verify lookup calls
      expect(mockOrganizationLookup.getOrganizationName).toHaveBeenCalledWith(organizationId)
      expect(mockOrganizationLookup.getUserName).toHaveBeenCalledWith(createdByUserId)
      expect(mockOrganizationLookup.getAthleteName).toHaveBeenCalledWith(athleteId, organizationId)
    })

    it('[1.9-UNIT-002] @p0 should return valid pending invitation', async () => {
      const token = 'valid-token-123'

      // Create expiry date 30 days in the future
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 30)

      const invitation = createInvitationData({
        token,
        expiresAt: expiryDate,
        acceptedAt: null,
        revokedAt: null,
      })

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(invitation))
      vi.mocked(mockOrganizationLookup.getOrganizationName).mockReturnValue(okAsync('Org'))
      vi.mocked(mockOrganizationLookup.getUserName).mockReturnValue(okAsync('Coach'))
      vi.mocked(mockOrganizationLookup.getAthleteName).mockReturnValue(okAsync('Athlete'))

      const getInvitationInfo = makeGetInvitationInfo({
        invitationRepository: mockInvitationRepository,
        organizationLookup: mockOrganizationLookup,
      })

      const result = await getInvitationInfo({ token })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.isValid).toBe(true)
      }
    })

    it('[1.9-UNIT-003] @p1 should return invalid when invitation is expired', async () => {
      const token = 'expired-token'

      const invitation = createExpiredInvitation({ token })

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(invitation))
      vi.mocked(mockOrganizationLookup.getOrganizationName).mockReturnValue(okAsync('Org'))
      vi.mocked(mockOrganizationLookup.getUserName).mockReturnValue(okAsync('Coach'))
      vi.mocked(mockOrganizationLookup.getAthleteName).mockReturnValue(okAsync('Athlete'))

      const getInvitationInfo = makeGetInvitationInfo({
        invitationRepository: mockInvitationRepository,
        organizationLookup: mockOrganizationLookup,
      })

      const result = await getInvitationInfo({ token })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.isValid).toBe(false)
      }
    })

    it('[1.9-UNIT-004] @p1 should return invalid when invitation is revoked', async () => {
      const token = 'revoked-token'

      const invitation = createRevokedInvitation({ token })

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(invitation))
      vi.mocked(mockOrganizationLookup.getOrganizationName).mockReturnValue(okAsync('Org'))
      vi.mocked(mockOrganizationLookup.getUserName).mockReturnValue(okAsync('Coach'))
      vi.mocked(mockOrganizationLookup.getAthleteName).mockReturnValue(okAsync('Athlete'))

      const getInvitationInfo = makeGetInvitationInfo({
        invitationRepository: mockInvitationRepository,
        organizationLookup: mockOrganizationLookup,
      })

      const result = await getInvitationInfo({ token })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.isValid).toBe(false)
      }
    })

    it('[1.9-UNIT-005] @p1 should return invalid when invitation is accepted', async () => {
      const token = 'accepted-token'

      const invitation = createAcceptedInvitation({ token })

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(invitation))
      vi.mocked(mockOrganizationLookup.getOrganizationName).mockReturnValue(okAsync('Org'))
      vi.mocked(mockOrganizationLookup.getUserName).mockReturnValue(okAsync('Coach'))
      vi.mocked(mockOrganizationLookup.getAthleteName).mockReturnValue(okAsync('Athlete'))

      const getInvitationInfo = makeGetInvitationInfo({
        invitationRepository: mockInvitationRepository,
        organizationLookup: mockOrganizationLookup,
      })

      const result = await getInvitationInfo({ token })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.isValid).toBe(false)
      }
    })
  })

  // NOTE: NO Authorization tests - this is a public endpoint

  describe('Validation Errors', () => {
    it('[1.9-UNIT-006] @p1 should return invalid_token error when token does not exist', async () => {
      const token = 'non-existent-token'

      // Mock repository returning null
      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(null))

      const getInvitationInfo = makeGetInvitationInfo({
        invitationRepository: mockInvitationRepository,
        organizationLookup: mockOrganizationLookup,
      })

      const result = await getInvitationInfo({ token })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error
        expect(error.type).toBe('invalid_token')
        if (error.type === 'invalid_token') {
          expect(error.message).toContain('Invalid invitation token')
        }
      }

      // Lookup services should NOT be called
      expect(mockOrganizationLookup.getOrganizationName).not.toHaveBeenCalled()
      expect(mockOrganizationLookup.getUserName).not.toHaveBeenCalled()
      expect(mockOrganizationLookup.getAthleteName).not.toHaveBeenCalled()
    })

    it('[1.9-UNIT-007] @p1 should return invalid_token error when findByToken returns TOKEN_NOT_FOUND', async () => {
      const token = 'invalid-token'

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(
        errAsync({
          type: 'TOKEN_NOT_FOUND',
          token,
        }),
      )

      const getInvitationInfo = makeGetInvitationInfo({
        invitationRepository: mockInvitationRepository,
        organizationLookup: mockOrganizationLookup,
      })

      const result = await getInvitationInfo({ token })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error
        expect(error.type).toBe('invalid_token')
        if (error.type === 'invalid_token') {
          expect(error.message).toContain('Invalid invitation token')
        }
      }
    })
  })

  describe('Repository Errors', () => {
    it('[1.9-UNIT-008] @p1 should return repository error when findByToken fails', async () => {
      const token = 'some-token'

      // Mock repository failure
      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(
        errAsync({
          type: 'DATABASE_ERROR',
          message: 'Connection timeout',
        }),
      )

      const getInvitationInfo = makeGetInvitationInfo({
        invitationRepository: mockInvitationRepository,
        organizationLookup: mockOrganizationLookup,
      })

      const result = await getInvitationInfo({ token })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error
        expect(error.type).toBe('repository_error')
        if (error.type === 'repository_error') {
          expect(error.message).toContain('Connection timeout')
        }
      }
    })

    it('[1.9-UNIT-009] @p1 should return repository error when organization lookup fails', async () => {
      const token = 'valid-token'

      const invitation = createInvitationData({ token })

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(invitation))

      // Mock organization lookup failure
      vi.mocked(mockOrganizationLookup.getOrganizationName).mockReturnValue(
        errAsync({
          message: 'Failed to fetch organization',
        }),
      )

      const getInvitationInfo = makeGetInvitationInfo({
        invitationRepository: mockInvitationRepository,
        organizationLookup: mockOrganizationLookup,
      })

      const result = await getInvitationInfo({ token })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error
        expect(error.type).toBe('repository_error')
        if (error.type === 'repository_error') {
          expect(error.message).toContain('Failed to fetch organization')
        }
      }
    })

    it('[1.9-UNIT-010] @p1 should return repository error when user lookup fails', async () => {
      const token = 'valid-token'

      const invitation = createInvitationData({ token, createdByUserId: 'user-1' })

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(invitation))
      vi.mocked(mockOrganizationLookup.getOrganizationName).mockReturnValue(okAsync('Org'))

      // Mock user lookup failure
      vi.mocked(mockOrganizationLookup.getUserName).mockReturnValue(
        errAsync({
          message: 'Failed to fetch user',
        }),
      )

      const getInvitationInfo = makeGetInvitationInfo({
        invitationRepository: mockInvitationRepository,
        organizationLookup: mockOrganizationLookup,
      })

      const result = await getInvitationInfo({ token })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error
        expect(error.type).toBe('repository_error')
        if (error.type === 'repository_error') {
          expect(error.message).toContain('Failed to fetch user')
        }
      }
    })

    it('[1.9-UNIT-011] @p1 should return repository error when athlete lookup fails', async () => {
      const token = 'valid-token'

      const invitation = createInvitationData({ token, createdByUserId: 'user-1' })

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(invitation))
      vi.mocked(mockOrganizationLookup.getOrganizationName).mockReturnValue(okAsync('Org'))
      vi.mocked(mockOrganizationLookup.getUserName).mockReturnValue(okAsync('Coach'))

      // Mock athlete lookup failure
      vi.mocked(mockOrganizationLookup.getAthleteName).mockReturnValue(
        errAsync({
          message: 'Failed to fetch athlete',
        }),
      )

      const getInvitationInfo = makeGetInvitationInfo({
        invitationRepository: mockInvitationRepository,
        organizationLookup: mockOrganizationLookup,
      })

      const result = await getInvitationInfo({ token })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error
        expect(error.type).toBe('repository_error')
        if (error.type === 'repository_error') {
          expect(error.message).toContain('Failed to fetch athlete')
        }
      }
    })
  })

  describe('Edge Cases', () => {
    it('[1.9-UNIT-012] @p2 should fallback to "Unknown" when organization name is null', async () => {
      const token = 'valid-token'

      const invitation = createInvitationData({ token })

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(invitation))
      vi.mocked(mockOrganizationLookup.getOrganizationName).mockReturnValue(okAsync(null)) // Null name
      vi.mocked(mockOrganizationLookup.getUserName).mockReturnValue(okAsync('Coach'))
      vi.mocked(mockOrganizationLookup.getAthleteName).mockReturnValue(okAsync('Athlete'))

      const getInvitationInfo = makeGetInvitationInfo({
        invitationRepository: mockInvitationRepository,
        organizationLookup: mockOrganizationLookup,
      })

      const result = await getInvitationInfo({ token })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.organizationName).toBe('Unknown')
      }
    })

    it('[1.9-UNIT-013] @p2 should fallback to "Unknown" when coach name is null', async () => {
      const token = 'valid-token'

      const invitation = createInvitationData({ token, createdByUserId: 'user-1' })

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(invitation))
      vi.mocked(mockOrganizationLookup.getOrganizationName).mockReturnValue(okAsync('Org'))
      vi.mocked(mockOrganizationLookup.getUserName).mockReturnValue(okAsync(null)) // Null name
      vi.mocked(mockOrganizationLookup.getAthleteName).mockReturnValue(okAsync('Athlete'))

      const getInvitationInfo = makeGetInvitationInfo({
        invitationRepository: mockInvitationRepository,
        organizationLookup: mockOrganizationLookup,
      })

      const result = await getInvitationInfo({ token })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.coachName).toBe('Unknown')
      }
    })

    it('[1.9-UNIT-014] @p2 should fallback to "Unknown" when athlete name is null', async () => {
      const token = 'valid-token'

      const invitation = createInvitationData({ token })

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(invitation))
      vi.mocked(mockOrganizationLookup.getOrganizationName).mockReturnValue(okAsync('Org'))
      vi.mocked(mockOrganizationLookup.getUserName).mockReturnValue(okAsync('Coach'))
      vi.mocked(mockOrganizationLookup.getAthleteName).mockReturnValue(okAsync(null)) // Null name

      const getInvitationInfo = makeGetInvitationInfo({
        invitationRepository: mockInvitationRepository,
        organizationLookup: mockOrganizationLookup,
      })

      const result = await getInvitationInfo({ token })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.athleteName).toBe('Unknown')
      }
    })

    it('[1.9-UNIT-015] @p2 should handle invitation with null createdByUserId (skip user lookup)', async () => {
      const token = 'valid-token'
      const athleteId = 'athlete-1'
      const organizationId = 'org-1'

      const invitation = createInvitationData({
        athleteId,
        organizationId,
        createdByUserId: null, // System-generated invitation
        token,
      })

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(invitation))
      vi.mocked(mockOrganizationLookup.getOrganizationName).mockReturnValue(okAsync('Org'))
      // getUserName should NOT be called
      vi.mocked(mockOrganizationLookup.getAthleteName).mockReturnValue(okAsync('Athlete'))

      const getInvitationInfo = makeGetInvitationInfo({
        invitationRepository: mockInvitationRepository,
        organizationLookup: mockOrganizationLookup,
      })

      const result = await getInvitationInfo({ token })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.coachName).toBe('Unknown')
      }

      // User lookup should NOT be called
      expect(mockOrganizationLookup.getUserName).not.toHaveBeenCalled()
    })

    it('[1.9-UNIT-016] @p2 should handle invitation near expiry', async () => {
      const token = 'valid-token'

      // Expires in 1 hour
      const nearExpiryDate = new Date()
      nearExpiryDate.setHours(nearExpiryDate.getHours() + 1)

      const invitation = createInvitationData({
        token,
        expiresAt: nearExpiryDate,
        acceptedAt: null,
        revokedAt: null,
      })

      vi.mocked(mockInvitationRepository.findByToken).mockReturnValue(okAsync(invitation))
      vi.mocked(mockOrganizationLookup.getOrganizationName).mockReturnValue(okAsync('Org'))
      vi.mocked(mockOrganizationLookup.getUserName).mockReturnValue(okAsync('Coach'))
      vi.mocked(mockOrganizationLookup.getAthleteName).mockReturnValue(okAsync('Athlete'))

      const getInvitationInfo = makeGetInvitationInfo({
        invitationRepository: mockInvitationRepository,
        organizationLookup: mockOrganizationLookup,
      })

      const result = await getInvitationInfo({ token })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        // Should still be valid (not expired yet)
        expect(result.value.isValid).toBe(true)
        expect(result.value.expiresAt.getTime()).toBeGreaterThan(Date.now())
      }
    })
  })
})
