# apps/coach-web

Desktop-first React SPA for strength coaches. Features Excel-like inline editing, keyboard navigation, and dark mode.

## Purpose

Primary interface for coaches to manage athletes, create training programs, and track progress. Built with React 19, TanStack Router/Query, and shadcn/ui components.

## Structure

```
src/
  components/
    ui/                  # shadcn/ui primitives (auto-generated)
    {feature}/           # Feature-specific components
  features/              # Feature modules (if using feature folders)
  hooks/                 # Custom React hooks
  lib/
    api-client.ts        # oRPC client configuration
    auth-client.ts       # Better-Auth client
    query-client.ts      # TanStack Query client
    utils.ts             # Utility functions (cn, etc.)
  routes/                # TanStack Router file-based routes
    __root.tsx           # Root layout with providers
    _authenticated.tsx   # Auth-required layout
    _authenticated/      # Protected routes
  assets/                # Static assets
  main.tsx               # App entry point
```

## Relevant Skills

| Skill | Description |
|-------|-------------|
| `/orpc-query` | **Primary skill.** Creating query/mutation hooks with oRPC + TanStack Query. Use when building API integration, data fetching, and cache invalidation. |
| `/form` | Creating forms with React Hook Form + shadcn Field component. Use when building any form with validation. |
| `/data-table` | Building tables with the DataTable compound component. Use for paginated, filterable data displays. |
| `/mutation-errors` | Handling errors in mutation hooks. Use when implementing error handling in components using mutations. |

## Conventions

### Route Structure (TanStack Router)

```
routes/
  __root.tsx              # Root layout with QueryClientProvider, ThemeProvider
  _authenticated.tsx      # Auth guard layout
  _authenticated/
    dashboard.tsx         # /dashboard
    athletes/
      index.tsx           # /athletes (list page)
      $athleteId.tsx      # /athletes/:athleteId (detail page)
      new.tsx             # /athletes/new (create page)
```

### API Hooks Pattern

```typescript
// features/athletes/hooks/queries/use-athletes.ts
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

export function useAthletes(filters?: ListAthletesInput) {
  return useQuery(orpc.athletes.list.queryOptions({ input: filters }))
}

// features/athletes/hooks/mutations/use-create-athlete.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

export function useCreateAthlete() {
  const queryClient = useQueryClient()
  return useMutation({
    ...orpc.athletes.create.mutationOptions(),
    onSuccess: () => {
      // Use oRPC's key() method for cache invalidation
      queryClient.invalidateQueries({ queryKey: orpc.athletes.key() })
    },
  })
}
```

### Component Organization

- **Page components** in `routes/` - Handle data fetching and layout
- **Feature components** in `components/{feature}/` - Reusable within a feature
- **UI primitives** in `components/ui/` - shadcn/ui components (auto-generated)

### Form Pattern

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAthleteInputSchema, type CreateAthleteInput } from '@strenly/contracts'

export function AthleteForm() {
  const form = useForm<CreateAthleteInput>({
    resolver: zodResolver(createAthleteInputSchema),
  })
  // ... form implementation
}
```

### Modal vs Drawer

**Use Modal (Dialog) for:**
- Create/edit forms that need focused attention
- Confirmation dialogs
- Short workflows (1-3 fields)
- Actions that don't require seeing the page behind

**Use Drawer (Sheet) for:**
- Contextual information panels (detail views, settings)
- Complex multi-step forms where page context helps
- Navigation menus on mobile
- Panels that users may want to reference alongside page content

**Pattern:**
- **Centered modal**: User focus shifts entirely to the dialog
- **Side drawer**: User maintains awareness of underlying page

## Critical Rules

- **Import schemas from `@strenly/contracts`** - Never define Zod schemas inline
- **Use oRPC hooks for API calls** - Don't use raw fetch
- **Invalidate queries on mutations** - Keep UI in sync with server state
- **Handle loading and error states** - Every data-fetching component needs them
- **No `as` casting** - Fix actual type issues
- **No `!` assertions** - Use optional chaining or guards
- **Avoid `useEffect`** - Prefer callback functions, event handlers, or derived state
- **Dark mode support** - Use CSS variables and Tailwind dark: variants

## Development

```bash
pnpm dev:coach      # Start development server
pnpm build:coach    # Build for production
pnpm typecheck      # Run TypeScript checks
pnpm lint           # Run Biome linter
```
