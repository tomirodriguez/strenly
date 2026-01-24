import { QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { queryClient } from '@/lib/query-client'

const TanStackRouterDevtools =
  import.meta.env.MODE === 'production'
    ? () => null
    : lazy(() =>
        import('@tanstack/router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      )

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-right" richColors />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </QueryClientProvider>
  )
}
