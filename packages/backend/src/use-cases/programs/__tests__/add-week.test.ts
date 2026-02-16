import { faker } from '@faker-js/faker'
import type { ProgramRepositoryPort } from '@strenly/core/ports/program-repository.port'
import { errAsync, okAsync } from 'neverthrow'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemberContext, createTestContext } from '../../../__tests__/helpers/test-context'
import { makeAddWeek } from '../add-week'

describe('addWeek use case', () => {
  let mockProgramRepository: ProgramRepositoryPort
  let mockGenerateId: () => string
  const programId = 'program-123'
  const orgId = 'org-456'

  beforeEach(() => {
    mockProgramRepository = {
      findById: vi.fn(),
      findWithDetails: vi.fn(),
      update: vi.fn(),
      saveProgramAggregate: vi.fn(),
      createWeek: vi.fn(),
    } as unknown as ProgramRepositoryPort
    mockGenerateId = vi.fn(() => faker.string.uuid())
  })

  describe('Happy Path', () => {
    it('should add week successfully with explicit name', async () => {
      const existingProgram = {
        id: programId,
        organizationId: orgId,
        name: 'Test Program',
        weeks: [{ id: 'week-1', name: 'Week 1', orderIndex: 0 }],
        sessions: [],
      }

      const newWeekId = 'week-new-123'
      vi.mocked(mockGenerateId).mockReturnValue(newWeekId)

      const createdWeek = {
        id: newWeekId,
        programId,
        name: 'Week 2',
        orderIndex: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockProgramRepository.findWithDetails).mockReturnValue(okAsync(existingProgram))
      vi.mocked(mockProgramRepository.createWeek).mockReturnValue(okAsync(createdWeek))

      const ctx = createTestContext({ organizationId: orgId })
      const addWeek = makeAddWeek({
        programRepository: mockProgramRepository,
        generateId: mockGenerateId,
      })

      const result = await addWeek({
        ...ctx,
        programId,
        name: 'Week 2',
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.id).toBe(newWeekId)
        expect(result.value.name).toBe('Week 2')
        expect(result.value.orderIndex).toBe(1)
        expect(result.value.programId).toBe(programId)
      }

      expect(mockProgramRepository.createWeek).toHaveBeenCalledWith(
        ctx,
        programId,
        expect.objectContaining({
          id: newWeekId,
          name: 'Week 2',
          orderIndex: 1,
        }),
      )
    })

    it('should add week with auto-generated name when not provided', async () => {
      const existingProgram = {
        id: programId,
        organizationId: orgId,
        name: 'Test Program',
        weeks: [],
        sessions: [],
      }

      const newWeekId = 'week-first-123'
      vi.mocked(mockGenerateId).mockReturnValue(newWeekId)

      vi.mocked(mockProgramRepository.findWithDetails).mockReturnValue(okAsync(existingProgram))
      vi.mocked(mockProgramRepository.createWeek).mockImplementation((_ctx, _pid, week) =>
        okAsync({
          ...week,
          programId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      )

      const ctx = createTestContext({ organizationId: orgId })
      const addWeek = makeAddWeek({
        programRepository: mockProgramRepository,
        generateId: mockGenerateId,
      })

      const result = await addWeek({
        ...ctx,
        programId,
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.id).toBe(newWeekId)
        expect(result.value.orderIndex).toBe(0)
        // Domain factory generates default name like "Week 1"
        expect(result.value.name).toBeTruthy()
      }
    })

    it('should add week to empty program with orderIndex 0', async () => {
      const emptyProgram = {
        id: programId,
        organizationId: orgId,
        name: 'Empty Program',
        weeks: [],
        sessions: [],
      }

      const newWeekId = 'week-first-123'
      vi.mocked(mockGenerateId).mockReturnValue(newWeekId)

      const createdWeek = {
        id: newWeekId,
        programId,
        name: 'First Week',
        orderIndex: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockProgramRepository.findWithDetails).mockReturnValue(okAsync(emptyProgram))
      vi.mocked(mockProgramRepository.createWeek).mockReturnValue(okAsync(createdWeek))

      const ctx = createTestContext({ organizationId: orgId })
      const addWeek = makeAddWeek({
        programRepository: mockProgramRepository,
        generateId: mockGenerateId,
      })

      const result = await addWeek({
        ...ctx,
        programId,
        name: 'First Week',
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.orderIndex).toBe(0)
      }
    })

    it('should trim week name when provided', async () => {
      const existingProgram = {
        id: programId,
        organizationId: orgId,
        name: 'Test Program',
        weeks: [],
        sessions: [],
      }

      const createdWeek = {
        id: 'week-123',
        programId,
        name: 'Trimmed Week',
        orderIndex: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockProgramRepository.findWithDetails).mockReturnValue(okAsync(existingProgram))
      vi.mocked(mockProgramRepository.createWeek).mockReturnValue(okAsync(createdWeek))

      const ctx = createTestContext({ organizationId: orgId })
      const addWeek = makeAddWeek({
        programRepository: mockProgramRepository,
        generateId: mockGenerateId,
      })

      const result = await addWeek({
        ...ctx,
        programId,
        name: '  Trimmed Week  ',
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.name).toBe('Trimmed Week')
      }
    })
  })

  describe('Authorization', () => {
    it('should return forbidden error when user lacks programs:write permission', async () => {
      const ctx = createMemberContext()
      const addWeek = makeAddWeek({
        programRepository: mockProgramRepository,
        generateId: mockGenerateId,
      })

      const result = await addWeek({
        ...ctx,
        programId,
        name: 'New Week',
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('forbidden')
        if (result.error.type === 'forbidden') {
          expect(result.error.message).toContain('No permission')
        }
      }

      // Repository should not be called
      expect(mockProgramRepository.findWithDetails).not.toHaveBeenCalled()
    })
  })

  describe('Not Found Errors', () => {
    it('should return not_found when program does not exist', async () => {
      vi.mocked(mockProgramRepository.findWithDetails).mockReturnValue(okAsync(null))

      const ctx = createTestContext({ organizationId: orgId })
      const addWeek = makeAddWeek({
        programRepository: mockProgramRepository,
        generateId: mockGenerateId,
      })

      const result = await addWeek({
        ...ctx,
        programId: 'non-existent-id',
        name: 'New Week',
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('not_found')
        if (result.error.type === 'not_found') {
          expect(result.error.programId).toBe('non-existent-id')
        }
      }

      // Create should not be called
      expect(mockProgramRepository.createWeek).not.toHaveBeenCalled()
    })
  })

  describe('Validation Errors', () => {
    it('should return validation error when name is too long', async () => {
      const existingProgram = {
        id: programId,
        organizationId: orgId,
        name: 'Test Program',
        weeks: [],
        sessions: [],
      }

      vi.mocked(mockProgramRepository.findWithDetails).mockReturnValue(okAsync(existingProgram))

      const ctx = createTestContext({ organizationId: orgId })
      const addWeek = makeAddWeek({
        programRepository: mockProgramRepository,
        generateId: mockGenerateId,
      })

      const result = await addWeek({
        ...ctx,
        programId,
        name: 'A'.repeat(300),
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('validation_error')
      }

      // Create should not be called
      expect(mockProgramRepository.createWeek).not.toHaveBeenCalled()
    })
  })

  describe('Repository Errors', () => {
    it('should return repository error when findWithDetails fails', async () => {
      vi.mocked(mockProgramRepository.findWithDetails).mockReturnValue(
        errAsync({
          type: 'DATABASE_ERROR',
          message: 'Connection lost',
        }),
      )

      const ctx = createTestContext({ organizationId: orgId })
      const addWeek = makeAddWeek({
        programRepository: mockProgramRepository,
        generateId: mockGenerateId,
      })

      const result = await addWeek({
        ...ctx,
        programId,
        name: 'New Week',
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('repository_error')
      }
    })

    it('should return repository error when createWeek fails', async () => {
      const existingProgram = {
        id: programId,
        organizationId: orgId,
        name: 'Test Program',
        weeks: [],
        sessions: [],
      }

      vi.mocked(mockProgramRepository.findWithDetails).mockReturnValue(okAsync(existingProgram))
      vi.mocked(mockProgramRepository.createWeek).mockReturnValue(
        errAsync({
          type: 'DATABASE_ERROR',
          message: 'Insert failed',
        }),
      )

      const ctx = createTestContext({ organizationId: orgId })
      const addWeek = makeAddWeek({
        programRepository: mockProgramRepository,
        generateId: mockGenerateId,
      })

      const result = await addWeek({
        ...ctx,
        programId,
        name: 'New Week',
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('repository_error')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle adding multiple weeks sequentially', async () => {
      const initialProgram = {
        id: programId,
        organizationId: orgId,
        name: 'Test Program',
        weeks: [],
        sessions: [],
      }

      // First call returns empty, second returns with 1 week
      vi.mocked(mockProgramRepository.findWithDetails)
        .mockReturnValueOnce(okAsync(initialProgram))
        .mockReturnValueOnce(
          okAsync({
            ...initialProgram,
            weeks: [{ id: 'week-1', name: 'Week 1', orderIndex: 0 }],
          }),
        )

      vi.mocked(mockProgramRepository.createWeek)
        .mockReturnValueOnce(
          okAsync({
            id: 'week-1',
            programId,
            name: 'Week 1',
            orderIndex: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        )
        .mockReturnValueOnce(
          okAsync({
            id: 'week-2',
            programId,
            name: 'Week 2',
            orderIndex: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        )

      const ctx = createTestContext({ organizationId: orgId })
      const addWeek = makeAddWeek({
        programRepository: mockProgramRepository,
        generateId: mockGenerateId,
      })

      // Add first week
      const result1 = await addWeek({ ...ctx, programId, name: 'Week 1' })
      expect(result1.isOk()).toBe(true)
      if (result1.isOk()) {
        expect(result1.value.orderIndex).toBe(0)
      }

      // Add second week
      const result2 = await addWeek({ ...ctx, programId, name: 'Week 2' })
      expect(result2.isOk()).toBe(true)
      if (result2.isOk()) {
        expect(result2.value.orderIndex).toBe(1)
      }
    })

    it('should use generateId for new week ID', async () => {
      const existingProgram = {
        id: programId,
        organizationId: orgId,
        name: 'Test Program',
        weeks: [],
        sessions: [],
      }

      const generatedId = 'generated-uuid-456'
      vi.mocked(mockGenerateId).mockReturnValue(generatedId)

      vi.mocked(mockProgramRepository.findWithDetails).mockReturnValue(okAsync(existingProgram))
      vi.mocked(mockProgramRepository.createWeek).mockImplementation((_ctx, _pid, week) =>
        okAsync({
          ...week,
          programId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      )

      const ctx = createTestContext({ organizationId: orgId })
      const addWeek = makeAddWeek({
        programRepository: mockProgramRepository,
        generateId: mockGenerateId,
      })

      const result = await addWeek({
        ...ctx,
        programId,
        name: 'New Week',
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.id).toBe(generatedId)
      }

      expect(mockGenerateId).toHaveBeenCalledTimes(1)
    })
  })
})
