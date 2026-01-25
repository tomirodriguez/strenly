import {
  hasPermission,
  type OrganizationContext,
  type ProgramRepositoryPort,
  type ProgramWithDetails,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'
import { makeDuplicateProgram } from './duplicate-program'

export type SaveAsTemplateInput = OrganizationContext & {
  programId: string
  name: string
  description?: string | null
}

export type SaveAsTemplateError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; programId: string }
  | { type: 'validation_error'; message: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  programRepository: ProgramRepositoryPort
  generateId: () => string
}

/**
 * Save a program as a template.
 * Creates a deep copy of the source program with isTemplate: true and athleteId: null.
 * The original program is not modified.
 */
export const makeSaveAsTemplate =
  (deps: Dependencies) =>
  (input: SaveAsTemplateInput): ResultAsync<ProgramWithDetails, SaveAsTemplateError> => {
    // 1. Authorization FIRST - saving as template requires programs:write
    if (!hasPermission(input.memberRole, 'programs:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to create templates',
      })
    }

    // 2. Use duplicate program to create a template copy
    // This ensures we deep copy all weeks, sessions, exercise rows, and prescriptions
    const duplicateProgramUseCase = makeDuplicateProgram(deps)

    return duplicateProgramUseCase({
      organizationId: input.organizationId,
      userId: input.userId,
      memberRole: input.memberRole,
      sourceProgramId: input.programId,
      name: input.name,
      athleteId: null, // Templates have no athlete
      isTemplate: true, // Mark as template
    }).mapErr((e): SaveAsTemplateError => {
      switch (e.type) {
        case 'forbidden':
          return { type: 'forbidden', message: e.message }
        case 'not_found':
          return { type: 'not_found', programId: e.programId }
        case 'validation_error':
          return { type: 'validation_error', message: e.message }
        case 'repository_error':
          return { type: 'repository_error', message: e.message }
      }
    })
  }
