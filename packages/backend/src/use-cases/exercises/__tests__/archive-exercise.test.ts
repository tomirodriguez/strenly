import type { ExerciseRepositoryPort } from '@strenly/core/ports/exercise-repository.port'
import { errAsync, okAsync } from 'neverthrow'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createExerciseEntity } from '../../../__tests__/factories/exercise-factory'
import { createAdminContext, createMemberContext } from '../../../__tests__/helpers/test-context'
import { makeArchiveExercise } from '../archive-exercise'

describe('archiveExercise use case', () => {
  let mockExerciseRepository: ExerciseRepositoryPort

  beforeEach(() => {
    // Mock repository
    mockExerciseRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
    }
  })

  describe('Happy Path', () => {
    it('should archive exercise successfully with admin role', async () => {
      const ctx = createAdminContext()
      const exerciseId = 'exercise-1'

      // Mock existing custom exercise (not curated)
      const existingExercise = createExerciseEntity({
        id: exerciseId,
        organizationId: ctx.organizationId,
        name: 'Custom Bench Press',
        archivedAt: null,
      })

      vi.mocked(mockExerciseRepository.findById).mockReturnValue(okAsync(existingExercise))
      vi.mocked(mockExerciseRepository.archive).mockReturnValue(okAsync(undefined))

      const archiveExercise = makeArchiveExercise({
        exerciseRepository: mockExerciseRepository,
      })

      const result = await archiveExercise({
        ...ctx,
        exerciseId,
      })

      // Assert success
      expect(result.isOk()).toBe(true)

      // Verify repository archive called
      expect(mockExerciseRepository.archive).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: ctx.organizationId,
        }),
        exerciseId,
      )
    })
  })

  describe('Authorization', () => {
    it('should return forbidden error when user lacks exercises:write permission', async () => {
      const ctx = createMemberContext() // Member role lacks write permission
      const exerciseId = 'exercise-1'

      const archiveExercise = makeArchiveExercise({
        exerciseRepository: mockExerciseRepository,
      })

      const result = await archiveExercise({
        ...ctx,
        exerciseId,
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
      expect(mockExerciseRepository.findById).not.toHaveBeenCalled()
      expect(mockExerciseRepository.archive).not.toHaveBeenCalled()
    })

    it('should succeed when user has admin role (has exercises:write)', async () => {
      const ctx = createAdminContext() // Admin role has write permission
      const exerciseId = 'exercise-1'

      const existingExercise = createExerciseEntity({
        id: exerciseId,
        organizationId: ctx.organizationId,
        name: 'Custom Exercise',
      })

      vi.mocked(mockExerciseRepository.findById).mockReturnValue(okAsync(existingExercise))
      vi.mocked(mockExerciseRepository.archive).mockReturnValue(okAsync(undefined))

      const archiveExercise = makeArchiveExercise({
        exerciseRepository: mockExerciseRepository,
      })

      const result = await archiveExercise({
        ...ctx,
        exerciseId,
      })

      expect(result.isOk()).toBe(true)
    })
  })

  describe('Not Found Errors', () => {
    it('should return not_found error when exercise does not exist', async () => {
      const ctx = createAdminContext()
      const exerciseId = 'non-existent-exercise'

      // Mock repository returning null (not found)
      vi.mocked(mockExerciseRepository.findById).mockReturnValue(okAsync(null))

      const archiveExercise = makeArchiveExercise({
        exerciseRepository: mockExerciseRepository,
      })

      const result = await archiveExercise({
        ...ctx,
        exerciseId,
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error
        expect(error.type).toBe('not_found')
        if (error.type === 'not_found') {
          expect(error.exerciseId).toBe(exerciseId)
        }
      }

      // Repository archive should NOT be called
      expect(mockExerciseRepository.archive).not.toHaveBeenCalled()
    })
  })

  describe('Curated Exercise Protection', () => {
    it('should return cannot_archive_curated error when trying to archive curated exercise', async () => {
      const ctx = createAdminContext()
      const exerciseId = 'curated-exercise-1'

      // Mock curated exercise (organizationId is null)
      const curatedExercise = createExerciseEntity({
        id: exerciseId,
        organizationId: null, // Curated exercise
        name: 'Bench Press',
      })

      vi.mocked(mockExerciseRepository.findById).mockReturnValue(okAsync(curatedExercise))

      const archiveExercise = makeArchiveExercise({
        exerciseRepository: mockExerciseRepository,
      })

      const result = await archiveExercise({
        ...ctx,
        exerciseId,
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error
        expect(error.type).toBe('cannot_archive_curated')
        if (error.type === 'cannot_archive_curated') {
          expect(error.message).toContain('curated')
        }
      }

      // Repository archive should NOT be called
      expect(mockExerciseRepository.archive).not.toHaveBeenCalled()
    })
  })

  describe('Repository Errors', () => {
    it('should return repository error when findById fails', async () => {
      const ctx = createAdminContext()
      const exerciseId = 'exercise-1'

      // Mock repository findById failure
      vi.mocked(mockExerciseRepository.findById).mockReturnValue(
        errAsync({
          type: 'DATABASE_ERROR',
          message: 'Connection failed',
        }),
      )

      const archiveExercise = makeArchiveExercise({
        exerciseRepository: mockExerciseRepository,
      })

      const result = await archiveExercise({
        ...ctx,
        exerciseId,
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

    it('should return repository error when archive fails', async () => {
      const ctx = createAdminContext()
      const exerciseId = 'exercise-1'

      const existingExercise = createExerciseEntity({
        id: exerciseId,
        organizationId: ctx.organizationId,
        name: 'Custom Exercise',
      })

      vi.mocked(mockExerciseRepository.findById).mockReturnValue(okAsync(existingExercise))

      // Mock repository archive failure
      vi.mocked(mockExerciseRepository.archive).mockReturnValue(
        errAsync({
          type: 'DATABASE_ERROR',
          message: 'Archive failed',
        }),
      )

      const archiveExercise = makeArchiveExercise({
        exerciseRepository: mockExerciseRepository,
      })

      const result = await archiveExercise({
        ...ctx,
        exerciseId,
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error
        expect(error.type).toBe('repository_error')
        if (error.type === 'repository_error') {
          expect(error.message).toContain('Archive failed')
        }
      }
    })
  })
})
