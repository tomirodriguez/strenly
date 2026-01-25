import { hasPermission, type OrganizationContext, type ProgramRepositoryPort, type Role } from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type ReorderExerciseRowsInput = OrganizationContext & {
  memberRole: Role
  sessionId: string
  rowIds: string[]
}

export type ReorderExerciseRowsError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; entityType: 'session'; id: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  programRepository: ProgramRepositoryPort
}

/**
 * Ensures superset groups are adjacent in the row order.
 * If a superset group is split, consolidates all members after the first occurrence.
 */
function ensureSupersetAdjacency(
  rowIds: string[],
  rowMetadata: Map<string, { supersetGroup: string | null }>,
): string[] {
  // Track which rows we've placed
  const placed = new Set<string>()
  const result: string[] = []

  for (const rowId of rowIds) {
    if (placed.has(rowId)) continue

    const metadata = rowMetadata.get(rowId)
    const group = metadata?.supersetGroup

    if (group) {
      // Find all rows in this superset group and place them together
      const groupMembers = rowIds.filter((id) => {
        const m = rowMetadata.get(id)
        return m?.supersetGroup === group && !placed.has(id)
      })
      for (const member of groupMembers) {
        result.push(member)
        placed.add(member)
      }
    } else {
      // Standalone row
      result.push(rowId)
      placed.add(rowId)
    }
  }

  return result
}

export const makeReorderExerciseRows =
  (deps: Dependencies) =>
  (input: ReorderExerciseRowsInput): ResultAsync<void, ReorderExerciseRowsError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'programs:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to modify programs',
      })
    }

    const ctx = { organizationId: input.organizationId, userId: input.userId, memberRole: input.memberRole }

    // 2. Fetch row metadata to check superset groups
    return deps.programRepository
      .findExerciseRowsBySessionId(ctx, input.sessionId)
      .mapErr((e): ReorderExerciseRowsError => {
        if (e.type === 'NOT_FOUND') {
          if (e.entityType === 'session') {
            return { type: 'not_found', entityType: 'session', id: e.id }
          }
          return { type: 'repository_error', message: `Entity not found: ${e.id}` }
        }
        return { type: 'repository_error', message: e.message }
      })
      .andThen((rows) => {
        // Build metadata map
        const rowMetadata = new Map<string, { supersetGroup: string | null }>()
        for (const row of rows) {
          rowMetadata.set(row.id, { supersetGroup: row.supersetGroup })
        }

        // Ensure superset adjacency
        const validatedOrder = ensureSupersetAdjacency(input.rowIds, rowMetadata)

        // 3. Delegate to repository
        return deps.programRepository
          .reorderExerciseRows(ctx, input.sessionId, validatedOrder)
          .mapErr((e): ReorderExerciseRowsError => {
            if (e.type === 'NOT_FOUND' && e.entityType === 'session') {
              return { type: 'not_found', entityType: 'session', id: e.id }
            }
            if (e.type === 'NOT_FOUND') {
              return { type: 'repository_error', message: `Entity not found: ${e.id}` }
            }
            return { type: 'repository_error', message: e.message }
          })
      })
  }
