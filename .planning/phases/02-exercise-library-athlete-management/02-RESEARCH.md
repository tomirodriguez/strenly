# Phase 2: Exercise Library & Athlete Management - Research

**Researched:** 2026-01-23
**Domain:** Athlete Profile Management, Exercise Library, Invitation Flows
**Confidence:** HIGH

## Summary

Phase 2 involves two core domains: **Athlete Management** (CRUD profiles, invitation/linking flow, coach-managed operations) and **Exercise Library** (curated database, custom exercises, muscle/pattern mappings). Both domains follow the established Clean Architecture patterns from Phase 1.

The research confirms that the existing codebase patterns (neverthrow ResultAsync, factory-based domain entities, repository ports, authorization-first use cases) apply directly. The main technical challenges are:
1. **Invitation token flow** - secure token generation, 7-day expiry, regeneration/revocation
2. **Self-referential relations** - exercise progressions linking exercises to easier/harder variants
3. **Dual data sources** - curated vs custom exercises with unified querying
4. **Multi-organization athletes** - users can link to profiles in multiple organizations

**Primary recommendation:** Follow existing Clean Architecture patterns exactly. Create domain entities for Athlete, AthleteInvitation, Exercise, and MuscleGroup with factory functions returning `Result<Entity, Error>`. Use `crypto.randomBytes()` for invitation tokens. Model progressions as a junction table with self-referential foreign keys.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| neverthrow | Latest | ResultAsync for use cases | Established in Phase 1 |
| drizzle-orm | Latest | Database schema and queries | Established in Phase 1 |
| zod | Latest | Contract validation | Established in Phase 1 |
| @paralleldrive/cuid2 | Latest | ID generation | Secure, collision-resistant |

### Supporting (To Add)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node.js `crypto` | Built-in | Invitation token generation | Secure token for invites |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| crypto.randomBytes | nanoid | nanoid is URL-friendly but crypto is built-in and standard |
| cuid2 | ulid | ULID is sortable but cuid2 matches existing UUID pattern |

**Installation:**
```bash
pnpm add @paralleldrive/cuid2
# crypto is built-in to Node.js
```

## Architecture Patterns

### Recommended Project Structure

Following established Clean Architecture from Phase 1:

```
packages/core/src/
├── domain/entities/
│   ├── athlete.ts              # Athlete domain entity
│   ├── athlete.test.ts         # 90%+ coverage
│   ├── athlete-invitation.ts   # Invitation domain entity
│   ├── athlete-invitation.test.ts
│   ├── exercise.ts             # Exercise domain entity
│   ├── exercise.test.ts
│   ├── muscle-group.ts         # MuscleGroup value object
│   └── movement-pattern.ts     # MovementPattern value object
├── ports/
│   ├── athlete-repository.port.ts
│   ├── athlete-invitation-repository.port.ts
│   └── exercise-repository.port.ts

packages/database/src/schema/
├── athletes.ts                 # Athletes table
├── athlete-invitations.ts      # Invitation tokens
├── exercises.ts                # Curated + custom exercises
├── muscle-groups.ts            # Lookup table
├── movement-patterns.ts        # Lookup table
├── exercise-muscles.ts         # Junction: exercise <-> muscle
└── exercise-progressions.ts    # Self-referential junction

packages/backend/src/
├── procedures/
│   ├── athletes/               # Athlete CRUD procedures
│   └── exercises/              # Exercise procedures
├── use-cases/
│   ├── athletes/               # Athlete use cases
│   └── exercises/              # Exercise use cases
└── infrastructure/repositories/
    ├── athlete.repository.ts
    ├── athlete-invitation.repository.ts
    └── exercise.repository.ts

packages/contracts/src/
├── athletes/                   # Athlete Zod schemas
└── exercises/                  # Exercise Zod schemas
```

### Pattern 1: Domain Entity with Factory Function

