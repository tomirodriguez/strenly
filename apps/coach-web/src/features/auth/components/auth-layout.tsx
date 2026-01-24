import { Dumbbell } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Panel - Branding (hidden on mobile) */}
      <div className="hidden flex-col items-center justify-center bg-primary p-12 text-primary-foreground lg:flex">
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <Dumbbell className="size-16" />
          </div>
          <div className="space-y-2">
            <h1 className="font-bold text-4xl">Strenly</h1>
            <p className="text-lg text-primary-foreground/90">
              Crea programas de entrenamiento tan rápido como en Excel
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Container */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md space-y-6">{children}</div>
      </div>
    </div>
  )
}
