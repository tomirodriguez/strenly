---
status: diagnosed
trigger: "Investigate the athlete validation mismatch issue: Frontend validation passes (allows empty email), Backend rejects with VALIDATION_ERROR 500"
created: 2026-01-25T00:00:00Z
updated: 2026-01-25T00:00:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED - Empty string email passes contract validation but fails domain entity validation
test: Traced data flow from frontend -> contracts -> procedure -> use case -> domain entity
expecting: Found exact mismatch
next_action: Return diagnosis

## Symptoms

expected: Empty email should be consistently handled (either allowed or rejected) across frontend and backend
actual: Frontend validation passes with empty email, backend rejects with VALIDATION_ERROR 500 "Datos de atleta invalidos"
errors: VALIDATION_ERROR 500 "Datos de atleta invalidos"
reproduction: Create/edit athlete with empty email field
started: Unknown

## Eliminated

## Evidence

- timestamp: 2026-01-25T00:01:00Z
  checked: Frontend form (apps/coach-web/src/features/athletes/components/athlete-form.tsx)
  found: Uses createAthleteInputSchema from @strenly/contracts, email field shown as optional in UI (line 50-56)
  implication: Frontend validates against contracts schema

- timestamp: 2026-01-25T00:02:00Z
  checked: Contracts schema (packages/contracts/src/athletes/athlete.ts:50)
  found: email field allows empty string via `.optional().or(z.literal(''))` pattern
  implication: Empty string "" passes contract validation as a valid value

- timestamp: 2026-01-25T00:03:00Z
  checked: Procedure (packages/backend/src/procedures/athletes/create-athlete.ts:28)
  found: `email: input.email ?? null` - uses nullish coalescing, so empty string "" is NOT converted to null
  implication: Empty string "" is passed through to use case

- timestamp: 2026-01-25T00:04:00Z
  checked: Domain entity (packages/core/src/domain/entities/athlete.ts:52-55)
  found: `if (email !== null && !EMAIL_REGEX.test(email))` - validates non-null emails against regex
  implication: Empty string "" fails regex validation because it's not null and doesn't match email pattern

## Resolution

root_cause: |
  The data transformation chain creates a validation mismatch:
  1. Contract schema (line 50) allows empty string: `z.string().email().optional().or(z.literal(''))`
  2. Procedure (line 28) uses nullish coalescing: `input.email ?? null`
     - This only converts undefined/null to null, NOT empty string
     - Empty string "" passes through unchanged
  3. Domain entity (line 53) validates: `if (email !== null && !EMAIL_REGEX.test(email))`
     - Empty string "" is not null, so it's validated
     - Empty string "" fails the email regex, returning INVALID_EMAIL error

fix: Change procedure line 28 from `input.email ?? null` to `input.email || null` to treat empty strings as null
verification:
files_changed: []