**What:** All domain entities use factory functions returning `Result<Entity, Error>`
**When to use:** Creating any domain entity (Athlete, Exercise, AthleteInvitation)
**Example:**
```typescript
// Source: Existing pattern from packages/core/src/domain/entities/plan.ts
import { type Result, err, ok } from "neverthrow";

export type AthleteStatus = "active" | "inactive";

export type Athlete = {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly birthdate: Date | null;
  readonly gender: "male" | "female" | "other" | null;
  readonly notes: string | null;
  readonly status: AthleteStatus;
  readonly linkedUserId: string | null; // null = not linked yet
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export type AthleteError =
  | { type: "INVALID_NAME"; message: string }
  | { type: "INVALID_EMAIL"; message: string };

type CreateAthleteInput = {
  id: string;
  organizationId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  birthdate?: Date | null;
  gender?: "male" | "female" | "other" | null;
  notes?: string | null;
  linkedUserId?: string | null;
  createdAt?: Date;
};

export function createAthlete(input: CreateAthleteInput): Result<Athlete, AthleteError> {
  // Validate name
  if (!input.name || input.name.trim().length < 1) {
    return err({ type: "INVALID_NAME", message: "Athlete name is required" });
  }
  if (input.name.length > 100) {
    return err({ type: "INVALID_NAME", message: "Athlete name must not exceed 100 characters" });
  }

  // Validate email format if provided
  if (input.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      return err({ type: "INVALID_EMAIL", message: "Invalid email format" });
    }
  }

  const now = new Date();
  return ok({
    id: input.id,
    organizationId: input.organizationId,
    name: input.name.trim(),
    email: input.email ?? null,
    phone: input.phone ?? null,
    birthdate: input.birthdate ?? null,
    gender: input.gender ?? null,
    notes: input.notes ?? null,
    status: "active",
    linkedUserId: input.linkedUserId ?? null,
    createdAt: input.createdAt ?? now,
    updatedAt: now,
  });
}
```

### Pattern 2: Secure Invitation Token Generation

**What:** Use Node.js crypto for secure, URL-safe invitation tokens
**When to use:** Generating athlete invitation links
**Example:**
```typescript
// Source: Node.js crypto documentation - https://nodejs.org/api/crypto.html
import crypto from "node:crypto";

export function generateInvitationToken(): string {
  // 32 bytes = 256 bits of entropy, base64url encoded
  return crypto.randomBytes(32).toString("base64url");
}

export type AthleteInvitation = {
  readonly id: string;
  readonly athleteId: string;
  readonly organizationId: string;
  readonly token: string; // Unique, secure token
  readonly createdByUserId: string;
  readonly expiresAt: Date; // 7 days from creation
  readonly revokedAt: Date | null;
  readonly acceptedAt: Date | null;
  readonly createdAt: Date;
};

export function createAthleteInvitation(input: {
  id: string;
  athleteId: string;
  organizationId: string;
  createdByUserId: string;
}): AthleteInvitation {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return {
    id: input.id,
    athleteId: input.athleteId,
    organizationId: input.organizationId,
    token: generateInvitationToken(),
    createdByUserId: input.createdByUserId,
    expiresAt,
    revokedAt: null,
    acceptedAt: null,
    createdAt: now,
  };
}
```

### Pattern 3: Self-Referential Exercise Progressions

**What:** Exercises can link to easier/harder variations via junction table
**When to use:** Modeling exercise progression chains
**Example:**
```typescript
// Source: Drizzle ORM docs - https://orm.drizzle.team/docs/relations
// Schema for exercise progressions (self-referential)
export const exerciseProgressions = pgTable(
  "exercise_progressions",
  {
    id: text("id").primaryKey(),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    progressionId: text("progression_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    direction: text("direction").$type<"easier" | "harder">().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("exercise_progressions_exercise_id_idx").on(table.exerciseId),
    index("exercise_progressions_progression_id_idx").on(table.progressionId),
  ]
);

// Relations definition
export const exerciseProgressionsRelations = relations(
  exerciseProgressions,
  ({ one }) => ({
    exercise: one(exercises, {
      fields: [exerciseProgressions.exerciseId],
      references: [exercises.id],
      relationName: "exerciseProgressions",
    }),
    progression: one(exercises, {
      fields: [exerciseProgressions.progressionId],
      references: [exercises.id],
      relationName: "progressionOf",
    }),
  })
);
```

### Pattern 4: Repository Port with OrganizationContext

