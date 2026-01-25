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
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="font-semibold text-xl">Crea tu organización</h2>
        <p className="text-muted-foreground text-sm">Este será el espacio donde gestionarás tus atletas y programas</p>
      </div>

      <div className="rounded-xl border bg-background p-6">
        <OrgForm onSubmit={onNext} isSubmitting={isLoading} />
      </div>

      <div className="text-center">
        <Button variant="ghost" onClick={onBack} disabled={isLoading}>
          Volver
        </Button>
      </div>
    </div>
  )
}
