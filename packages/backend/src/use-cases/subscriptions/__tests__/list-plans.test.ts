import type { Plan } from '@strenly/core/domain/entities/plan'
import type { PlanRepositoryPort } from '@strenly/core/ports/plan-repository.port'
import { errAsync, okAsync } from 'neverthrow'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { makeListPlans } from '../list-plans'

// Helper to create plan entity
function createPlan(overrides: Partial<Plan> = {}): Plan {
  return {
    id: 'plan-456',
    name: 'Pro Plan',
    slug: 'pro',
    organizationType: 'coach_solo',
    athleteLimit: 50,
    coachLimit: 1,
    features: {
      templates: true,
      analytics: true,
      exportData: true,
      customExercises: true,
      multipleCoaches: false,
    },
    priceMonthly: 4999,
    priceYearly: 49999,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('listPlans use case', () => {
  let mockPlanRepository: PlanRepositoryPort

  beforeEach(() => {
    mockPlanRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      findBySlug: vi.fn(),
    }
  })

  // NOTE: No Authorization tests - this is a PUBLIC endpoint

  describe('Happy Path', () => {
    it('should list all active plans successfully', async () => {
      const plans = [
        createPlan({ id: 'plan-1', name: 'Starter', slug: 'starter', athleteLimit: 10 }),
        createPlan({ id: 'plan-2', name: 'Pro', slug: 'pro', athleteLimit: 50 }),
        createPlan({ id: 'plan-3', name: 'Elite', slug: 'elite', athleteLimit: 200 }),
      ]

      vi.mocked(mockPlanRepository.findAll).mockReturnValue(
        okAsync({
          items: plans,
          totalCount: 3,
        }),
      )

      const listPlans = makeListPlans({
        planRepository: mockPlanRepository,
      })

      const result = await listPlans({})

      // Assert success
      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        const data = result.value
        expect(data.items).toHaveLength(3)
        expect(data.totalCount).toBe(3)
        expect(data.items[0]?.name).toBe('Starter')
        expect(data.items[1]?.name).toBe('Pro')
        expect(data.items[2]?.name).toBe('Elite')
      }

      // Verify repository called with correct filters
      expect(mockPlanRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          activeOnly: true,
          limit: 100,
          offset: 0,
        }),
      )
    })

    it('should list plans filtered by organization type (coach_solo)', async () => {
      const soloPlans = [
        createPlan({ id: 'plan-1', name: 'Solo Starter', organizationType: 'coach_solo' }),
        createPlan({ id: 'plan-2', name: 'Solo Pro', organizationType: 'coach_solo' }),
      ]

      vi.mocked(mockPlanRepository.findAll).mockReturnValue(
        okAsync({
          items: soloPlans,
          totalCount: 2,
        }),
      )

      const listPlans = makeListPlans({
        planRepository: mockPlanRepository,
      })

      const result = await listPlans({
        organizationType: 'coach_solo',
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.items).toHaveLength(2)
        expect(result.value.items.every((p) => p.organizationType === 'coach_solo')).toBe(true)
      }

      // Verify filter passed to repository
      expect(mockPlanRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationType: 'coach_solo',
          activeOnly: true,
        }),
      )
    })

    it('should list plans filtered by organization type (gym)', async () => {
      const gymPlans = [createPlan({ id: 'plan-1', name: 'Gym Plan', organizationType: 'gym', coachLimit: 10 })]

      vi.mocked(mockPlanRepository.findAll).mockReturnValue(
        okAsync({
          items: gymPlans,
          totalCount: 1,
        }),
      )

      const listPlans = makeListPlans({
        planRepository: mockPlanRepository,
      })

      const result = await listPlans({
        organizationType: 'gym',
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.items).toHaveLength(1)
        expect(result.value.items[0]?.organizationType).toBe('gym')
      }
    })

    it('should list plans with their feature sets', async () => {
      const plans = [
        createPlan({
          id: 'plan-1',
          name: 'Basic',
          features: {
            templates: false,
            analytics: false,
            exportData: false,
            customExercises: true,
            multipleCoaches: false,
          },
        }),
        createPlan({
          id: 'plan-2',
          name: 'Pro',
          features: {
            templates: true,
            analytics: true,
            exportData: true,
            customExercises: true,
            multipleCoaches: false,
          },
        }),
      ]

      vi.mocked(mockPlanRepository.findAll).mockReturnValue(
        okAsync({
          items: plans,
          totalCount: 2,
        }),
      )

      const listPlans = makeListPlans({
        planRepository: mockPlanRepository,
      })

      const result = await listPlans({})

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.items[0]?.features.templates).toBe(false)
        expect(result.value.items[1]?.features.templates).toBe(true)
      }
    })

    it('should list plans with pricing information', async () => {
      const plans = [
        createPlan({
          id: 'plan-1',
          name: 'Starter',
          priceMonthly: 2999, // $29.99
          priceYearly: 29999, // $299.99
        }),
        createPlan({
          id: 'plan-2',
          name: 'Pro',
          priceMonthly: 4999, // $49.99
          priceYearly: 49999, // $499.99
        }),
      ]

      vi.mocked(mockPlanRepository.findAll).mockReturnValue(
        okAsync({
          items: plans,
          totalCount: 2,
        }),
      )

      const listPlans = makeListPlans({
        planRepository: mockPlanRepository,
      })

      const result = await listPlans({})

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.items[0]?.priceMonthly).toBe(2999)
        expect(result.value.items[0]?.priceYearly).toBe(29999)
        expect(result.value.items[1]?.priceMonthly).toBe(4999)
        expect(result.value.items[1]?.priceYearly).toBe(49999)
      }
    })
  })

  describe('Repository Errors', () => {
    it('should return repository error when database fails', async () => {
      // Mock repository failure
      vi.mocked(mockPlanRepository.findAll).mockReturnValue(
        errAsync({
          type: 'DATABASE_ERROR',
          message: 'Connection timeout',
        }),
      )

      const listPlans = makeListPlans({
        planRepository: mockPlanRepository,
      })

      const result = await listPlans({})

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error
        expect(error.type).toBe('repository_error')
        if (error.type === 'repository_error') {
          expect(error.message).toContain('Connection timeout')
        }
      }
    })
  })

  describe('Edge Cases', () => {
    it('should return empty list when no active plans exist', async () => {
      // No active plans
      vi.mocked(mockPlanRepository.findAll).mockReturnValue(
        okAsync({
          items: [],
          totalCount: 0,
        }),
      )

      const listPlans = makeListPlans({
        planRepository: mockPlanRepository,
      })

      const result = await listPlans({})

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.items).toHaveLength(0)
        expect(result.value.totalCount).toBe(0)
      }
    })

    it('should only return active plans (isActive: true)', async () => {
      // Repository should filter to activeOnly: true
      const activePlans = [
        createPlan({ id: 'plan-1', name: 'Active Plan 1', isActive: true }),
        createPlan({ id: 'plan-2', name: 'Active Plan 2', isActive: true }),
      ]

      vi.mocked(mockPlanRepository.findAll).mockReturnValue(
        okAsync({
          items: activePlans,
          totalCount: 2,
        }),
      )

      const listPlans = makeListPlans({
        planRepository: mockPlanRepository,
      })

      const result = await listPlans({})

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.items.every((p) => p.isActive === true)).toBe(true)
      }

      // Verify activeOnly flag was passed
      expect(mockPlanRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          activeOnly: true,
        }),
      )
    })

    it('should handle plans with different athlete limits', async () => {
      const plans = [
        createPlan({ id: 'plan-1', name: 'Small', athleteLimit: 10 }),
        createPlan({ id: 'plan-2', name: 'Medium', athleteLimit: 50 }),
        createPlan({ id: 'plan-3', name: 'Large', athleteLimit: 200 }),
        createPlan({ id: 'plan-4', name: 'Unlimited', athleteLimit: 9999 }),
      ]

      vi.mocked(mockPlanRepository.findAll).mockReturnValue(
        okAsync({
          items: plans,
          totalCount: 4,
        }),
      )

      const listPlans = makeListPlans({
        planRepository: mockPlanRepository,
      })

      const result = await listPlans({})

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.items).toHaveLength(4)
        const limits = result.value.items.map((p) => p.athleteLimit)
        expect(limits).toEqual([10, 50, 200, 9999])
      }
    })

    it('should handle plans with multipleCoaches feature', async () => {
      const plans = [
        createPlan({
          id: 'plan-1',
          name: 'Solo',
          organizationType: 'coach_solo',
          coachLimit: 1,
          features: { templates: true, analytics: true, exportData: true, customExercises: true, multipleCoaches: false },
        }),
        createPlan({
          id: 'plan-2',
          name: 'Team',
          organizationType: 'gym',
          coachLimit: 10,
          features: { templates: true, analytics: true, exportData: true, customExercises: true, multipleCoaches: true },
        }),
      ]

      vi.mocked(mockPlanRepository.findAll).mockReturnValue(
        okAsync({
          items: plans,
          totalCount: 2,
        }),
      )

      const listPlans = makeListPlans({
        planRepository: mockPlanRepository,
      })

      const result = await listPlans({})

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.items[0]?.features.multipleCoaches).toBe(false)
        expect(result.value.items[1]?.features.multipleCoaches).toBe(true)
      }
    })
  })
})
