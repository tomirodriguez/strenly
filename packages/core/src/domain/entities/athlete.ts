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

export type AthleteError =
  | { type: 'INVALID_NAME'; message: string }
  | { type: 'INVALID_EMAIL'; message: string }
  | { type: 'ALREADY_INACTIVE'; message: string }
  | { type: 'ALREADY_ACTIVE'; message: string }

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

export type UpdateAthleteInput = {
  name?: string
  email?: string | null
  phone?: string | null
  birthdate?: Date | null
  gender?: AthleteGender | null
  notes?: string | null
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

/**
 * Update an athlete's details with validation.
 * Only the provided fields are updated; undefined fields are kept unchanged.
 */
export function updateAthlete(athlete: Athlete, updates: UpdateAthleteInput): Result<Athlete, AthleteError> {
  // Validate name if provided
  if (updates.name !== undefined) {
    const trimmedName = updates.name.trim()
    if (trimmedName.length === 0) {
      return err({ type: 'INVALID_NAME', message: 'Name is required' })
    }
    if (trimmedName.length > 100) {
      return err({ type: 'INVALID_NAME', message: 'Name must not exceed 100 characters' })
    }
  }

  // Validate email if provided
  const email = updates.email !== undefined ? (updates.email ?? null) : athlete.email
  if (email !== null && !EMAIL_REGEX.test(email)) {
    return err({ type: 'INVALID_EMAIL', message: 'Invalid email format' })
  }

  return ok({
    ...athlete,
    name: updates.name !== undefined ? updates.name.trim() : athlete.name,
    email,
    phone: updates.phone !== undefined ? (updates.phone ?? null) : athlete.phone,
    birthdate: updates.birthdate !== undefined ? (updates.birthdate ?? null) : athlete.birthdate,
    gender: updates.gender !== undefined ? (updates.gender ?? null) : athlete.gender,
    notes: updates.notes !== undefined ? (updates.notes ?? null) : athlete.notes,
    updatedAt: new Date(),
  })
}

/**
 * Deactivate an athlete (set status to inactive).
 * Returns error if athlete is already inactive.
 */
export function deactivateAthlete(athlete: Athlete): Result<Athlete, AthleteError> {
  if (athlete.status === 'inactive') {
    return err({ type: 'ALREADY_INACTIVE', message: 'Athlete is already inactive' })
  }

  return ok({
    ...athlete,
    status: 'inactive',
    updatedAt: new Date(),
  })
}

/**
 * Reactivate an athlete (set status to active).
 * Returns error if athlete is already active.
 */
export function reactivateAthlete(athlete: Athlete): Result<Athlete, AthleteError> {
  if (athlete.status === 'active') {
    return err({ type: 'ALREADY_ACTIVE', message: 'Athlete is already active' })
  }

  return ok({
    ...athlete,
    status: 'active',
    updatedAt: new Date(),
  })
}
