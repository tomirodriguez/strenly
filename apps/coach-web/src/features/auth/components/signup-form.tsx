import { zodResolver } from '@hookform/resolvers/zod'
import { signupInputSchema, type SignupInput } from '@strenly/contracts'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type SignupFormProps = {
  onSubmit: (data: SignupInput) => void | Promise<void>
  isLoading?: boolean
}

export function SignupForm({ onSubmit, isLoading }: SignupFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupInputSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <FieldContent>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register('name')}
          />
          <FieldError errors={[errors.name]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <FieldContent>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          <FieldError errors={[errors.email]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <FieldContent>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          <FieldError errors={[errors.password]} />
        </FieldContent>
      </Field>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Creating account...
          </span>
        ) : (
          'Sign up'
        )}
      </Button>
    </form>
  )
}
