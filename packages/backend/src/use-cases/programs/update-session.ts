import { hasPermission, type OrganizationContext, type ProgramRepositoryPort, type ProgramSession } from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type UpdateSessionInput = OrganizationContext & {
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

    // 2. Fetch existing session
    return deps.programRepository
      .findSessionById(ctx, input.sessionId)
      .mapErr((e): UpdateSessionError => {
        if (e.type === 'NOT_FOUND') {
          return { type: 'not_found', sessionId: input.sessionId }
        }
        return { type: 'repository_error', message: e.message }
      })
      .andThen((existing) => {
        // 3. Merge updates with existing data
        const updated: ProgramSession = {
          ...existing,
          name: input.name.trim(),
          updatedAt: new Date(),
        }

        // 4. Persist
        return deps.programRepository.updateSession(ctx, updated).mapErr((e): UpdateSessionError => {
          if (e.type === 'NOT_FOUND') {
            return { type: 'not_found', sessionId: input.sessionId }
          }
          return { type: 'repository_error', message: e.message }
        })
      })
  }
