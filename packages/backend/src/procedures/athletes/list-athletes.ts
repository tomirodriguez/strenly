import {
  athleteStatusSchema,
  listAthletesInputSchema,
  listAthletesOutputSchema,
} from '@strenly/contracts/athletes/athlete'
import { createAthleteRepository } from '../../infrastructure/repositories/athlete.repository'
import { authProcedure } from '../../lib/orpc'
import { makeListAthletes } from '../../use-cases/athletes/list-athletes'

/**
 * List athletes procedure
 * Requires authentication and organization context
 * Supports filtering by status, search, and pagination
 */
export const listAthletes = authProcedure
  .input(listAthletesInputSchema)
  .output(listAthletesOutputSchema)
  .errors({
    FORBIDDEN: { message: 'No tienes permisos para ver atletas' },
  })
  .handler(async ({ input, context, errors }) => {
    const useCase = makeListAthletes({
      athleteRepository: createAthleteRepository(context.db),
    })

    // Parse status from optional string to enum
    const status = input.status ? athleteStatusSchema.parse(input.status) : undefined

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      status,
      search: input.search,
      limit: input.limit,
      offset: input.offset,
    })

    if (result.isErr()) {
      // Exhaustive error mapping
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN()
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    const { items, totalCount } = result.value

    return {
      items: items.map((athlete) => ({
        id: athlete.id,
        organizationId: athlete.organizationId,
        name: athlete.name,
        email: athlete.email,
        phone: athlete.phone,
        birthdate: athlete.birthdate?.toISOString().split('T')[0] ?? null,
        gender: athlete.gender,
        notes: athlete.notes,
        status: athlete.status,
        linkedUserId: athlete.linkedUserId,
        isLinked: athlete.linkedUserId !== null,
        createdAt: athlete.createdAt.toISOString(),
        updatedAt: athlete.updatedAt.toISOString(),
      })),
      totalCount,
    }
  })
