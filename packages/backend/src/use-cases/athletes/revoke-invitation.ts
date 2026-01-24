import {
  type AthleteInvitationRepositoryError,
  type AthleteInvitationRepositoryPort,
  hasPermission,
  type OrganizationContext,
} from '@strenly/core'
import { errAsync, okAsync, type ResultAsync } from 'neverthrow'

export type RevokeInvitationInput = OrganizationContext & {
  athleteId: string
}

export type RevokeInvitationError =
  | { type: 'forbidden'; message: string }
  | { type: 'invitation_not_found'; athleteId: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  invitationRepository: AthleteInvitationRepositoryPort
}

function mapInvitationRepoError(e: AthleteInvitationRepositoryError): RevokeInvitationError {
  if (e.type === 'DATABASE_ERROR') {
    return { type: 'repository_error', message: e.message }
  }
  return { type: 'repository_error', message: e.type }
}

export const makeRevokeInvitation =
  (deps: Dependencies) =>
  (input: RevokeInvitationInput): ResultAsync<void, RevokeInvitationError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'athletes:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to revoke athlete invitations',
      })
    }

    const ctx: OrganizationContext = {
      organizationId: input.organizationId,
      userId: input.userId,
      memberRole: input.memberRole,
    }

    // 2. Find invitation for athlete
    return deps.invitationRepository
      .findByAthleteId(ctx, input.athleteId)
      .mapErr(mapInvitationRepoError)
      .andThen((invitation) => {
        if (invitation === null) {
          return errAsync<void, RevokeInvitationError>({
            type: 'invitation_not_found',
            athleteId: input.athleteId,
          })
        }

        // 3. Revoke the invitation
        return deps.invitationRepository.revoke(ctx, invitation.id).mapErr(mapInvitationRepoError)
      })
      .andThen(() => okAsync(undefined))
  }
