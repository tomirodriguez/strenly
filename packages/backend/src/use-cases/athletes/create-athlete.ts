import {
  type Athlete,
  type AthleteGender,
  type AthleteRepositoryPort,
  createAthlete,
  hasPermission,
  type OrganizationContext,
  type Role,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type CreateAthleteInput = OrganizationContext & {
  memberRole: Role
  name: string
  email?: string | null
  phone?: string | null
  birthdate?: Date | null
  gender?: AthleteGender | null
  notes?: string | null
}

export type CreateAthleteError =
  | { type: 'forbidden'; message: string }
  | { type: 'validation_error'; message: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  athleteRepository: AthleteRepositoryPort
  generateId: () => string
}

export const makeCreateAthlete =
  (deps: Dependencies) =>
  (input: CreateAthleteInput): ResultAsync<Athlete, CreateAthleteError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'athletes:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to create athletes',
      })
    }

    // 2. Domain validation
    const athleteResult = createAthlete({
      id: deps.generateId(),
      organizationId: input.organizationId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      birthdate: input.birthdate,
      gender: input.gender,
      notes: input.notes,
    })

    if (athleteResult.isErr()) {
      return errAsync({
        type: 'validation_error',
        message: athleteResult.error.message,
      })
    }

    const athlete = athleteResult.value

    // 3. Persist
    return deps.athleteRepository
      .create({ organizationId: input.organizationId, userId: input.userId, memberRole: input.memberRole }, athlete)
      .mapErr(
        (e): CreateAthleteError => ({
          type: 'repository_error',
          message: e.type === 'DATABASE_ERROR' ? e.message : `Athlete not found: ${e.athleteId}`,
        }),
      )
  }
