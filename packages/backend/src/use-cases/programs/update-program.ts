import {
  createProgram,
  hasPermission,
  type OrganizationContext,
  type Program,
  type ProgramRepositoryPort,
  type ProgramStatus,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type UpdateProgramInput = OrganizationContext & {
  programId: string
  name?: string
  description?: string | null
  athleteId?: string | null
  isTemplate?: boolean
  status?: ProgramStatus
}

export type UpdateProgramError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; programId: string }
  | { type: 'validation_error'; message: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  programRepository: ProgramRepositoryPort
}

export const makeUpdateProgram =
  (deps: Dependencies) =>
  (input: UpdateProgramInput): ResultAsync<Program, UpdateProgramError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'programs:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to update programs',
      })
    }

    const ctx: OrganizationContext = {
      organizationId: input.organizationId,
      userId: input.userId,
      memberRole: input.memberRole,
    }

    // 2. Fetch existing program
    return deps.programRepository
      .findById(ctx, input.programId)
      .mapErr((e): UpdateProgramError => {
        if (e.type === 'NOT_FOUND') {
          return { type: 'not_found', programId: input.programId }
        }
        return { type: 'repository_error', message: e.message }
      })
      .andThen((existing) => {
        // 3. Merge updates with existing data
        const merged = {
          id: existing.id,
          organizationId: existing.organizationId,
          name: input.name ?? existing.name,
          description: input.description !== undefined ? input.description : existing.description,
          athleteId: input.athleteId !== undefined ? input.athleteId : existing.athleteId,
          isTemplate: input.isTemplate ?? existing.isTemplate,
          status: input.status ?? existing.status,
          createdAt: existing.createdAt,
        }

        // 4. Domain validation
        const programResult = createProgram(merged)

        if (programResult.isErr()) {
          return errAsync<Program, UpdateProgramError>({
            type: 'validation_error',
            message: programResult.error.message,
          })
        }

        // 5. Persist
        return deps.programRepository.update(ctx, programResult.value).mapErr(
          (e): UpdateProgramError => ({
            type: 'repository_error',
            message: e.type === 'DATABASE_ERROR' ? e.message : `Not found: ${e.id}`,
          }),
        )
      })
  }
