import { Button } from '@/components/ui/button'
import { OrgForm } from './org-form'

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
      <div className="text-center">
        <h2 className="font-semibold text-xl">Crea tu organizacion</h2>
        <p className="mt-2 text-muted-foreground">
          Aqui es donde gestionaras tus atletas y programas
        </p>
      </div>

      <OrgForm onSubmit={onNext} isLoading={isLoading} />

      <div className="text-center">
        <Button variant="ghost" onClick={onBack} disabled={isLoading}>
          Volver
        </Button>
      </div>
    </div>
  )
}
