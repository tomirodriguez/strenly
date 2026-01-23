# Phase 1: Foundation & Multi-Tenancy - Research

**Researched:** 2026-01-23
**Domain:** Authentication, Authorization, Multi-Tenancy, Subscription Management
**Confidence:** HIGH

## Summary

This phase establishes the core authentication and multi-tenancy infrastructure for Strenly. The research focused on implementing user authentication (email/password + Google OAuth), organization management with role-based access, multi-tenant data isolation, and subscription plan enforcement.

The standard approach uses **Better-Auth** as the authentication framework with its built-in **organization plugin** for multi-tenancy. Data isolation is achieved through a hybrid approach: application-level filtering with **RLS (Row-Level Security)** as a safety net. Subscription management ties organizations to plans, with limits enforced at the application layer.

**Critical finding:** Email/password authentication using Better-Auth's default scrypt hashing exceeds Cloudflare Workers free-tier CPU limits (~80ms hash time vs 10ms limit). The reference implementation disabled email/password due to this. For paid Workers tier (30s CPU limit) or using a custom lightweight hash function, email/password works. Alternative: use Email OTP plugin which avoids password verification overhead entirely.

**Primary recommendation:** Use Better-Auth with organization plugin, implement hybrid multi-tenancy (app-level + RLS), and either use paid Cloudflare Workers tier for email/password or use Email OTP as the email-based auth method.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| better-auth | ^1.4.x | Authentication framework | TypeScript-first, built-in organization plugin, Hono integration, active development (YC backed) |
| better-auth/plugins/organization | (bundled) | Multi-tenant organizations | Built-in roles (owner/admin/member), invitations, access control |
| drizzle-orm | ^0.38.x | Database ORM + RLS | Type-safe, RLS support via `pgPolicy`, Neon integration |
| @neondatabase/serverless | ^0.10.x | PostgreSQL driver | Edge-compatible, serverless, works with Cloudflare Workers |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| neverthrow | ^8.x | Error handling | All async operations in use cases |
| zod | ^3.24.x | Schema validation | All API contracts and form validation |
| hono | ^4.x | Web framework | API routing, middleware |
| @orpc/server | ^0.x | Type-safe RPC | Procedure definitions with auth hierarchy |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Better-Auth | Lucia Auth | Lucia is lower-level, requires more manual work for organizations |
| Better-Auth | NextAuth/Auth.js | Less TypeScript-native, complex for non-Next.js setups |
| RLS + App filtering | Pure RLS | Pure RLS harder to debug, app-level gives explicit control |
| Pure app filtering | RLS only | No database-level safety net, relies on code correctness |

**Installation:**
```bash
pnpm add better-auth drizzle-orm @neondatabase/serverless neverthrow zod
pnpm add -D @better-auth/cli drizzle-kit
```

## Architecture Patterns

### Recommended Project Structure
```
packages/
├── auth/                    # Better-Auth configuration
│   └── src/
│       └── auth.ts          # createAuth factory function
├── database/
│   └── src/
│       └── schema/
│           ├── auth.ts      # users, sessions, accounts, organizations, members, invitations
│           ├── plans.ts     # subscription plans
│           └── subscriptions.ts  # organization subscriptions
├── backend/
│   └── src/
│       ├── lib/
│       │   └── orpc.ts      # publicProcedure, sessionProcedure, authProcedure
│       └── procedures/
│           ├── auth/        # session-level auth operations
│           └── organizations/  # org management procedures
└── contracts/
    └── src/
        ├── auth/            # auth schemas
        └── organizations/   # org schemas
```

### Pattern 1: Cloudflare Workers Auth Factory
**What:** Create Better-Auth instance per-request with environment bindings
**When to use:** Always in Cloudflare Workers (env vars not available at module scope)
**Example:**
```typescript
// Source: Reference implementation /Users/tomiardz/Projects/strenly/packages/auth/src/auth.ts
export const createAuth = (env: AuthEnv, db: DB) => {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema,
      usePlural: true,
    }),
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true, // Requires paid Workers tier for scrypt
      // OR use custom lighter hash function
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        prompt: 'select_account',
      },
    },
    plugins: [
      organization({
        // Hook to create subscription on org creation
        organizationHooks: {
          afterCreateOrganization: async ({ organization }) => {
            // Create subscription linked to organization
          },
        },
      }),
    ],
  })
}
```

