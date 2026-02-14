import { zodResolver } from '@hookform/resolvers/zod'
import { type LoginInput, loginInputSchema } from '@strenly/contracts/auth/auth'
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
  const { handleSubmit, control } = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <fieldset disabled={isSubmitting} className="space-y-4">
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Correo electronico</FieldLabel>
              <FieldContent>
                <Input id="email" type="email" autoComplete="email" {...field} />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">Contrasena</FieldLabel>
              <FieldContent>
                <Input id="password" type="password" autoComplete="current-password" {...field} />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="rememberMe"
          control={control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <FieldLabel htmlFor="rememberMe" className="flex cursor-pointer items-center gap-2">
                <Checkbox id="rememberMe" checked={field.value} onCheckedChange={field.onChange} />
                <span className="text-sm">Recordarme</span>
              </FieldLabel>
            </Field>
          )}
        />
      </fieldset>

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
