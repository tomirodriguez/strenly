import type { ProgramRepositoryPort } from '@strenly/core/ports/program-repository.port'
import { okAsync } from 'neverthrow'
import { vi } from 'vitest'

export function createProgramRepositoryMock(overrides: Partial<ProgramRepositoryPort> = {}): ProgramRepositoryPort {
  return {
    loadProgramAggregate: vi.fn().mockReturnValue(okAsync(null)),
    saveProgramAggregate: vi.fn().mockReturnValue(okAsync({ updatedAt: new Date() })),
    findById: vi.fn().mockReturnValue(okAsync(null)),
    update: vi.fn().mockReturnValue(okAsync(null)),
    list: vi.fn().mockReturnValue(okAsync({ items: [], totalCount: 0 })),
    findWithDetails: vi.fn().mockReturnValue(okAsync(null)),
    addWeek: vi.fn().mockReturnValue(okAsync(undefined)),
    updateWeek: vi.fn().mockReturnValue(okAsync(undefined)),
    deleteWeek: vi.fn().mockReturnValue(okAsync(undefined)),
    duplicateWeek: vi.fn().mockReturnValue(okAsync(undefined)),
    addSession: vi.fn().mockReturnValue(okAsync(undefined)),
    updateSession: vi.fn().mockReturnValue(okAsync(undefined)),
    deleteSession: vi.fn().mockReturnValue(okAsync(undefined)),
    addExerciseRow: vi.fn().mockReturnValue(okAsync(undefined)),
    updateExerciseRow: vi.fn().mockReturnValue(okAsync(undefined)),
    deleteExerciseRow: vi.fn().mockReturnValue(okAsync(undefined)),
    reorderExerciseRows: vi.fn().mockReturnValue(okAsync(undefined)),
    createExerciseGroup: vi.fn().mockReturnValue(okAsync(undefined)),
    updateExerciseGroup: vi.fn().mockReturnValue(okAsync(undefined)),
    deleteExerciseGroup: vi.fn().mockReturnValue(okAsync(undefined)),
    updatePrescription: vi.fn().mockReturnValue(okAsync(undefined)),
    ...overrides,
  }
}
