import {
  type AthleteRepositoryPort,
  createProgram,
  hasPermission,
  type OrganizationContext,
  type Program,
  type ProgramRepositoryPort,
} from '@strenly/core'
import { errAsync, okAsync, type ResultAsync } from 'neverthrow'

export type CreateProgramInput = OrganizationContext & {
  name: string
  description?: string | null
  athleteId?: string | null
  isTemplate?: boolean
}

export type CreateProgramError =
  | { type: 'forbidden'; message: string }
  | { type: 'validation_error'; message: string }
  | { type: 'athlete_not_found'; athleteId: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  programRepository: ProgramRepositoryPort
  athleteRepository: AthleteRepositoryPort
  generateId: () => string
}

export const makeCreateProgram =
  (deps: Dependencies) =>
  (input: CreateProgramInput): ResultAsync<Program, CreateProgramError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'programs:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to create programs',
      })
    }

    const ctx: OrganizationContext = {
      organizationId: input.organizationId,
      userId: input.userId,
      memberRole: input.memberRole,
    }

    // 2. Domain validation
    const programResult = createProgram({
      id: deps.generateId(),
      organizationId: input.organizationId,
      name: input.name,
      description: input.description,
      athleteId: input.athleteId,
      isTemplate: input.isTemplate,
    })

    if (programResult.isErr()) {
      return errAsync({
        type: 'validation_error',
        message: programResult.error.message,
      })
    }

    const program = programResult.value

    // 3. If athleteId provided, verify athlete exists in organization
    const athleteCheck: ResultAsync<void, CreateProgramError> = input.athleteId
      ? deps.athleteRepository
          .findById(ctx, input.athleteId)
          .map(() => undefined)
          .mapErr((e): CreateProgramError => {
            if (e.type === 'NOT_FOUND') {
              return { type: 'athlete_not_found', athleteId: input.athleteId ?? '' }
            }
            return { type: 'repository_error', message: e.message }
          })
      : okAsync(undefined)

    return athleteCheck
      .andThen(() =>
        // 4. Save program
        deps.programRepository.create(ctx, program).mapErr((e): CreateProgramError => {
          if (e.type === 'DATABASE_ERROR') {
            return { type: 'repository_error', message: e.message }
          }
          return { type: 'repository_error', message: `Not found: ${e.id}` }
        }),
      )
      .andThen((createdProgram) => {
        const now = new Date()

        // 5. Create default week ("Semana 1")
        return deps.programRepository
          .createWeek(ctx, createdProgram.id, {
            id: deps.generateId(),
            name: 'Semana 1',
            orderIndex: 0,
            createdAt: now,
            updatedAt: now,
          })
          .mapErr(
            (e): CreateProgramError => ({
              type: 'repository_error',
              message: e.type === 'DATABASE_ERROR' ? e.message : `Not found: ${e.id}`,
            }),
          )
          .andThen(() =>
            // 6. Create default session ("DIA 1")
            deps.programRepository
              .createSession(ctx, createdProgram.id, {
                id: deps.generateId(),
                name: 'DIA 1',
                orderIndex: 0,
                createdAt: now,
                updatedAt: now,
              })
              .mapErr(
                (e): CreateProgramError => ({
                  type: 'repository_error',
                  message: e.type === 'DATABASE_ERROR' ? e.message : `Not found: ${e.id}`,
                }),
              ),
          )
          .map(() => createdProgram)
      })
  }
