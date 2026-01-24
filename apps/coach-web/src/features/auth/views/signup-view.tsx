import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { AuthLayout } from '../components/auth-layout'
import { OAuthButtons } from '../components/oauth-buttons'
import { SignupForm } from '../components/signup-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authClient } from '@/lib/auth-client'

interface SignupFormData {
  name: string
  email: string
  password: string
}

export function SignupView() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      })

      if (result.error) {
        toast.error(result.error.message ?? 'Error al crear cuenta')
        setIsLoading(false)
        return
      }

      // New users always need to create an organization
      navigate({ to: '/onboarding' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear cuenta')
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>Crear una cuenta</CardTitle>
          <CardDescription>Comienza con Strenly hoy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <OAuthButtons />
          <SignupForm onSubmit={handleSignup} isLoading={isLoading} />
          <div className="text-center text-muted-foreground text-sm">
            Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Iniciar sesion
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
