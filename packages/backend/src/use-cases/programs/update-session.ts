import {
  hasPermission,
  type OrganizationContext,
  type ProgramRepositoryPort,
  type ProgramSession,
  type Role,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type UpdateSessionInput = OrganizationContext & {
  memberRole: Role
  sessionId: string
  name: string
}

export type UpdateSessionError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; sessionId: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  programRepository: ProgramRepositoryPort
}

export const makeUpdateSession =
  (deps: Dependencies) =>
  (input: UpdateSessionInput): ResultAsync<ProgramSession, UpdateSessionError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'programs:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to modify programs',
      })
    }

    const ctx = { organizationId: input.organizationId, userId: input.userId, memberRole: input.memberRole }

    // 2. The repository's updateSession verifies access internally
    // We construct the session with the new name - repository preserves other fields
    const session: ProgramSession = {
      id: input.sessionId,
      programId: '', // Will be ignored by update (repository uses ID lookup)
      name: input.name.trim(),
      orderIndex: 0, // Will be preserved by update
      createdAt: new Date(), // Will be preserved
      updatedAt: new Date(), // Will be updated
    }

    return deps.programRepository.updateSession(ctx, session).mapErr((e): UpdateSessionError => {
      if (e.type === 'NOT_FOUND') {
        return { type: 'not_found', sessionId: input.sessionId }
      }
      return { type: 'repository_error', message: e.message }
    })
  }
