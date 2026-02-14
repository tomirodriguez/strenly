import { hasPermission, type OrganizationContext, type ProgramRepositoryPort, type ProgramWeek } from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type UpdateWeekInput = OrganizationContext & {
  weekId: string
  name: string
}

export type UpdateWeekError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; weekId: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  programRepository: ProgramRepositoryPort
}

export const makeUpdateWeek =
  (deps: Dependencies) =>
  (input: UpdateWeekInput): ResultAsync<ProgramWeek, UpdateWeekError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'programs:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to modify programs',
      })
    }

    const ctx = { organizationId: input.organizationId, userId: input.userId, memberRole: input.memberRole }

    // 2. Fetch existing week to preserve its orderIndex
    return deps.programRepository
      .findWeekById(ctx, input.weekId)
      .mapErr((e): UpdateWeekError => {
        if (e.type === 'NOT_FOUND') {
          return { type: 'not_found', weekId: input.weekId }
        }
        return { type: 'repository_error', message: e.message }
      })
      .andThen((existing) => {
        // 3. Update with new name, preserving orderIndex
        const week: ProgramWeek = {
          id: existing.id,
          programId: existing.programId,
          name: input.name.trim(),
          orderIndex: existing.orderIndex,
          createdAt: existing.createdAt,
          updatedAt: new Date(),
        }

        return deps.programRepository.updateWeek(ctx, week).mapErr((e): UpdateWeekError => {
          if (e.type === 'NOT_FOUND') {
            return { type: 'not_found', weekId: input.weekId }
          }
          return { type: 'repository_error', message: e.message }
        })
      })
  }
