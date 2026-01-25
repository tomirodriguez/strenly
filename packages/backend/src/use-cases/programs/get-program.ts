import {
  hasPermission,
  type OrganizationContext,
  type ProgramRepositoryPort,
  type ProgramWithDetails,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type GetProgramInput = OrganizationContext & {
  programId: string
}

export type GetProgramError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; programId: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  programRepository: ProgramRepositoryPort
}

export const makeGetProgram =
  (deps: Dependencies) =>
  (input: GetProgramInput): ResultAsync<ProgramWithDetails, GetProgramError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'programs:read')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to view programs',
      })
    }

    const ctx: OrganizationContext = {
      organizationId: input.organizationId,
      userId: input.userId,
      memberRole: input.memberRole,
    }

    // 2. Fetch program with full details for grid rendering
    return deps.programRepository.findWithDetails(ctx, input.programId).mapErr((e): GetProgramError => {
      if (e.type === 'NOT_FOUND') {
        return { type: 'not_found', programId: input.programId }
      }
      return { type: 'repository_error', message: e.message }
    })
  }
