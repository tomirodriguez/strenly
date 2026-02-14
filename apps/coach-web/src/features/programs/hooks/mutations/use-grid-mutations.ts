import type { ProgramWithDetails } from '@strenly/contracts/programs/program'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { handleMutationError } from '@/lib/api-errors'

/**
 * Grid mutation hooks for program editing
 * These hooks handle all grid manipulation operations with optimistic updates
 */

// ============================================================================
// Prescription Operations
// ============================================================================

/**
 * Hook to update a prescription cell in the grid.
 * This is the most frequently called mutation during grid editing.
 * Uses optimistic updates for responsive UX.
 */
export function useUpdatePrescription(programId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.prescriptions.update.mutationOptions(),
    onMutate: async (_newPrescription) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: orpc.programs.get.key({ input: { programId } }),
      })

      // Snapshot previous value
      const previous = queryClient.getQueryData<ProgramWithDetails>(
        orpc.programs.get.queryOptions({ input: { programId } }).queryKey,
      )

      // Optimistic update could be implemented here
      // For now, we rely on server response for data consistency

      return { previous }
    },
    onError: (_err, _newPrescription, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(orpc.programs.get.queryOptions({ input: { programId } }).queryKey, context.previous)
      }
      handleMutationError(_err, { fallbackMessage: 'Error al actualizar la prescripcion' })
    },
    onSettled: () => {
      // Sync with server
      queryClient.invalidateQueries({
        queryKey: orpc.programs.get.key({ input: { programId } }),
      })
    },
  })
}

// ============================================================================
// Exercise Row Operations
// ============================================================================

/**
 * Hook to add an exercise row to a session
 */
export function useAddExerciseRow(programId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.exerciseRows.add.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.programs.get.key({ input: { programId } }),
      })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al agregar ejercicio' })
    },
  })
}

/**
 * Hook to update an exercise row
 */
export function useUpdateExerciseRow(programId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.exerciseRows.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.programs.get.key({ input: { programId } }),
      })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al actualizar ejercicio' })
    },
  })
}

/**
 * Hook to delete an exercise row
 */
export function useDeleteExerciseRow(programId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.exerciseRows.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.programs.get.key({ input: { programId } }),
      })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al eliminar ejercicio' })
    },
  })
}

/**
 * Hook to reorder exercise rows within a session
 */
export function useReorderExerciseRows(programId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.exerciseRows.reorder.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.programs.get.key({ input: { programId } }),
      })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al reordenar ejercicios' })
    },
  })
}

// ============================================================================
// Week Operations
// ============================================================================

/**
 * Hook to add a week (column) to the program
 */
export function useAddWeek(programId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.weeks.add.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.programs.get.key({ input: { programId } }),
      })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al agregar semana' })
    },
  })
}

/**
 * Hook to update a week's name
 */
export function useUpdateWeek(programId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.weeks.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.programs.get.key({ input: { programId } }),
      })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al actualizar semana' })
    },
  })
}

/**
 * Hook to delete a week
 */
export function useDeleteWeek(programId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.weeks.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.programs.get.key({ input: { programId } }),
      })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al eliminar semana' })
    },
  })
}

/**
 * Hook to duplicate a week with all its prescriptions
 */
export function useDuplicateWeek(programId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.weeks.duplicate.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.programs.get.key({ input: { programId } }),
      })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al duplicar semana' })
    },
  })
}

// ============================================================================
// Session Operations
// ============================================================================

/**
 * Hook to add a session (training day) to the program
 */
export function useAddSession(programId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.sessions.add.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.programs.get.key({ input: { programId } }),
      })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al agregar sesion' })
    },
  })
}

/**
 * Hook to update a session's name
 */
export function useUpdateSession(programId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.sessions.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.programs.get.key({ input: { programId } }),
      })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al actualizar sesion' })
    },
  })
}

/**
 * Hook to delete a session
 */
export function useDeleteSession(programId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.sessions.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.programs.get.key({ input: { programId } }),
      })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al eliminar sesion' })
    },
  })
}
