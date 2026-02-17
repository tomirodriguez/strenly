import { ZapIcon } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Panel — violet branding */}
      <div className="hidden flex-col items-center justify-center bg-primary p-12 text-primary-foreground lg:flex">
        <div className="space-y-8 text-center">
          <div className="flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-white/15">
              <ZapIcon className="size-8" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="font-bold text-5xl tracking-tight">STRENLY</h1>
            <p className="mx-auto max-w-xs text-lg text-primary-foreground/80 leading-relaxed">
              Crea programas de entrenamiento tan rápido como en Excel
            </p>
          </div>
          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="text-center">
              <p className="font-bold text-2xl">10x</p>
              <p className="text-primary-foreground/70 text-xs uppercase tracking-wide">Más rápido</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="font-bold text-2xl">100%</p>
              <p className="text-primary-foreground/70 text-xs uppercase tracking-wide">Keyboard-first</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — form */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-12">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <ZapIcon className="size-5 text-primary" />
          <span className="font-bold text-xl">STRENLY</span>
        </div>
        <div className="w-full max-w-md space-y-6">{children}</div>
      </div>
    </div>
  )
}
