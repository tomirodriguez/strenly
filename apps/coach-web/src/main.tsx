import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from '@/components/ui/sonner'
import './index.css'
import { ThemeProvider } from './lib/theme'
import { routeTree } from './routeTree.gen'

// Create router instance
const router = createRouter({ routeTree })

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  </StrictMode>,
)
