import { parsePrescriptionToSeries } from '@strenly/contracts/programs/prescription'
import {
  hasPermission,
  type OrganizationContext,
  type ProgramRepositoryPort,
  type Role,
  type Series,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type UpdatePrescriptionInput = OrganizationContext & {
  memberRole: Role
  exerciseRowId: string
  weekId: string
  notation: string
}

export type UpdatePrescriptionError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; entityType: 'exercise_row' | 'week'; id: string }
  | { type: 'validation_error'; message: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  programRepository: ProgramRepositoryPort
}

/**
 * Update a prescription cell in the program grid.
 * This is the CORE operation for grid editing - called on every cell edit.
 *
 * Parses notation like "3x8@120kg" into structured data (Series[]).
 * Pass "-" or empty string to clear the cell.
 */
export const makeUpdatePrescription =
  (deps: Dependencies) =>
  (input: UpdatePrescriptionInput): ResultAsync<Series[] | null, UpdatePrescriptionError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'programs:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to modify programs',
      })
    }

    const ctx = { organizationId: input.organizationId, userId: input.userId, memberRole: input.memberRole }

    // 2. Parse the notation to series array
    const parsedSeries = parsePrescriptionToSeries(input.notation)

    // 3. If null (unparseable), return validation error
    if (parsedSeries === null) {
      return errAsync({
        type: 'validation_error',
        message: 'Invalid prescription notation',
      })
    }

    // 4. If empty array (skip/empty), delete the prescription
    if (parsedSeries.length === 0) {
      return deps.programRepository
        .upsertPrescription(ctx, input.exerciseRowId, input.weekId, null)
        .mapErr((e): UpdatePrescriptionError => {
          if (e.type === 'NOT_FOUND') {
            return { type: 'not_found', entityType: e.entityType === 'week' ? 'week' : 'exercise_row', id: e.id }
          }
          return { type: 'repository_error', message: e.message }
        })
        .map(() => null)
    }

    // 5. Convert PrescriptionSeriesInput[] to Series[]
    const series: Series[] = parsedSeries.map((s, idx) => ({
      orderIndex: idx,
      reps: s.reps,
      repsMax: s.repsMax,
      isAmrap: s.isAmrap,
      intensityType: s.intensityType,
      intensityValue: s.intensityValue,
      tempo: s.tempo,
      restSeconds: null, // Not supported in notation parsing
    }))

    // 6. Upsert the prescription with series
    return deps.programRepository
      .upsertPrescription(ctx, input.exerciseRowId, input.weekId, series)
      .mapErr((e): UpdatePrescriptionError => {
        if (e.type === 'NOT_FOUND') {
          return { type: 'not_found', entityType: e.entityType === 'week' ? 'week' : 'exercise_row', id: e.id }
        }
        return { type: 'repository_error', message: e.message }
      })
      .map(() => series)
  }
