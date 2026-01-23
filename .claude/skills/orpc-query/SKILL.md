---
name: orpc-query
description: |
  This skill provides patterns for creating query and mutation hooks with oRPC + TanStack Query.
  Use this skill when creating API hooks for fetching data, creating mutations with cache invalidation,
  setting up infinite queries for pagination, or configuring the oRPC client.
  Do NOT load for backend procedure definitions, Zod contracts, or non-oRPC API calls.
---

# oRPC Query Hooks

## Overview

This skill provides patterns for implementing type-safe API hooks using oRPC with TanStack Query (React Query). It covers query hooks, mutations, infinite queries, and query key management.

## API Client Configuration

### Standard Setup

The oRPC client must be configured with `@orpc/client` and `@orpc/react-query`:

```typescript
// src/lib/api-client.ts
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { createORPCReactQueryUtils } from '@orpc/react-query'
import type { Router, RouterClient } from '@my-app/backend'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'

const link = new RPCLink({
  url: `${API_URL}/rpc`,
  fetch: (input, init) => {
    return fetch(input, { ...init, credentials: 'include' })
  },
})

export const client: RouterClient<Router> = createORPCClient(link)
export const orpc = createORPCReactQueryUtils(client)
```

### With Custom Headers (Multi-Tenancy)

When organization context is needed via headers:

```typescript
// src/lib/api-client.ts
let currentOrgSlug: string | null = null

export function setCurrentOrgSlug(slug: string | null): void {
  currentOrgSlug = slug
}

const link = new RPCLink({
  url: `${API_URL}/rpc`,
  fetch: (input, init) => {
    const headers = new Headers((init as RequestInit | undefined)?.headers)

    if (currentOrgSlug) {
      headers.set('X-Organization-Slug', currentOrgSlug)
    }

    return fetch(input, { ...init, headers, credentials: 'include' })
  },
})

export const client: RouterClient<Router> = createORPCClient(link)
export const orpc = createORPCReactQueryUtils(client)
```

## Query Hooks

### Pattern 1: Using queryOptions (Preferred)

The simplest approach using oRPC's built-in `queryOptions()`:

```typescript
// src/features/dashboard/hooks/use-dashboard.ts
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

export function useDashboard() {
  return useQuery(
    orpc.dashboard.get.queryOptions({
      input: {},
    }),
  )
}
```

With input parameters:

```typescript
export function useAthlete(athleteId: string) {
  return useQuery(
    orpc.athletes.get.queryOptions({
      input: { athleteId },
    }),
  )
}
```

### Pattern 2: Manual Query with Custom Configuration

When custom query keys, staleTime, or conditional fetching is needed:

```typescript
// src/features/workout/api/today-workout-api.ts
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

export const todayWorkoutKeys = {
  all: ['today-workout'] as const,
  today: () => [...todayWorkoutKeys.all, 'today'] as const,
}

export function useTodayWorkout() {
  return useQuery({
    queryKey: todayWorkoutKeys.today(),
    queryFn: () => orpc.workoutLogs.getTodayWorkout.call({}),
    staleTime: 1000 * 60 * 5,    // 5 minutes
    gcTime: 1000 * 60 * 30,      // 30 minutes cache
  })
}
```

### Pattern 3: Conditional Queries

Use `enabled` for queries that depend on other data:

```typescript
export function useAthleteProgram(athleteId: string | undefined) {
  return useQuery({
    queryKey: ['athlete-program', athleteId],
    queryFn: () => orpc.programs.getByAthlete.call({ athleteId: athleteId! }),
    enabled: !!athleteId,
    staleTime: 1000 * 60 * 5,
  })
}
```

## Query Key Factories

Organize query keys for easy invalidation:

```typescript
// src/features/athletes/api/athletes-keys.ts
export const athleteKeys = {
  all: ['athletes'] as const,
  lists: () => [...athleteKeys.all, 'list'] as const,
  list: (filters: { status?: string; search?: string }) =>
    [...athleteKeys.lists(), filters] as const,
  details: () => [...athleteKeys.all, 'detail'] as const,
  detail: (id: string) => [...athleteKeys.details(), id] as const,
}
```

Usage with queries:

```typescript
export function useAthletes(filters: { status?: string; search?: string }) {
  return useQuery({
    queryKey: athleteKeys.list(filters),
    queryFn: () => orpc.athletes.list.call({
      status: filters.status,
      search: filters.search,
    }),
  })
}

export function useAthlete(athleteId: string) {
  return useQuery({
    queryKey: athleteKeys.detail(athleteId),
    queryFn: () => orpc.athletes.get.call({ athleteId }),
    enabled: !!athleteId,
  })
}
```

