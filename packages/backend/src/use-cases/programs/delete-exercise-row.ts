import { hasPermission, type OrganizationContext, type ProgramRepositoryPort, type Role } from '@strenly/core'
import { errAsync, okAsync, type ResultAsync } from 'neverthrow'

export type DeleteExerciseRowInput = OrganizationContext & {
  memberRole: Role
  rowId: string
}

export type DeleteExerciseRowError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; rowId: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  programRepository: ProgramRepositoryPort
}

export const makeDeleteExerciseRow =
  (deps: Dependencies) =>
  (input: DeleteExerciseRowInput): ResultAsync<void, DeleteExerciseRowError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'programs:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to modify programs',
      })
    }

    const ctx = { organizationId: input.organizationId, userId: input.userId, memberRole: input.memberRole }

    // 2. First check if row has sub-rows (split rows) - delete them first
    return deps.programRepository
      .findSubRows(ctx, input.rowId)
      .mapErr((e): DeleteExerciseRowError => {
        if (e.type === 'NOT_FOUND') {
          return { type: 'not_found', rowId: input.rowId }
        }
        return { type: 'repository_error', message: e.message }
      })
      .andThen((subRows) => {
        // 3. Delete all sub-rows first (cascades to their prescriptions)
        const deleteSubRowsSequentially = (rows: typeof subRows): ResultAsync<void, DeleteExerciseRowError> => {
          if (rows.length === 0) {
            return okAsync(undefined)
          }

          const first = rows[0]
          if (!first) {
            return okAsync(undefined)
          }

          return deps.programRepository
            .deleteExerciseRow(ctx, first.id)
            .mapErr((e): DeleteExerciseRowError => {
              if (e.type === 'NOT_FOUND') {
                return { type: 'not_found', rowId: e.id }
              }
              return { type: 'repository_error', message: e.message }
            })
            .andThen(() => deleteSubRowsSequentially(rows.slice(1)))
        }

        return deleteSubRowsSequentially(subRows)
      })
      .andThen(() => {
        // 4. Delete the main row (cascades to its prescriptions)
        return deps.programRepository.deleteExerciseRow(ctx, input.rowId).mapErr((e): DeleteExerciseRowError => {
          if (e.type === 'NOT_FOUND') {
            return { type: 'not_found', rowId: input.rowId }
          }
          return { type: 'repository_error', message: e.message }
        })
      })
  }
