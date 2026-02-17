---
project_name: 'strenly'
user_name: 'Tomi'
date: '2026-02-17'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'contracts_rules', 'testing_rules', 'quality_rules', 'critical_rules']
status: 'complete'
rule_count: 42
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

| Layer | Technology | Version |
|-------|------------|---------|
| Monorepo | pnpm workspaces + Turbo | pnpm 9.15.4, Turbo 2.5.4 |
| Language | TypeScript | 5.7–5.8 |
| Linting | Biome | 2.3.12 |
| Frontend (coach-web) | React + Vite + TanStack Router + TanStack Query | React 19, Vite 7 |
| UI Components | shadcn/ui + Tailwind CSS | Tailwind v4 |
| API | Hono + oRPC | Hono 4.11+, oRPC 1.13+ |
| Database | Neon PostgreSQL + Drizzle ORM | drizzle-orm 0.44+ |
| Auth | Better-Auth | 1.4+ |
| Validation | Zod | 4.1.12 |
| Error Handling | neverthrow | 8.1+ |
| Testing (unit) | Vitest | 3.x |
| Testing (e2e) | Playwright | 1.52+ |
| Hosting (frontend) | Vercel | — |
| Hosting (backend) | Railway | — |

## Critical Implementation Rules

### TypeScript & Language Rules

- **No `as` type casting** — fix the actual type issue. Exceptions: `as const`, `as T` in `Array<T>.includes(value as T)`, and `*.test.ts` / `*.spec.ts` files
- **No `!` non-null assertions** — use `?.` or `??` instead
- **No `any`** — use `unknown` and narrow with type guards
- **Package imports use explicit paths** — packages expose named exports, never wildcard. E.g., `@strenly/contracts/athletes/athlete`, `@strenly/core/domain/entities/athlete`, `@strenly/database/schema`
- **No barrel files** — except the explicitly allowed ones: `procedures/router.ts`, `procedures/{domain}/index.ts`, `infrastructure/repositories/index.ts`, `database/src/schema/index.ts`, and package-level `index.ts` entry points
- **neverthrow pattern** — all async operations in use cases and repositories return `ResultAsync<T, E>`. Use `.andThen()`, `.map()`, `.mapErr()` for chaining — never `await` and unwrap manually
- **Zod 4 syntax** — use `z.object`, `z.string`, etc. from `zod` (not `zod/v4`). Zod 4 is the default import
- **Error types** — use tagged union objects: `{ type: 'ERROR_TYPE'; message: string }`, never `throw` inside use cases or repositories
- **ID generation** — use `crypto.randomUUID()` (native, no `uuid` package needed)
- **Dates in contracts/API** — dates are `z.string()` (ISO strings) in contracts, converted to `Date` objects only at the repository boundary

### Clean Architecture Rules

- **Layer order is mandatory** — always implement in this sequence: Domain Entity → Port → Repository → Use Case → Contracts → Procedure → Frontend hooks → Page/Component
- **Use case pattern** — factory function: `export const makeXUseCase = (deps: Dependencies) => (input: Input): ResultAsync<Output, Error> => { ... }`. Authorization FIRST before any other logic
- **Repository pattern** — factory function: `export function createXRepository(db: DbClient): XRepositoryPort { return { ... } }`. Always use `ResultAsync.fromPromise()` to wrap Drizzle queries. Always filter by `organizationId`
- **Port pattern** — interface type: `export type XRepositoryPort = { method(ctx: OrganizationContext, ...): ResultAsync<...> }`. All methods receive `OrganizationContext` as first argument
- **Procedure pattern** — thin handlers only: `authProcedure.input(schema).output(schema).errors({}).handler(...)`. Call use case, map errors with exhaustive switch, return mapped output. No business logic
- **Procedure error mapping** — exhaustive `switch(result.error.type)` — if TypeScript doesn't error on a missing case, you missed one
- **Authorization** — check `hasPermission(input.memberRole, 'resource:action')` as the very first line in use cases. Format: `resource:action` (e.g., `athletes:write`, `programs:read`)
- **Domain entities** — two factory functions per entity: `createX(input)` for new entities (validates, returns `Result<Entity, Error>`), `reconstituteX(props)` for rehydrating from DB (no validation, trusted data). Entities are plain objects (no classes), all fields `readonly`
- **`@strenly/core` has zero external dependencies** — never import from other `@strenly/*` packages inside `core`

