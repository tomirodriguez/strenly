import type { Athlete } from '@strenly/core/domain/entities/athlete'

/**
 * Shared helper: Map Athlete domain entity to contract output
 */
export function mapAthleteToOutput(athlete: Athlete) {
  return {
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
  }
}
