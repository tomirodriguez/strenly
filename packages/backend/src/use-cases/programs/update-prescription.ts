import { parsePrescriptionNotation } from '@strenly/contracts/programs/prescription'
import {
  createPrescription,
  hasPermission,
  type OrganizationContext,
  type Prescription,
  type ProgramRepositoryPort,
  type Role,
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
  generateId: () => string
}

/**
 * Update a prescription cell in the program grid.
 * This is the CORE operation for grid editing - called on every cell edit.
 *
 * Parses notation like "3x8@120kg" into structured data.
 * Pass "-" or empty string to clear the cell.
 */
export const makeUpdatePrescription =
  (deps: Dependencies) =>
  (input: UpdatePrescriptionInput): ResultAsync<Prescription | null, UpdatePrescriptionError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'programs:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to modify programs',
      })
    }

    const ctx = { organizationId: input.organizationId, userId: input.userId, memberRole: input.memberRole }

    // 2. Parse the notation
    const parsed = parsePrescriptionNotation(input.notation)

    // 3. If null (skip/empty), delete the prescription
    if (parsed === null) {
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

    // 4. Validate parsed prescription via domain factory
    const prescriptionResult = createPrescription({
      id: deps.generateId(),
      sets: parsed.sets,
      repsMin: parsed.repsMin,
      repsMax: parsed.repsMax,
      isAmrap: parsed.isAmrap,
      isUnilateral: parsed.isUnilateral,
      unilateralUnit: parsed.unilateralUnit,
      intensityType: parsed.intensityType,
      intensityValue: parsed.intensityValue,
      tempo: parsed.tempo,
    })

    if (prescriptionResult.isErr()) {
      return errAsync({
        type: 'validation_error',
        message: prescriptionResult.error.message,
      })
    }

    const prescription = prescriptionResult.value

    // 5. Upsert the prescription
    return deps.programRepository
      .upsertPrescription(ctx, input.exerciseRowId, input.weekId, prescription)
      .mapErr((e): UpdatePrescriptionError => {
        if (e.type === 'NOT_FOUND') {
          return { type: 'not_found', entityType: e.entityType === 'week' ? 'week' : 'exercise_row', id: e.id }
        }
        return { type: 'repository_error', message: e.message }
      })
      .map(() => prescription)
  }
