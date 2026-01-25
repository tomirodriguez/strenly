import {
  hasPermission,
  type OrganizationContext,
  type ProgramRepositoryPort,
  type ProgramWeek,
  type Role,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type AddWeekInput = OrganizationContext & {
  memberRole: Role
  programId: string
  name?: string
}

export type AddWeekError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; programId: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  programRepository: ProgramRepositoryPort
  generateId: () => string
}

export const makeAddWeek =
  (deps: Dependencies) =>
  (input: AddWeekInput): ResultAsync<ProgramWeek, AddWeekError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'programs:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to modify programs',
      })
    }

    const ctx = { organizationId: input.organizationId, userId: input.userId, memberRole: input.memberRole }

    // 2. Find program with details to get current week count
    return deps.programRepository
      .findWithDetails(ctx, input.programId)
      .mapErr((e): AddWeekError => {
        if (e.type === 'NOT_FOUND') {
          return { type: 'not_found', programId: input.programId }
        }
        return { type: 'repository_error', message: e.message }
      })
      .andThen((program) => {
        // 3. Calculate orderIndex and default name
        const nextOrderIndex = program.weeks.length
        const defaultName = `Semana ${nextOrderIndex + 1}`
        const name = input.name ?? defaultName

        const now = new Date()
        const week: Omit<ProgramWeek, 'programId'> = {
          id: deps.generateId(),
          name,
          orderIndex: nextOrderIndex,
          createdAt: now,
          updatedAt: now,
        }

        // 4. Create week via repository
        return deps.programRepository.createWeek(ctx, input.programId, week).mapErr(
          (e): AddWeekError => ({
            type: 'repository_error',
            message: e.type === 'DATABASE_ERROR' ? e.message : `Program not found: ${input.programId}`,
          }),
        )
      })
  }
