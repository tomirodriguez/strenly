# apps/coach-web

Desktop-first React SPA for strength coaches. Excel-like inline editing, keyboard navigation, dark mode.

## Structure

```
src/
  components/
    ui/                  # shadcn/ui primitives (auto-generated)
    {feature}/           # Feature-specific components
  hooks/                 # Custom React hooks
  lib/
    api-client.ts        # oRPC client configuration
    auth-client.ts       # Better-Auth client
    query-client.ts      # TanStack Query client
    utils.ts             # Utility functions (cn, etc.)
  routes/                # TanStack Router file-based routes
    __root.tsx           # Root layout with providers
    _authenticated.tsx   # Auth-required layout
    _authenticated/      # Protected routes
  main.tsx               # App entry point
```

## Relevant Skills

| Skill | Description |
|-------|-------------|
| `/orpc-query` | **Primary.** Query/mutation hooks with oRPC + TanStack Query. |
| `/form` | Forms with React Hook Form + shadcn Field. |
| `/data-table` | Tables with DataTable compound component. |
| `/mutation-errors` | Error handling in mutation hooks. |

## Conventions

- **Page components** in `routes/` — handle data fetching and layout
- **Feature components** in `components/{feature}/` — reusable within a feature
- **UI primitives** in `components/ui/` — shadcn/ui (auto-generated)

### Modal vs Drawer vs Page
- **Modal (Dialog):** Create/edit forms needing focused attention, confirmations, short workflows
- **Drawer (Sheet):** Contextual info panels, navigation on mobile
- **Dedicated page:** Complex multi-step forms where user needs full screen space

## Critical Rules

- **Import schemas from `@strenly/contracts`** — never define Zod schemas inline
- **Use oRPC hooks for API calls** — don't use raw fetch
- **Invalidate queries on mutations** — keep UI in sync
- **Handle loading and error states** — every data-fetching component needs them
- **Avoid `useEffect`** — prefer callbacks, event handlers, or derived state
- **Dark mode support** — use CSS variables and Tailwind dark: variants

## Development

```bash
pnpm dev:coach      # Start development server
pnpm typecheck      # Run TypeScript checks
pnpm lint           # Run Biome linter
```
