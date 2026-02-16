import { faker } from '@faker-js/faker'
import type { ExerciseRepositoryPort } from '@strenly/core/ports/exercise-repository.port'
import type { ProgramRepositoryPort } from '@strenly/core/ports/program-repository.port'
import { errAsync, okAsync } from 'neverthrow'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createExerciseEntity } from '../../../__tests__/factories/exercise-factory'
import { createMemberContext, createTestContext } from '../../../__tests__/helpers/test-context'
import { makeAddExerciseRow } from '../add-exercise-row'

describe('addExerciseRow use case', () => {
  let mockProgramRepository: ProgramRepositoryPort
  let mockExerciseRepository: ExerciseRepositoryPort
  let mockGenerateId: () => string
  const sessionId = 'session-123'
  const exerciseId = 'exercise-456'
  const orgId = 'org-789'

  beforeEach(() => {
    mockProgramRepository = {
      findById: vi.fn(),
      update: vi.fn(),
      saveProgramAggregate: vi.fn(),
      getMaxExerciseRowOrderIndex: vi.fn(),
      createExerciseRow: vi.fn(),
    } as unknown as ProgramRepositoryPort
    mockExerciseRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
    } as unknown as ExerciseRepositoryPort
    mockGenerateId = vi.fn(() => faker.string.uuid())
  })

  describe('Happy Path', () => {
    it('should add exercise row successfully to empty session', async () => {
      const rowId = 'row-new-123'
      vi.mocked(mockGenerateId).mockReturnValue(rowId)

      // Empty session has max orderIndex -1
      vi.mocked(mockProgramRepository.getMaxExerciseRowOrderIndex).mockReturnValue(okAsync(-1))

      const createdRow = {
        id: rowId,
        sessionId,
        exerciseId,
        orderIndex: 0,
        groupId: null,
        orderWithinGroup: null,
        setTypeLabel: null,
        notes: null,
        restSeconds: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockProgramRepository.createExerciseRow).mockReturnValue(okAsync(createdRow))

      const exercise = createExerciseEntity({
        id: exerciseId,
        organizationId: orgId,
        name: 'Barbell Squat',
      })

      vi.mocked(mockExerciseRepository.findById).mockReturnValue(okAsync(exercise))

      const ctx = createTestContext({ organizationId: orgId })
      const addExerciseRow = makeAddExerciseRow({
        programRepository: mockProgramRepository,
        exerciseRepository: mockExerciseRepository,
        generateId: mockGenerateId,
      })

      const result = await addExerciseRow({
        ...ctx,
        sessionId,
        exerciseId,
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.row.id).toBe(rowId)
        expect(result.value.row.exerciseId).toBe(exerciseId)
        expect(result.value.row.orderIndex).toBe(0)
        expect(result.value.row.groupId).toBe(null)
        expect(result.value.exerciseName).toBe('Barbell Squat')
      }

      expect(mockProgramRepository.createExerciseRow).toHaveBeenCalledWith(
        ctx,
        sessionId,
        expect.objectContaining({
          id: rowId,
          exerciseId,
          orderIndex: 0,
        }),
      )
    })

    it('should add exercise row to existing session with correct orderIndex', async () => {
      // Existing session has 2 rows (orderIndex 0, 1), so max is 1
      vi.mocked(mockProgramRepository.getMaxExerciseRowOrderIndex).mockReturnValue(okAsync(1))

      const createdRow = {
        id: 'row-123',
        sessionId,
        exerciseId,
        orderIndex: 2,
        groupId: null,
        orderWithinGroup: null,
        setTypeLabel: null,
        notes: null,
        restSeconds: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockProgramRepository.createExerciseRow).mockReturnValue(okAsync(createdRow))

      const exercise = createExerciseEntity({
        id: exerciseId,
        organizationId: orgId,
        name: 'Bench Press',
      })

      vi.mocked(mockExerciseRepository.findById).mockReturnValue(okAsync(exercise))

      const ctx = createTestContext({ organizationId: orgId })
      const addExerciseRow = makeAddExerciseRow({
        programRepository: mockProgramRepository,
        exerciseRepository: mockExerciseRepository,
        generateId: mockGenerateId,
      })

      const result = await addExerciseRow({
        ...ctx,
        sessionId,
        exerciseId,
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.row.orderIndex).toBe(2)
      }
    })

    it('should add exercise row with groupId when provided', async () => {
      const groupId = 'group-123'
      vi.mocked(mockProgramRepository.getMaxExerciseRowOrderIndex).mockReturnValue(okAsync(0))

      const createdRow = {
        id: 'row-123',
        sessionId,
        exerciseId,
        orderIndex: 1,
        groupId,
        orderWithinGroup: null,
        setTypeLabel: null,
        notes: null,
        restSeconds: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockProgramRepository.createExerciseRow).mockReturnValue(okAsync(createdRow))

      const exercise = createExerciseEntity({
        id: exerciseId,
        organizationId: orgId,
        name: 'Pull-ups',
      })

      vi.mocked(mockExerciseRepository.findById).mockReturnValue(okAsync(exercise))

      const ctx = createTestContext({ organizationId: orgId })
      const addExerciseRow = makeAddExerciseRow({
        programRepository: mockProgramRepository,
        exerciseRepository: mockExerciseRepository,
        generateId: mockGenerateId,
      })

      const result = await addExerciseRow({
        ...ctx,
        sessionId,
        exerciseId,
        groupId,
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.row.groupId).toBe(groupId)
      }

      expect(mockProgramRepository.createExerciseRow).toHaveBeenCalledWith(
        ctx,
        sessionId,
        expect.objectContaining({
          groupId,
        }),
      )
    })

    it('should handle exercise name not found gracefully', async () => {
      vi.mocked(mockProgramRepository.getMaxExerciseRowOrderIndex).mockReturnValue(okAsync(-1))

      const createdRow = {
        id: 'row-123',
        sessionId,
        exerciseId,
        orderIndex: 0,
        groupId: null,
        orderWithinGroup: null,
        setTypeLabel: null,
        notes: null,
        restSeconds: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockProgramRepository.createExerciseRow).mockReturnValue(okAsync(createdRow))

      // Exercise not found
      vi.mocked(mockExerciseRepository.findById).mockReturnValue(okAsync(null))

      const ctx = createTestContext({ organizationId: orgId })
      const addExerciseRow = makeAddExerciseRow({
        programRepository: mockProgramRepository,
        exerciseRepository: mockExerciseRepository,
        generateId: mockGenerateId,
      })

      const result = await addExerciseRow({
        ...ctx,
        sessionId,
        exerciseId,
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.exerciseName).toBe('Unknown')
      }
    })
  })

  describe('Authorization', () => {
    it('should return forbidden error when user lacks programs:write permission', async () => {
      const ctx = createMemberContext()
      const addExerciseRow = makeAddExerciseRow({
        programRepository: mockProgramRepository,
        exerciseRepository: mockExerciseRepository,
        generateId: mockGenerateId,
      })

      const result = await addExerciseRow({
        ...ctx,
        sessionId,
        exerciseId,
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('forbidden')
        if (result.error.type === 'forbidden') {
          expect(result.error.message).toContain('No permission')
        }
      }

      // Repository should not be called
      expect(mockProgramRepository.getMaxExerciseRowOrderIndex).not.toHaveBeenCalled()
    })
  })

  describe('Not Found Errors', () => {
    it('should return not_found when session does not exist (getMaxOrderIndex)', async () => {
      vi.mocked(mockProgramRepository.getMaxExerciseRowOrderIndex).mockReturnValue(
        errAsync({
          type: 'NOT_FOUND',
          entityType: 'session',
          id: sessionId,
        }),
      )

      const ctx = createTestContext({ organizationId: orgId })
      const addExerciseRow = makeAddExerciseRow({
        programRepository: mockProgramRepository,
        exerciseRepository: mockExerciseRepository,
        generateId: mockGenerateId,
      })

      const result = await addExerciseRow({
        ...ctx,
        sessionId,
        exerciseId,
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('not_found')
        if (result.error.type === 'not_found') {
          expect(result.error.entityType).toBe('session')
          expect(result.error.id).toBe(sessionId)
        }
      }

      // Create should not be called
      expect(mockProgramRepository.createExerciseRow).not.toHaveBeenCalled()
    })

    it('should return not_found when session does not exist (createExerciseRow)', async () => {
      vi.mocked(mockProgramRepository.getMaxExerciseRowOrderIndex).mockReturnValue(okAsync(0))
      vi.mocked(mockProgramRepository.createExerciseRow).mockReturnValue(
        errAsync({
          type: 'NOT_FOUND',
          entityType: 'session',
          id: sessionId,
        }),
      )

      const ctx = createTestContext({ organizationId: orgId })
      const addExerciseRow = makeAddExerciseRow({
        programRepository: mockProgramRepository,
        exerciseRepository: mockExerciseRepository,
        generateId: mockGenerateId,
      })

      const result = await addExerciseRow({
        ...ctx,
        sessionId,
        exerciseId,
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('not_found')
        if (result.error.type === 'not_found') {
          expect(result.error.entityType).toBe('session')
        }
      }
    })
  })

  describe('Validation Errors', () => {
    it('should return validation error when exerciseId is invalid', async () => {
      vi.mocked(mockProgramRepository.getMaxExerciseRowOrderIndex).mockReturnValue(okAsync(0))

      const ctx = createTestContext({ organizationId: orgId })
      const addExerciseRow = makeAddExerciseRow({
        programRepository: mockProgramRepository,
        exerciseRepository: mockExerciseRepository,
        generateId: mockGenerateId,
      })

      const result = await addExerciseRow({
        ...ctx,
        sessionId,
        exerciseId: '', // Invalid empty exerciseId
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('validation_error')
      }

      // Create should not be called
      expect(mockProgramRepository.createExerciseRow).not.toHaveBeenCalled()
    })
  })

  describe('Repository Errors', () => {
    it('should return repository error when getMaxExerciseRowOrderIndex fails', async () => {
      vi.mocked(mockProgramRepository.getMaxExerciseRowOrderIndex).mockReturnValue(
        errAsync({
          type: 'DATABASE_ERROR',
          message: 'Connection lost',
        }),
      )

      const ctx = createTestContext({ organizationId: orgId })
      const addExerciseRow = makeAddExerciseRow({
        programRepository: mockProgramRepository,
        exerciseRepository: mockExerciseRepository,
        generateId: mockGenerateId,
      })

      const result = await addExerciseRow({
        ...ctx,
        sessionId,
        exerciseId,
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('repository_error')
      }
    })

    it('should return repository error when createExerciseRow fails', async () => {
      vi.mocked(mockProgramRepository.getMaxExerciseRowOrderIndex).mockReturnValue(okAsync(0))
      vi.mocked(mockProgramRepository.createExerciseRow).mockReturnValue(
        errAsync({
          type: 'DATABASE_ERROR',
          message: 'Insert failed',
        }),
      )

      const ctx = createTestContext({ organizationId: orgId })
      const addExerciseRow = makeAddExerciseRow({
        programRepository: mockProgramRepository,
        exerciseRepository: mockExerciseRepository,
        generateId: mockGenerateId,
      })

      const result = await addExerciseRow({
        ...ctx,
        sessionId,
        exerciseId,
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('repository_error')
      }
    })

    it('should return repository error when exercise lookup fails', async () => {
      vi.mocked(mockProgramRepository.getMaxExerciseRowOrderIndex).mockReturnValue(okAsync(0))

      const createdRow = {
        id: 'row-123',
        sessionId,
        exerciseId,
        orderIndex: 1,
        groupId: null,
        orderWithinGroup: null,
        setTypeLabel: null,
        notes: null,
        restSeconds: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockProgramRepository.createExerciseRow).mockReturnValue(okAsync(createdRow))

      // Exercise lookup fails
      vi.mocked(mockExerciseRepository.findById).mockReturnValue(
        errAsync({
          type: 'DATABASE_ERROR',
          message: 'Query timeout',
        }),
      )

      const ctx = createTestContext({ organizationId: orgId })
      const addExerciseRow = makeAddExerciseRow({
        programRepository: mockProgramRepository,
        exerciseRepository: mockExerciseRepository,
        generateId: mockGenerateId,
      })

      const result = await addExerciseRow({
        ...ctx,
        sessionId,
        exerciseId,
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('repository_error')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should use generateId for new row ID', async () => {
      const generatedId = 'generated-row-uuid-123'
      vi.mocked(mockGenerateId).mockReturnValue(generatedId)

      vi.mocked(mockProgramRepository.getMaxExerciseRowOrderIndex).mockReturnValue(okAsync(-1))
      vi.mocked(mockProgramRepository.createExerciseRow).mockImplementation((_ctx, _sessionId, row) =>
        okAsync({
          ...row,
          sessionId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      )

      const exercise = createExerciseEntity({
        id: exerciseId,
        organizationId: orgId,
        name: 'Test Exercise',
      })

      vi.mocked(mockExerciseRepository.findById).mockReturnValue(okAsync(exercise))

      const ctx = createTestContext({ organizationId: orgId })
      const addExerciseRow = makeAddExerciseRow({
        programRepository: mockProgramRepository,
        exerciseRepository: mockExerciseRepository,
        generateId: mockGenerateId,
      })

      const result = await addExerciseRow({
        ...ctx,
        sessionId,
        exerciseId,
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.row.id).toBe(generatedId)
      }

      expect(mockGenerateId).toHaveBeenCalledTimes(1)
    })

    it('should handle null groupId correctly', async () => {
      vi.mocked(mockProgramRepository.getMaxExerciseRowOrderIndex).mockReturnValue(okAsync(0))

      const createdRow = {
        id: 'row-123',
        sessionId,
        exerciseId,
        orderIndex: 1,
        groupId: null,
        orderWithinGroup: null,
        setTypeLabel: null,
        notes: null,
        restSeconds: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockProgramRepository.createExerciseRow).mockReturnValue(okAsync(createdRow))

      const exercise = createExerciseEntity({
        id: exerciseId,
        organizationId: orgId,
        name: 'Test Exercise',
      })

      vi.mocked(mockExerciseRepository.findById).mockReturnValue(okAsync(exercise))

      const ctx = createTestContext({ organizationId: orgId })
      const addExerciseRow = makeAddExerciseRow({
        programRepository: mockProgramRepository,
        exerciseRepository: mockExerciseRepository,
        generateId: mockGenerateId,
      })

      const result = await addExerciseRow({
        ...ctx,
        sessionId,
        exerciseId,
        groupId: null,
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.row.groupId).toBe(null)
      }
    })
  })
})
