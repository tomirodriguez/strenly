# Strenly — Development Guide

**Generated:** 2026-02-17

## Prerequisites

- **Node.js** 20+
- **pnpm** 9.15.4 (managed via `packageManager` in root `package.json`)
- **Docker** — for local PostgreSQL database
- **Git**

## Initial Setup

```bash
# 1. Clone and install dependencies
git clone <repo>
cd strenly
pnpm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables section)

# 3. Start local database
pnpm db:start          # Starts Docker PostgreSQL

# 4. Push schema to database
pnpm db:push           # Applies Drizzle schema

# 5. Seed development data
pnpm db:seed           # Adds test users, exercises, programs

# 6. Start development servers
pnpm dev               # All apps (API + coach-web)
# or
pnpm dev:coach         # Coach web only (needs API running)
pnpm dev:server        # API only
```

## Environment Variables

Create `.env` in the project root:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/strenly

# Better-Auth
BETTER_AUTH_SECRET=<generate: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:8787

# Optional: Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Environment
ENVIRONMENT=development
PORT=8787

# Frontend (prefix with VITE_)
VITE_API_URL=http://localhost:8787
```

## Development Commands

```bash
# Run everything
pnpm dev               # All apps via Turbo
pnpm dev:coach         # Coach web + API (via scripts/dev-coach.sh)
pnpm dev:server        # API server only (via scripts/dev-server.sh)

# Quality checks
pnpm typecheck         # TypeScript (turbo run typecheck)
pnpm lint              # Biome linter (turbo run lint)
pnpm lint:fix          # Biome with auto-fix
pnpm format            # Biome format (--write)

# Testing
pnpm test              # All unit tests (Vitest)
pnpm test:e2e          # E2E tests (Playwright) — no backend needed
pnpm test:e2e:ui       # E2E with interactive UI

# Database operations
pnpm db:push           # Push schema changes to dev database
pnpm db:generate       # Generate migration files
pnpm db:migrate        # Run migrations
pnpm db:studio         # Open Drizzle Studio (visual DB browser)
pnpm db:seed           # Seed development data
pnpm db:reset          # Drop + recreate database + push schema

# Test database (separate Docker container)
pnpm test:db:start     # Start test DB
pnpm test:db:push      # Apply schema to test DB
pnpm test:db:reset     # Reset test DB
```

## Development Ports

| Service | Port | URL |
|---------|------|-----|
| API Server | 8787 | http://localhost:8787 |
| Coach Web | 5173 | http://localhost:5173 |

## Project-Specific Scripts

```
scripts/
├── dev-coach.sh        # Start API + coach-web concurrently
├── dev-server.sh       # Start API with dotenv-cli
├── dev-test.sh         # Start test DB + run tests
└── test-e2e.sh         # Run E2E test suite (with grid)
```

## Code Style

- **Formatter/Linter**: [Biome](https://biomejs.dev/) (replaces ESLint + Prettier)
- **Config**: `biome.json` at root
- **TypeScript**: Strict mode, no `any`, no `!` assertions, no `as` casting

Key Biome rules enforced:
- `noExplicitAny` — use `unknown` and narrow
- No unused imports/variables
- Consistent import ordering

## Architecture Workflow

When adding a new feature:

### Backend (Clean Architecture order)
1. **Domain entity** in `packages/core/src/domain/entities/`
2. **Port interface** in `packages/core/src/ports/`
3. **Repository** in `packages/backend/src/infrastructure/repositories/`
4. **Use case** in `packages/backend/src/use-cases/`
5. **Contracts** in `packages/contracts/src/`
6. **Procedure** in `packages/backend/src/procedures/`

### Frontend (after backend)
1. **Route** in `apps/coach-web/src/routes/`
2. **API hooks** in `features/{domain}/hooks/`
3. **View component** in `features/{domain}/views/`
4. **Feature components** in `features/{domain}/components/`
5. **Forms** using React Hook Form + Field component

### Skills for Implementation
```bash
/architecture    # Load before planning any backend feature
/domain          # Creating domain entities
/port            # Defining repository interfaces
/repository      # Implementing repositories with Drizzle
/use-case        # Business logic with neverthrow
/contracts       # Zod schemas for API boundary
/procedure       # Thin oRPC handlers
/orpc-query      # Frontend API hooks
/form            # React Hook Form + Field
/data-table      # DataTable compound component
```

## Testing Guide

### Unit Tests (Vitest)
Located in `__tests__/` subdirectories within each package.

```bash
# Run tests for a specific package
pnpm --filter @strenly/core test
pnpm --filter @strenly/backend test
pnpm --filter @strenly/backend test:coverage
```

**Test patterns:**
- Domain entities: exhaustive validation tests in `packages/core/src/domain/**/__tests__/`
- Use cases: mock repositories from `packages/backend/src/__tests__/factories/`
- Repositories: mock DB client

**Coverage targets:**
- `packages/core`: 90%+
- `packages/backend` use cases: 80%+
- `packages/backend` repositories: 75%+

### E2E Tests (Playwright)
Located in `apps/coach-web/e2e/`.

```bash
pnpm test:e2e          # Headless
pnpm test:e2e:ui       # Interactive UI
```

**Key pattern:** All API calls are mocked via `page.route()` in `e2e/mocks/setup-mocks.ts`. No real backend needed.

## Database Workflow

```bash
# 1. Modify schema files in packages/database/src/schema/
# 2. Generate migration
pnpm db:generate

