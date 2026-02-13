---
name: orpc-query
description: |
  Provides patterns for creating query and mutation hooks with oRPC + TanStack Query.
  Use this skill when creating API hooks for fetching data, creating mutations with cache invalidation,
  setting up infinite queries for pagination, or configuring the oRPC client.
  Do NOT load for backend procedure definitions, Zod contracts, or non-oRPC API calls.
---

<objective>
Implements type-safe API hooks using oRPC with TanStack Query (React Query). Covers query hooks, mutations, infinite queries, query key management, and client configuration.
</objective>

<quick_start>
```typescript
// src/lib/api-client.ts
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { createORPCReactQueryUtils } from '@orpc/react-query'

const link = new RPCLink({
  url: `${API_URL}/rpc`,
  fetch: (input, init) => fetch(input, { ...init, credentials: 'include' }),
})

export const client = createORPCClient(link)
export const orpc = createORPCReactQueryUtils(client)

// Usage
const { data } = useQuery(orpc.athletes.get.queryOptions({ input: { athleteId } }))
```
</quick_start>

<client_configuration>
**Standard Setup:**

```typescript
// src/lib/api-client.ts
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { createORPCReactQueryUtils } from '@orpc/react-query'
import type { Router, RouterClient } from '@/server/router' // or your backend router path

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

**With Custom Headers (Multi-Tenancy):**

```typescript
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
```
</client_configuration>

<query_patterns>
**Pattern 1: Using queryOptions (Preferred)**

```typescript
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

export function useDashboard() {
  return useQuery(
    orpc.dashboard.get.queryOptions({
      input: {},
    }),
  )
}

export function useAthlete(athleteId: string) {
  return useQuery(
    orpc.athletes.get.queryOptions({
      input: { athleteId },
    }),
  )
}
```

**Pattern 2: Manual Query with Custom Configuration**

```typescript
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

**Pattern 3: Conditional Queries**

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
</query_patterns>

<query_keys>
oRPC provides built-in methods for query key management. **Do NOT create custom query key factories.**

**Available Methods:**

| Method | Purpose | Use Case |
|--------|---------|----------|
| `.key()` | Partial matching | Invalidate all queries for a procedure |
| `.key({ input })` | Exact matching with input | Invalidate/get specific query |
| `.queryKey({ input })` | Full query key | `setQueryData`, `getQueryData` |
| `.mutationKey()` | Mutation key matching | Track mutation state |
| `.infiniteKey()` | Infinite query key | Invalidate infinite queries |

**Invalidation Patterns:**

```typescript
import { useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

// Invalidate ALL athlete queries (list, get, etc.)
queryClient.invalidateQueries({ queryKey: orpc.athletes.key() })

// Invalidate specific list query
queryClient.invalidateQueries({ queryKey: orpc.athletes.list.key() })

// Invalidate specific detail query with input
queryClient.invalidateQueries({
  queryKey: orpc.athletes.get.key({ input: { athleteId } })
})

// Get/set specific query data
const athlete = queryClient.getQueryData(
  orpc.athletes.get.queryKey({ input: { athleteId } })
)

queryClient.setQueryData(
  orpc.athletes.get.queryKey({ input: { athleteId } }),
  updatedAthlete
)
```

**Why oRPC Keys Are Better:**

1. **Type-safe** - Input is validated at compile time
2. **Automatic** - Keys match what `queryOptions` generates
3. **Consistent** - No manual key string management
4. **Refactor-friendly** - Renaming procedures updates keys automatically
</query_keys>

<mutations>
**Standard Mutation with Cache Invalidation:**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orpc } from '@/lib/api-client'

export function useCreateAthlete() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.athletes.create.mutationOptions(),
    onSuccess: () => {
      toast.success('Atleta creado correctamente')
      // Invalidate ALL athlete queries using oRPC's key() method
      queryClient.invalidateQueries({ queryKey: orpc.athletes.key() })
    },
    onError: (error) => {
      toast.error(error.message ?? 'Error al crear atleta')
    },
  })
}
```

**Mutation with Optimistic Updates:**

```typescript
export function useUpdateAthlete() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.athletes.update.mutationOptions(),
    onMutate: async (newData) => {
      // Cancel with oRPC key
      await queryClient.cancelQueries({
        queryKey: orpc.athletes.get.key({ input: { athleteId: newData.athleteId } })
      })

      // Get previous data with oRPC queryKey
      const previousAthlete = queryClient.getQueryData(
        orpc.athletes.get.queryKey({ input: { athleteId: newData.athleteId } })
      )

      // Optimistically update
      queryClient.setQueryData(
        orpc.athletes.get.queryKey({ input: { athleteId: newData.athleteId } }),
        (old: Athlete | undefined) => old ? { ...old, ...newData } : old
      )

      return { previousAthlete }
    },
    onError: (_err, newData, context) => {
      if (context?.previousAthlete) {
        queryClient.setQueryData(
          orpc.athletes.get.queryKey({ input: { athleteId: newData.athleteId } }),
          context.previousAthlete
        )
      }
      toast.error('Error al actualizar atleta')
    },
    onSettled: (_data, _error, variables) => {
      // Invalidate the specific query
      queryClient.invalidateQueries({
        queryKey: orpc.athletes.get.key({ input: { athleteId: variables.athleteId } })
      })
    },
  })
}
```
</mutations>

<infinite_queries>
For paginated lists with "load more" functionality:

```typescript
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

