---
type: quick
id: "011"
name: refactor-forms-to-skill-pattern
files_modified:
  - apps/coach-web/src/features/auth/components/login-form.tsx
  - apps/coach-web/src/features/auth/components/signup-form.tsx
  - apps/coach-web/src/features/auth/components/org-form.tsx
  - apps/coach-web/src/features/athletes/components/athlete-form.tsx
autonomous: true
---

<objective>
Refactor all 4 coach-web forms to follow the `/form` skill pattern.

Purpose: Standardize form patterns for consistency and maintainability. The current forms use deprecated `zodResolver` and anti-pattern `watch`+`setValue` for controlled components.

Output: All forms using `standardSchemaResolver` and `Controller` for controlled components.
</objective>

<context>
@.claude/skills/form/SKILL.md
@apps/coach-web/src/features/auth/components/login-form.tsx
@apps/coach-web/src/features/auth/components/signup-form.tsx
@apps/coach-web/src/features/auth/components/org-form.tsx
@apps/coach-web/src/features/athletes/components/athlete-form.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Refactor auth forms (login-form, signup-form)</name>
  <skills>/form</skills>
  <files>
    apps/coach-web/src/features/auth/components/login-form.tsx
    apps/coach-web/src/features/auth/components/signup-form.tsx
  </files>
  <action>
  **login-form.tsx:**
  1. Replace `zodResolver` with `standardSchemaResolver` from `@hookform/resolvers/standard-schema`
  2. Replace `watch('rememberMe')` + `setValue` pattern with `Controller`:
     ```tsx
     import { Controller } from 'react-hook-form'

     // In useForm, add control to destructuring
     const { register, handleSubmit, formState: { errors }, control } = useForm(...)

     // Replace the Checkbox field with:
     <Controller
       control={control}
       name="rememberMe"
       render={({ field }) => (
         <Checkbox
           id="rememberMe"
           checked={field.value}
           onCheckedChange={field.onChange}
         />
       )}
     />
     ```
  3. Remove unused `setValue` and `watch` from useForm destructuring

  **signup-form.tsx:**
  1. Replace `zodResolver` with `standardSchemaResolver` from `@hookform/resolvers/standard-schema`
  2. No controlled components - just update the resolver import
  </action>
  <verify>
  - `pnpm typecheck` passes
  - `pnpm lint` passes
  - Login form renders without errors
  - Signup form renders without errors
  </verify>
  <done>
  - Both auth forms use `standardSchemaResolver`
  - Login form uses `Controller` for Checkbox instead of watch+setValue
  </done>
</task>

<task type="auto">
  <name>Task 2: Refactor org-form and athlete-form</name>
  <skills>/form</skills>
  <files>
    apps/coach-web/src/features/auth/components/org-form.tsx
    apps/coach-web/src/features/athletes/components/athlete-form.tsx
  </files>
  <action>
  **org-form.tsx:**
  1. Create a Zod schema for validation (replace inline `register` validation):
     ```tsx
     import { z } from 'zod'
     import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'

     const orgFormSchema = z.object({
       name: z.string()
         .min(2, 'El nombre debe tener al menos 2 caracteres')
         .max(50, 'El nombre no puede superar los 50 caracteres'),
       slug: z.string()
         .min(2, 'La URL debe tener al menos 2 caracteres')
         .regex(/^[a-z0-9-]+$/, 'Solo puede contener letras minusculas, numeros y guiones'),
     })

     type OrgFormData = z.infer<typeof orgFormSchema>
     ```
  2. Add `standardSchemaResolver(orgFormSchema)` to useForm
  3. Update register calls to remove inline validation:
     ```tsx
     {...register('name', { onChange: handleNameChange })}
     {...register('slug', { onChange: handleSlugChange })}
     ```
  4. The `setValue` for slug auto-generation is a valid use case - keep it (derived field pattern per STATE.md decision)

  **athlete-form.tsx:**
  1. Replace `zodResolver` with `standardSchemaResolver` from `@hookform/resolvers/standard-schema`
  2. Replace `watch('gender')` + `setValue` pattern with `Controller`:
     ```tsx
     import { Controller } from 'react-hook-form'

     // In useForm, add control to destructuring
     const { register, handleSubmit, formState: { errors }, control } = useForm(...)

     // Replace the Select field with:
     <Controller
       control={control}
       name="gender"
       render={({ field }) => (
         <Select value={field.value ?? ''} onValueChange={field.onChange}>
           <SelectTrigger id="gender">
             <SelectValue placeholder="Seleccionar genero" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="male">Masculino</SelectItem>
             <SelectItem value="female">Femenino</SelectItem>
             <SelectItem value="other">Otro</SelectItem>
           </SelectContent>
         </Select>
       )}
     />
     ```
  3. Remove unused `setValue` and `watch` from useForm destructuring
  </action>
  <verify>
  - `pnpm typecheck` passes
  - `pnpm lint` passes
  - Org form renders and slug auto-generation works
  - Athlete form renders and gender select works
  </verify>
  <done>
  - org-form uses Zod schema with `standardSchemaResolver`
  - athlete-form uses `standardSchemaResolver` and `Controller` for Select
  </done>
</task>

</tasks>

<verification>
```bash
pnpm typecheck && pnpm lint
```
Manual: Visit /login, /signup, onboarding org step, and athlete creation modal - all forms should render and validate correctly.
</verification>

<success_criteria>
- All 4 forms use `standardSchemaResolver` instead of `zodResolver`
- Controlled components (Checkbox, Select) use `Controller` instead of watch+setValue
- org-form has proper Zod schema instead of inline register validation
- All forms pass typecheck and lint
</success_criteria>
