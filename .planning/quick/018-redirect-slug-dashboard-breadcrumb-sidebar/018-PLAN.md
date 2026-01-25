---
phase: quick
plan: 018
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/coach-web/src/routes/_authenticated/$orgSlug.tsx
  - apps/coach-web/src/components/layout/breadcrumbs.tsx
  - apps/coach-web/src/components/layout/app-header.tsx
  - apps/coach-web/src/components/layout/app-sidebar.tsx
autonomous: true

must_haves:
  truths:
    - "Navigating to /$orgSlug redirects to /$orgSlug/dashboard"
    - "Breadcrumbs always show 'Inicio' as first item linking to dashboard"
    - "Sidebar has a visible collapse trigger on desktop"
    - "Sidebar collapses to icon-only mode when triggered"
  artifacts:
    - path: "apps/coach-web/src/routes/_authenticated/$orgSlug.tsx"
      provides: "Redirect to dashboard"
    - path: "apps/coach-web/src/components/layout/breadcrumbs.tsx"
      provides: "Inicio as home breadcrumb"
    - path: "apps/coach-web/src/components/layout/app-header.tsx"
      provides: "Visible sidebar trigger"
    - path: "apps/coach-web/src/components/layout/app-sidebar.tsx"
      provides: "Collapsible sidebar"
  key_links:
    - from: "$orgSlug.tsx"
      to: "/$orgSlug/dashboard"
      via: "redirect in beforeLoad"
---

<objective>
Add redirect from /$orgSlug to /$orgSlug/dashboard, fix breadcrumb home to show "Inicio" linking to dashboard, and enable sidebar collapse on desktop.

Purpose: Improve navigation UX by ensuring users land on dashboard, have consistent breadcrumb navigation, and can collapse sidebar for more workspace.
Output: Updated route, breadcrumbs, header, and sidebar components.
</objective>

<execution_context>
@/Users/tomiardz/.claude/get-shit-done/workflows/execute-plan.md
@/Users/tomiardz/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/coach-web/src/routes/_authenticated/$orgSlug.tsx
@apps/coach-web/src/components/layout/breadcrumbs.tsx
@apps/coach-web/src/components/layout/app-header.tsx
@apps/coach-web/src/components/layout/app-sidebar.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add redirect and fix breadcrumbs</name>
  <files>
    apps/coach-web/src/routes/_authenticated/$orgSlug.tsx
    apps/coach-web/src/components/layout/breadcrumbs.tsx
  </files>
  <action>
1. In `$orgSlug.tsx`:
   - In `beforeLoad`, after validating org exists, add redirect to dashboard:
     ```typescript
     throw redirect({ to: '/$orgSlug/dashboard', params: { orgSlug: params.orgSlug } })
     ```
   - Remove the component since this route now only redirects

2. In `breadcrumbs.tsx`:
   - Replace current breadcrumb logic to always start with "Inicio" linking to `/${orgSlug}/dashboard`
   - Get orgSlug from useParams
   - Filter out the org slug segment from subsequent breadcrumb items
   - Keep the remaining breadcrumb items after "Inicio"
   - Example structure:
     - Dashboard page: Inicio (current page, no link)
     - Athletes page: Inicio > Atletas
     - Athlete detail: Inicio > Atletas > [Name]
  </action>
  <verify>
    - Navigate to `/{orgSlug}` - should redirect to `/{orgSlug}/dashboard`
    - Dashboard breadcrumb shows only "Inicio" (no link, current page)
    - Athletes page shows "Inicio > Atletas"
  </verify>
  <done>
    - /$orgSlug redirects to /$orgSlug/dashboard
    - All pages show "Inicio" as first breadcrumb item
    - Dashboard shows "Inicio" as current page (not a link)
  </done>
</task>

<task type="auto">
  <name>Task 2: Enable sidebar collapse on desktop</name>
  <files>
    apps/coach-web/src/components/layout/app-header.tsx
    apps/coach-web/src/components/layout/app-sidebar.tsx
  </files>
  <action>
1. In `app-sidebar.tsx`:
   - Change `<Sidebar collapsible="offExamples">` to `<Sidebar collapsible="icon">`
   - This enables the sidebar to collapse to icon-only mode

2. In `app-header.tsx`:
   - Remove `md:hidden` from `<SidebarTrigger className="md:hidden" />`
   - Keep it as `<SidebarTrigger />` or add styling as needed
   - Keep the separator visible on all screen sizes (remove `md:hidden` from Separator too)
  </action>
  <verify>
    - SidebarTrigger button visible on desktop
    - Clicking trigger collapses sidebar to icon-only mode
    - Clicking again expands sidebar
    - Nav items show only icons when collapsed
  </verify>
  <done>
    - Sidebar trigger visible on all screen sizes
    - Sidebar collapses to icon-only mode on desktop
    - Sidebar expands back to full mode when triggered again
  </done>
</task>

</tasks>

<verification>
1. Navigate to `/{orgSlug}` - redirects to `/{orgSlug}/dashboard`
2. Dashboard shows "Inicio" as breadcrumb (current page, no link)
3. Athletes page shows "Inicio > Atletas"
4. Sidebar trigger visible in header on desktop
5. Clicking sidebar trigger collapses sidebar to icons
6. Clicking again expands sidebar
7. Run `pnpm typecheck && pnpm lint` - passes
</verification>

<success_criteria>
- /$orgSlug automatically redirects to /$orgSlug/dashboard
- Breadcrumbs start with "Inicio" on all pages
- "Inicio" links to dashboard (except when on dashboard - shown as current)
- Sidebar can be collapsed/expanded on desktop via header trigger
- Collapsed sidebar shows only icons
</success_criteria>

<output>
After completion, create `.planning/quick/018-redirect-slug-dashboard-breadcrumb-sidebar/018-SUMMARY.md`
</output>