### Pattern 2: Three-Tier Procedure Hierarchy
**What:** Public, session, and auth procedures with progressive authentication
**When to use:** All API endpoints
**Example:**
```typescript
// Source: Reference implementation /Users/tomiardz/Projects/strenly/packages/backend/src/lib/orpc.ts
// publicProcedure - No auth (health checks, plan listing)
export const publicProcedure = os.$context<BaseContext>().errors(commonErrors)

// sessionProcedure - User authenticated, no org context (onboarding, accept invitation)
export const sessionProcedure = os
  .$context<BaseContext>()
  .errors({ ...commonErrors, ...authErrors })
  .use(async ({ context, next, errors }) => {
    const session = await context.auth.api.getSession({ headers: context.headers })
    if (!session?.user) throw errors.UNAUTHORIZED()
    return next({ context: { user: session.user, session: session.session } })
  })

// authProcedure - User + organization context (most endpoints)
export const authProcedure = os
  .$context<BaseContext>()
  .errors({ ...commonErrors, ...authErrors, ORG_NOT_FOUND: {} })
  .use(async ({ context, next, errors }) => {
    // 1. Validate session
    // 2. Get org slug from X-Organization-Slug header
    // 3. Validate membership
    // 4. Return context with user + org + role
  })
```

### Pattern 3: Hybrid Multi-Tenancy
**What:** Application-level filtering + RLS safety net
**When to use:** All multi-tenant data access
**Example:**
```typescript
// Source: Drizzle ORM RLS docs https://orm.drizzle.team/docs/rls
// Schema with RLS policy
export const athletes = pgTable('athletes', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
}, (table) => [
  pgPolicy('athletes_org_isolation', {
    for: 'all',
    using: sql`organization_id = current_setting('app.organization_id')::text`,
  }),
])

// Repository always filters by org
export async function listAthletes(db: DbClient, orgId: string) {
  return db.select().from(athletes).where(eq(athletes.organizationId, orgId))
}
```

### Pattern 4: Organization-Scoped Request Context
**What:** Pass organization ID via header, validate membership in middleware
**When to use:** All authenticated requests that need org context
**Example:**
```typescript
// Client sends header
const client = createClient({
  headers: () => ({
    'X-Organization-Slug': currentOrg.slug,
  }),
})

// Middleware validates and injects context
const orgSlug = context.headers.get('X-Organization-Slug')
const [org] = await db.select().from(organizations).where(eq(organizations.slug, orgSlug))
const [membership] = await db.select().from(members)
  .where(and(eq(members.organizationId, org.id), eq(members.userId, session.user.id)))
if (!membership) throw errors.FORBIDDEN()
```

### Anti-Patterns to Avoid
- **Direct RLS-only approach:** Hard to debug, test, and understand query behavior
- **No RLS backup:** Relies entirely on code correctness for data isolation
- **Global email uniqueness workarounds:** Better-Auth enforces unique emails globally; design around this
- **Testing with superuser:** Superusers bypass RLS, giving false confidence
- **Views without security_invoker:** Views bypass RLS by default

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session management | Custom JWT + refresh tokens | Better-Auth sessions | Handles refresh, multi-device, cookie security |
| Password hashing | Manual bcrypt/argon2 | Better-Auth built-in | scrypt by default, configurable, timing-attack safe |
| OAuth flows | Manual token exchange | Better-Auth social providers | Handles state, PKCE, token refresh |
| Org invitations | Custom invite tokens | Better-Auth organization plugin | Built-in invite/accept/reject flow |
| Role-based access | Manual permission checks | Better-Auth access control | Type-safe permission definitions |
| Email verification | Custom tokens + emails | Better-Auth email verification | Configurable expiry, secure tokens |
| Password reset | Custom reset flow | Better-Auth password reset | Token expiry, callback handling |

**Key insight:** Authentication is security-critical and full of edge cases (timing attacks, token rotation, session fixation). Better-Auth handles these correctly; hand-rolling invites vulnerabilities.

## Common Pitfalls

### Pitfall 1: Scrypt CPU Limits on Cloudflare Workers Free Tier
**What goes wrong:** Email/password sign-in fails with "exceeded CPU time limit"
**Why it happens:** Better-Auth uses scrypt (80ms), free tier allows 10ms
**How to avoid:**
- Use paid Workers tier (30s limit)
- Use Email OTP plugin instead of password
- Implement custom lighter hash (reduces security)
**Warning signs:** Random auth failures, ~50% success rate

