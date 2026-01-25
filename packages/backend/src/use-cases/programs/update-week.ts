import { hasPermission, type OrganizationContext, type ProgramRepositoryPort, type ProgramWeek, type Role } from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type UpdateWeekInput = OrganizationContext & {
  memberRole: Role
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

    // 2. We need to find the existing week first to get its details
    // The repository updateWeek requires the full ProgramWeek, so we use a workaround:
    // Pass a partial week and let the repository handle verification
    // Since updateWeek verifies access internally, we construct the week with the new name
    // Note: The repository's updateWeek will verify the week exists and belongs to org
    const week: ProgramWeek = {
      id: input.weekId,
      programId: '', // Will be ignored by update (repository uses ID lookup)
      name: input.name.trim(),
      orderIndex: 0, // Will be preserved by update
      createdAt: new Date(), // Will be preserved
      updatedAt: new Date(), // Will be updated
    }

    return deps.programRepository.updateWeek(ctx, week).mapErr((e): UpdateWeekError => {
      if (e.type === 'NOT_FOUND') {
        return { type: 'not_found', weekId: input.weekId }
      }
      return { type: 'repository_error', message: e.message }
    })
  }
