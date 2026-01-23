# Technology Stack

**Project:** Strenly - Training Planning Platform for Strength Coaches
**Researched:** 2026-01-23
**Overall Confidence:** HIGH (verified via official docs and current releases)

---

## Executive Summary

This stack research addresses the core technical decisions for Strenly's training planning platform. The stack is largely pre-decided (React 19 + Vite, Hono + oRPC, Cloudflare Workers, Neon PostgreSQL, Better-Auth), so this document focuses on:

1. **Grid editing solution** - The make-or-break decision for coach UX
2. **PWA patterns** - Critical for athlete app offline capability
3. **oRPC patterns** - For type-safe APIs with real-time/optimistic updates
4. **RLS implementation** - Multi-tenancy security layer

---

## Core Framework Stack (Pre-decided)

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| React | 19.x | Frontend framework (both apps) | HIGH |
| Vite | 6.x / 7.x | Build tool, dev server | HIGH |
| Hono | 4.11.x | Edge-first web framework | HIGH |
| oRPC | 1.0.x | Type-safe RPC layer | HIGH |
| Cloudflare Workers | Latest | Edge compute runtime | HIGH |
| Neon PostgreSQL | Latest | Serverless PostgreSQL | HIGH |
| Drizzle ORM | 1.0.0-beta.12 | TypeScript ORM | MEDIUM (still beta) |
| Better-Auth | 1.4.x | Authentication framework | HIGH |
| pnpm | 9.x | Package manager | HIGH |
| Turborepo | Latest | Monorepo build system | HIGH |

### Version Notes

- **Drizzle ORM 1.0.0-beta.12** (Jan 2026): Architecture rewrite complete, RLS support added in v1.0 beta. Schema introspection now <1s vs 10s before. Still beta but production-ready for most use cases.
- **Hono 4.11.x**: Current stable. Type system fixes for middleware in 4.11.0.
- **oRPC 1.0.0**: Just reached stable (Dec 2025). Production-ready with full OpenAPI support.
- **Better-Auth 1.4.15**: Latest stable with OAuth Device Grant, database joins (2-3x latency improvement).

---

## Grid Editing Library Decision

### Recommendation: AG Grid (Enterprise)

**Confidence:** HIGH
**Rationale:** For Excel-like editing with keyboard navigation in a training program builder, AG Grid Enterprise is the clear choice.

| Criterion | AG Grid Enterprise | TanStack Table | Handsontable |
|-----------|-------------------|----------------|--------------|
| Keyboard navigation | Built-in, Excel-like | DIY (complex) | Built-in |
| Inline editing | Full support | DIY | Full support |
| Cell validation | v34+ native | DIY | Plugin |
| Batch editing | v34+ native | DIY | Limited |
| Virtualization | 100K+ rows | With react-window | Native |
| Bundle size | Large (~200KB+) | Tiny (~15KB) | Medium (~100KB) |
| License cost | $999/dev/year | Free | $699/dev/year |
| React 19 support | v34.3+ | Native | Wrapper |

### Why AG Grid over alternatives:

1. **v34.3 has explicit React 19.2 support** - Critical for your stack
2. **Batch editing (v34.0)** - Perfect for program template bulk updates
3. **Cell validation (v34.0)** - Prevent invalid RPE/percentage entries
4. **Test IDs (v34.1)** - Essential for E2E testing training grids
5. **Keyboard shortcuts mirror Excel** - Coaches expect F2/Enter/Tab behavior

### Why NOT TanStack Table:

- You'd need 2-4 weeks building keyboard navigation, cell editing, and copy-paste
- "It feels like Lego for tables - you get the pieces, but you build the castle"
- Makes sense for read-only tables, NOT for Excel-like editing

### Why NOT Handsontable:

- Slightly cheaper but less TypeScript integration
- AG Grid's batch editing and validation are more mature
- Handsontable's React wrapper is less native-feeling

### Installation

```bash
pnpm add ag-grid-react ag-grid-enterprise
```

### Specific Patterns for Training Grids

```typescript
// Keyboard navigation for program editing
const gridOptions = {
  enterNavigatesVertically: true,        // Excel-like
  enterNavigatesVerticallyAfterEdit: true,
  tabToNextCell: (params) => {
    // Custom logic for set/rep/weight cell flow
  },
  singleClickEdit: true,                 // Fast editing
  stopEditingWhenCellsLoseFocus: true,

  // Batch editing for "apply to all sets"
  getContextMenuItems: (params) => [
    'copy', 'paste',
    {
      name: 'Apply to column',
      action: () => applyToColumn(params)
    }
  ]
};
```

---

## PWA Architecture