### oRPC & API Rules

- **oRPC wire format** — URLs use slashes: `POST /rpc/athletes/create`, `POST /rpc/programs/get`. Body: `{ json: { ...input } }`. Response: `{ json: { ...output } }`
- **Organization context** — sent via `X-Organization-Slug` header on every authenticated request. Set automatically by `RPCLink` in `api-client.ts`
- **Procedure types** — `publicProcedure` (no auth), `sessionProcedure` (user auth, no org), `authProcedure` (user + org membership required)
- **`reconstitute` in repositories** — never call `createX()` when loading from DB; always use `reconstituteX()` to skip validation on already-persisted data

### React Frontend Rules

- **No `useEffect`** — prefer event handlers, callbacks, or derived state
- **Query hooks** — `useQuery(orpc.{domain}.{action}.queryOptions({ input }))` — one hook per query, placed in `features/{domain}/hooks/queries/`
- **Mutation hooks** — `useMutation({ ...orpc.{domain}.{action}.mutationOptions(), onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.{domain}.key() }), onError: handleMutationError })` — placed in `features/{domain}/hooks/mutations/`
- **Cache invalidation** — always use `orpc.{domain}.key()` (invalidates the whole domain), not hand-crafted query keys
- **Route files are thin** — `createFileRoute()` + component assignment + `pendingComponent` + `errorComponent` only. No data fetching logic in route files
- **Feature structure** — `src/features/{domain}/{views,components,hooks/{queries,mutations}}/`. Views handle data fetching and layout; components are reusable within a feature
- **UI primitives** — always use `@/components/ui/*` (shadcn). Never install raw Radix UI primitives directly — add them via `shadcn` CLI
- **`cn()` utility** — always use `cn()` from `@/lib/utils` for conditional classNames, never string concatenation
- **Mutation error handling** — use `handleMutationError(error, { fallbackMessage: '...' })` from `@/lib/api-errors`. For UX-specific behavior (UNAUTHORIZED redirects, typed error messages), load the `/mutation-errors` skill

### Contracts & Validation Rules

- **All schemas live in `@strenly/contracts`** — never define Zod schemas inline in procedures, use cases, or components
- **Schema naming convention** — `createXInputSchema`, `updateXInputSchema`, `listXQuerySchema`, `xOutputSchema`, `xListOutputSchema`. Inferred types: `type CreateXInput = z.infer<typeof createXInputSchema>`
- **Schema composition** — base entity schema first, then derive input schemas via `.pick()`, `.extend()`, `.partial()`. Never duplicate field definitions
- **List responses always return `{ items, totalCount }`** — `z.object({ items: z.array(xOutputSchema), totalCount: z.number() })`
- **Input schemas handle form empty strings** — extend nullable fields with `.or(z.literal(''))` to handle form submissions that send `""` instead of `null`
- **Output schemas include server-generated fields** — `id`, `createdAt`, `updatedAt` added via `.extend()` on top of input shape
- **Zod 4 changes** — `z.string().min(1)` still works. Use `z.enum([...])` not `z.union([z.literal(...)])` for enums. `.nullable()` and `.optional()` work the same
- **Better-Auth client URLs** — session: `GET /api/auth/get-session`, org list: `GET /api/auth/organization/list`. Response is raw JSON (client wraps as `{ data, error }`)

### Testing Rules

- **Unit test location** — `__tests__/` subdirectory next to the source file. E.g., `domain/entities/__tests__/athlete.test.ts`
- **Coverage requirements** — `packages/core`: 90%+ (all domain entities must be fully tested). `packages/backend` use cases: 80%+, repositories: 75%+
- **Use case test pattern** — inject mock repositories via the `deps` parameter. Never mock `import`s directly; use the dependency injection pattern
- **Domain entity tests** — test both `createX()` (validates, returns `Result`) and `reconstituteX()` (skips validation). Test all error branches
- **Vitest** — use `describe/it/expect`. No `test()` at top level without a `describe` wrapper
- **E2E tests (Playwright)** — mock all API calls via `page.route()` in `e2e/mocks/setup-mocks.ts`. No backend or database needed — Vite dev server only
- **`page.route()` order** — routes are evaluated in REVERSE registration order (LIFO). Register catch-all routes FIRST, specific routes AFTER
- **Mock data** — E2E mock data lives in `e2e/mocks/`. Call `setupMocks(page)` in the test fixture before navigation
- **Run tests** — `pnpm test` (unit), `pnpm test:e2e` (e2e coach-web)

