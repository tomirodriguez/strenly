import { zodResolver } from '@hookform/resolvers/zod'
import { type SignupInput, signupInputSchema } from '@strenly/contracts/auth/auth'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type SignupFormProps = {
  onSubmit: (data: SignupInput) => void | Promise<void>
  isSubmitting?: boolean
}

export function SignupForm({ onSubmit, isSubmitting }: SignupFormProps) {
  const { handleSubmit, control } = useForm<SignupInput>({
    resolver: zodResolver(signupInputSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <fieldset disabled={isSubmitting} className="space-y-4">
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Nombre</FieldLabel>
              <FieldContent>
                <Input id="name" type="text" autoComplete="name" {...field} />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

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
                <Input id="password" type="password" autoComplete="new-password" {...field} />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
      </fieldset>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Creando cuenta...
          </span>
        ) : (
          'Registrarse'
        )}
      </Button>
    </form>
  )
}
