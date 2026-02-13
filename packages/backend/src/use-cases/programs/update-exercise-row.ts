import {
  type ExerciseRepositoryPort,
  hasPermission,
  type OrganizationContext,
  type ProgramExerciseRow,
  type ProgramRepositoryPort,
  type Role,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type UpdateExerciseRowInput = OrganizationContext & {
  memberRole: Role
  rowId: string
  exerciseId?: string
  groupId?: string | null
  orderWithinGroup?: number | null
  setTypeLabel?: string | null
  notes?: string | null
  restSeconds?: number | null
}

export type UpdateExerciseRowResult = {
  row: ProgramExerciseRow
  exerciseName: string
}

export type UpdateExerciseRowError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; rowId: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  programRepository: ProgramRepositoryPort
  exerciseRepository: ExerciseRepositoryPort
}

export const makeUpdateExerciseRow =
  (deps: Dependencies) =>
  (input: UpdateExerciseRowInput): ResultAsync<UpdateExerciseRowResult, UpdateExerciseRowError> => {
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
      .mapErr((e): UpdateExerciseRowError => {
        if (e.type === 'NOT_FOUND') {
          return { type: 'not_found', rowId: input.rowId }
        }
        return { type: 'repository_error', message: e.message }
      })
      .andThen((existing) => {
        // 3. Merge updates with existing data
        const updated: ProgramExerciseRow = {
          id: existing.id,
          sessionId: existing.sessionId,
          exerciseId: input.exerciseId ?? existing.exerciseId,
          orderIndex: existing.orderIndex,
          // Group-based fields
          groupId: input.groupId !== undefined ? input.groupId : existing.groupId,
          orderWithinGroup: input.orderWithinGroup !== undefined ? input.orderWithinGroup : existing.orderWithinGroup,
          // Other fields
          setTypeLabel: input.setTypeLabel !== undefined ? input.setTypeLabel : existing.setTypeLabel,
          notes: input.notes !== undefined ? input.notes : existing.notes,
          restSeconds: input.restSeconds !== undefined ? input.restSeconds : existing.restSeconds,
          createdAt: existing.createdAt,
          updatedAt: new Date(),
        }

        // 4. Persist
        return deps.programRepository
          .updateExerciseRow(ctx, updated)
          .mapErr((e): UpdateExerciseRowError => {
            if (e.type === 'NOT_FOUND') {
              return { type: 'not_found', rowId: e.id }
            }
            return { type: 'repository_error', message: e.message }
          })
          .andThen((updatedRow) => {
            // 5. Fetch exercise name for the response
            return deps.exerciseRepository
              .findById(input.organizationId, updatedRow.exerciseId)
              .map(
                (exercise): UpdateExerciseRowResult => ({
                  row: updatedRow,
                  exerciseName: exercise?.name ?? 'Unknown',
                }),
              )
              .mapErr(
                (e): UpdateExerciseRowError => ({
                  type: 'repository_error',
                  message: e.type === 'DATABASE_ERROR' ? e.message : 'Failed to fetch exercise',
                }),
              )
          })
      })
  }
