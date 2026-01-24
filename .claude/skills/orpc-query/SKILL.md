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

<query_key_factories>
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

// Usage
export function useAthletes(filters: { status?: string; search?: string }) {
  return useQuery({
    queryKey: athleteKeys.list(filters),
    queryFn: () => orpc.athletes.list.call({
      status: filters.status,
      search: filters.search,
    }),
  })
}
```
</query_key_factories>

<mutations>
**Standard Mutation with Cache Invalidation:**

```typescript
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

**Mutation with Optimistic Updates:**

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
</mutations>

<infinite_queries>
For paginated lists with "load more" functionality:

```typescript
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
</file_organization>

<anti_patterns>
**WRONG: Creating custom fetch wrappers**
```typescript
export async function fetchAthletes() {
  const response = await fetch(`${API_URL}/api/athletes`, {
    credentials: 'include',
  })
  return response.json()
}
```

**CORRECT: Use oRPC client**
```typescript
export function useAthletes() {
  return useQuery({
    queryKey: ['athletes'],
    queryFn: () => orpc.athletes.list.call({}),
  })
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
| Manual `queryFn` | Custom staleTime, keys, or enabled | `queryFn: () => orpc.x.call({})` |
| Query Key Factory | Multiple related queries | `athleteKeys.list(filters)` |
| `useMutation` | Create/Update/Delete operations | With `invalidateQueries` on success |
| `useInfiniteQuery` | Paginated "load more" lists | With `getNextPageParam` |
</success_criteria>
