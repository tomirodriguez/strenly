import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { AuthLayout } from '../components/auth-layout'
import { OrgForm } from '../components/org-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authClient, useSession } from '@/lib/auth-client'

interface OrgFormData {
  name: string
  slug: string
}

export function OnboardingView() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { data: session } = useSession()

  const handleCreateOrg = async (data: OrgFormData) => {
    setIsLoading(true)
    try {
      const result = await authClient.organization.create({
        name: data.name,
        slug: data.slug,
      })

      if (result.error) {
        toast.error(result.error.message ?? 'Error al crear la organizacion')
        setIsLoading(false)
        return
      }

      // Set as active organization
      if (result.data?.id) {
        await authClient.organization.setActive({
          organizationId: result.data.id,
        })
      }

      toast.success('Organizacion creada exitosamente')
      navigate({ to: '/dashboard' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear la organizacion')
      setIsLoading(false)
    }
  }

  const userName = session?.user?.name ?? 'there'

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>Bienvenido, {userName}!</CardTitle>
          <CardDescription>
            Empecemos creando tu organizacion. Aqui es donde gestionaras tus atletas y programas de entrenamiento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <OrgForm onSubmit={handleCreateOrg} isLoading={isLoading} />
          <div className="text-center text-muted-foreground text-sm">
            Necesitas unirte a una organizacion existente? Contacta al administrador para una invitacion.
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