## Mutations

### Standard Mutation with Cache Invalidation

```typescript
// src/features/athletes/api/athletes-mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orpc } from '@/lib/api-client'
import { athleteKeys } from './athletes-keys'
import type { CreateAthleteInput } from '@my-app/contracts/athletes/create-athlete'

export function useCreateAthlete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateAthleteInput) =>
      orpc.athletes.create.call(input),
    onSuccess: () => {
      toast.success('Atleta creado correctamente')
      queryClient.invalidateQueries({ queryKey: athleteKeys.lists() })
    },
    onError: (error) => {
      toast.error(error.message ?? 'Error al crear atleta')
    },
  })
}
```

### Mutation with Optimistic Updates

```typescript
export function useUpdateAthlete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateAthleteInput) =>
      orpc.athletes.update.call(input),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({
        queryKey: athleteKeys.detail(newData.athleteId)
      })

      const previousAthlete = queryClient.getQueryData(
        athleteKeys.detail(newData.athleteId)
      )

      queryClient.setQueryData(
        athleteKeys.detail(newData.athleteId),
        (old: Athlete | undefined) => old ? { ...old, ...newData } : old
      )

      return { previousAthlete }
    },
    onError: (_err, newData, context) => {
      if (context?.previousAthlete) {
        queryClient.setQueryData(
          athleteKeys.detail(newData.athleteId),
          context.previousAthlete
        )
      }
      toast.error('Error al actualizar atleta')
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: athleteKeys.detail(variables.athleteId)
      })
    },
  })
}
```

## Infinite Queries (Pagination)

For paginated lists with "load more" functionality:

```typescript
// src/features/history/api/history-api.ts
import { useInfiniteQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

const PAGE_SIZE = 20

export const historyKeys = {
  all: ['workout-history'] as const,
  list: (filters?: { status?: string }) =>
    [...historyKeys.all, 'list', filters] as const,
}

export function useWorkoutHistory(filters?: { status?: string }) {
  return useInfiniteQuery({
    queryKey: historyKeys.list(filters),
    queryFn: ({ pageParam = 0 }) =>
      orpc.workoutLogs.getHistory.call({
        limit: PAGE_SIZE,
        offset: pageParam,
        status: filters?.status,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage.hasMore) return undefined
      return lastPageParam + PAGE_SIZE
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  })
}
```

Usage in component:

```typescript
function HistoryList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useWorkoutHistory()

  const allItems = data?.pages.flatMap(page => page.items) ?? []

  return (
    <div>
      {allItems.map(item => <HistoryItem key={item.id} item={item} />)}

      {hasNextPage && (
        <Button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
        </Button>
      )}
    </div>
  )
}
```

## File Organization

Organize API-related files by feature:

```
src/features/athletes/
├── api/
│   ├── athletes-keys.ts      # Query key factory
│   ├── athletes-queries.ts   # useQuery hooks
│   └── athletes-mutations.ts # useMutation hooks
├── components/
│   ├── athletes-list.tsx
│   └── create-athlete-form.tsx
└── hooks/
    └── use-athletes.ts       # Composite hooks (optional)
```

## Anti-Patterns to Avoid

### WRONG: Creating custom fetch wrappers

```typescript
// WRONG - Don't create custom API functions
export async function fetchAthletes() {
  const response = await fetch(`${API_URL}/api/athletes`, {
    credentials: 'include',
  })
  return response.json()
}
```

### CORRECT: Use oRPC client

```typescript
// CORRECT - Use oRPC with TanStack Query
export function useAthletes() {
  return useQuery({
    queryKey: ['athletes'],
    queryFn: () => orpc.athletes.list.call({}),
  })
}
```

### WRONG: Calling oRPC outside React Query

```typescript
// WRONG - Direct calls lose caching benefits
async function loadData() {
  const athletes = await orpc.athletes.list.call({})
  setAthletes(athletes)
}
```

### CORRECT: Always use hooks

```typescript
// CORRECT - Data is cached and reactive
function AthletesList() {
  const { data: athletes } = useAthletes()
  return <List items={athletes} />
}
```

## Summary

| Pattern | When to Use | Example |
|---------|-------------|---------|
| `queryOptions()` | Simple queries, no custom config | `orpc.dashboard.get.queryOptions({})` |
| Manual `queryFn` | Custom staleTime, keys, or enabled | `queryFn: () => orpc.x.call({})` |
| Query Key Factory | Multiple related queries | `athleteKeys.list(filters)` |
| `useMutation` | Create/Update/Delete operations | With `invalidateQueries` on success |
| `useInfiniteQuery` | Paginated "load more" lists | With `getNextPageParam` |
