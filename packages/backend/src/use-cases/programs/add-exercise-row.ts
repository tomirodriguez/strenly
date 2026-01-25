import {
  hasPermission,
  type OrganizationContext,
  type ProgramExerciseRow,
  type ProgramRepositoryPort,
  type Role,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type AddExerciseRowInput = OrganizationContext & {
  memberRole: Role
  sessionId: string
  exerciseId: string
  supersetGroup?: string | null
  supersetOrder?: number | null
}

export type AddExerciseRowError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; entityType: 'session'; id: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  programRepository: ProgramRepositoryPort
  generateId: () => string
}

export const makeAddExerciseRow =
  (deps: Dependencies) =>
  (input: AddExerciseRowInput): ResultAsync<ProgramExerciseRow, AddExerciseRowError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'programs:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to modify programs',
      })
    }

    const ctx = { organizationId: input.organizationId, userId: input.userId, memberRole: input.memberRole }
    const now = new Date()

    // 2. Get max order index to append at end
    return deps.programRepository
      .getMaxExerciseRowOrderIndex(ctx, input.sessionId)
      .mapErr((e): AddExerciseRowError => {
        if (e.type === 'NOT_FOUND') {
          return { type: 'not_found', entityType: 'session', id: e.id }
        }
        return { type: 'repository_error', message: e.message }
      })
      .andThen((maxOrder) => {
        // 3. Create exercise row via repository
        const row: Omit<ProgramExerciseRow, 'sessionId'> = {
          id: deps.generateId(),
          exerciseId: input.exerciseId,
          orderIndex: maxOrder + 1,
          // New group-based fields
          groupId: null, // null for legacy superset-based creation
          orderWithinGroup: null,
          // Legacy superset fields
          supersetGroup: input.supersetGroup ?? null,
          supersetOrder: input.supersetOrder ?? null,
          // Other fields
          setTypeLabel: null,
          isSubRow: false,
          parentRowId: null,
          notes: null,
          restSeconds: null,
          createdAt: now,
          updatedAt: now,
        }

        return deps.programRepository.createExerciseRow(ctx, input.sessionId, row).mapErr((e): AddExerciseRowError => {
          if (e.type === 'NOT_FOUND') {
            return { type: 'not_found', entityType: 'session', id: e.id }
          }
          return { type: 'repository_error', message: e.message }
        })
      })
  }