**What:** All repository methods receive OrganizationContext for multi-tenancy
**When to use:** Every repository that accesses tenant data
**Example:**
```typescript
// Source: Existing pattern from packages/core/src/ports/subscription-repository.port.ts
import type { ResultAsync } from "neverthrow";
import type { OrganizationContext } from "../types/organization-context";
import type { Athlete } from "../domain/entities/athlete";

export type AthleteRepositoryError =
  | { type: "NOT_FOUND"; athleteId: string }
  | { type: "DATABASE_ERROR"; message: string };

export type ListAthletesOptions = {
  status?: "active" | "inactive";
  search?: string;
  limit?: number;
  offset?: number;
};

export type AthleteRepositoryPort = {
  findById(ctx: OrganizationContext, athleteId: string): ResultAsync<Athlete, AthleteRepositoryError>;
  findAll(ctx: OrganizationContext, options?: ListAthletesOptions): ResultAsync<{ items: Athlete[]; totalCount: number }, AthleteRepositoryError>;
  create(ctx: OrganizationContext, athlete: Athlete): ResultAsync<Athlete, AthleteRepositoryError>;
  update(ctx: OrganizationContext, athlete: Athlete): ResultAsync<Athlete, AthleteRepositoryError>;
  archive(ctx: OrganizationContext, athleteId: string): ResultAsync<void, AthleteRepositoryError>;
};
```

### Anti-Patterns to Avoid

- **No delete for athletes:** Use archive (status: inactive) instead. Preserves history and references.
- **No direct DB queries in use cases:** Always go through repository ports.
- **No Zod schemas in domain entities:** Domain uses pure TypeScript types; Zod is for contracts only.
- **No business logic in procedures:** Procedures orchestrate; use cases contain logic.
- **No 'as' casting:** Use Zod safeParse or type guards for conversions.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Secure token generation | Math.random or UUID | crypto.randomBytes | CSPRNG provides 256 bits of entropy |
| ID generation | Auto-increment or timestamp | cuid2 or crypto.randomUUID | Secure, collision-resistant, URL-safe |
| Email validation | Simple regex | Well-tested regex or library | Edge cases are tricky (internationalized emails) |
| Date expiry calculation | Manual arithmetic | Date math with explicit milliseconds | Avoid timezone bugs |

**Key insight:** Security-sensitive operations (tokens, IDs) must use cryptographically secure methods. Node.js `crypto` module is battle-tested and built-in.

## Common Pitfalls

### Pitfall 1: Invitation Token Leakage

**What goes wrong:** Token exposed in logs, URLs without HTTPS, or stored unhashed
**Why it happens:** Treating invitation tokens like regular IDs
**How to avoid:**
- Use HTTPS only (PWA requirement)
- Never log full tokens (log first 8 chars + `...` for debugging)
- Consider hashing tokens in DB (lookup by hash, not raw token)
**Warning signs:** Tokens visible in server logs, plain-text storage

### Pitfall 2: Multi-Org User Confusion

**What goes wrong:** User links to wrong organization or linking fails silently
**Why it happens:** Invitation validation doesn't check organization context
**How to avoid:**
- Invitation token is bound to specific athleteId AND organizationId
- Show org name + coach name on invite page BEFORE linking
- Require explicit confirmation before linking
**Warning signs:** Users reporting "wrong profile" after linking

### Pitfall 3: Exercise Progression Cycles

**What goes wrong:** Circular progressions (A -> B -> C -> A)
**Why it happens:** No cycle detection when adding progressions
**How to avoid:**
- Validate no cycles when adding progressions (DFS/BFS check)
- Consider limiting progression depth (e.g., max 5 levels)
- UI shows warning if adding creates potential cycle
**Warning signs:** Infinite loops in "show related exercises"

### Pitfall 4: Missing Organization Scope

**What goes wrong:** Athlete from Org A visible to Org B
**Why it happens:** Query missing `WHERE organization_id = ?`
**How to avoid:**
- Repository ports require OrganizationContext
- All queries include organization filter
- Database RLS as safety net
**Warning signs:** Athletes appearing in wrong organization

### Pitfall 5: Archive vs Delete Confusion

