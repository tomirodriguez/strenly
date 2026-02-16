import type { ExerciseRepositoryPort } from '@strenly/core/ports/exercise-repository.port'
import { okAsync } from 'neverthrow'
import { vi } from 'vitest'

export function createExerciseRepositoryMock(overrides: Partial<ExerciseRepositoryPort> = {}): ExerciseRepositoryPort {
  return {
    findById: vi.fn().mockReturnValue(okAsync(null)),
    findAll: vi.fn().mockReturnValue(okAsync({ items: [], totalCount: 0 })),
    create: vi.fn().mockReturnValue(okAsync(undefined)),
    update: vi.fn().mockReturnValue(okAsync(undefined)),
    archive: vi.fn().mockReturnValue(okAsync(undefined)),
    ...overrides,
  }
}
