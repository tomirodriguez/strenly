import type { ListPlansOptions, PlanRepositoryError, PlanRepositoryPort } from '@strenly/core'
import { createPlan, type OrganizationType, type Plan, type PlanFeatures } from '@strenly/core'
import type { DbClient } from '@strenly/database'
import { plans } from '@strenly/database/schema'
import { and, count, eq } from 'drizzle-orm'
import { err, ok, ResultAsync } from 'neverthrow'

function wrapDbError(error: unknown): PlanRepositoryError {
  console.error('Plan repository error:', error)
  return { type: 'DATABASE_ERROR', message: 'Database operation failed' }
}

/**
 * Safely parse organization type from database
 * Returns a valid OrganizationType or defaults to 'coach_solo'
 */
function parseOrganizationType(value: string): OrganizationType {
  if (value === 'coach_solo' || value === 'gym') {
    return value
  }
  return 'coach_solo'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Safely parse features from database JSON
 * Maps database features to domain PlanFeatures type
 */
function parseFeatures(dbFeatures: unknown): PlanFeatures {
  // Default features
  const defaultFeatures: PlanFeatures = {
    templates: false,
    analytics: false,
    exportData: false,
    customExercises: false,
    multipleCoaches: false,
  }

  if (!isRecord(dbFeatures)) {
    return defaultFeatures
  }

  return {
    templates: typeof dbFeatures.templates === 'boolean' ? dbFeatures.templates : false,
    analytics: typeof dbFeatures.analytics === 'boolean' ? dbFeatures.analytics : false,
    exportData: typeof dbFeatures.exportData === 'boolean' ? dbFeatures.exportData : false,
    customExercises: typeof dbFeatures.customExercises === 'boolean' ? dbFeatures.customExercises : false,
    multipleCoaches: typeof dbFeatures.multipleCoaches === 'boolean' ? dbFeatures.multipleCoaches : false,
  }
}

function mapToDomain(row: typeof plans.$inferSelect): Plan | null {
  const result = createPlan({
    id: row.id,
    name: row.name,
    slug: row.slug,
    organizationType: parseOrganizationType(row.organizationType),
    athleteLimit: row.athleteLimit,
    coachLimit: row.coachLimit,
    features: parseFeatures(row.features),
    priceMonthly: row.priceMonthly,
    priceYearly: row.priceYearly,
    isActive: row.isActive,
  })

  return result.isOk() ? result.value : null
}

export function createPlanRepository(db: DbClient): PlanRepositoryPort {
  return {
    findById(id: string): ResultAsync<Plan | null, PlanRepositoryError> {
      return ResultAsync.fromPromise(
        db
          .select()
          .from(plans)
          .where(eq(plans.id, id))
          .then((rows) => rows[0]),
        wrapDbError,
      ).andThen((row) => {
        if (!row) {
          return ok(null)
        }
        const plan = mapToDomain(row)
        if (!plan) {
          return err({ type: 'DATABASE_ERROR', message: 'Invalid plan data' } as const)
        }
        return ok(plan)
      })
    },

    findBySlug(slug: string): ResultAsync<Plan | null, PlanRepositoryError> {
      return ResultAsync.fromPromise(
        db
          .select()
          .from(plans)
          .where(eq(plans.slug, slug))
          .then((rows) => rows[0]),
        wrapDbError,
      ).andThen((row) => {
        if (!row) {
          return ok(null)
        }
        const plan = mapToDomain(row)
        if (!plan) {
          return err({ type: 'DATABASE_ERROR', message: 'Invalid plan data' } as const)
        }
        return ok(plan)
      })
    },

    findAll(options: ListPlansOptions): ResultAsync<{ items: Plan[]; totalCount: number }, PlanRepositoryError> {
      return ResultAsync.fromPromise(
        (async () => {
          const conditions = []

          if (options.activeOnly !== false) {
            conditions.push(eq(plans.isActive, true))
          }

          if (options.organizationType) {
            conditions.push(eq(plans.organizationType, options.organizationType))
          }

          const whereClause = conditions.length > 0 ? and(...conditions) : undefined

          const [countResult, rows] = await Promise.all([
            db.select({ count: count() }).from(plans).where(whereClause),
            db
              .select()
              .from(plans)
              .where(whereClause)
              .orderBy(plans.priceMonthly)
              .limit(options.limit ?? 100)
              .offset(options.offset ?? 0),
          ])

          const items = rows.map(mapToDomain).filter((p): p is Plan => p !== null)

          return {
            items,
            totalCount: countResult[0]?.count ?? 0,
          }
        })(),
        wrapDbError,
      )
    },
  }
}
