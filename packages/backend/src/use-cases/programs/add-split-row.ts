import {
  hasPermission,
  type OrganizationContext,
  type ProgramExerciseRow,
  type ProgramRepositoryPort,
  type Role,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type AddSplitRowInput = OrganizationContext & {
  memberRole: Role
  parentRowId: string
  setTypeLabel: string // e.g., "BACK-OFF VOLUME"
}

export type AddSplitRowError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; parentRowId: string }
  | { type: 'invalid_parent'; message: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  programRepository: ProgramRepositoryPort
  generateId: () => string
}

/**
 * Add a split row (sub-row) for an existing exercise row.
 * Split rows allow the same exercise with different set configurations
 * (e.g., main working sets vs back-off volume).
 */
export const makeAddSplitRow =
  (deps: Dependencies) =>
  (input: AddSplitRowInput): ResultAsync<ProgramExerciseRow, AddSplitRowError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'programs:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to modify programs',
      })
    }

    const ctx = { organizationId: input.organizationId, userId: input.userId, memberRole: input.memberRole }
    const now = new Date()

    // 2. Fetch parent row
    return deps.programRepository
      .findExerciseRowById(ctx, input.parentRowId)
      .mapErr((e): AddSplitRowError => {
        if (e.type === 'NOT_FOUND') {
          return { type: 'not_found', parentRowId: input.parentRowId }
        }
        return { type: 'repository_error', message: e.message }
      })
      .andThen((parentRow) => {
        // 3. Verify parent is NOT already a sub-row
        if (parentRow.isSubRow) {
          return errAsync<ProgramExerciseRow, AddSplitRowError>({
            type: 'invalid_parent',
            message: 'Cannot create a sub-row of a sub-row',
          })
        }

        // 4. Create the sub-row with same properties as parent
        const subRow: Omit<ProgramExerciseRow, 'sessionId'> = {
          id: deps.generateId(),
          exerciseId: parentRow.exerciseId,
          // Place it right after parent (will be normalized later if needed)
          orderIndex: parentRow.orderIndex + 0.5,
          supersetGroup: parentRow.supersetGroup,
          supersetOrder: parentRow.supersetOrder,
          setTypeLabel: input.setTypeLabel,
          isSubRow: true,
          parentRowId: parentRow.id,
          notes: null,
          restSeconds: null,
          createdAt: now,
          updatedAt: now,
        }

        return deps.programRepository.createExerciseRow(ctx, parentRow.sessionId, subRow).mapErr(
          (e): AddSplitRowError => ({
            type: 'repository_error',
            message: e.type === 'DATABASE_ERROR' ? e.message : `Entity not found: ${e.id}`,
          }),
        )
      })
  }
