import { err, ok, type Result } from 'neverthrow'

export type AthleteStatus = 'active' | 'inactive'
export type AthleteGender = 'male' | 'female' | 'other'

export type Athlete = {
  readonly id: string
  readonly organizationId: string
  readonly name: string
  readonly email: string | null
  readonly phone: string | null
  readonly birthdate: Date | null
  readonly gender: AthleteGender | null
  readonly notes: string | null
  readonly status: AthleteStatus
  readonly linkedUserId: string | null
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type AthleteError = { type: 'INVALID_NAME'; message: string } | { type: 'INVALID_EMAIL'; message: string }

type CreateAthleteInput = {
  id: string
  organizationId: string
  name: string
  email?: string | null
  phone?: string | null
  birthdate?: Date | null
  gender?: AthleteGender | null
  notes?: string | null
  status?: AthleteStatus
  linkedUserId?: string | null
}

// Simple email regex - validates basic email structure
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Reconstitute an Athlete from database props without validation.
 * Used when loading from the database where data is already known to be valid.
 */
export function reconstituteAthlete(props: Athlete): Athlete {
  return { ...props }
}

export function createAthlete(input: CreateAthleteInput): Result<Athlete, AthleteError> {
  // Validate and normalize name
  const trimmedName = input.name.trim()
  if (trimmedName.length === 0) {
    return err({ type: 'INVALID_NAME', message: 'Name is required' })
  }
  if (trimmedName.length > 100) {
    return err({ type: 'INVALID_NAME', message: 'Name must not exceed 100 characters' })
  }

  // Validate email if provided
  const email = input.email ?? null
  if (email !== null && !EMAIL_REGEX.test(email)) {
    return err({ type: 'INVALID_EMAIL', message: 'Invalid email format' })
  }

  const now = new Date()

  return ok({
    id: input.id,
    organizationId: input.organizationId,
    name: trimmedName,
    email,
    phone: input.phone ?? null,
    birthdate: input.birthdate ?? null,
    gender: input.gender ?? null,
    notes: input.notes ?? null,
    status: input.status ?? 'active',
    linkedUserId: input.linkedUserId ?? null,
    createdAt: now,
    updatedAt: now,
  })
}
