import {
  hasPermission,
  type OrganizationContext,
  type ProgramExerciseRow,
  type ProgramRepositoryPort,
  type Role,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type ToggleSupersetInput = OrganizationContext & {
  memberRole: Role
  rowId: string
  supersetGroup: string | null // null to remove from superset
}

export type ToggleSupersetError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; rowId: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  programRepository: ProgramRepositoryPort
}

/**
 * Toggle superset grouping for an exercise row.
 * - Pass a group name (e.g., "A") to add to superset
 * - Pass null to remove from superset
 *
 * When adding to a superset, the row is assigned the next order
 * within that group (e.g., A1, A2, A3).
 */
export const makeToggleSuperset =
  (deps: Dependencies) =>
  (input: ToggleSupersetInput): ResultAsync<ProgramExerciseRow, ToggleSupersetError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'programs:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to modify programs',
      })
    }

    const ctx = { organizationId: input.organizationId, userId: input.userId, memberRole: input.memberRole }

    // 2. Fetch existing row
    return deps.programRepository
      .findExerciseRowById(ctx, input.rowId)
      .mapErr((e): ToggleSupersetError => {
        if (e.type === 'NOT_FOUND') {
          return { type: 'not_found', rowId: input.rowId }
        }
        return { type: 'repository_error', message: e.message }
      })
      .andThen((existing) => {
        // 3. If removing from superset
        if (input.supersetGroup === null) {
          const updated: ProgramExerciseRow = {
            ...existing,
            supersetGroup: null,
            supersetOrder: null,
            updatedAt: new Date(),
          }

          return deps.programRepository.updateExerciseRow(ctx, updated).mapErr(
            (e): ToggleSupersetError => ({
              type: 'repository_error',
              message: e.type === 'DATABASE_ERROR' ? e.message : `Entity not found: ${e.id}`,
            }),
          )
        }

        // 4. Adding to superset - query max order in that group, then set order = max + 1
        // If staying in the same group, keep the existing order
        if (existing.supersetGroup === input.supersetGroup && existing.supersetOrder !== null) {
          // Already in this superset group, no change needed
          return deps.programRepository.updateExerciseRow(ctx, existing).mapErr(
            (e): ToggleSupersetError => ({
              type: 'repository_error',
              message: e.type === 'DATABASE_ERROR' ? e.message : `Entity not found: ${e.id}`,
            }),
          )
        }

        // Query for max order in the target superset group
        return deps.programRepository
          .getMaxSupersetOrder(ctx, existing.sessionId, input.supersetGroup)
          .mapErr(
            (e): ToggleSupersetError => ({
              type: 'repository_error',
              message: e.type === 'DATABASE_ERROR' ? e.message : `Session not found: ${e.id}`,
            }),
          )
          .andThen((maxOrder) => {
            const updated: ProgramExerciseRow = {
              ...existing,
              supersetGroup: input.supersetGroup,
              supersetOrder: maxOrder + 1,
              updatedAt: new Date(),
            }

            return deps.programRepository.updateExerciseRow(ctx, updated).mapErr(
              (e): ToggleSupersetError => ({
                type: 'repository_error',
                message: e.type === 'DATABASE_ERROR' ? e.message : `Entity not found: ${e.id}`,
              }),
            )
          })
      })
  }
