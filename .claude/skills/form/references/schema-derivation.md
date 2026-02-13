# Schema Derivation from Contracts

Form schemas MUST be derived from contracts in `@/contracts`, NOT redefined inline. Contracts are the single source of truth for validation logic.

## Why Contract-First?

- **Single source of truth** - Validation logic lives in one place
- **Automatic propagation** - Changes to contracts update all forms
- **API consistency** - Form and API validation guaranteed to match
- **Spanish messages** - Error messages consistent everywhere

## Patterns

### Pick Fields from Contract

When form needs a subset of contract fields:

```tsx
import { createTaxpayerInputSchema } from '@/contracts/taxpayer/create-taxpayer'

// CORRECT - derive from contract
const formSchema = createTaxpayerInputSchema.pick({
  name: true,
  fiscalPeriod: true
})

// WRONG - duplicate validation
const formSchema = z.object({
  name: z.string().min(1, 'Requerido'),  // Duplicates contract!
  fiscalPeriod: z.number(),
})
```

### Omit Fields Not in Form

When form doesn't need certain fields (e.g., IDs from route/context):

```tsx
import { setInitialBalanceInputSchema } from '@/contracts/account/set-initial-balance'

// Form doesn't need accountId (comes from route params)
const balanceFormSchema = setInitialBalanceInputSchema.omit({ accountId: true })
```

### Extend for UI-Only Fields

When form needs extra fields for display that aren't sent to API:

```tsx
import { instrumentPositionInputSchema } from '@/contracts/declaration/update-declaration'

// Add display-only field for UI
const formInstrumentSchema = instrumentPositionInputSchema.extend({
  instrumentName: z.string().optional(), // UI display only, stripped before API call
})
```

### Compose from Multiple Contracts

When form combines schemas from different contracts:

```tsx
import {
  cashPositionInputSchema,
  instrumentPositionInputSchema
} from '@/contracts/declaration/update-declaration'

const declarationFormSchema = z.object({
  cashPosition: cashPositionInputSchema,
  instrumentPositions: z.array(instrumentPositionInputSchema.extend({
    instrumentName: z.string().optional(), // UI-only
  })),
  markComplete: z.boolean(), // Form-specific field
})
```

### Partial for Edit Forms

When edit form makes all fields optional:

```tsx
import { createAthleteInputSchema } from '@/contracts/athlete/create-athlete'

// Edit form - all fields optional
const editFormSchema = createAthleteInputSchema.partial()

// Edit form - some fields required
const editFormSchema = createAthleteInputSchema.partial().required({
  name: true
})
```

## Common Mistakes

### Redefining Validation

```tsx
// BAD - duplicates contract validation
const formSchema = z.object({
  arsBalance: z.string().optional().refine(
    (val) => !val || /^-?\d+(\.\d{1,2})?$/.test(val),
    { message: 'Ingrese un numero valido' }
  ),
})

// GOOD - derive from contract
import { setInitialBalanceInputSchema } from '@/contracts/account/set-initial-balance'
const formSchema = setInitialBalanceInputSchema.omit({ accountId: true })
```

### Different Validation Rules

```tsx
// BAD - form has different regex than contract
const formSchema = z.object({
  amount: z.string().regex(/^\d+$/, 'Solo numeros'), // Different from contract!
})

// GOOD - use contract's validation
import { amountInputSchema } from '@/contracts/common/amount'
const formSchema = z.object({
  amount: amountInputSchema,
})
```

### Forgetting UI-Only Fields

```tsx
// When form needs display data not in contract
const formSchema = contractSchema.extend({
  // Explicitly mark UI-only fields
  displayLabel: z.string().optional(),  // For select display
  _tempId: z.string().optional(),       // For field arrays
})

// Strip before sending to API
const apiData = {
  ...formData,
  displayLabel: undefined,
  _tempId: undefined,
}
```

## When No Contract Exists

If form is purely frontend (no API call), define schema locally. But if form submits to API:

1. First check if contract exists in `@/contracts`
2. If not, consider if one should be created (use `/contracts` skill)
3. Only define locally if truly form-specific with no API equivalent