### Recommendation: vite-plugin-pwa + Workbox with Background Sync

**Confidence:** HIGH
**Version:** vite-plugin-pwa 1.2.0 (Nov 2025)

### Coach App (Dark Theme, Keyboard-Dense)

PWA is optional for coach app. Focus on:
- Desktop-first experience
- Quick response caching for API calls
- NOT offline-first (coaches need real-time sync)

### Athlete App (Light Theme, Touch-Friendly)

**Full PWA with Offline Support Required**

```typescript
// vite.config.ts for athlete app
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      strategies: 'injectManifest', // Custom SW for advanced offline
      srcDir: 'src',
      filename: 'sw.ts',

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // Cache training programs for offline view
        runtimeCaching: [
          {
            urlPattern: /\/api\/programs\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'training-programs',
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 }
            }
          },
          {
            urlPattern: /\/api\/workouts\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'workouts',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 100 }
            }
          }
        ]
      },

      manifest: {
        name: 'Strenly Athlete',
        short_name: 'Strenly',
        theme_color: '#ffffff',
        display: 'standalone'
      }
    })
  ]
});
```

### Background Sync for Workout Logging

Athletes may complete workouts offline. Use Workbox Background Sync:

```typescript
// src/sw.ts (service worker)
import { BackgroundSyncPlugin } from 'workbox-background-sync';

const bgSyncPlugin = new BackgroundSyncPlugin('workoutQueue', {
  maxRetentionTime: 24 * 60 // Retry for 24 hours
});

registerRoute(
  /\/api\/workouts\/log/,
  new NetworkOnly({
    plugins: [bgSyncPlugin]
  }),
  'POST'
);
```

### Cloudflare Workers + PWA Compatibility

- **No conflicts**: Service workers run in browser, Workers run at edge
- **Cache coordination**: Use Cache-Control headers from Workers to guide SW caching
- **Asset serving**: Use `wrangler.toml` static assets for PWA shell

---

## oRPC Patterns

### Recommendation: oRPC 1.0 with TanStack Query Integration

**Confidence:** HIGH
**Why oRPC over tRPC:**

1. **OpenAPI built-in** - Generate API docs, webhook handlers, mobile clients
2. **Cloudflare Workers native** - trpc-openapi deprecated and didn't work on edge
3. **File uploads native** - For exercise videos/images
4. **SSE/Streaming typed** - For real-time workout sync

### Installation

```bash
pnpm add @orpc/server @orpc/client @orpc/react-query @orpc/zod
```

### Server Setup (Hono + oRPC)

```typescript
// apps/api/src/router.ts
import { os } from '@orpc/server';
import { oz } from '@orpc/zod';
import { z } from 'zod';

// Base procedure with auth middleware
const authed = os.use(async ({ context, next }) => {
  const session = await getSession(context.req);
  if (!session) throw new Error('Unauthorized');
  return next({ context: { ...context, session } });
});

// Training program procedures
export const programRouter = {
  list: authed
    .input(z.object({ teamId: z.string() }))
    .handler(async ({ input, context }) => {
      return db.query.programs.findMany({
        where: eq(programs.teamId, input.teamId)
      });
    }),

  update: authed
    .input(oz.object({
      programId: oz.string(),
      data: oz.object({
        name: oz.string().optional(),
        weeks: oz.array(WeekSchema).optional()
      })
    }))
    .handler(async ({ input, context }) => {
      // Batch update with optimistic locking
      return db.update(programs)
        .set(input.data)
        .where(eq(programs.id, input.programId))
        .returning();
    })
};
```

### Client Setup with TanStack Query

```typescript
// packages/client/src/orpc.ts
import { createORPCReactQueryUtils } from '@orpc/react-query';
import { createClient } from '@orpc/client';
import type { AppRouter } from '@strenly/api';

const client = createClient<AppRouter>({
  baseURL: import.meta.env.VITE_API_URL
});

export const orpc = createORPCReactQueryUtils(client);
```

### Optimistic Updates Pattern

```typescript
// Coach app: Instant grid updates
function useProgramUpdate() {
  const queryClient = useQueryClient();

  return orpc.program.update.useMutation({
    // Optimistic update - immediate UI feedback
    onMutate: async (newData) => {
      await queryClient.cancelQueries(['program', newData.programId]);

      const previous = queryClient.getQueryData(['program', newData.programId]);

      queryClient.setQueryData(['program', newData.programId], (old) => ({
        ...old,
        ...newData.data
      }));

      return { previous };
    },

    // Rollback on error
    onError: (err, newData, context) => {
      queryClient.setQueryData(
        ['program', newData.programId],
        context?.previous
      );
      toast.error('Failed to save. Rolling back...');
    },

    // Refetch to ensure consistency
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries(['program', variables.programId]);
    }
  });
}
```