const PAGE_SIZE = 20

export function useWorkoutHistory(filters?: { status?: string }) {
  return useInfiniteQuery({
    // Let oRPC manage the query key automatically
    ...orpc.workoutLogs.getHistory.infiniteOptions({
      input: { limit: PAGE_SIZE, status: filters?.status },
    }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage.hasMore) return undefined
      return lastPageParam + PAGE_SIZE
    },
  })
}

// Invalidate infinite query using infiniteKey()
function useRefreshHistory() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({
    queryKey: orpc.workoutLogs.getHistory.infiniteKey()
  })
}

// Usage
function HistoryList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useWorkoutHistory()
  const allItems = data?.pages.flatMap(page => page.items) ?? []

  return (
    <div>
      {allItems.map(item => <HistoryItem key={item.id} item={item} />)}
      {hasNextPage && (
        <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
        </Button>
      )}
    </div>
  )
}
```
</infinite_queries>

<file_organization>
```
src/features/athletes/
├── hooks/
│   ├── queries/
│   │   ├── use-athletes.ts       # List query hook
│   │   └── use-athlete.ts        # Detail query hook
│   └── mutations/
│       ├── use-create-athlete.ts
│       └── use-update-athlete.ts
└── components/
    ├── athletes-list.tsx
    └── athlete-form.tsx
```

**Note:** No separate `*-keys.ts` files needed. oRPC provides `.key()` methods directly.
</file_organization>

<anti_patterns>
**WRONG: Creating custom query key factories**
```typescript
// DON'T DO THIS - oRPC has built-in key management
export const athleteKeys = {
  all: ['athletes'] as const,
  detail: (id: string) => [...athleteKeys.all, id] as const,
}

queryClient.invalidateQueries({ queryKey: athleteKeys.all })
```

**CORRECT: Use oRPC's built-in key methods**
```typescript
// Invalidate all athlete queries
queryClient.invalidateQueries({ queryKey: orpc.athletes.key() })

// Invalidate specific query with input
queryClient.invalidateQueries({
  queryKey: orpc.athletes.get.key({ input: { athleteId } })
})
```

**WRONG: Creating custom fetch wrappers**
```typescript
export async function fetchAthletes() {
  const response = await fetch(`${API_URL}/api/athletes`, {
    credentials: 'include',
  })
  return response.json()
}
```

**CORRECT: Use oRPC client with queryOptions**
```typescript
export function useAthletes() {
  return useQuery(orpc.athletes.list.queryOptions({ input: {} }))
}
```

**WRONG: Calling oRPC outside React Query**
```typescript
async function loadData() {
  const athletes = await orpc.athletes.list.call({})
  setAthletes(athletes)
}
```

**CORRECT: Always use hooks**
```typescript
function AthletesList() {
  const { data: athletes } = useAthletes()
  return <List items={athletes} />
}
```
</anti_patterns>

<success_criteria>
| Pattern | When to Use | Example |
|---------|-------------|---------|
| `queryOptions()` | Simple queries, no custom config | `orpc.dashboard.get.queryOptions({})` |
| Manual `queryFn` | Custom staleTime or enabled | `queryFn: () => orpc.x.call({})` |
| `.key()` | Invalidate all queries for procedure | `orpc.athletes.key()` |
| `.key({ input })` | Invalidate specific query | `orpc.athletes.get.key({ input })` |
| `.queryKey({ input })` | Get/set query data | `orpc.athletes.get.queryKey({ input })` |
| `useMutation` | Create/Update/Delete operations | With `invalidateQueries` on success |
| `useInfiniteQuery` | Paginated "load more" lists | With `getNextPageParam` |
</success_criteria>
