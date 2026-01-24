import { zodResolver } from '@hookform/resolvers/zod'
import { type CreateAthleteInput, createAthleteInputSchema } from '@strenly/contracts/athletes/athlete'
import { useForm } from 'react-hook-form'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type AthleteFormProps = {
  id?: string
  onSubmit: (data: CreateAthleteInput) => void
  defaultValues?: Partial<CreateAthleteInput>
}

/**
 * Form component for creating or editing an athlete.
 * Uses React Hook Form with Zod validation.
 * Accepts an optional id prop to link with external submit buttons.
 */
export function AthleteForm({ id, onSubmit, defaultValues }: AthleteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateAthleteInput>({
    resolver: zodResolver(createAthleteInputSchema),
    defaultValues,
  })

  const genderValue = watch('gender')

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Field>
        <FieldLabel htmlFor="name">
          Name <span className="text-destructive">*</span>
        </FieldLabel>
        <FieldContent>
          <Input id="name" {...register('name')} placeholder="Enter athlete name" />
          <FieldError errors={[errors.name]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <FieldContent>
          <Input id="email" type="email" {...register('email')} placeholder="athlete@example.com" />
          <FieldDescription>Optional. Used for sending invitations to the athlete app.</FieldDescription>
          <FieldError errors={[errors.email]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="phone">Phone</FieldLabel>
        <FieldContent>
          <Input id="phone" {...register('phone')} placeholder="+1 (555) 000-0000" />
          <FieldError errors={[errors.phone]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="birthdate">Birthdate</FieldLabel>
        <FieldContent>
          <Input id="birthdate" type="date" {...register('birthdate')} />
          <FieldError errors={[errors.birthdate]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="gender">Gender</FieldLabel>
        <FieldContent>
          <Select
            value={genderValue ?? ''}
            onValueChange={(value) => setValue('gender', value as 'male' | 'female' | 'other')}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <FieldError errors={[errors.gender]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="notes">Notes</FieldLabel>
        <FieldContent>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Any additional notes about the athlete..."
            rows={4}
          />
          <FieldError errors={[errors.notes]} />
        </FieldContent>
      </Field>
    </form>
  )
}
