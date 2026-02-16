import { faker } from '@faker-js/faker'
import type { Plan } from '@strenly/core/domain/entities/plan'
import type { PlanRepositoryPort } from '@strenly/core/ports/plan-repository.port'
import type { SubscriptionRepositoryPort } from '@strenly/core/ports/subscription-repository.port'
import { errAsync, okAsync } from 'neverthrow'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { makeCreateSubscription } from '../create-subscription'

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

describe('createSubscription use case', () => {
  let mockSubscriptionRepository: SubscriptionRepositoryPort
  let mockPlanRepository: PlanRepositoryPort
  let mockGenerateId: () => string
  const organizationId = 'org-123'
  const planId = 'plan-456'

  beforeEach(() => {
    mockSubscriptionRepository = {
      create: vi.fn(),
      findByOrganizationId: vi.fn(),
      save: vi.fn(),
      updateAthleteCount: vi.fn(),
    } as unknown as SubscriptionRepositoryPort
    mockPlanRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      findBySlug: vi.fn(),
    } as unknown as PlanRepositoryPort
    mockGenerateId = vi.fn(() => faker.string.uuid())
  })

  describe('Happy Path', () => {
    it('should create subscription successfully with 30-day period', async () => {
      const plan = createPlan({ id: planId, name: 'Pro Plan', athleteLimit: 50 })

      const subscriptionId = 'sub-new-123'
      vi.mocked(mockGenerateId).mockReturnValue(subscriptionId)

      vi.mocked(mockPlanRepository.findById).mockReturnValue(okAsync(plan))

      vi.mocked(mockSubscriptionRepository.create).mockImplementation((subscription) => okAsync(subscription))

      const createSubscription = makeCreateSubscription({
        subscriptionRepository: mockSubscriptionRepository,
        planRepository: mockPlanRepository,
        generateId: mockGenerateId,
      })

      const result = await createSubscription({
        organizationId,
        planId,
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.subscription.id).toBe(subscriptionId)
        expect(result.value.subscription.organizationId).toBe(organizationId)
        expect(result.value.subscription.planId).toBe(planId)
        expect(result.value.subscription.status).toBe('active')
        expect(result.value.subscription.athleteCount).toBe(0)
        expect(result.value.plan).toEqual(plan)

        // Verify 30-day period
        const periodStart = result.value.subscription.currentPeriodStart
        const periodEnd = result.value.subscription.currentPeriodEnd
        const daysDiff = Math.floor((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
        expect(daysDiff).toBe(30)
      }

      expect(mockSubscriptionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: subscriptionId,
          organizationId,
          planId,
          status: 'active',
          athleteCount: 0,
        }),
      )
    })

    it('should create subscription for basic plan', async () => {
      const plan = createPlan({
        id: planId,
        name: 'Basic Plan',
        athleteLimit: 10,
        features: {
          templates: true,
          analytics: false,
          exportData: false,
          customExercises: true,
          multipleCoaches: false,
        },
      })

      vi.mocked(mockPlanRepository.findById).mockReturnValue(okAsync(plan))
      vi.mocked(mockSubscriptionRepository.create).mockImplementation((subscription) => okAsync(subscription))

      const createSubscription = makeCreateSubscription({
        subscriptionRepository: mockSubscriptionRepository,
        planRepository: mockPlanRepository,
        generateId: mockGenerateId,
      })

      const result = await createSubscription({
        organizationId,
        planId,
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.plan.name).toBe('Basic Plan')
        expect(result.value.subscription.status).toBe('active')
      }
    })

    it('should start with athleteCount at 0', async () => {
      const plan = createPlan({ id: planId, name: 'Pro Plan', athleteLimit: 50 })

      vi.mocked(mockPlanRepository.findById).mockReturnValue(okAsync(plan))
      vi.mocked(mockSubscriptionRepository.create).mockImplementation((subscription) => okAsync(subscription))

      const createSubscription = makeCreateSubscription({
        subscriptionRepository: mockSubscriptionRepository,
        planRepository: mockPlanRepository,
        generateId: mockGenerateId,
      })

      const result = await createSubscription({
        organizationId,
        planId,
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.subscription.athleteCount).toBe(0)
      }
    })
  })

  describe('Not Found Errors', () => {
    it('should return plan_not_found when plan does not exist', async () => {
      vi.mocked(mockPlanRepository.findById).mockReturnValue(okAsync(null))

      const createSubscription = makeCreateSubscription({
        subscriptionRepository: mockSubscriptionRepository,
        planRepository: mockPlanRepository,
        generateId: mockGenerateId,
      })

      const result = await createSubscription({
        organizationId,
        planId: 'non-existent-plan',
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('plan_not_found')
        if (result.error.type === 'plan_not_found') {
          expect(result.error.planId).toBe('non-existent-plan')
        }
      }

      // Create should not be called
      expect(mockSubscriptionRepository.create).not.toHaveBeenCalled()
    })
  })

  describe('Validation Errors', () => {
    it('should return validation error when subscription entity creation fails', async () => {
      const plan = createPlan({ id: planId, name: 'Pro Plan', athleteLimit: 50 })

      vi.mocked(mockPlanRepository.findById).mockReturnValue(okAsync(plan))

      // Force validation error by mocking generateId to return empty string
      vi.mocked(mockGenerateId).mockReturnValue('')

      const createSubscription = makeCreateSubscription({
        subscriptionRepository: mockSubscriptionRepository,
        planRepository: mockPlanRepository,
        generateId: mockGenerateId,
      })

      const result = await createSubscription({
        organizationId,
        planId,
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('validation_error')
      }

      // Create should not be called
      expect(mockSubscriptionRepository.create).not.toHaveBeenCalled()
    })
  })

  describe('Repository Errors', () => {
    it('should return repository error when plan lookup fails', async () => {
      vi.mocked(mockPlanRepository.findById).mockReturnValue(
        errAsync({
          type: 'DATABASE_ERROR',
          message: 'Connection lost',
        }),
      )

      const createSubscription = makeCreateSubscription({
        subscriptionRepository: mockSubscriptionRepository,
        planRepository: mockPlanRepository,
        generateId: mockGenerateId,
      })

      const result = await createSubscription({
        organizationId,
        planId,
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('repository_error')
      }
    })

    it('should return repository error when subscription creation fails', async () => {
      const plan = createPlan({ id: planId, name: 'Pro Plan', athleteLimit: 50 })

      vi.mocked(mockPlanRepository.findById).mockReturnValue(okAsync(plan))
      vi.mocked(mockSubscriptionRepository.create).mockReturnValue(
        errAsync({
          type: 'DATABASE_ERROR',
          message: 'Insert failed',
        }),
      )

      const createSubscription = makeCreateSubscription({
        subscriptionRepository: mockSubscriptionRepository,
        planRepository: mockPlanRepository,
        generateId: mockGenerateId,
      })

      const result = await createSubscription({
        organizationId,
        planId,
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('repository_error')
      }
    })

    it('should return repository error when organization not found', async () => {
      const plan = createPlan({ id: planId, name: 'Pro Plan', athleteLimit: 50 })

      vi.mocked(mockPlanRepository.findById).mockReturnValue(okAsync(plan))
      vi.mocked(mockSubscriptionRepository.create).mockReturnValue(
        errAsync({
          type: 'NOT_FOUND',
          organizationId,
        }),
      )

      const createSubscription = makeCreateSubscription({
        subscriptionRepository: mockSubscriptionRepository,
        planRepository: mockPlanRepository,
        generateId: mockGenerateId,
      })

      const result = await createSubscription({
        organizationId,
        planId,
      })

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        expect(result.error.type).toBe('repository_error')
        if (result.error.type === 'repository_error') {
          expect(result.error.message).toContain('not found')
        }
      }
    })
  })

  describe('Edge Cases', () => {
    it('should use generateId for subscription ID', async () => {
      const plan = createPlan({ id: planId, name: 'Pro Plan', athleteLimit: 50 })

      const generatedId = 'generated-subscription-uuid'
      vi.mocked(mockGenerateId).mockReturnValue(generatedId)

      vi.mocked(mockPlanRepository.findById).mockReturnValue(okAsync(plan))
      vi.mocked(mockSubscriptionRepository.create).mockImplementation((subscription) => okAsync(subscription))

      const createSubscription = makeCreateSubscription({
        subscriptionRepository: mockSubscriptionRepository,
        planRepository: mockPlanRepository,
        generateId: mockGenerateId,
      })

      const result = await createSubscription({
        organizationId,
        planId,
      })

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        expect(result.value.subscription.id).toBe(generatedId)
      }

      expect(mockGenerateId).toHaveBeenCalledTimes(1)
    })

    it('should create subscriptions for different organizations', async () => {
      const plan = createPlan({ id: planId, name: 'Pro Plan', athleteLimit: 50 })

      vi.mocked(mockPlanRepository.findById).mockReturnValue(okAsync(plan))
      vi.mocked(mockSubscriptionRepository.create).mockImplementation((subscription) => okAsync(subscription))

      const createSubscription = makeCreateSubscription({
        subscriptionRepository: mockSubscriptionRepository,
        planRepository: mockPlanRepository,
        generateId: mockGenerateId,
      })

      // Create for org 1
      const result1 = await createSubscription({
        organizationId: 'org-1',
        planId,
      })

      expect(result1.isOk()).toBe(true)
      if (result1.isOk()) {
        expect(result1.value.subscription.organizationId).toBe('org-1')
      }

      // Create for org 2
      const result2 = await createSubscription({
        organizationId: 'org-2',
        planId,
      })

      expect(result2.isOk()).toBe(true)
      if (result2.isOk()) {
        expect(result2.value.subscription.organizationId).toBe('org-2')
      }

      expect(mockSubscriptionRepository.create).toHaveBeenCalledTimes(2)
    })

    it('should set currentPeriodStart to current time', async () => {
      const plan = createPlan({ id: planId, name: 'Pro Plan', athleteLimit: 50 })

      const beforeCreation = new Date()

      vi.mocked(mockPlanRepository.findById).mockReturnValue(okAsync(plan))
      vi.mocked(mockSubscriptionRepository.create).mockImplementation((subscription) => okAsync(subscription))

      const createSubscription = makeCreateSubscription({
        subscriptionRepository: mockSubscriptionRepository,
        planRepository: mockPlanRepository,
        generateId: mockGenerateId,
      })

      const result = await createSubscription({
        organizationId,
        planId,
      })

      const afterCreation = new Date()

      expect(result.isOk()).toBe(true)

      if (result.isOk()) {
        const periodStart = result.value.subscription.currentPeriodStart
        expect(periodStart.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime())
        expect(periodStart.getTime()).toBeLessThanOrEqual(afterCreation.getTime())
      }
    })
  })

  describe('No Authorization', () => {
    it('should create subscription without authorization check (public use case)', async () => {
      // This use case is PUBLIC - used during onboarding
      // No authorization check is performed, so no role context is needed

      const plan = createPlan({ id: planId, name: 'Pro Plan', athleteLimit: 50 })

      vi.mocked(mockPlanRepository.findById).mockReturnValue(okAsync(plan))
      vi.mocked(mockSubscriptionRepository.create).mockImplementation((subscription) => okAsync(subscription))

      const createSubscription = makeCreateSubscription({
        subscriptionRepository: mockSubscriptionRepository,
        planRepository: mockPlanRepository,
        generateId: mockGenerateId,
      })

      const result = await createSubscription({
        organizationId,
        planId,
      })

      expect(result.isOk()).toBe(true)
    })
  })
})
