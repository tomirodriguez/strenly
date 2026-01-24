import { QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/query-client'
import { ThemeProvider } from '@/lib/theme'

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
      <ThemeProvider>
        <Outlet />
        <Toaster />
        <Suspense>
          <TanStackRouterDevtools />
        </Suspense>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
