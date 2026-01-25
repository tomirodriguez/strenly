import type { SaveDraftInput } from '@strenly/contracts/programs/save-draft'
import {
  hasPermission,
  type OrganizationContext,
  type PrescriptionSeriesData,
  type ProgramRepositoryPort,
  type SaveDraftInput as RepoSaveDraftInput,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type SaveDraftError =
  | { type: 'unauthorized'; message: string }
  | { type: 'program_not_found'; programId: string }
  | { type: 'conflict'; message: string; serverUpdatedAt: Date }
  | { type: 'repository_error'; message: string }

export type SaveDraftResult = {
  updatedAt: Date
  conflictWarning: string | null
}

type Dependencies = {
  programRepository: ProgramRepositoryPort
}

/**
 * Map repository error to use case error.
 * Handles the discriminated union from ProgramRepositoryError.
 */
function mapRepoError(e: { type: 'NOT_FOUND' | 'DATABASE_ERROR'; message?: string; id?: string }): SaveDraftError {
  if (e.type === 'DATABASE_ERROR') {
    return { type: 'repository_error', message: e.message ?? 'Database error' }
  }
  return { type: 'repository_error', message: `Entity not found: ${e.id ?? 'unknown'}` }
}

/**
 * Save draft changes to a program atomically.
 * This is the bulk save operation for client-side editing.
 *
 * Accepts all changes made client-side (prescriptions, exercise rows, groups)
 * and persists them in a single transaction.
 */
export const makeSaveDraft =
  (deps: Dependencies) =>
  (ctx: OrganizationContext, input: SaveDraftInput): ResultAsync<SaveDraftResult, SaveDraftError> => {
    // 1. Authorization FIRST
    if (!hasPermission(ctx.memberRole, 'programs:write')) {
      return errAsync({
        type: 'unauthorized',
        message: 'No tienes permiso para editar programas',
      })
    }

    // 2. Verify program exists and belongs to org
    return deps.programRepository
      .findById(ctx, input.programId)
      .mapErr(mapRepoError)
      .andThen((program) => {
        // 3. Check if program exists
        if (!program) {
          return errAsync<SaveDraftResult, SaveDraftError>({
            type: 'program_not_found',
            programId: input.programId,
          })
        }

        // 4. Optional conflict check using lastLoadedAt
        let conflictWarning: string | null = null
        if (input.lastLoadedAt && program.updatedAt > input.lastLoadedAt) {
          conflictWarning =
            'El programa fue modificado por otro usuario. Tus cambios se guardaron pero podrian sobrescribir cambios recientes.'
        }

        // 5. Apply all updates in transaction (repository handles atomicity)
        // Map contract input to repository format
        const repoInput: RepoSaveDraftInput = {
          programId: input.programId,
          prescriptionUpdates: input.prescriptions.map((p) => ({
            exerciseRowId: p.exerciseRowId,
            weekId: p.weekId,
            series: p.series.map(
              (s): PrescriptionSeriesData => ({
                orderIndex: s.orderIndex,
                reps: s.reps,
                repsMax: s.repsMax,
                isAmrap: s.isAmrap,
                intensityType: s.intensityType,
                intensityValue: s.intensityValue,
                intensityUnit: s.intensityUnit,
                tempo: s.tempo,
                restSeconds: null, // Not used in current contract
              }),
            ),
          })),
          exerciseRowUpdates: input.exerciseRows.map((r) => ({
            rowId: r.rowId,
            exerciseId: r.exerciseId,
          })),
          groupUpdates: input.groups.map((g) => ({
            groupId: g.groupId,
            name: g.name,
            // Note: exerciseRowIds in the contract is for membership changes,
            // but the repository handles this differently via orderWithinGroup.
            // For now, we map the basic group updates.
          })),
        }

        return deps.programRepository
          .saveDraft(ctx, repoInput)
          .map((result) => ({
            updatedAt: result.updatedAt,
            conflictWarning,
          }))
          .mapErr(mapRepoError)
      })
  }
