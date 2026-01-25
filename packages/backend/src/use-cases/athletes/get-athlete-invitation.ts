import {
  type AthleteInvitationRepositoryPort,
  type AthleteRepositoryPort,
  hasPermission,
  type OrganizationContext,
} from '@strenly/core'
import { errAsync, okAsync, type ResultAsync } from 'neverthrow'

export type GetAthleteInvitationInput = OrganizationContext & {
  athleteId: string
}

export type GetAthleteInvitationResult = {
  id: string
  athleteId: string
  invitationUrl: string
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  expiresAt: Date
  createdAt: Date
  acceptedAt: Date | null
}

export type GetAthleteInvitationError =
  | { type: 'forbidden'; message: string }
  | { type: 'athlete_not_found'; athleteId: string }
  | { type: 'no_invitation'; athleteId: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  athleteRepository: AthleteRepositoryPort
  invitationRepository: AthleteInvitationRepositoryPort
  appUrl: string
}

export const makeGetAthleteInvitation =
  (deps: Dependencies) =>
  (input: GetAthleteInvitationInput): ResultAsync<GetAthleteInvitationResult, GetAthleteInvitationError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'athletes:read')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to view athlete invitations',
      })
    }

    const ctx: OrganizationContext = {
      organizationId: input.organizationId,
      userId: input.userId,
      memberRole: input.memberRole,
    }

    // 2. Verify athlete exists and belongs to org
    return deps.athleteRepository
      .findById(ctx, input.athleteId)
      .mapErr((e): GetAthleteInvitationError => {
        if (e.type === 'NOT_FOUND') {
          return { type: 'athlete_not_found', athleteId: input.athleteId }
        }
        return { type: 'repository_error', message: e.type === 'DATABASE_ERROR' ? e.message : 'Unknown error' }
      })
      .andThen(() => {
        // 3. Get active invitation
        return deps.invitationRepository.findByAthleteId(ctx, input.athleteId).mapErr(
          (e): GetAthleteInvitationError => ({
            type: 'repository_error',
            message: e.type === 'DATABASE_ERROR' ? e.message : 'Invitation error',
          }),
        )
      })
      .andThen((invitation) => {
        if (!invitation) {
          return errAsync<GetAthleteInvitationResult, GetAthleteInvitationError>({
            type: 'no_invitation',
            athleteId: input.athleteId,
          })
        }

        // Determine status
        let status: 'pending' | 'accepted' | 'expired' | 'revoked' = 'pending'
        if (invitation.acceptedAt) {
          status = 'accepted'
        } else if (invitation.revokedAt) {
          status = 'revoked'
        } else if (invitation.expiresAt < new Date()) {
          status = 'expired'
        }

        return okAsync({
          id: invitation.id,
          athleteId: invitation.athleteId,
          invitationUrl: `${deps.appUrl}/invite/${invitation.token}`,
          status,
          expiresAt: invitation.expiresAt,
          createdAt: invitation.createdAt,
          acceptedAt: invitation.acceptedAt,
        })
      })
  }
