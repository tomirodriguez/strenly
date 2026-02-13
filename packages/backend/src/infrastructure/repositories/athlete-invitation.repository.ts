import type {
  AthleteInvitation,
  AthleteInvitationRepositoryError,
  AthleteInvitationRepositoryPort,
  OrganizationContext,
} from '@strenly/core'
import type { DbClient } from '@strenly/database'
import { athleteInvitations, athletes } from '@strenly/database/schema'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { err, ok, ResultAsync as RA, type ResultAsync } from 'neverthrow'

function wrapDbError(error: unknown): AthleteInvitationRepositoryError {
  console.error('AthleteInvitation repository error:', error)
  return { type: 'DATABASE_ERROR', message: 'Database operation failed' }
}

/**
 * Maps a database row to an AthleteInvitation domain entity.
 */
function mapToDomain(row: typeof athleteInvitations.$inferSelect): AthleteInvitation {
  return {
    id: row.id,
    athleteId: row.athleteId,
    organizationId: row.organizationId,
    createdByUserId: row.createdByUserId ?? '',
    token: row.token,
    expiresAt: row.expiresAt,
    acceptedAt: row.acceptedAt,
    revokedAt: row.revokedAt,
    createdAt: row.createdAt,
  }
}

export function createAthleteInvitationRepository(db: DbClient): AthleteInvitationRepositoryPort {
  return {
    /**
     * Find an invitation by its token.
     * This is a public lookup - no organization context required.
     * Used during invitation acceptance flow.
     */
    findByToken(token: string): ResultAsync<AthleteInvitation | null, AthleteInvitationRepositoryError> {
      return RA.fromPromise(
        db
          .select()
          .from(athleteInvitations)
          .where(eq(athleteInvitations.token, token))
          .then((rows) => rows[0]),
        wrapDbError,
      ).map((row) => {
        if (!row) {
          return null
        }
        return mapToDomain(row)
      })
    },

    /**
     * Find the active invitation for an athlete.
     * Returns the most recent non-revoked invitation.
     */
    findByAthleteId(
      ctx: OrganizationContext,
      athleteId: string,
    ): ResultAsync<AthleteInvitation | null, AthleteInvitationRepositoryError> {
      return RA.fromPromise(
        db
          .select()
          .from(athleteInvitations)
          .where(
            and(
              eq(athleteInvitations.athleteId, athleteId),
              eq(athleteInvitations.organizationId, ctx.organizationId),
              isNull(athleteInvitations.revokedAt),
            ),
          )
          .orderBy(desc(athleteInvitations.createdAt))
          .limit(1)
          .then((rows) => rows[0]),
        wrapDbError,
      ).map((row) => {
        if (!row) {
          return null
        }
        return mapToDomain(row)
      })
    },

    /**
     * Create a new invitation.
     */
    create(
      ctx: OrganizationContext,
      invitation: AthleteInvitation,
    ): ResultAsync<AthleteInvitation, AthleteInvitationRepositoryError> {
      return RA.fromPromise(
        db
          .insert(athleteInvitations)
          .values({
            id: invitation.id,
            athleteId: invitation.athleteId,
            organizationId: ctx.organizationId,
            createdByUserId: invitation.createdByUserId,
            token: invitation.token,
            expiresAt: invitation.expiresAt,
            acceptedAt: invitation.acceptedAt,
            revokedAt: invitation.revokedAt,
          })
          .returning()
          .then((rows) => rows[0]),
        wrapDbError,
      ).andThen((row) => {
        if (!row) {
          return err({ type: 'DATABASE_ERROR', message: 'Failed to create invitation' } as const)
        }
        return ok(mapToDomain(row))
      })
    },

    /**
     * Mark an invitation as accepted and link the user to the athlete.
     * This is a transaction: update invitation AND update athlete.linkedUserId.
     * This is a public operation - no organization context required.
     */
    markAccepted(token: string, userId: string): ResultAsync<void, AthleteInvitationRepositoryError> {
      return RA.fromPromise(
        (async () => {
          // First find the invitation to get the athleteId
          const invitationRows = await db.select().from(athleteInvitations).where(eq(athleteInvitations.token, token))

          const invitation = invitationRows[0]
          if (!invitation) {
            return { found: false } as const
          }

          // Update the invitation to mark as accepted
          await db.update(athleteInvitations).set({ acceptedAt: new Date() }).where(eq(athleteInvitations.token, token))

          // Link the user to the athlete (scoped by organizationId for defense-in-depth)
          await db
            .update(athletes)
            .set({
              linkedUserId: userId,
              updatedAt: new Date(),
            })
            .where(and(eq(athletes.id, invitation.athleteId), eq(athletes.organizationId, invitation.organizationId)))

          return { found: true } as const
        })(),
        wrapDbError,
      ).andThen((result) => {
        if (!result.found) {
          return err({ type: 'TOKEN_NOT_FOUND', token } as const)
        }
        return ok(undefined)
      })
    },

    /**
     * Revoke an invitation.
     */
    revoke(ctx: OrganizationContext, invitationId: string): ResultAsync<void, AthleteInvitationRepositoryError> {
      return RA.fromPromise(
        db
          .update(athleteInvitations)
          .set({ revokedAt: new Date() })
          .where(
            and(eq(athleteInvitations.id, invitationId), eq(athleteInvitations.organizationId, ctx.organizationId)),
          )
          .returning()
          .then((rows) => rows[0]),
        wrapDbError,
      ).andThen((row) => {
        if (!row) {
          return err({ type: 'NOT_FOUND', invitationId } as const)
        }
        return ok(undefined)
      })
    },
  }
}
