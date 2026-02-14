import { QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, type ErrorComponentProps, Link, Outlet } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { Button } from '@/components/ui/button'
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
  errorComponent: RootErrorComponent,
  notFoundComponent: RootNotFoundComponent,
})

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-right" richColors />
      <Suspense>
        <TanStackRouterDevtools position="bottom-right" />
      </Suspense>
    </QueryClientProvider>
  )
}

function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="font-bold text-2xl">Algo salio mal</h1>
      <p className="max-w-md text-center text-muted-foreground">
        {error instanceof Error ? error.message : 'Ocurrio un error inesperado.'}
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          Reintentar
        </Button>
        <Button render={<Link to="/" />}>Ir al inicio</Button>
      </div>
    </div>
  )
}

function RootNotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="font-bold text-4xl">404</h1>
      <p className="text-muted-foreground">La pagina que buscas no existe.</p>
      <Button render={<Link to="/" />}>Ir al inicio</Button>
    </div>
  )
}
