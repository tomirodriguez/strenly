import type { MuscleGroupRepositoryPort } from '@strenly/core/ports/muscle-group-repository.port'
import { okAsync } from 'neverthrow'
import { vi } from 'vitest'

export function createMuscleGroupRepositoryMock(
  overrides: Partial<MuscleGroupRepositoryPort> = {},
): MuscleGroupRepositoryPort {
  return {
    findAll: vi.fn().mockReturnValue(okAsync([])),
    findById: vi.fn().mockReturnValue(okAsync(null)),
    ...overrides,
  }
}
