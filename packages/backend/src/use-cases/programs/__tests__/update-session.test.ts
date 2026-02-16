import type { ProgramRepositoryPort, ProgramSession } from '@strenly/core/ports/program-repository.port'
import { errAsync, okAsync } from 'neverthrow'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAdminContext, createMemberContext } from '../../../__tests__/helpers/test-context'
import { makeUpdateSession } from '../update-session'

describe('updateSession use case', () => {
  let mockProgramRepository: ProgramRepositoryPort

  beforeEach(() => {
    // Mock ALL repository methods
    mockProgramRepository = {
      loadProgramAggregate: vi.fn(),
      saveProgramAggregate: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      list: vi.fn(),
      findWithDetails: vi.fn(),
      createWeek: vi.fn(),
      findWeekById: vi.fn(),
      updateWeek: vi.fn(),
      deleteWeek: vi.fn(),
      findSessionById: vi.fn(),
      createSession: vi.fn(),
      updateSession: vi.fn(),
      deleteSession: vi.fn(),
      createGroup: vi.fn(),
      updateGroup: vi.fn(),
      deleteGroup: vi.fn(),
      getMaxGroupOrderIndex: vi.fn(),
      findExerciseRowById: vi.fn(),
      getMaxExerciseRowOrderIndex: vi.fn(),
      createExerciseRow: vi.fn(),
      updateExerciseRow: vi.fn(),
      deleteExerciseRow: vi.fn(),
      upsertPrescription: vi.fn(),
      updatePrescriptionSeries: vi.fn(),
      saveDraft: vi.fn(),
      reorderExerciseRows: vi.fn(),
      duplicateWeek: vi.fn(),
      repositionRowToEndOfSession: vi.fn(),
      findExerciseRowsBySessionId: vi.fn(),
    }
  })

  describe('Happy Path', () => {
    it('should update session name successfully', async () => {
      const ctx = createAdminContext()
      const sessionId = 'session-1'

      // Mock existing session
      const existingSession: ProgramSession = {
        id: sessionId,
        programId: 'program-1',
        name: 'Old Session Name',
        orderIndex: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      vi.mocked(mockProgramRepository.findSessionById).mockReturnValue(okAsync(existingSession))

      // Mock successful update
      const updatedSession: ProgramSession = {
        ...existingSession,
        name: 'New Session Name',
        updatedAt: new Date('2024-01-02'),
      }
      vi.mocked(mockProgramRepository.updateSession).mockReturnValue(okAsync(updatedSession))

      const updateSession = makeUpdateSession({
        programRepository: mockProgramRepository,
      })

      const result = await updateSession({
        ...ctx,
        sessionId,
        name: 'New Session Name',
      })

      // Assert success
      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        const session = result.value
        expect(session.name).toBe('New Session Name')
        expect(session.orderIndex).toBe(0) // Unchanged
      }

      // Verify repository calls
      expect(mockProgramRepository.findSessionById).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: ctx.organizationId,
        }),
        sessionId,
      )
      expect(mockProgramRepository.updateSession).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: ctx.organizationId,
        }),
        expect.objectContaining({
          id: sessionId,
          name: 'New Session Name',
        }),
      )
    })

    it('should update with same name (idempotent)', async () => {
      const ctx = createAdminContext()
      const sessionId = 'session-1'

      const existingSession: ProgramSession = {
        id: sessionId,
        programId: 'program-1',
        name: 'Day 1',
        orderIndex: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      vi.mocked(mockProgramRepository.findSessionById).mockReturnValue(okAsync(existingSession))

      const updatedSession: ProgramSession = {
        ...existingSession,
        updatedAt: new Date('2024-01-02'),
      }
      vi.mocked(mockProgramRepository.updateSession).mockReturnValue(okAsync(updatedSession))

      const updateSession = makeUpdateSession({
        programRepository: mockProgramRepository,
      })

      const result = await updateSession({
        ...ctx,
        sessionId,
        name: 'Day 1', // Same name
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        const session = result.value
        expect(session.name).toBe('Day 1')
      }
    })

    it('should update session in multi-session program', async () => {
      const ctx = createAdminContext()
      const sessionId = 'session-3'

      const existingSession: ProgramSession = {
        id: sessionId,
        programId: 'program-1',
        name: 'Day 3',
        orderIndex: 2, // Third session
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      vi.mocked(mockProgramRepository.findSessionById).mockReturnValue(okAsync(existingSession))

      const updatedSession: ProgramSession = {
        ...existingSession,
        name: 'Upper Body',
        updatedAt: new Date('2024-01-02'),
      }
      vi.mocked(mockProgramRepository.updateSession).mockReturnValue(okAsync(updatedSession))

      const updateSession = makeUpdateSession({
        programRepository: mockProgramRepository,
      })

      const result = await updateSession({
        ...ctx,
        sessionId,
        name: 'Upper Body',
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        const session = result.value
        expect(session.name).toBe('Upper Body')
        expect(session.orderIndex).toBe(2) // Preserved
      }
    })
  })

  describe('Authorization', () => {
    it('should return forbidden error when user lacks programs:write permission', async () => {
      const ctx = createMemberContext() // Member role lacks write permission
      const sessionId = 'session-1'

      const updateSession = makeUpdateSession({
        programRepository: mockProgramRepository,
      })

      const result = await updateSession({
        ...ctx,
        sessionId,
        name: 'New Name',
      })

      // Assert authorization failure
      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error
        expect(error.type).toBe('forbidden')
        if (error.type === 'forbidden') {
          expect(error.message).toContain('No permission')
        }
      }

      // Repository should NOT be called
      expect(mockProgramRepository.findSessionById).not.toHaveBeenCalled()
      expect(mockProgramRepository.updateSession).not.toHaveBeenCalled()
    })

    it('should succeed when user has admin role (has programs:write)', async () => {
      const ctx = createAdminContext() // Admin role has write permission
      const sessionId = 'session-1'

      const existingSession: ProgramSession = {
        id: sessionId,
        programId: 'program-1',
        name: 'Old Name',
        orderIndex: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      vi.mocked(mockProgramRepository.findSessionById).mockReturnValue(okAsync(existingSession))

      const updatedSession: ProgramSession = {
        ...existingSession,
        name: 'New Name',
        updatedAt: new Date('2024-01-02'),
      }
      vi.mocked(mockProgramRepository.updateSession).mockReturnValue(okAsync(updatedSession))

      const updateSession = makeUpdateSession({
        programRepository: mockProgramRepository,
      })

      const result = await updateSession({
        ...ctx,
        sessionId,
        name: 'New Name',
      })

      expect(result.isOk()).toBe(true)
    })
  })

  describe('Validation Errors', () => {
    it('should return not_found when sessionId does not exist', async () => {
      const ctx = createAdminContext()
      const sessionId = 'non-existent-session'

      // Mock repository returning null (not found)
      vi.mocked(mockProgramRepository.findSessionById).mockReturnValue(okAsync(null))

      const updateSession = makeUpdateSession({
        programRepository: mockProgramRepository,
      })

      const result = await updateSession({
        ...ctx,
        sessionId,
        name: 'New Name',
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error
        expect(error.type).toBe('not_found')
        if (error.type === 'not_found') {
          expect(error.sessionId).toBe(sessionId)
        }
      }

      // Repository update should NOT be called
      expect(mockProgramRepository.updateSession).not.toHaveBeenCalled()
    })

    it('should return validation_error when name is too long', async () => {
      const ctx = createAdminContext()
      const sessionId = 'session-1'

      const existingSession: ProgramSession = {
        id: sessionId,
        programId: 'program-1',
        name: 'Old Name',
        orderIndex: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      vi.mocked(mockProgramRepository.findSessionById).mockReturnValue(okAsync(existingSession))

      const updateSession = makeUpdateSession({
        programRepository: mockProgramRepository,
      })

      const result = await updateSession({
        ...ctx,
        sessionId,
        name: 'A'.repeat(51), // Invalid: exceeds 50 character limit
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error
        expect(error.type).toBe('validation_error')
        if (error.type === 'validation_error') {
          expect(error.message).toContain('must not exceed 50 characters')
        }
      }

      // Repository update should NOT be called for invalid input
      expect(mockProgramRepository.updateSession).not.toHaveBeenCalled()
    })
  })

  describe('Repository Errors', () => {
    it('should return repository error when findSessionById fails', async () => {
      const ctx = createAdminContext()
      const sessionId = 'session-1'

      // Mock repository findSessionById failure
      vi.mocked(mockProgramRepository.findSessionById).mockReturnValue(
        errAsync({
          type: 'DATABASE_ERROR',
          message: 'Connection failed',
        }),
      )

      const updateSession = makeUpdateSession({
        programRepository: mockProgramRepository,
      })

      const result = await updateSession({
        ...ctx,
        sessionId,
        name: 'New Name',
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error
        expect(error.type).toBe('repository_error')
        if (error.type === 'repository_error') {
          expect(error.message).toContain('Connection failed')
        }
      }
    })
  })

  describe('Edge Cases', () => {
    it('should update session with special characters in name', async () => {
      const ctx = createAdminContext()
      const sessionId = 'session-1'

      const existingSession: ProgramSession = {
        id: sessionId,
        programId: 'program-1',
        name: 'Old Name',
        orderIndex: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      vi.mocked(mockProgramRepository.findSessionById).mockReturnValue(okAsync(existingSession))

      const updatedSession: ProgramSession = {
        ...existingSession,
        name: 'Day #1 - Push (Chest/Shoulders)',
        updatedAt: new Date('2024-01-02'),
      }
      vi.mocked(mockProgramRepository.updateSession).mockReturnValue(okAsync(updatedSession))

      const updateSession = makeUpdateSession({
        programRepository: mockProgramRepository,
      })

      const result = await updateSession({
        ...ctx,
        sessionId,
        name: 'Day #1 - Push (Chest/Shoulders)',
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        const session = result.value
        expect(session.name).toBe('Day #1 - Push (Chest/Shoulders)')
      }
    })

    it('should return validation_error when name is empty', async () => {
      const ctx = createAdminContext()
      const sessionId = 'session-1'

      const existingSession: ProgramSession = {
        id: sessionId,
        programId: 'program-1',
        name: 'Old Name',
        orderIndex: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      vi.mocked(mockProgramRepository.findSessionById).mockReturnValue(okAsync(existingSession))

      const updateSession = makeUpdateSession({
        programRepository: mockProgramRepository,
      })

      const result = await updateSession({
        ...ctx,
        sessionId,
        name: '', // Empty - should fail
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error
        expect(error.type).toBe('validation_error')
        if (error.type === 'validation_error') {
          expect(error.message).toContain('Session name is required')
        }
      }

      // Repository update should NOT be called for invalid input
      expect(mockProgramRepository.updateSession).not.toHaveBeenCalled()
    })
  })
})
