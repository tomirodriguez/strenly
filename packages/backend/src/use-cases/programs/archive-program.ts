import {
  archiveProgram as archiveProgramDomain,
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
      .mapErr(
        (e): ArchiveProgramError => ({
          type: 'repository_error',
          message: e.type === 'DATABASE_ERROR' ? e.message : `Not found: ${e.id}`,
        }),
      )
      .andThen((existing) => {
        if (!existing) {
          return errAsync<Program, ArchiveProgramError>({ type: 'not_found', programId: input.programId })
        }
        // 3. Use domain function for status transition validation
        const result = archiveProgramDomain(existing)
        if (result.isErr()) {
          return errAsync<Program, ArchiveProgramError>({
            type: 'invalid_transition',
            message: result.error.message,
          })
        }

        // 4. Persist archived program
        return deps.programRepository.update(ctx, result.value).mapErr(
          (e): ArchiveProgramError => ({
            type: 'repository_error',
            message: e.type === 'DATABASE_ERROR' ? e.message : `Not found: ${e.id}`,
          }),
        )
      })
  }
