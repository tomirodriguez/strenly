import { hasPermission, type OrganizationContext, type ProgramRepositoryPort, type Role } from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type ReorderExerciseRowsInput = OrganizationContext & {
  memberRole: Role
  sessionId: string
  rowIds: string[]
}

export type ReorderExerciseRowsError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; entityType: 'session'; id: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  programRepository: ProgramRepositoryPort
}

export const makeReorderExerciseRows =
  (deps: Dependencies) =>
  (input: ReorderExerciseRowsInput): ResultAsync<void, ReorderExerciseRowsError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'programs:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to modify programs',
      })
    }

    const ctx = { organizationId: input.organizationId, userId: input.userId, memberRole: input.memberRole }

    // 2. Delegate to repository (it verifies session exists and all rowIds belong to it)
    return deps.programRepository.reorderExerciseRows(ctx, input.sessionId, input.rowIds).mapErr(
      (e): ReorderExerciseRowsError => {
        if (e.type === 'NOT_FOUND' && e.entityType === 'session') {
          return { type: 'not_found', entityType: 'session', id: e.id }
        }
        if (e.type === 'NOT_FOUND') {
          return { type: 'repository_error', message: `Entity not found: ${e.id}` }
        }
        return { type: 'repository_error', message: e.message }
      },
    )
  }