### Code Quality & Style Rules

- **Biome config** — single quotes, no semicolons, 2-space indent, 120 char line width, trailing commas, LF line endings
- **Import organization** — Biome auto-sorts: Node built-ins → npm packages → workspace packages (`@strenly/*`) → relative paths. Run `pnpm lint:fix` to auto-fix
- **Unused imports/variables are errors** — Biome enforces `noUnusedImports`, `noUnusedVariables`, `noUnusedFunctionParameters`. Clean up before committing
- **Tailwind class sorting** — Biome `useSortedClasses` warns on unsorted Tailwind classes. Applies to `className` props and `cn()` calls. Run `pnpm lint:fix` to auto-sort
- **`components/ui/`** — shadcn/ui generated files. Biome a11y rules are relaxed here. Do not manually edit these files; regenerate via `shadcn` CLI
- **Validate before commit** — run `pnpm quality` (runs `turbo run typecheck && turbo run lint:fix` across all packages). Equivalent to the `/quality-gate` skill
- **Multi-tenancy is non-negotiable** — every Drizzle query on tenant tables MUST include `.where(eq(table.organizationId, ctx.organizationId))`. No exceptions
- **`updatedAt`** — always set `updatedAt: new Date()` explicitly in Drizzle `.update()` calls (not handled automatically)

### Critical Don't-Miss Rules

#### Anti-patterns to NEVER do

- **Never query without `organizationId`** — all tables with `organizationId` column are tenant-scoped. Missing this filter is a data leak
- **Never put business logic in procedures** — procedures only: extract context → call use case → map errors → return output
- **Never call `createX()` when loading from DB** — use `reconstituteX()`. Calling `createX()` sets `createdAt`/`updatedAt` to `new Date()`, corrupting timestamps
- **Never define Zod schemas outside `@strenly/contracts`** — not in procedures, not in components, not inline anywhere
- **Never use `useEffect` for data fetching or derived state** — TanStack Query handles fetching; derive state from query results directly
- **Never import across layer boundaries incorrectly** — `core` cannot import from `database`, `auth`, `backend`, or apps. `contracts` can only import from `core`
- **Never use raw `fetch` for API calls in the frontend** — always use the `orpc` client from `@/lib/api-client`
- **Never hand-craft oRPC query keys** — use `orpc.{domain}.key()` for invalidation, `orpc.{domain}.{action}.queryOptions()` for queries

#### Edge cases agents must handle

- **Drizzle `.returning()` can return empty array** — always `.andThen(row => row ? ok(mapToDomain(row)) : err(...))` after `.then(rows => rows[0])`
- **Parallel queries in repositories** — use `ResultAsync.combine([countQuery, dataQuery])` instead of `Promise.all` to keep everything in the neverthrow world and propagate errors correctly
- **`wrapDbError` helper** — every repository must have a local `wrapDbError(error: unknown): XRepositoryError` function for `ResultAsync.fromPromise()`
- **Form nullable fields** — procedure input may have `""` (empty string) for optional text fields. Convert to `null` before passing to use case: `input.email || null`
- **`X-Organization-Slug` header** — required on all `authProcedure` calls. Missing header throws `ORG_NOT_FOUND`. The RPCLink sets it automatically from `currentOrgSlug` or the URL path
- **Better-Auth organization plugin** — use `context.auth.api.getFullOrganization()` in `authProcedure` middleware to validate membership. Never query the DB directly for this

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code in this project
- Follow ALL rules exactly as documented — they are based on real code, not theory
- When in doubt, search for 2–3 existing examples of similar patterns in the codebase before implementing
- Load the relevant skill (`/architecture`, `/use-case`, `/repository`, `/procedure`, `/orpc-query`, `/form`, `/data-table`, `/mutation-errors`) before implementing each layer
- Update this file if new patterns emerge

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack or architectural patterns change
- Run `pnpm quality` after any implementation before committing

_Last Updated: 2026-02-17_