### Pitfall 2: Missing baseURL in Better-Auth Config
**What goes wrong:** OAuth redirects fail with `redirect_uri_mismatch`
**Why it happens:** Better-Auth defaults to localhost for callback URLs
**How to avoid:** Always set `baseURL` in auth config from environment variable
**Warning signs:** Google OAuth works locally, fails in production

### Pitfall 3: RLS Bypassed by Views and Functions
**What goes wrong:** Data leaks through views or security definer functions
**Why it happens:** Views run as creator (often superuser), bypass RLS
**How to avoid:** Use `security_invoker = true` for views (Postgres 15+)
**Warning signs:** Queries through views return all tenants' data

### Pitfall 4: activeOrganizationId Lost with customSession
**What goes wrong:** Organization context unavailable after adding custom session data
**Why it happens:** Known Better-Auth issue when combining customSession + organization plugins
**How to avoid:** Don't use customSession plugin; use procedure middleware for custom context
**Warning signs:** `activeOrganizationId` undefined despite being set

### Pitfall 5: Testing RLS with Superuser
**What goes wrong:** RLS appears to work but doesn't in production
**Why it happens:** Superusers and table owners bypass RLS by default
**How to avoid:**
- Test with dedicated non-superuser role
- Use `FORCE ROW LEVEL SECURITY` on tables
- Never grant BYPASSRLS to app roles
**Warning signs:** Policies work in tests, data leaks in production

### Pitfall 6: Missing Indexes on RLS Policy Columns
**What goes wrong:** Queries become extremely slow with RLS enabled
**Why it happens:** RLS filtering without index causes sequential scans
**How to avoid:** Always index columns used in RLS policies (e.g., `organization_id`)
**Warning signs:** Query times increase dramatically after enabling RLS

## Code Examples

Verified patterns from official sources:

### Better-Auth Email/Password Setup
```typescript
// Source: https://www.better-auth.com/docs/authentication/email-password
import { betterAuth } from "better-auth"

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url, token }) => {
      // Don't await - prevents timing attacks
      sendEmail({ to: user.email, subject: "Reset password", url })
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour
  },
})

// Client sign up
await authClient.signUp.email({
  name: "John Doe",
  email: "john@example.com",
  password: "password1234",
})

// Client sign in
await authClient.signIn.email({
  email: "john@example.com",
  password: "password1234",
  rememberMe: true,
})

// Password reset flow
await authClient.requestPasswordReset({
  email: "john@example.com",
  redirectTo: "https://example.com/reset-password",
})

await authClient.resetPassword({
  newPassword: "newpassword1234",
  token: tokenFromEmail,
})
```

### Better-Auth Google OAuth Setup
```typescript
// Source: https://www.better-auth.com/docs/authentication/google
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL, // CRITICAL: prevents redirect_uri_mismatch
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      prompt: "select_account", // Always show account picker
      // For refresh tokens:
      // accessType: "offline",
      // prompt: "select_account consent",
    },
  },
})

// Client sign in with Google
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard",
})
```

### Better-Auth Organization Plugin Setup
```typescript
// Source: https://www.better-auth.com/docs/plugins/organization
import { organization } from "better-auth/plugins"

export const auth = betterAuth({
  plugins: [
    organization({
      allowUserToCreateOrganization: async (user) => {
        // Optional: restrict org creation
        return true
      },
      sendInvitationEmail: async (data) => {
        const inviteLink = `https://app.example.com/accept-invite/${data.id}`
        sendEmail({
          email: data.email,
          subject: `Join ${data.organization.name}`,
          inviteLink,
        })
      },
      creatorRole: "owner", // Default role for creator
      membershipLimit: 100, // Max members per org
    }),
  ],
})

// Client: Create organization
await authClient.organization.create({
  name: "My Gym",
  slug: "my-gym",
})

// Client: Invite member
await authClient.organization.inviteMember({
  email: "coach@example.com",
  role: "admin",
  organizationId: "org-id",
})

// Client: Accept invitation
await authClient.organization.acceptInvitation({
  invitationId: "invitation-id",
})

// Client: Update member role
await authClient.organization.updateMemberRole({
  memberId: "member-id",
  role: "coach",
})

