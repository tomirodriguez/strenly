import { Sparkles } from 'lucide-react'
import { OrgForm } from './org-form'
import { Button } from '@/components/ui/button'

interface OrgData {
  name: string
  slug: string
}

interface OrgFormStepProps {
  onNext: (data: OrgData) => void
  onBack: () => void
  isLoading?: boolean
}

export function OrgFormStep({ onNext, onBack, isLoading }: OrgFormStepProps) {
  return (
    <div className="fade-in-0 animate-in space-y-8 duration-300">
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
          <Sparkles className="size-8 text-primary" />
        </div>
        <h2 className="font-bold text-2xl">Crea tu organizacion</h2>
        <p className="mt-2 text-base text-muted-foreground">Aqui es donde gestionaras tus atletas y programas</p>
      </div>

      <OrgForm onSubmit={onNext} isLoading={isLoading} />

      <div className="space-y-3 text-center">
        <p className="text-muted-foreground text-sm">Ya casi terminas! Solo un paso mas para comenzar.</p>
        <Button variant="ghost" onClick={onBack} disabled={isLoading}>
          Volver
        </Button>
      </div>
    </div>
  )
}
