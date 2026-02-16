import type { AthleteRepositoryPort } from '@strenly/core/ports/athlete-repository.port'
import { errAsync, okAsync } from 'neverthrow'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAthleteEntity } from '../../../__tests__/factories/athlete-factory'
import { createAthleteRepositoryMock } from '../../../__tests__/factories/athlete-repository-mock'
import { createAdminContext, createMemberContext } from '../../../__tests__/helpers/test-context'
import { makeListAthletes } from '../list-athletes'

describe('listAthletes use case', () => {
  let mockAthleteRepository: AthleteRepositoryPort

  beforeEach(() => {
    mockAthleteRepository = createAthleteRepositoryMock()
  })

  describe('Happy Path', () => {
    it('should list athletes successfully', async () => {
      const ctx = createAdminContext()

      const athletes = [
        createAthleteEntity({ id: 'athlete-1', organizationId: ctx.organizationId }),
        createAthleteEntity({ id: 'athlete-2', organizationId: ctx.organizationId }),
      ]

      vi.mocked(mockAthleteRepository.findAll).mockReturnValue(
        okAsync({ items: athletes, totalCount: 2 }),
      )

      const listAthletes = makeListAthletes({
        athleteRepository: mockAthleteRepository,
      })

      const result = await listAthletes(ctx)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.items).toHaveLength(2)
        expect(result.value.totalCount).toBe(2)
      }

      expect(mockAthleteRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: ctx.organizationId,
        }),
        expect.objectContaining({
          limit: 50,
          offset: 0,
        }),
      )
    })

    it('should filter by status', async () => {
      const ctx = createAdminContext()

      vi.mocked(mockAthleteRepository.findAll).mockReturnValue(
        okAsync({ items: [], totalCount: 0 }),
      )

      const listAthletes = makeListAthletes({
        athleteRepository: mockAthleteRepository,
      })

      await listAthletes({
        ...ctx,
        status: 'active',
      })

      expect(mockAthleteRepository.findAll).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'active',
        }),
      )
    })

    it('should apply search filter', async () => {
      const ctx = createAdminContext()

      vi.mocked(mockAthleteRepository.findAll).mockReturnValue(
        okAsync({ items: [], totalCount: 0 }),
      )

      const listAthletes = makeListAthletes({
        athleteRepository: mockAthleteRepository,
      })

      await listAthletes({
        ...ctx,
        search: 'John',
      })

      expect(mockAthleteRepository.findAll).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          search: 'John',
        }),
      )
    })

    it('should apply pagination', async () => {
      const ctx = createAdminContext()

      vi.mocked(mockAthleteRepository.findAll).mockReturnValue(
        okAsync({ items: [], totalCount: 0 }),
      )

      const listAthletes = makeListAthletes({
        athleteRepository: mockAthleteRepository,
      })

      await listAthletes({
        ...ctx,
        limit: 10,
        offset: 5,
      })

      expect(mockAthleteRepository.findAll).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          limit: 10,
          offset: 5,
        }),
      )
    })
  })

  describe('Repository Errors', () => {
    it('should return repository error when findAll fails', async () => {
      const ctx = createAdminContext()

      vi.mocked(mockAthleteRepository.findAll).mockReturnValue(
        errAsync({
          type: 'DATABASE_ERROR',
          message: 'Query failed',
        }),
      )

      const listAthletes = makeListAthletes({
        athleteRepository: mockAthleteRepository,
      })

      const result = await listAthletes(ctx)

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error
        expect(error.type).toBe('repository_error')
        if (error.type === 'repository_error') {
          expect(error.message).toContain('Query failed')
        }
      }
    })
  })

  describe('Edge Cases', () => {
    it('should return empty list when no athletes exist', async () => {
      const ctx = createAdminContext()

      vi.mocked(mockAthleteRepository.findAll).mockReturnValue(
        okAsync({ items: [], totalCount: 0 }),
      )

      const listAthletes = makeListAthletes({
        athleteRepository: mockAthleteRepository,
      })

      const result = await listAthletes(ctx)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.items).toHaveLength(0)
        expect(result.value.totalCount).toBe(0)
      }
    })
  })
})