### Real-Time Sync (Coach -> Athlete)

Use oRPC's SSE support for live updates:

```typescript
// Server: SSE endpoint for workout updates
export const realtimeRouter = {
  programUpdates: authed
    .input(z.object({ programId: z.string() }))
    .handler(async function* ({ input, context }) {
      // Subscribe to database changes
      for await (const change of subscribeToProgram(input.programId)) {
        yield change;
      }
    })
};

// Client: Subscribe to updates
function useRealtimeProgramSync(programId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = orpc.realtime.programUpdates.subscribe(
      { programId },
      {
        onData: (update) => {
          queryClient.setQueryData(['program', programId], (old) => ({
            ...old,
            ...update
          }));
        }
      }
    );

    return unsubscribe;
  }, [programId]);
}
```

---

## Drizzle ORM + PostgreSQL RLS

### Recommendation: Drizzle 1.0 beta with Neon's crudPolicy helper

**Confidence:** MEDIUM (Drizzle RLS is new, patterns still evolving)

### RLS Strategy for Multi-Tenancy

```typescript
// packages/db/src/schema/programs.ts
import { pgTable, text, uuid, pgPolicy } from 'drizzle-orm/pg-core';
import { crudPolicy } from 'drizzle-orm/neon';
import { sql } from 'drizzle-orm';

// Authenticated user role
export const authenticatedRole = pgRole('authenticated');

export const programs = pgTable('programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id),
  name: text('name').notNull(),
  createdBy: uuid('created_by').notNull()
}, (table) => [
  // RLS: Users can only access programs in their team
  crudPolicy({
    role: authenticatedRole,
    read: sql`team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.user_id()
    )`,
    modify: sql`team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.user_id()
      AND role IN ('coach', 'admin')
    )`
  })
]).enableRLS();
```

### Hyperdrive Connection Setup

```typescript
// apps/api/src/db.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@strenly/db/schema';

export function createDb(env: Env) {
  // Use Hyperdrive for connection pooling
  const sql = neon(env.HYPERDRIVE.connectionString);

  return drizzle(sql, {
    schema,
    logger: env.NODE_ENV === 'development'
  });
}
```

### Wrangler Configuration

```toml
# wrangler.toml
name = "strenly-api"
compatibility_date = "2024-01-01"

[[hyperdrive]]
binding = "HYPERDRIVE"
id = "your-hyperdrive-id"

[vars]
NODE_ENV = "production"
```

### RLS Testing Pattern

```typescript
// Test that RLS actually works
describe('Program RLS', () => {
  it('blocks cross-team access', async () => {
    const db = createDb(env);

    // Set session context to team A user
    await db.execute(sql`SET app.user_id = ${teamAUserId}`);

    // Try to access team B program
    const result = await db.query.programs.findFirst({
      where: eq(programs.id, teamBProgramId)
    });

    expect(result).toBeNull(); // RLS blocks access
  });
});
```

---

## Monorepo Structure

### Recommended Layout

```
strenly/
├── apps/
│   ├── coach/              # Coach SPA (dark, keyboard-dense)
│   │   ├── src/
│   │   └── vite.config.ts
│   ├── athlete/            # Athlete PWA (light, touch-friendly)
│   │   ├── src/
│   │   ├── sw.ts           # Service worker
│   │   └── vite.config.ts
│   └── api/                # Hono + oRPC on Cloudflare Workers
│       ├── src/
│       └── wrangler.toml
├── packages/
│   ├── db/                 # Drizzle schema + migrations
│   │   ├── schema/
│   │   ├── migrations/
│   │   └── drizzle.config.ts
│   ├── api-client/         # Generated oRPC client + hooks
│   ├── ui/                 # Shared UI components (Tailwind)
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Shared utilities
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### Turborepo Configuration

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    }
  }
}
```

