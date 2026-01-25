import { zodResolver } from '@hookform/resolvers/zod'
import { type LoginInput, loginInputSchema } from '@strenly/contracts'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type LoginFormProps = {
  onSubmit: (data: LoginInput) => void | Promise<void>
  isSubmitting?: boolean
}

export function LoginForm({ onSubmit, isSubmitting }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field>
        <FieldLabel htmlFor="email">Correo electronico</FieldLabel>
        <FieldContent>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />
          <FieldError errors={[errors.email]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="password">Contrasena</FieldLabel>
        <FieldContent>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          <FieldError errors={[errors.password]} />
        </FieldContent>
      </Field>

      <Field orientation="horizontal">
        <FieldLabel htmlFor="rememberMe" className="flex cursor-pointer items-center gap-2">
          <Controller
            control={control}
            name="rememberMe"
            render={({ field }) => <Checkbox id="rememberMe" checked={field.value} onCheckedChange={field.onChange} />}
          />
          <span className="text-sm">Recordarme</span>
        </FieldLabel>
      </Field>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Iniciando sesion...
          </span>
        ) : (
          'Iniciar sesion'
        )}
      </Button>
    </form>
  )
}
