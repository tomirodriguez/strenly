import {
  addExerciseRowSchema,
  addSplitRowSchema,
  deleteExerciseRowSchema,
  exerciseRowOutputSchema,
  reorderExerciseRowsSchema,
  toggleSupersetSchema,
  updateExerciseRowSchema,
} from '@strenly/contracts/programs'
import { z } from 'zod'
import { createExerciseRepository } from '../../infrastructure/repositories/exercise.repository'
import { createProgramRepository } from '../../infrastructure/repositories/program.repository'
import { authProcedure } from '../../lib/orpc'
import { makeAddExerciseRow } from '../../use-cases/programs/add-exercise-row'
import { makeAddSplitRow } from '../../use-cases/programs/add-split-row'
import { makeDeleteExerciseRow } from '../../use-cases/programs/delete-exercise-row'
import { makeReorderExerciseRows } from '../../use-cases/programs/reorder-exercise-rows'
import { makeToggleSuperset } from '../../use-cases/programs/toggle-superset'
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
      supersetGroup: input.supersetGroup ?? null,
      supersetOrder: input.supersetOrder ?? null,
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

    // Fetch exercise name
    const exerciseResult = await exerciseRepository.findById(row.exerciseId)
    const exerciseName = exerciseResult.isOk() ? (exerciseResult.value?.name ?? 'Unknown') : 'Unknown'

    return {
      id: row.id,
      sessionId: row.sessionId,
      exerciseId: row.exerciseId,
      exerciseName,
      orderIndex: row.orderIndex,
      supersetGroup: row.supersetGroup,
      supersetOrder: row.supersetOrder,
      setTypeLabel: row.setTypeLabel,
      isSubRow: row.isSubRow,
      parentRowId: row.parentRowId,
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
      supersetGroup: input.supersetGroup,
      supersetOrder: input.supersetOrder,
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

    // Fetch exercise name
    const exerciseResult = await exerciseRepository.findById(row.exerciseId)
    const exerciseName = exerciseResult.isOk() ? (exerciseResult.value?.name ?? 'Unknown') : 'Unknown'

    return {
      id: row.id,
      sessionId: row.sessionId,
      exerciseId: row.exerciseId,
      exerciseName,
      orderIndex: row.orderIndex,
      supersetGroup: row.supersetGroup,
      supersetOrder: row.supersetOrder,
      setTypeLabel: row.setTypeLabel,
      isSubRow: row.isSubRow,
      parentRowId: row.parentRowId,
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

/**
 * Add a split row (sub-row with different set type)
 */
export const addSplitRowProcedure = authProcedure
  .errors({
    FORBIDDEN: { message: 'No tienes permisos para modificar programas' },
    NOT_FOUND: { message: 'Fila de ejercicio no encontrada' },
    INVALID_PARENT: { message: 'No puedes crear una sub-fila de otra sub-fila' },
  })
  .input(addSplitRowSchema)
  .output(exerciseRowOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const programRepository = createProgramRepository(context.db)
    const exerciseRepository = createExerciseRepository(context.db)

    const useCase = makeAddSplitRow({
      programRepository,
      generateId: () => crypto.randomUUID(),
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      parentRowId: input.parentRowId,
      setTypeLabel: input.setTypeLabel,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN()
        case 'not_found':
          throw errors.NOT_FOUND()
        case 'invalid_parent':
          throw errors.INVALID_PARENT()
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    const row = result.value

    // Fetch exercise name
    const exerciseResult = await exerciseRepository.findById(row.exerciseId)
    const exerciseName = exerciseResult.isOk() ? (exerciseResult.value?.name ?? 'Unknown') : 'Unknown'

    return {
      id: row.id,
      sessionId: row.sessionId,
      exerciseId: row.exerciseId,
      exerciseName,
      orderIndex: row.orderIndex,
      supersetGroup: row.supersetGroup,
      supersetOrder: row.supersetOrder,
      setTypeLabel: row.setTypeLabel,
      isSubRow: row.isSubRow,
      parentRowId: row.parentRowId,
      notes: row.notes,
      restSeconds: row.restSeconds,
    }
  })

/**
 * Toggle superset grouping for an exercise row
 */
export const toggleSupersetProcedure = authProcedure
  .errors({
    FORBIDDEN: { message: 'No tienes permisos para modificar programas' },
    NOT_FOUND: { message: 'Fila de ejercicio no encontrada' },
  })
  .input(toggleSupersetSchema)
  .output(exerciseRowOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const programRepository = createProgramRepository(context.db)
    const exerciseRepository = createExerciseRepository(context.db)

    const useCase = makeToggleSuperset({
      programRepository,
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      rowId: input.rowId,
      supersetGroup: input.supersetGroup,
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

    // Fetch exercise name
    const exerciseResult = await exerciseRepository.findById(row.exerciseId)
    const exerciseName = exerciseResult.isOk() ? (exerciseResult.value?.name ?? 'Unknown') : 'Unknown'

    return {
      id: row.id,
      sessionId: row.sessionId,
      exerciseId: row.exerciseId,
      exerciseName,
      orderIndex: row.orderIndex,
      supersetGroup: row.supersetGroup,
      supersetOrder: row.supersetOrder,
      setTypeLabel: row.setTypeLabel,
      isSubRow: row.isSubRow,
      parentRowId: row.parentRowId,
      notes: row.notes,
      restSeconds: row.restSeconds,
    }
  })