# 3. Review generated migration in packages/database/drizzle/migrations/
# 4. Apply to dev database
pnpm db:push        # Fast (no migration file, for dev only)
# OR
pnpm db:migrate     # Creates migration history

# 5. Open Studio to verify
pnpm db:studio
```

## Common Development Tasks

### Add a new domain entity
```bash
# 1. Create entity file
# packages/core/src/domain/entities/{entity}.ts

# 2. Write tests
# packages/core/src/domain/entities/__tests__/{entity}.test.ts

# 3. Add port interface
# packages/core/src/ports/{entity}-repository.port.ts
```

### Add a new API endpoint
```bash
# 1. Add Zod schema to contracts
# packages/contracts/src/{domain}/{entity}.ts

# 2. Implement use case
# packages/backend/src/use-cases/{domain}/{action}.ts

# 3. Add repository method if needed
# packages/backend/src/infrastructure/repositories/{entity}.repository.ts

# 4. Create procedure
# packages/backend/src/procedures/{domain}/{action}.ts

# 5. Register in domain index
# packages/backend/src/procedures/{domain}/index.ts
```

### Add a new page/feature to Coach Web
```bash
# 1. Create route file (TanStack Router auto-generates tree)
# apps/coach-web/src/routes/_authenticated/$orgSlug/{feature}.tsx

# 2. Add API hooks
# apps/coach-web/src/features/{feature}/hooks/queries/use-{entity}.ts
# apps/coach-web/src/features/{feature}/hooks/mutations/use-{action}.ts

# 3. Build view + components
# apps/coach-web/src/features/{feature}/views/{feature}-view.tsx
```

## Debugging

### API not connecting
- Check `VITE_API_URL` in `.env` matches running API port
- Check CORS: trusted origins in `packages/backend/src/app-railway.ts`
- Check `BETTER_AUTH_URL` matches API URL

### Database connection issues
- Ensure Docker is running: `docker ps`
- Check `DATABASE_URL` in `.env`
- Try `pnpm db:reset` to start fresh

### TypeScript errors
- Run `pnpm typecheck` from root — runs all packages
- Common: missing `organizationId` in repository calls
- Common: `as` casting (not allowed — fix the type)

### oRPC type errors
- Ensure `@strenly/contracts` schema matches use case return type
- Check `mapProgramToAggregate` mapper for schema alignment
