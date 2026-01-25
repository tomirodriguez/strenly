import {
  archiveProgram,
  hasPermission,
  type OrganizationContext,
  type Program,
  type ProgramRepositoryPort,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type ArchiveProgramInput = OrganizationContext & {
  programId: string
}

export type ArchiveProgramError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; programId: string }
  | { type: 'invalid_transition'; message: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  programRepository: ProgramRepositoryPort
}

export const makeArchiveProgram =
  (deps: Dependencies) =>
  (input: ArchiveProgramInput): ResultAsync<Program, ArchiveProgramError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'programs:delete')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to archive programs',
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
      .mapErr((e): ArchiveProgramError => {
        if (e.type === 'NOT_FOUND') {
          return { type: 'not_found', programId: input.programId }
        }
        return { type: 'repository_error', message: e.message }
      })
      .andThen((existing) => {
        // 3. Use domain method for status transition
        const archiveResult = archiveProgram(existing)

        if (archiveResult.isErr()) {
          return errAsync<Program, ArchiveProgramError>({
            type: 'invalid_transition',
            message: archiveResult.error.message,
          })
        }

        // 4. Persist
        return deps.programRepository.update(ctx, archiveResult.value).mapErr(
          (e): ArchiveProgramError => ({
            type: 'repository_error',
            message: e.type === 'DATABASE_ERROR' ? e.message : `Not found: ${e.id}`,
          }),
        )
      })
  }
