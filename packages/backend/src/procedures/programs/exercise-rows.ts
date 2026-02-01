import {
  addExerciseRowSchema,
  deleteExerciseRowSchema,
  exerciseRowOutputSchema,
  reorderExerciseRowsSchema,
  updateExerciseRowSchema,
} from '@strenly/contracts/programs'
import { z } from 'zod'
import { createExerciseRepository } from '../../infrastructure/repositories/exercise.repository'
import { createProgramRepository } from '../../infrastructure/repositories/program.repository'
import { authProcedure } from '../../lib/orpc'
import { makeAddExerciseRow } from '../../use-cases/programs/add-exercise-row'
import { makeDeleteExerciseRow } from '../../use-cases/programs/delete-exercise-row'
import { makeReorderExerciseRows } from '../../use-cases/programs/reorder-exercise-rows'
import { makeUpdateExerciseRow } from '../../use-cases/programs/update-exercise-row'

/**
 * Add an exercise row to a session
 */
export const addExerciseRowProcedure = authProcedure
  .errors({
    FORBIDDEN: { message: 'No tienes permisos para modificar programas' },
    SESSION_NOT_FOUND: { message: 'Sesion no encontrada' },
  })
  .input(addExerciseRowSchema)
  .output(exerciseRowOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const programRepository = createProgramRepository(context.db)
    const exerciseRepository = createExerciseRepository(context.db)

    const useCase = makeAddExerciseRow({
      programRepository,
      generateId: () => crypto.randomUUID(),
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      sessionId: input.sessionId,
      exerciseId: input.exerciseId,
      groupId: input.groupId ?? null,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN()
        case 'not_found':
          throw errors.SESSION_NOT_FOUND()
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    const row = result.value

    // Fetch exercise name (pass organizationId to get curated or org-specific exercises)
    const exerciseResult = await exerciseRepository.findById(context.organization.id, row.exerciseId)
    const exerciseName = exerciseResult.isOk() ? (exerciseResult.value?.name ?? 'Unknown') : 'Unknown'

    return {
      id: row.id,
      sessionId: row.sessionId,
      exerciseId: row.exerciseId,
      exerciseName,
      orderIndex: row.orderIndex,
      groupId: row.groupId,
      orderWithinGroup: row.orderWithinGroup,
      setTypeLabel: row.setTypeLabel,
      notes: row.notes,
      restSeconds: row.restSeconds,
    }
  })

/**
 * Update an exercise row's properties
 */
export const updateExerciseRowProcedure = authProcedure
  .errors({
    FORBIDDEN: { message: 'No tienes permisos para modificar programas' },
    NOT_FOUND: { message: 'Fila de ejercicio no encontrada' },
  })
  .input(updateExerciseRowSchema)
  .output(exerciseRowOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const programRepository = createProgramRepository(context.db)
    const exerciseRepository = createExerciseRepository(context.db)

    const useCase = makeUpdateExerciseRow({
      programRepository,
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      rowId: input.rowId,
      exerciseId: input.exerciseId,
      groupId: input.groupId,
      orderWithinGroup: input.orderWithinGroup,
      setTypeLabel: input.setTypeLabel,
      notes: input.notes,
      restSeconds: input.restSeconds,
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

    const row = result.value

    // Fetch exercise name (pass organizationId to get curated or org-specific exercises)
    const exerciseResult = await exerciseRepository.findById(context.organization.id, row.exerciseId)
    const exerciseName = exerciseResult.isOk() ? (exerciseResult.value?.name ?? 'Unknown') : 'Unknown'

    return {
      id: row.id,
      sessionId: row.sessionId,
      exerciseId: row.exerciseId,
      exerciseName,
      orderIndex: row.orderIndex,
      groupId: row.groupId,
      orderWithinGroup: row.orderWithinGroup,
      setTypeLabel: row.setTypeLabel,
      notes: row.notes,
      restSeconds: row.restSeconds,
    }
  })

/**
 * Delete an exercise row
 */
export const deleteExerciseRowProcedure = authProcedure
  .errors({
    FORBIDDEN: { message: 'No tienes permisos para modificar programas' },
    NOT_FOUND: { message: 'Fila de ejercicio no encontrada' },
  })
  .input(deleteExerciseRowSchema)
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context, errors }) => {
    const useCase = makeDeleteExerciseRow({
      programRepository: createProgramRepository(context.db),
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      rowId: input.rowId,
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

    return { success: true }
  })

/**
 * Reorder exercise rows in a session (for drag-and-drop)
 */
export const reorderExerciseRowsProcedure = authProcedure
  .errors({
    FORBIDDEN: { message: 'No tienes permisos para modificar programas' },
    SESSION_NOT_FOUND: { message: 'Sesion no encontrada' },
  })
  .input(reorderExerciseRowsSchema)
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context, errors }) => {
    const useCase = makeReorderExerciseRows({
      programRepository: createProgramRepository(context.db),
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      sessionId: input.sessionId,
      rowIds: input.rowIds,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN()
        case 'not_found':
          throw errors.SESSION_NOT_FOUND()
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    return { success: true }
  })
