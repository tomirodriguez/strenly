# TanStack Router File-Based Routing

When creating new routes in `src/frontend/routes/`

## Layout vs Index Routes

TanStack Router uses file-based routing with specific conventions for layouts and index routes.

### Critical Rule

**If a directory `foo/` exists with child routes, a sibling `foo.tsx` becomes a LAYOUT route.**

Layout routes MUST render `<Outlet />` to display child routes. If they don't, child routes will never appear.

### When to Use Each Pattern

| Pattern | Use When | Example |
|---------|----------|---------|
| `foo.tsx` alone | Simple page, no nested routes | `dashboard.tsx` |
| `foo/index.tsx` | Page at `/foo` with sibling routes in same directory | `ddjj/index.tsx` + `ddjj/$accountId.tsx` |
| `foo.tsx` + `foo/` | Layout wrapper for nested routes (shared UI) | `_authenticated.tsx` + `_authenticated/$orgSlug/` |

### Correct Patterns

**Pattern 1: Sibling routes (no shared layout)**

When you have multiple routes at the same level that don't share layout UI:

```
taxpayerId/
  ddjj/
    index.tsx           # Matches /ddjj/
    $accountId.tsx      # Matches /ddjj/$accountId
```

Both routes are siblings. Navigation between them works correctly.

**Pattern 2: Layout route with children**

When child routes share common UI (sidebar, tabs, etc.):

```
taxpayers/
  $taxpayerId.tsx       # Layout with <Outlet />
  $taxpayerId/
    overview.tsx        # Child route
    settings.tsx        # Child route
```

The `$taxpayerId.tsx` layout wraps all children and MUST contain `<Outlet />`.

### Common Mistake

**WRONG:**
```
taxpayerId/
  ddjj.tsx              # This becomes a layout (no Outlet)
  ddjj/
    $accountId.tsx      # Never renders!
```

When `ddjj/` directory exists, `ddjj.tsx` is treated as a layout. Without `<Outlet />`, the child `$accountId.tsx` never renders.

**FIX:**
```
taxpayerId/
  ddjj/
    index.tsx           # Matches /ddjj/
    $accountId.tsx      # Matches /ddjj/$accountId (works!)
```

### Route Path Conventions

| File | Route Path in createFileRoute |
|------|-------------------------------|
| `foo.tsx` | `'/path/to/foo'` |
| `foo/index.tsx` | `'/path/to/foo/'` (trailing slash) |
| `foo/$param.tsx` | `'/path/to/foo/$param'` |

### This Codebase Examples

**Correct sibling pattern (DDJJ):**
```
src/frontend/routes/_authenticated/$orgSlug/taxpayers/$taxpayerId/ddjj/
  index.tsx           # TaxpayerDDJJView (accounts list)
  $accountId.tsx      # AccountDeclarationView (form)
```

**Correct layout pattern (authenticated):**
```
src/frontend/routes/
  _authenticated.tsx        # AuthenticatedLayout with <Outlet />
  _authenticated/
    $orgSlug.tsx            # OrgLayout with <Outlet />
    $orgSlug/
      dashboard.tsx         # Page component
```

### Decision Checklist

Before creating a route, ask:

1. **Will there be child routes in a subdirectory?**
   - YES with shared UI -> Create layout (must have `<Outlet />`)
   - YES without shared UI -> Use `index.tsx` in the subdirectory
   - NO -> Simple `foo.tsx` is fine

2. **Does a subdirectory already exist?**
   - YES -> You MUST either:
     - Add `<Outlet />` to render children (layout pattern)
     - Move your file into the directory as `index.tsx` (sibling pattern)

### Verification

After creating routes, run:

```bash
pnpm vite build  # Regenerates route tree
pnpm typecheck   # Ensures routes are valid
```

Check `src/frontend/routeTree.gen.ts` to verify routes are registered correctly.