**What goes wrong:** Athletes "deleted" but references break
**Why it happens:** Hard delete instead of soft archive
**How to avoid:**
- No delete endpoint - only archive (status: inactive)
- Foreign keys use SET NULL or preserve references
- UI hides inactive by default but allows filtering
**Warning signs:** 404 errors for historical workout logs

## Code Examples

Verified patterns from official sources:

### Database Schema: Athletes Table

```typescript
// Source: Following existing patterns from packages/database/src/schema/auth.ts
import { boolean, index, pgTable, text, timestamp, date } from "drizzle-orm/pg-core";
import { organizations, users } from "./auth";

export const athletes = pgTable(
  "athletes",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    birthdate: date("birthdate"),
    gender: text("gender").$type<"male" | "female" | "other">(),
    notes: text("notes"),
    status: text("status").$type<"active" | "inactive">().default("active").notNull(),
    linkedUserId: text("linked_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("athletes_organization_id_idx").on(table.organizationId),
    index("athletes_linked_user_id_idx").on(table.linkedUserId),
    index("athletes_status_idx").on(table.status),
  ]
);
```

### Database Schema: Exercises Table

```typescript
// Source: Following existing patterns and domain research
import { boolean, index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./auth";

export const exercises = pgTable(
  "exercises",
  {
    id: text("id").primaryKey(),
    // null organizationId = curated (global), non-null = custom (org-specific)
    organizationId: text("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    instructions: text("instructions"),
    videoUrl: text("video_url"),
    // Movement pattern classification
    movementPattern: text("movement_pattern").$type<
      "push" | "pull" | "hinge" | "squat" | "carry" | "core"
    >(),
    // Laterality
    isUnilateral: boolean("is_unilateral").default(false).notNull(),
    // Custom exercise tracking
    isCurated: boolean("is_curated").default(false).notNull(),
    clonedFromId: text("cloned_from_id").references(() => exercises.id, { onDelete: "set null" }),
    // Soft delete
    archivedAt: timestamp("archived_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("exercises_organization_id_idx").on(table.organizationId),
    index("exercises_movement_pattern_idx").on(table.movementPattern),
    index("exercises_is_curated_idx").on(table.isCurated),
  ]
);
```

### Database Schema: Muscle Groups (Lookup)

```typescript
// Source: Domain research - packages/docs/domain-research-strength-training.md
export const muscleGroups = pgTable("muscle_groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(), // e.g., "chest", "back"
  displayName: text("display_name").notNull(), // e.g., "Chest", "Back"
  bodyRegion: text("body_region").$type<"upper" | "lower" | "core">().notNull(),
});

// Junction table: exercises <-> muscle groups
export const exerciseMuscles = pgTable(
  "exercise_muscles",
  {
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    muscleGroupId: text("muscle_group_id")
      .notNull()
      .references(() => muscleGroups.id, { onDelete: "cascade" }),
    isPrimary: boolean("is_primary").default(false).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.exerciseId, table.muscleGroupId] }),
    index("exercise_muscles_exercise_id_idx").on(table.exerciseId),
    index("exercise_muscles_muscle_group_id_idx").on(table.muscleGroupId),
  ]
);
```

### Use Case: Create Athlete

```typescript
// Source: Following existing pattern from packages/backend/src/use-cases/subscriptions/get-subscription.ts
import {
  hasPermission,
  type AthleteRepositoryPort,
  type OrganizationContext,
  type Role,
  createAthlete,
  type Athlete,
} from "@strenly/core";
import { errAsync, type ResultAsync, okAsync } from "neverthrow";

export type CreateAthleteInput = OrganizationContext & {
  memberRole: Role;
  name: string;
  email?: string;
  phone?: string;
  birthdate?: Date;
  gender?: "male" | "female" | "other";
  notes?: string;
};

export type CreateAthleteError =
  | { type: "forbidden"; message: string }
  | { type: "validation_error"; message: string }
  | { type: "repository_error"; message: string };

type Dependencies = {
  athleteRepository: AthleteRepositoryPort;
  generateId: () => string;
};

export const makeCreateAthlete =
  (deps: Dependencies) =>
  (input: CreateAthleteInput): ResultAsync<Athlete, CreateAthleteError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, "athletes:write")) {
      return errAsync({
        type: "forbidden",
        message: "No permission to create athletes",
      });
    }

    // 2. Domain validation via factory function
    const athleteResult = createAthlete({
      id: deps.generateId(),
      organizationId: input.organizationId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      birthdate: input.birthdate,
      gender: input.gender,
      notes: input.notes,
    });

    if (athleteResult.isErr()) {
      return errAsync({
        type: "validation_error",
        message: athleteResult.error.message,
      });
    }

    // 3. Persist via repository
    return deps.athleteRepository
      .create(input, athleteResult.value)
      .mapErr((e): CreateAthleteError => ({
        type: "repository_error",
        message: e.message,
      }));
  };
```

