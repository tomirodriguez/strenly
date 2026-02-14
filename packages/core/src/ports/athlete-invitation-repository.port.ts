import type { ResultAsync } from 'neverthrow'
import type { AthleteInvitation } from '../domain/entities/athlete-invitation'
import type { OrganizationContext } from '../types/organization-context'

export type AthleteInvitationRepositoryError =
  | { type: 'NOT_FOUND'; invitationId: string }
  | { type: 'TOKEN_NOT_FOUND'; token: string }
  | { type: 'DATABASE_ERROR'; message: string; cause?: unknown }

export type AthleteInvitationRepositoryPort = {
  /**
   * Find an invitation by its token.
   * This is a public lookup - no organization context required.
   * Used during invitation acceptance flow.
   */
  findByToken(token: string): ResultAsync<AthleteInvitation | null, AthleteInvitationRepositoryError>

  /**
   * Find the active invitation for an athlete.
   */
  findByAthleteId(
    ctx: OrganizationContext,
    athleteId: string,
  ): ResultAsync<AthleteInvitation | null, AthleteInvitationRepositoryError>

  /**
   * Create a new invitation.
   */
  create(
    ctx: OrganizationContext,
    invitation: AthleteInvitation,
  ): ResultAsync<AthleteInvitation, AthleteInvitationRepositoryError>

  /**
   * Mark an invitation as accepted and link the user.
   * This is a public operation - no organization context required.
   */
  markAccepted(token: string, userId: string): ResultAsync<void, AthleteInvitationRepositoryError>

  /**
   * Revoke an invitation.
   */
  revoke(ctx: OrganizationContext, invitationId: string): ResultAsync<void, AthleteInvitationRepositoryError>
}
