import {
  type Athlete,
  type AthleteRepositoryPort,
  type AthleteStatus,
  hasPermission,
  type OrganizationContext,
  type Role,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type ListAthletesInput = OrganizationContext & {
  memberRole: Role
  status?: AthleteStatus
  search?: string
  limit?: number
  offset?: number
}

export type ListAthletesResult = {
  items: Athlete[]
  totalCount: number
}

export type ListAthletesError = { type: 'forbidden'; message: string } | { type: 'repository_error'; message: string }

type Dependencies = {
  athleteRepository: AthleteRepositoryPort
}

export const makeListAthletes =
  (deps: Dependencies) =>
  (input: ListAthletesInput): ResultAsync<ListAthletesResult, ListAthletesError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'athletes:read')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to list athletes',
      })
    }

    // 2. Fetch athletes with filtering
    return deps.athleteRepository
      .findAll(
        { organizationId: input.organizationId, userId: input.userId, memberRole: input.memberRole },
        {
          status: input.status,
          search: input.search,
          limit: input.limit,
          offset: input.offset,
        },
      )
      .mapErr(
        (e): ListAthletesError => ({
          type: 'repository_error',
          message: e.type === 'DATABASE_ERROR' ? e.message : `Athlete not found: ${e.athleteId}`,
        }),
      )
  }