### Invitation Link Flow

```typescript
// Source: Best practices from Clerk, Stytch documentation
// Invitation URL structure: https://app.strenly.com/invite/{token}
// PWA route handles the flow

// 1. Generate invitation (coach web)
const invitation = createAthleteInvitation({
  id: generateId(),
  athleteId: athlete.id,
  organizationId: ctx.organizationId,
  createdByUserId: ctx.userId,
});
// Return URL for coach to copy: `${PWA_URL}/invite/${invitation.token}`

// 2. Accept invitation (athlete PWA)
// POST /api/invitations/accept
// - Validate token exists and not expired/revoked
// - If logged in: link user to athlete, mark accepted
// - If not logged in: redirect to sign-up with token in state, then link
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| UUID v4 for IDs | CUID2 or UUID v7 | 2024+ | Better security, no info leakage |
| Simple random tokens | crypto.randomBytes | Always | CSPRNG required for security |
| Hard delete | Soft delete / archive | Best practice | Preserves data integrity |
| Cascade delete | SET NULL for references | Depends | Better for audit trails |

**Deprecated/outdated:**
- `nanoid` < v5: Use v5+ or cuid2 for latest security improvements
- `shortid`: Deprecated, use nanoid or cuid2

## Open Questions

Things that couldn't be fully resolved:

1. **Clone provenance tracking (Claude's Discretion)**
   - What we know: Cloned exercises have `clonedFromId` field
   - What's unclear: Should UI show "cloned from X" prominently?
   - Recommendation: Store relationship, UI decision deferred to implementation

2. **Muscle group icon/color system (Claude's Discretion)**
   - What we know: 8-10 major muscle groups
   - What's unclear: Which icon library? Color scheme?
   - Recommendation: Use existing design system, defer visual details to frontend phase

3. **Exercise seed data source**
   - What we know: Need 50-100 common exercises
   - What's unclear: Where to source accurate data (API vs manual curation)?
   - Recommendation: Manual curation from ExRx.net (licensing allows) for MVP accuracy

## Sources

### Primary (HIGH confidence)
- Phase 1 codebase: `packages/core/`, `packages/backend/`, `packages/database/` - established patterns
- Drizzle ORM docs: https://orm.drizzle.team/docs/relations - self-referential relations
- Node.js crypto docs: https://nodejs.org/api/crypto.html - randomBytes for tokens
- Domain research: `/docs/domain-research-strength-training.md` - muscle groups, movement patterns

### Secondary (MEDIUM confidence)
- [Clerk invitation flow docs](https://clerk.com/docs/custom-flows/application-invitations) - token-in-URL pattern
- [Stytch magic link guide](https://stytch.com/docs/guides/magic-links/email-magic-links/invite-user) - invitation flow patterns
- [CUID2 GitHub](https://github.com/paralleldrive/cuid2) - ID generation best practices
- [ExerciseDB API](https://github.com/ExerciseDB/exercisedb-api) - exercise data structure reference

### Tertiary (LOW confidence)
- [ExRx.net](https://exrx.net/) - exercise database reference (licensing check needed)
- [Wisp CMS ID comparison](https://www.wisp.blog/blog/uuid-vs-cuid-vs-nanoid-choosing-the-right-id-generator-for-your-application) - ID generator comparison

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using established Phase 1 patterns
- Architecture: HIGH - Clean Architecture already implemented
- Pitfalls: HIGH - Common patterns verified with multiple sources
- Exercise data model: MEDIUM - Based on domain research, may need iteration

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (30 days - stable patterns)
