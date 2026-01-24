import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { AuthLayout } from '../components/auth-layout'
import { LoginForm } from '../components/login-form'
import { OAuthButtons } from '../components/oauth-buttons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authClient } from '@/lib/auth-client'

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

export function LoginView() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      })

      if (result.error) {
        toast.error(result.error.message ?? 'Error al iniciar sesion')
        setIsLoading(false)
        return
      }

      // Check if user has organizations
      const orgs = await authClient.organization.list()
      if (orgs.data?.length) {
        navigate({ to: '/dashboard' })
      } else {
        navigate({ to: '/onboarding' })
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al iniciar sesion')
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>Inicia sesion en tu cuenta</CardTitle>
          <CardDescription>Bienvenido de vuelta! Por favor ingresa tus credenciales.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <OAuthButtons />
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
          <div className="text-center text-muted-foreground text-sm">
            No tienes cuenta?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Registrarse
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
