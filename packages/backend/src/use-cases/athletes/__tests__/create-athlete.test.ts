import type { AthleteRepositoryPort } from '@strenly/core/ports/athlete-repository.port'
import { errAsync, okAsync } from 'neverthrow'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAthleteEntity, createAthleteInput } from '../../../__tests__/factories/athlete-factory'
import { createAdminContext, createMemberContext, createTestContext } from '../../../__tests__/helpers/test-context'
import { makeCreateAthlete } from '../create-athlete'

describe('createAthlete use case', () => {
  let mockAthleteRepository: AthleteRepositoryPort
  let mockGenerateId: () => string

  beforeEach(() => {
    // Mock repository
    mockAthleteRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
      findByLinkedUserId: vi.fn(),
    }

    // Mock ID generator
    mockGenerateId = vi.fn(() => 'test-athlete-id')
  })

  describe('Happy Path', () => {
    it('should create athlete successfully with owner role', async () => {
      const ctx = createTestContext({ memberRole: 'owner' })
      const input = createAthleteInput({ name: 'John Doe', email: 'john@example.com' })

      // Mock successful repository create
      const athlete = createAthleteEntity({
        id: 'test-athlete-id',
        organizationId: ctx.organizationId,
        name: 'John Doe',
        email: 'john@example.com',
        phone: input.phone,
        birthdate: input.birthdate,
        gender: input.gender,
        notes: input.notes,
      })
      vi.mocked(mockAthleteRepository.create).mockReturnValue(okAsync(athlete))

      const createAthlete = makeCreateAthlete({
        athleteRepository: mockAthleteRepository,
        generateId: mockGenerateId,
      })

      const result = await createAthlete({ ...ctx, ...input })

      // Assert success
      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        const athlete = result.value
        expect(athlete.id).toBe('test-athlete-id')
        expect(athlete.name).toBe('John Doe')
        expect(athlete.email).toBe('john@example.com')
        expect(athlete.organizationId).toBe(ctx.organizationId)
      }

      // Verify repository called with correct context
      expect(mockAthleteRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: ctx.organizationId,
          userId: ctx.userId,
          memberRole: 'owner',
        }),
        expect.objectContaining({
          id: 'test-athlete-id',
          name: 'John Doe',
          email: 'john@example.com',
        }),
      )
    })

    it('should create athlete with minimal required fields', async () => {
      const ctx = createAdminContext()
      const input = { name: 'Jane Doe' } // Only required field

      const athlete = createAthleteEntity({
        id: 'test-athlete-id',
        organizationId: ctx.organizationId,
        name: 'Jane Doe',
        email: null,
        phone: null,
        birthdate: null,
        gender: null,
        notes: null,
      })
      vi.mocked(mockAthleteRepository.create).mockReturnValue(okAsync(athlete))

      const createAthlete = makeCreateAthlete({
        athleteRepository: mockAthleteRepository,
        generateId: mockGenerateId,
      })

      const result = await createAthlete({ ...ctx, ...input })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        const athlete = result.value
        expect(athlete.name).toBe('Jane Doe')
        expect(athlete.email).toBeNull()
      }
    })
  })

  describe('Authorization', () => {
    it('should return forbidden error when user lacks athletes:write permission', async () => {
      const ctx = createMemberContext() // Viewer role lacks write permission
      const input = createAthleteInput()

      const createAthlete = makeCreateAthlete({
        athleteRepository: mockAthleteRepository,
        generateId: mockGenerateId,
      })

      const result = await createAthlete({ ...ctx, ...input })

      // Assert authorization failure
      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error
        expect(error.type).toBe('forbidden')
        expect(error.message).toContain('No permission')
      }

      // Repository should NOT be called
      expect(mockAthleteRepository.create).not.toHaveBeenCalled()
    })

    it('should succeed when user has coach role (has athletes:write)', async () => {
      const ctx = createAdminContext() // Coach role has write permission
      const input = createAthleteInput()

      const athlete = createAthleteEntity({
        id: 'test-athlete-id',
        organizationId: ctx.organizationId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        birthdate: input.birthdate,
        gender: input.gender,
        notes: input.notes,
      })
      vi.mocked(mockAthleteRepository.create).mockReturnValue(okAsync(athlete))

      const createAthlete = makeCreateAthlete({
        athleteRepository: mockAthleteRepository,
        generateId: mockGenerateId,
      })

      const result = await createAthlete({ ...ctx, ...input })

      expect(result.isOk()).toBe(true)
    })
  })

  describe('Validation Errors', () => {
    it('should return validation error when name is empty', async () => {
      const ctx = createAdminContext()
      const input = createAthleteInput({ name: '' }) // Invalid: empty name

      const createAthlete = makeCreateAthlete({
        athleteRepository: mockAthleteRepository,
        generateId: mockGenerateId,
      })

      const result = await createAthlete({ ...ctx, ...input })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error
        expect(error.type).toBe('validation_error')
        expect(error.message).toContain('Name')
      }

      // Repository should NOT be called for invalid input
      expect(mockAthleteRepository.create).not.toHaveBeenCalled()
    })

    it('should return validation error for malformed email', async () => {
      const ctx = createAdminContext()
      const input = createAthleteInput({ email: 'invalid-email' })

      const createAthlete = makeCreateAthlete({
        athleteRepository: mockAthleteRepository,
        generateId: mockGenerateId,
      })

      const result = await createAthlete({ ...ctx, ...input })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error
        expect(error.type).toBe('validation_error')
        expect(error.message.toLowerCase()).toContain('email')
      }
    })
  })

  describe('Repository Errors', () => {
    it('should return repository error when database fails', async () => {
      const ctx = createAdminContext()
      const input = createAthleteInput()

      // Mock repository failure
      vi.mocked(mockAthleteRepository.create).mockReturnValue(
        errAsync({
          type: 'DATABASE_ERROR',
          message: 'Connection failed',
        }),
      )

      const createAthlete = makeCreateAthlete({
        athleteRepository: mockAthleteRepository,
        generateId: mockGenerateId,
      })

      const result = await createAthlete({ ...ctx, ...input })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error
        expect(error.type).toBe('repository_error')
        expect(error.message).toContain('Connection failed')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle null optional fields correctly', async () => {
      const ctx = createAdminContext()
      const input = createAthleteInput({
        email: null,
        phone: null,
        birthdate: null,
        gender: null,
        notes: null,
      })

      const athlete = createAthleteEntity({
        id: 'test-athlete-id',
        organizationId: ctx.organizationId,
        name: input.name,
        email: null,
        phone: null,
        birthdate: null,
        gender: null,
        notes: null,
      })
      vi.mocked(mockAthleteRepository.create).mockReturnValue(okAsync(athlete))

      const createAthlete = makeCreateAthlete({
        athleteRepository: mockAthleteRepository,
        generateId: mockGenerateId,
      })

      const result = await createAthlete({ ...ctx, ...input })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        const athlete = result.value
        expect(athlete.email).toBeNull()
        expect(athlete.phone).toBeNull()
        expect(athlete.birthdate).toBeNull()
      }
    })

    it('should create multiple athletes with unique IDs in parallel', async () => {
      const ctx = createAdminContext()
      let idCounter = 0
      const generateUniqueId = vi.fn(() => `athlete-${++idCounter}`)

      const createAthlete = makeCreateAthlete({
        athleteRepository: mockAthleteRepository,
        generateId: generateUniqueId,
      })

      const inputs = [
        createAthleteInput({ name: 'Athlete 1' }),
        createAthleteInput({ name: 'Athlete 2' }),
        createAthleteInput({ name: 'Athlete 3' }),
      ]

      // Mock repository for all creates
      vi.mocked(mockAthleteRepository.create).mockImplementation((_, athlete) =>
        okAsync({
          ...athlete,
          archivedAt: null,
          status: 'active' as const,
        }),
      )

      // Create all athletes in parallel
      const results = await Promise.all(inputs.map((input) => createAthlete({ ...ctx, ...input })))

      // All should succeed
      expect(results.every((r) => r.isOk())).toBe(true)

      // All should have unique IDs
      const ids = results.map((r) => (r.isOk() ? r.value.id : null))
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(3)
    })
  })
})
