import {
  hasPermission,
  type OrganizationContext,
  type Program,
  type ProgramRepositoryPort,
  type ProgramStatus,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type ListProgramsInput = OrganizationContext & {
  athleteId?: string | null
  isTemplate?: boolean
  status?: ProgramStatus
  search?: string
  limit?: number
  offset?: number
}

export type ListProgramsResult = {
  items: Program[]
  totalCount: number
}

export type ListProgramsError = { type: 'forbidden'; message: string } | { type: 'repository_error'; message: string }

type Dependencies = {
  programRepository: ProgramRepositoryPort
}

export const makeListPrograms =
  (deps: Dependencies) =>
  (input: ListProgramsInput): ResultAsync<ListProgramsResult, ListProgramsError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'programs:read')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to list programs',
      })
    }

    const ctx: OrganizationContext = {
      organizationId: input.organizationId,
      userId: input.userId,
      memberRole: input.memberRole,
    }

    // 2. Fetch programs with filtering
    return deps.programRepository
      .list(ctx, {
        athleteId: input.athleteId,
        isTemplate: input.isTemplate,
        status: input.status,
        search: input.search,
        limit: input.limit ?? 50,
        offset: input.offset ?? 0,
      })
      .mapErr(
        (e): ListProgramsError => ({
          type: 'repository_error',
          message: e.type === 'DATABASE_ERROR' ? e.message : `Not found: ${e.id}`,
        }),
      )
  }
