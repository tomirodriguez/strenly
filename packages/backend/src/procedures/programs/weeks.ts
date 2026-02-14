import { successOutputSchema } from '@strenly/contracts/common/success'
import {
  addWeekSchema,
  deleteWeekSchema,
  duplicateWeekSchema,
  updateWeekSchema,
  weekOutputSchema,
} from '@strenly/contracts/programs'
import { createProgramRepository } from '../../infrastructure/repositories/program.repository'
import { authProcedure } from '../../lib/orpc'
import { makeAddWeek } from '../../use-cases/programs/add-week'
import { makeDeleteWeek } from '../../use-cases/programs/delete-week'
import { makeDuplicateWeek } from '../../use-cases/programs/duplicate-week'
import { makeUpdateWeek } from '../../use-cases/programs/update-week'

/**
 * Add a new week to a program
 */
export const addWeekProcedure = authProcedure
  .errors({
    FORBIDDEN: { message: 'You do not have permission to modify programs' },
    NOT_FOUND: { message: 'Program not found' },
  })
  .input(addWeekSchema)
  .output(weekOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const useCase = makeAddWeek({
      programRepository: createProgramRepository(context.db),
      generateId: () => crypto.randomUUID(),
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      programId: input.programId,
      name: input.name,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN()
        case 'not_found':
          throw errors.NOT_FOUND()
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    const week = result.value

    return {
      id: week.id,
      programId: week.programId,
      name: week.name,
      orderIndex: week.orderIndex,
    }
  })

/**
 * Update a week's name
 */
export const updateWeekProcedure = authProcedure
  .errors({
    FORBIDDEN: { message: 'You do not have permission to modify programs' },
    NOT_FOUND: { message: 'Week not found' },
  })
  .input(updateWeekSchema)
  .output(weekOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const useCase = makeUpdateWeek({
      programRepository: createProgramRepository(context.db),
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      weekId: input.weekId,
      name: input.name,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN()
        case 'not_found':
          throw errors.NOT_FOUND()
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    const week = result.value

    return {
      id: week.id,
      programId: week.programId,
      name: week.name,
      orderIndex: week.orderIndex,
    }
  })

/**
 * Delete a week from a program
 */
export const deleteWeekProcedure = authProcedure
  .errors({
    FORBIDDEN: { message: 'You do not have permission to modify programs' },
    NOT_FOUND: { message: 'Week not found' },
    PROGRAM_NOT_FOUND: { message: 'Program not found' },
    LAST_WEEK: { message: 'Cannot delete the last week of a program' },
  })
  .input(deleteWeekSchema)
  .output(successOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const useCase = makeDeleteWeek({
      programRepository: createProgramRepository(context.db),
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      programId: input.programId,
      weekId: input.weekId,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN()
        case 'not_found':
          throw errors.NOT_FOUND()
        case 'program_not_found':
          throw errors.PROGRAM_NOT_FOUND()
        case 'last_week':
          throw errors.LAST_WEEK()
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    return { success: true }
  })

/**
 * Duplicate a week with all its prescriptions
 */
export const duplicateWeekProcedure = authProcedure
  .errors({
    FORBIDDEN: { message: 'You do not have permission to modify programs' },
    NOT_FOUND: { message: 'Week not found' },
    PROGRAM_NOT_FOUND: { message: 'Program not found' },
  })
  .input(duplicateWeekSchema)
  .output(weekOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const useCase = makeDuplicateWeek({
      programRepository: createProgramRepository(context.db),
      generateId: () => crypto.randomUUID(),
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      programId: input.programId,
      weekId: input.weekId,
      name: input.name,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN()
        case 'not_found':
          throw errors.NOT_FOUND()
        case 'program_not_found':
          throw errors.PROGRAM_NOT_FOUND()
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    const week = result.value

    return {
      id: week.id,
      programId: week.programId,
      name: week.name,
      orderIndex: week.orderIndex,
    }
  })
