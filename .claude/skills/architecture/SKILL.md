---
name: architecture
description: |
  This skill defines the mandatory Clean Architecture development flow for the project.
  Use this skill BEFORE implementing any backend feature to understand the correct order
  of layers and which skills to invoke for each layer.
  This skill should be loaded automatically when creating new entities, use cases, or procedures.
version: 1.0.0
---

# Architecture - Clean Architecture Development Flow

This skill defines the **mandatory** development flow for any backend feature. The architecture follows **Inside-Out** development: start from the core (domain) and work outward to the API layer.

## CRITICAL: Why This Matters

Without following this flow:
- Authorization gets skipped (security vulnerability)
- Data gets persisted without domain validation (data integrity issues)
- Business logic ends up in procedures (unmaintainable code)
- Pagination breaks (missing totalCount for DataTable)

## Mandatory Development Flow

For ANY backend feature, follow this order. **Invoke the corresponding skill BEFORE writing each layer.**

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. DOMAIN ENTITY (/domain-entity)                                   │
│    Location: packages/core/src/domain/entities/{entity}.ts          │
│    - Factory function returns Result<Entity, DomainError>           │
│    - All business validation rules live here                        │
│    - ID is received as input (not generated here)                   │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 2. PORT (/port)                                                     │
│    Location: packages/core/src/ports/{entity}-repository.port.ts    │
│    - Define repository interface                                    │
│    - All methods receive OrganizationContext                        │
│    - findAll returns { items, totalCount } (REQUIRED for pagination)│
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 3. REPOSITORY (/repository)                                         │
│    Location: packages/backend/src/infrastructure/repositories/      │
│    - Implement port with Drizzle ORM                                │
│    - ALWAYS filter by ctx.organizationId (multi-tenancy)            │
│    - Use ResultAsync.fromPromise with wrapError                     │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 4. USE CASE (/use-case + /authorization)                            │
│    Location: packages/backend/src/use-cases/{domain}/               │
│    - Authorization check FIRST (hasPermission)                      │
│    - Validate via domain entity BEFORE persisting                   │
│    - generateId as injected dependency                              │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 5. CONTRACTS (/contracts)                                           │
│    Location: packages/contracts/src/{domain}/                       │
│    - Zod schemas for API input/output                               │
│    - Validation messages in Spanish                                 │
│    - List endpoints: limit, offset input + totalCount output        │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 6. PROCEDURE (/procedure)                                           │
│    Location: packages/backend/src/procedures/{domain}/              │
│    - ONLY orchestration (create repos, use case, map errors)        │
│    - NO business logic here                                         │
│    - Map ALL error types with exhaustive switch                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Rules That Are Most Often Violated

### 1. Authorization Must Be FIRST in Use Cases

```typescript
// WRONG - No authorization
export const makeCreateAthlete = (deps) => (input) => {
  return deps.repository.create(ctx, input)
}

// CORRECT - Authorization FIRST
export const makeCreateAthlete = (deps) => (input) => {
  if (!hasPermission(input.memberRole, 'athletes:write')) {
    return errAsync({ type: 'forbidden', message: '...' })
  }
  // ... rest of logic
}
```

### 2. Domain Entity Validation Before Persisting

```typescript
// WRONG - Persist without domain validation
const id = crypto.randomUUID()
return deps.repository.create(ctx, { id, ...input })

// CORRECT - Validate via domain first
const entityResult = createAthlete({ id: deps.generateId(), ...input })
if (entityResult.isErr()) {
  return errAsync({ type: 'validation_error', message: entityResult.error.message })
}
return deps.repository.create(ctx, entityResult.value)
```

### 3. No Business Logic in Procedures

```typescript
// WRONG - Logic in procedure
.handler(async ({ input }) => {
  if (input.amount > 1000) {  // Business rule in procedure!
    throw errors.LIMIT_EXCEEDED()
  }
})

// CORRECT - Procedure only orchestrates
.handler(async ({ input, context }) => {
  const result = await useCase(input)
  if (result.isErr()) {
    switch (result.error.type) { /* map errors */ }
  }
  return result.value
})
```

### 4. Always Return totalCount in Lists

```typescript
// WRONG - Only return items
findAll: (ctx, options) => {
  return db.select().from(table).limit(options.limit)
}

// CORRECT - Return items + totalCount
findAll: (ctx, options) => {
  const [{ count }] = await db.select({ count: count() }).from(table)
  const items = await db.select().from(table).limit(options.limit)
  return { items, totalCount: count }
}
```

### 5. Always Filter by OrganizationContext

```typescript
// WRONG - No organization filter
findById: (id) => {
  return db.select().from(table).where(eq(table.id, id))
}

// CORRECT - Always filter by organizationId
findById: (ctx, id) => {
  return db.select().from(table).where(
    and(
      eq(table.id, id),
      eq(table.organizationId, ctx.organizationId)
    )
  )
}
```

## Quick Reference: What Goes Where

| What | Layer | Skill |
|------|-------|-------|
| Business validation rules | Domain Entity | `/domain-entity` |
| Repository interfaces | Port | `/port` |
| Database queries (Drizzle) | Repository | `/repository` |
| Business logic orchestration | Use Case | `/use-case` |
| Permission checks (RBAC) | Use Case | `/authorization` |
| API input/output schemas | Contracts | `/contracts` |
| API endpoints | Procedure | `/procedure` |

## Checklist Before Declaring Feature Complete

- [ ] Domain entity created with factory function returning Result
- [ ] Port defined with OrganizationContext and pagination types
- [ ] Repository filters by organizationId, returns totalCount for lists
- [ ] Use case checks authorization FIRST, validates via domain entity
- [ ] Contracts have validation messages in Spanish
- [ ] Procedure only orchestrates, maps ALL error types

## Detailed Examples

For complete code examples of each layer, see `references/layer-examples.md`.
