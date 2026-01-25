import {
  hasPermission,
  type OrganizationContext,
  type ProgramRepositoryPort,
  type ProgramSession,
  type Role,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type AddSessionInput = OrganizationContext & {
  memberRole: Role
  programId: string
  name: string
}

export type AddSessionError =
  | { type: 'forbidden'; message: string }
  | { type: 'program_not_found'; programId: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  programRepository: ProgramRepositoryPort
  generateId: () => string
}

export const makeAddSession =
  (deps: Dependencies) =>
  (input: AddSessionInput): ResultAsync<ProgramSession, AddSessionError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'programs:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to modify programs',
      })
    }

    const ctx = { organizationId: input.organizationId, userId: input.userId, memberRole: input.memberRole }

    // 2. Get program details to calculate next orderIndex
    return deps.programRepository
      .findWithDetails(ctx, input.programId)
      .mapErr((e): AddSessionError => {
        if (e.type === 'NOT_FOUND') {
          return { type: 'program_not_found', programId: input.programId }
        }
        return { type: 'repository_error', message: e.message }
      })
      .andThen((program) => {
        // 3. Calculate orderIndex as max existing + 1
        const nextOrderIndex = program.sessions.length

        const now = new Date()
        const session: Omit<ProgramSession, 'programId'> = {
          id: deps.generateId(),
          name: input.name.trim(),
          orderIndex: nextOrderIndex,
          createdAt: now,
          updatedAt: now,
        }

        // 4. Create session via repository
        return deps.programRepository.createSession(ctx, input.programId, session).mapErr(
          (e): AddSessionError => ({
            type: 'repository_error',
            message: e.type === 'DATABASE_ERROR' ? e.message : `Program not found: ${input.programId}`,
          }),
        )
      })
  }