// Client: Remove member
await authClient.organization.removeMember({
  memberIdOrEmail: "coach@example.com",
  organizationId: "org-id",
})
```

### Drizzle RLS Policy Definition
```typescript
// Source: https://orm.drizzle.team/docs/rls
import { sql } from 'drizzle-orm'
import { pgPolicy, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

// Define role for application
export const appRole = pgRole('app_user').existing()

// Table with RLS policy
export const athletes = pgTable('athletes', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  pgPolicy('athletes_isolation_policy', {
    for: 'all',
    to: appRole,
    using: sql`organization_id = current_setting('app.organization_id', true)::text`,
    withCheck: sql`organization_id = current_setting('app.organization_id', true)::text`,
  }),
])

// Setting context before queries (in transaction)
await db.execute(sql`SET LOCAL app.organization_id = ${orgId}`)
```

### Hono + Better-Auth Integration
```typescript
// Source: https://www.better-auth.com/docs/integrations/hono
import { Hono } from "hono"
import { cors } from "hono/cors"

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// CORS must be first
app.use("/api/auth/*", cors({
  origin: (origin) => {
    if (origin.includes("localhost")) return origin
    if (origin.endsWith(".example.com")) return origin
    return null
  },
  credentials: true,
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["POST", "GET", "OPTIONS"],
}))

// Infrastructure middleware
app.use("/api/*", async (c, next) => {
  const db = createDb(c.env.DATABASE_URL)
  c.set("db", db)
  const auth = createAuth(c.env, db)
  c.set("auth", auth)
  await next()
})

// Mount Better-Auth handler
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  const auth = c.get("auth")
  return auth.handler(c.req.raw)
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| NextAuth/Auth.js | Better-Auth | 2024 | TypeScript-first, better multi-tenant support |
| Manual org management | Better-Auth organization plugin | 2024 | Built-in invites, roles, access control |
| Pure RLS multi-tenancy | Hybrid (app + RLS) | Best practice | Easier debugging + database safety net |
| `enableRLS()` in Drizzle | `pgTable.withRLS()` or policy auto-enable | Drizzle v1.0-beta | Cleaner API, deprecated old method |

**Deprecated/outdated:**
- `enableRLS()` method: Deprecated in Drizzle v1.0.0-beta.1, use `pgTable.withRLS()` instead
- Manual invitation systems: Better-Auth organization plugin handles this natively
- JWT-only sessions: Cookie-based sessions with server validation preferred for security

## Open Questions

Things that couldn't be fully resolved:

1. **Email/Password on Free Cloudflare Workers Tier**
   - What we know: scrypt takes ~80ms, free tier allows 10ms
   - What's unclear: Whether Email OTP is acceptable UX for coach app
   - Recommendation: Use paid tier ($5/mo) OR implement Email OTP for email-based auth

2. **Subscription Enforcement Timing**
   - What we know: Plan limits should be enforced, ref implementation creates subscription on org creation
   - What's unclear: Whether to check limits on every request vs periodic
   - Recommendation: Check limits in use cases when relevant (adding athletes, inviting coaches)

3. **Coach vs Gym Organization Types**
   - What we know: SUB-05 requires different plan configurations
   - What's unclear: Whether this is a plan attribute or organization attribute
   - Recommendation: Add `organizationType` to plans table (coach_solo, gym)

## Sources

### Primary (HIGH confidence)
- Better-Auth official docs - email/password, OAuth, organization plugin, session management
- Drizzle ORM official docs - RLS implementation, policy definition
- Reference implementation `/Users/tomiardz/Projects/strenly/packages/auth/`

### Secondary (MEDIUM confidence)
- [Hono Better-Auth integration](https://www.better-auth.com/docs/integrations/hono)
- [Hono Better-Auth on Cloudflare example](https://hono.dev/examples/better-auth-on-cloudflare)
- [Neon RLS + Drizzle guide](https://neon.com/docs/guides/rls-drizzle)

### Tertiary (LOW confidence)
- [Better-Auth GitHub issues](https://github.com/better-auth/better-auth/issues/969) - scrypt CPU limits
- [Bytebase PostgreSQL RLS footguns](https://www.bytebase.com/blog/postgres-row-level-security-footguns/)
- Community discussions on multi-tenant patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Better-Auth is the established solution, well-documented
- Architecture: HIGH - Reference implementation validates patterns
- Pitfalls: HIGH - Multiple authoritative sources + reference implementation experience

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (30 days - Better-Auth is stable, patterns are established)
