import { acceptInvitationInputSchema, acceptInvitationOutputSchema } from '@strenly/contracts/athletes/invitation'
import { createAthleteRepository } from '../../infrastructure/repositories/athlete.repository'
import { createAthleteInvitationRepository } from '../../infrastructure/repositories/athlete-invitation.repository'
import { sessionProcedure } from '../../lib/orpc'
import { makeAcceptInvitation } from '../../use-cases/athletes/accept-invitation'

/**
 * Accept an athlete invitation
 * Requires authentication (session) but no organization context
 * The athlete accepting uses their user session to link accounts
 */
export const acceptInvitation = sessionProcedure
  .input(acceptInvitationInputSchema)
  .output(acceptInvitationOutputSchema)
  .errors({
    INVALID_TOKEN: { message: 'Invalid invitation token' },
    EXPIRED: { message: 'The invitation has expired' },
    ALREADY_ACCEPTED: { message: 'The invitation has already been accepted' },
    ALREADY_REVOKED: { message: 'The invitation has been revoked' },
  })
  .handler(async ({ input, context, errors }) => {
    const useCase = makeAcceptInvitation({
      invitationRepository: createAthleteInvitationRepository(context.db),
      athleteRepository: createAthleteRepository(context.db),
    })

    const result = await useCase({
      token: input.token,
      userId: context.user.id,
    })

    if (result.isErr()) {
      // Exhaustive error mapping
      switch (result.error.type) {
        case 'invalid_token':
          throw errors.INVALID_TOKEN()
        case 'expired':
          throw errors.EXPIRED()
        case 'already_accepted':
          throw errors.ALREADY_ACCEPTED()
        case 'already_revoked':
          throw errors.ALREADY_REVOKED()
        case 'athlete_not_found':
          // This is an internal error - the athlete should exist
          console.error('Athlete not found after accepting invitation:', result.error.athleteId)
          throw new Error('Internal error')
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    return {
      athleteId: result.value.athlete.id,
      organizationId: result.value.organizationId,
    }
  })
