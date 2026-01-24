import type { DbClient } from '@strenly/database'
import { athletes, organizations, users } from '@strenly/database/schema'
import { and, eq } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import type { OrganizationLookup } from '../../use-cases/athletes/get-invitation-info'

/**
 * Wraps database errors for lookup service
 */
function wrapDbError(error: unknown): { message: string } {
  console.error('Organization lookup error:', error)
  return { message: 'Database operation failed' }
}

/**
 * Creates an organization lookup service for resolving display names
 * Used by public invitation info endpoint
 */
export function createOrganizationLookup(db: DbClient): OrganizationLookup {
  return {
    getOrganizationName(organizationId: string) {
      return ResultAsync.fromPromise(
        db
          .select({ name: organizations.name })
          .from(organizations)
          .where(eq(organizations.id, organizationId))
          .then((rows) => rows[0]?.name ?? null),
        wrapDbError,
      )
    },

    getUserName(userId: string) {
      return ResultAsync.fromPromise(
        db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, userId))
          .then((rows) => rows[0]?.name ?? null),
        wrapDbError,
      )
    },

    getAthleteName(athleteId: string, organizationId: string) {
      return ResultAsync.fromPromise(
        db
          .select({ name: athletes.name })
          .from(athletes)
          .where(and(eq(athletes.id, athleteId), eq(athletes.organizationId, organizationId)))
          .then((rows) => rows[0]?.name ?? null),
        wrapDbError,
      )
    },
  }
}
