import {
  hasPermission,
  type OrganizationContext,
  type ProgramRepositoryPort,
  type ProgramWeek,
  type Role,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type DuplicateWeekInput = OrganizationContext & {
  memberRole: Role
  programId: string
  weekId: string
  name?: string
}

export type DuplicateWeekError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; weekId: string }
  | { type: 'program_not_found'; programId: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  programRepository: ProgramRepositoryPort
  generateId: () => string
}

export const makeDuplicateWeek =
  (deps: Dependencies) =>
  (input: DuplicateWeekInput): ResultAsync<ProgramWeek, DuplicateWeekError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'programs:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to modify programs',
      })
    }

    const ctx = { organizationId: input.organizationId, userId: input.userId, memberRole: input.memberRole }

    // 2. Get program details to find source week name
    return deps.programRepository
      .findWithDetails(ctx, input.programId)
      .mapErr((e): DuplicateWeekError => {
        if (e.type === 'NOT_FOUND') {
          return { type: 'program_not_found', programId: input.programId }
        }
        return { type: 'repository_error', message: e.message }
      })
      .andThen((program) => {
        // 3. Find the source week
        const sourceWeek = program.weeks.find((w) => w.id === input.weekId)
        if (!sourceWeek) {
          return errAsync<ProgramWeek, DuplicateWeekError>({
            type: 'not_found',
            weekId: input.weekId,
          })
        }

        // 4. Generate default name if not provided
        const newName = input.name ?? `${sourceWeek.name} (copia)`

        // 5. Duplicate the week via repository (copies all prescriptions)
        return deps.programRepository.duplicateWeek(ctx, input.weekId, newName).mapErr(
          (e): DuplicateWeekError => ({
            type: 'repository_error',
            message: e.type === 'DATABASE_ERROR' ? e.message : `Week not found: ${input.weekId}`,
          }),
        )
      })
  }
