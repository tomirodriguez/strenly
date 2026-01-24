---
id: "005"
type: quick
title: "Fix onboarding: org creation error, form layout, and slug auto-generation"
files_modified:
  - packages/auth/src/auth.ts
  - apps/coach-web/src/features/auth/views/onboarding-view.tsx
  - apps/coach-web/src/features/auth/components/org-form.tsx
---

<objective>
Fix three bugs in the onboarding flow:
1. Organization creation fails with 500 error due to JSON.parse on already-parsed metadata
2. Onboarding form layout too cramped for 3-column plan grid
3. Slug auto-generation only works for first character typed

Purpose: Enable coaches to complete onboarding without errors
Output: Working onboarding flow with proper layout and slug auto-generation
</objective>

<context>
@packages/auth/src/auth.ts
@apps/coach-web/src/features/auth/views/onboarding-view.tsx
@apps/coach-web/src/features/auth/components/org-form.tsx
@apps/coach-web/src/features/auth/components/auth-layout.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix JSON.parse error on organization metadata</name>
  <files>packages/auth/src/auth.ts</files>
  <action>
    In `afterCreateOrganization` hook (line 98), Better-Auth passes `org.metadata` as an object, not a JSON string.

    Change:
    ```typescript
    const metadata = org.metadata ? JSON.parse(org.metadata) : null
    ```

    To:
    ```typescript
    const metadata = org.metadata as { planId?: string } | null
    ```

    Note: The `as` cast is acceptable here because Better-Auth types metadata as `unknown` but we control what we pass in during organization creation.
  </action>
  <verify>
    1. `pnpm typecheck` passes
    2. Organization creation no longer throws 500 error
  </verify>
  <done>Organization creation succeeds without JSON.parse error</done>
</task>

<task type="auto">
  <name>Task 2: Fix onboarding layout for plan selection grid</name>
  <files>apps/coach-web/src/features/auth/views/onboarding-view.tsx</files>
  <action>
    The AuthLayout uses `max-w-md` (448px) which is too narrow for the 3-column plan grid.

    Replace the AuthLayout wrapper with a custom layout for onboarding that:
    1. Uses the same branding panel on the left (lg:grid-cols-2 layout)
    2. Uses `max-w-3xl` instead of `max-w-md` for the content area to fit 3 plan cards

    Change the return statement to use a custom layout instead of AuthLayout:

    ```tsx
    return (
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Panel - Branding (hidden on mobile) */}
        <div className="hidden flex-col items-center justify-center bg-primary p-12 text-primary-foreground lg:flex">
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <Dumbbell className="size-16" />
            </div>
            <div className="space-y-2">
              <h1 className="font-bold text-4xl">Strenly</h1>
              <p className="text-lg text-primary-foreground/90">
                Crea programas de entrenamiento tan rapido como en Excel
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Onboarding Content (wider than auth forms) */}
        <div className="flex flex-col items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-3xl space-y-6">
            <Card>
              {/* ... existing Card content ... */}
            </Card>
          </div>
        </div>
      </div>
    )
    ```

    Import `Dumbbell` from `lucide-react`.
    Remove the `AuthLayout` import since it's no longer used.
  </action>
  <verify>
    1. `pnpm typecheck` passes
    2. Onboarding page displays with proper width
    3. Plan cards in step 2 display in 3 columns on desktop without being squished
  </verify>
  <done>Plan selection step displays 3 cards properly without layout cramping</done>
</task>

<task type="auto">
  <name>Task 3: Fix slug auto-generation using callbacks (no useEffect)</name>
  <files>apps/coach-web/src/features/auth/components/org-form.tsx</files>
  <action>
    The current useEffect approach is problematic. Replace with pure callback approach:

    1. Add a ref to track if user manually edited slug:
    ```typescript
    const userEditedSlug = useRef(false)
    ```

    2. Remove the useEffect entirely (lines 42-46)

    3. Create onChange handlers for both inputs:
    ```typescript
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value
      // Auto-generate slug if user hasn't manually edited it
      if (!userEditedSlug.current) {
        setValue('slug', generateSlug(newName))
      }
    }

    const handleSlugChange = () => {
      userEditedSlug.current = true
    }
    ```

    4. Update the name input to use the callback:
    ```typescript
    {...register('name', {
      required: 'El nombre de la organizacion es obligatorio',
      minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres' },
      maxLength: { value: 50, message: 'El nombre no puede superar los 50 caracteres' },
      onChange: handleNameChange,
    })}
    ```

    5. Update the slug input to use the callback:
    ```typescript
    {...register('slug', {
      required: 'La URL es obligatoria',
      pattern: { value: /^[a-z0-9-]+$/, message: 'Solo puede contener letras minusculas, numeros y guiones' },
      minLength: { value: 2, message: 'La URL debe tener al menos 2 caracteres' },
      onChange: handleSlugChange,
    })}
    ```

    6. Remove `useEffect` import, add `useRef` import.
    7. Remove `watch` from useForm destructuring (no longer needed).
  </action>
  <verify>
    1. `pnpm typecheck` passes
    2. Typing in name field auto-generates slug continuously
    3. Once user manually edits slug field, auto-generation stops
    4. No useEffect in the component
  </verify>
  <done>Slug auto-generates via onChange callback, no useEffect used</done>
</task>

</tasks>

<verification>
1. `pnpm typecheck` passes for all packages
2. `pnpm lint` passes
3. Manual test: Complete full onboarding flow (coach type -> plan selection -> org creation)
4. Organization is created successfully
5. User is redirected to /{orgSlug}/dashboard
</verification>

<success_criteria>
- Organization creation returns 200, not 500
- Plan selection step displays 3 cards in a row without cramping on desktop
- Slug auto-generates continuously as user types name
- Full onboarding flow completes successfully
</success_criteria>