### Workspace Protocol

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
// apps/coach/package.json
{
  "dependencies": {
    "@strenly/db": "workspace:*",
    "@strenly/api-client": "workspace:*",
    "@strenly/ui": "workspace:*"
  }
}
```

---

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | 5.90.x | Server state management | All API calls |
| @tanstack/react-table | 8.x | Read-only data tables | Athlete workout history |
| ag-grid-react | 34.3+ | Editable training grids | Coach program builder |
| zustand | 5.x | Client state (UI state only) | Modal states, local prefs |
| zod | 3.24.x | Runtime validation | oRPC schemas, forms |
| react-hook-form | 7.x | Form handling | Settings, onboarding |
| tailwindcss | 4.x | Styling (Rust engine) | Both apps |
| @radix-ui/* | Latest | Accessible primitives | Dialogs, dropdowns, etc. |
| framer-motion | 12.x | Animations | Athlete app transitions |

---

## What NOT to Use (and Why)

| Technology | Why NOT | Use Instead |
|------------|---------|-------------|
| tRPC | No OpenAPI, trpc-openapi deprecated, edge issues | oRPC |
| Redux | Overkill, TanStack Query handles server state | zustand (minimal) |
| Prisma | Heavy cold starts on Workers, no native RLS | Drizzle ORM |
| create-react-app | Deprecated Feb 2025 | Vite |
| TanStack Table (for editing) | 2-4 weeks DIY for Excel-like features | AG Grid |
| Neon serverless driver with Hyperdrive | Redundant pooling | node-postgres via Hyperdrive |
| Firebase Auth | Vendor lock-in, no self-host option | Better-Auth |
| Next.js | Overkill for SPA, adds complexity | Vite + React |

---

## Installation Commands

```bash
# Initialize monorepo
pnpm create turbo@latest strenly

# Core dependencies (in root)
pnpm add -D typescript @types/node vitest

# API app
cd apps/api
pnpm add hono @hono/zod-validator
pnpm add @orpc/server @orpc/openapi
pnpm add drizzle-orm @neondatabase/serverless
pnpm add better-auth
pnpm add -D wrangler drizzle-kit @cloudflare/vitest-pool-workers

# Coach app
cd apps/coach
pnpm add react react-dom
pnpm add ag-grid-react ag-grid-enterprise
pnpm add @tanstack/react-query
pnpm add @orpc/client @orpc/react-query
pnpm add zustand zod react-hook-form
pnpm add -D vite @vitejs/plugin-react tailwindcss

# Athlete app
cd apps/athlete
pnpm add react react-dom
pnpm add @tanstack/react-query @tanstack/react-table
pnpm add @orpc/client @orpc/react-query
pnpm add zustand zod
pnpm add -D vite @vitejs/plugin-react vite-plugin-pwa tailwindcss

# Shared packages
cd packages/db
pnpm add drizzle-orm pg
pnpm add -D drizzle-kit @types/pg
```

---

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Core stack (React, Vite, Hono) | HIGH | Stable, well-documented, verified versions |
| oRPC | HIGH | 1.0 released Dec 2025, production-ready |
| AG Grid for editing | HIGH | v34.3 has React 19 support, mature features |
| PWA with vite-plugin-pwa | HIGH | v1.2.0 stable, well-documented patterns |
| Drizzle ORM RLS | MEDIUM | v1.0 beta, RLS patterns new but functional |
| Better-Auth | HIGH | v1.4.15 stable, active development |
| Hyperdrive + Neon | HIGH | Official integration, well-documented |

---

## Sources

### Official Documentation
- [React 19 Release](https://react.dev/blog/2024/12/05/react-19)
- [oRPC v1 Announcement](https://orpc.dev/blog/v1-announcement)
- [Drizzle ORM RLS](https://orm.drizzle.team/docs/rls)
- [Neon + Drizzle RLS Guide](https://neon.com/docs/guides/rls-drizzle)
- [Cloudflare Hyperdrive + Neon](https://neon.com/docs/guides/cloudflare-hyperdrive)
- [Hono Cloudflare Workers](https://hono.dev/docs/getting-started/cloudflare-workers)
- [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa)
- [AG Grid v34 Release Notes](https://www.ag-grid.com/whats-new/)
- [Better-Auth Docs](https://www.better-auth.com/docs/introduction)

### Community Resources
- [oRPC vs tRPC Comparison](https://orpc.dev/docs/comparison)
- [Hono RPC Monorepo Example](https://github.com/sor4chi/hono-rpc-monorepo-pnpm-turbo)
- [TanStack Query Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
- [AG Grid vs TanStack Table](https://blog.ag-grid.com/headless-react-table-vs-ag-grid-react-data-grid/)

---

## Next Steps for Roadmap

1. **Phase 1: Foundation** - Monorepo setup, auth, basic DB schema
2. **Phase 2: Core Grid** - AG Grid integration for program builder
3. **Phase 3: API Layer** - oRPC routes with RLS enforcement
4. **Phase 4: Athlete PWA** - Offline-capable workout viewer
5. **Phase 5: Real-time Sync** - SSE-based coach-to-athlete updates

Key flags for deeper research:
- **AG Grid license management** in monorepo (single license for both apps?)
- **Drizzle migration strategy** for production with RLS policies
- **Background sync conflict resolution** when athlete edits offline
