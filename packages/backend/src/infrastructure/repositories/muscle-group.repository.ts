import type { MuscleGroupData, MuscleGroupRepositoryError, MuscleGroupRepositoryPort } from '@strenly/core'
import type { DbClient } from '@strenly/database'
import { muscleGroups } from '@strenly/database/schema'
import { eq } from 'drizzle-orm'
import { ok, ResultAsync } from 'neverthrow'

function wrapDbError(error: unknown): MuscleGroupRepositoryError {
  console.error('MuscleGroup repository error:', error)
  return { type: 'DATABASE_ERROR', message: 'Database operation failed' }
}

/**
 * Parse body region from database value
 * Returns valid body region or defaults to "core"
 */
function parseBodyRegion(value: string): 'upper' | 'lower' | 'core' {
  if (value === 'upper' || value === 'lower' || value === 'core') {
    return value
  }
  return 'core'
}

/**
 * Map database row to MuscleGroupData
 */
function mapToData(row: typeof muscleGroups.$inferSelect): MuscleGroupData {
  return {
    id: row.id,
    name: row.name,
    displayName: row.displayName,
    bodyRegion: parseBodyRegion(row.bodyRegion),
  }
}

/**
 * Create a read-only MuscleGroup repository
 * Used for populating dropdowns and validating muscle group references
 */
export function createMuscleGroupRepository(db: DbClient): MuscleGroupRepositoryPort {
  return {
    findAll(): ResultAsync<MuscleGroupData[], MuscleGroupRepositoryError> {
      return ResultAsync.fromPromise(
        db
          .select()
          .from(muscleGroups)
          .orderBy(muscleGroups.displayName)
          .then((rows) => rows.map(mapToData)),
        wrapDbError,
      )
    },

    findById(id: string): ResultAsync<MuscleGroupData | null, MuscleGroupRepositoryError> {
      return ResultAsync.fromPromise(
        db
          .select()
          .from(muscleGroups)
          .where(eq(muscleGroups.id, id))
          .then((rows) => rows[0]),
        wrapDbError,
      ).andThen((row) => {
        if (!row) {
          return ok(null)
        }
        return ok(mapToData(row))
      })
    },
  }
}
