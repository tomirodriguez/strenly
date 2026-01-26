---
phase: quick
plan: 022
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/coach-web/src/components/ui/sidebar.tsx
  - apps/coach-web/src/components/layout/app-shell.tsx
autonomous: true

must_haves:
  truths:
    - "Page content scrolls within the content area only"
    - "Sidebar and header remain fixed during scroll"
    - "Horizontal overflow is contained within content area"
  artifacts:
    - path: "apps/coach-web/src/components/ui/sidebar.tsx"
      provides: "Fixed viewport height and overflow containment"
    - path: "apps/coach-web/src/components/layout/app-shell.tsx"
      provides: "Scrollable main content container"
  key_links:
    - from: "SidebarProvider wrapper"
      to: "SidebarInset"
      via: "flexbox containment chain"
      pattern: "h-svh.*flex.*min-h-0.*overflow"
---

<objective>
Fix App Shell scroll containment so scroll occurs only within the content area, not the entire shell.

Purpose: Currently the entire page scrolls when content overflows, causing the sidebar and header to scroll off-screen. The proper behavior is for only the main content area to scroll while sidebar and header remain fixed.

Output: Modified sidebar.tsx and app-shell.tsx with proper flexbox containment chain.
</objective>

<execution_context>
@/Users/tomiardz/.claude/get-shit-done/workflows/execute-plan.md
@/Users/tomiardz/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/coach-web/src/components/ui/sidebar.tsx
@apps/coach-web/src/components/layout/app-shell.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix flexbox containment chain for scroll isolation</name>
  <files>
    apps/coach-web/src/components/ui/sidebar.tsx
    apps/coach-web/src/components/layout/app-shell.tsx
  </files>
  <action>
    **Problem:** The current layout allows content to expand the entire shell, causing whole-page scroll.

    **Root cause analysis:**
    1. `SidebarProvider` wrapper has `min-h-svh` but no `h-svh` - allows growth beyond viewport
    2. `SidebarInset` has `flex-1` but no `min-h-0` - flex items default to `min-height: auto`, preventing shrink
    3. `main` in AppShell has `flex-1` but no `overflow-auto` - content expands parent instead of scrolling

    **Fix in sidebar.tsx - SidebarProvider wrapper (line ~126):**
    Change: `min-h-svh w-full`
    To: `h-svh w-full`

    This constrains the entire shell to exactly viewport height.

    **Fix in sidebar.tsx - SidebarInset (line ~284-285):**
    Add `min-h-0 overflow-hidden` to the className:
    ```
    'relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background ...'
    ```

    `min-h-0` allows the flex item to shrink below its content size.
    `overflow-hidden` prevents content from expanding this container.

    **Fix in app-shell.tsx - main element (line ~30):**
    Change: `className="flex flex-1 flex-col p-4 md:p-8"`
    To: `className="flex min-h-0 flex-1 flex-col overflow-auto p-4 md:p-8"`

    `min-h-0` allows shrinking within flex parent.
    `overflow-auto` makes this the scrollable container.

    **The complete containment chain:**
    ```
    SidebarProvider (h-svh, fixed height)
      -> SidebarInset (flex-1, min-h-0, overflow-hidden)
        -> AppHeader (fixed height)
        -> main (flex-1, min-h-0, overflow-auto) <- scrolls here
    ```
  </action>
  <verify>
    1. Open the coach web app at http://localhost:5173
    2. Navigate to a page with enough content to overflow (programs grid or athletes list)
    3. Scroll down - only the main content area should scroll
    4. Verify sidebar remains fixed on the left
    5. Verify header remains fixed at the top
    6. Add content wider than viewport - horizontal scroll should be contained in content area
    7. Run `pnpm typecheck` - no type errors
  </verify>
  <done>
    - Sidebar remains fixed during vertical scroll
    - Header remains fixed during vertical scroll
    - Horizontal overflow scrolls only within content area
    - No layout shift or visual glitches
  </done>
</task>

</tasks>

<verification>
- Navigate to programs page with grid - scroll behavior correct
- Navigate to athletes page with long list - scroll behavior correct
- Sidebar and header remain visible at all scroll positions
- No visual regressions in layout
- `pnpm typecheck && pnpm lint` passes
</verification>

<success_criteria>
- Scroll is isolated to content area only
- Sidebar and header are fixed/sticky during scroll
- Both horizontal and vertical scroll contained within content
- No TypeScript or lint errors
</success_criteria>

<output>
After completion, create `.planning/quick/022-fix-app-shell-scroll-containment/022-SUMMARY.md`
</output>
