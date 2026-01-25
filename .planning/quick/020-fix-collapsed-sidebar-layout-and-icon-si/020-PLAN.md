---
phase: quick
plan: 020
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/coach-web/src/components/ui/sidebar.tsx
  - apps/coach-web/src/components/layout/app-sidebar.tsx
autonomous: true

must_haves:
  truths:
    - "Collapsed sidebar shows only centered icons without text leaking"
    - "Icons are appropriately sized for the item height (20px for h-12 items)"
    - "Header shows logo icon only when collapsed"
    - "Footer shows avatar only when collapsed"
  artifacts:
    - path: "apps/coach-web/src/components/ui/sidebar.tsx"
      provides: "Fixed collapsed width and icon sizing"
    - path: "apps/coach-web/src/components/layout/app-sidebar.tsx"
      provides: "Responsive header/footer content"
  key_links:
    - from: "sidebar.tsx"
      to: "app-sidebar.tsx"
      via: "CSS data-attributes for collapsible=icon state"
---

<objective>
Fix collapsed sidebar layout issues: icons too small, text leaking, content cut off.

Purpose: Provide a clean, usable collapsed sidebar state with properly sized icons and no visible text.
Output: Collapsed sidebar shows centered icons only; expanded shows full content.
</objective>

<execution_context>
@/Users/tomiardz/.claude/get-shit-done/workflows/execute-plan.md
@/Users/tomiardz/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/coach-web/src/components/ui/sidebar.tsx
@apps/coach-web/src/components/layout/app-sidebar.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix sidebar.tsx collapsed state dimensions and icon sizes</name>
  <files>apps/coach-web/src/components/ui/sidebar.tsx</files>
  <action>
Fix the following issues in sidebar.tsx:

1. **Increase collapsed width** (line 21):
   - Change `SIDEBAR_WIDTH_ICON = '4rem'` to `SIDEBAR_WIDTH_ICON = '5rem'` (80px)
   - This accommodates h-12 (48px) items with proper padding

2. **Fix sidebarMenuButtonVariants** (lines 443-463):
   - Change base class `[&_svg]:size-4` to `[&_svg]:size-5` (20px icons)
   - Remove `group-data-[collapsible=icon]:size-8!` from base (keep h-12 height when collapsed)
   - For size="lg" variant, add proper collapsed centering:
     ```
     lg: 'h-12 text-sm group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0!'
     ```
   - The items should stay h-12 when collapsed but center the icon

3. **Ensure text is hidden when collapsed**:
   - The existing `overflow-hidden` + narrow width should clip text
   - Verify `[&>span:last-child]:truncate` works with collapsed width
  </action>
  <verify>
Run `pnpm typecheck` - no errors.
Visually inspect: collapsed sidebar items are h-12 squares with centered 20px icons.
  </verify>
  <done>
Collapsed sidebar items maintain height, center icons, hide text via overflow.
  </done>
</task>

<task type="auto">
  <name>Task 2: Make app-sidebar.tsx header and footer collapse-aware</name>
  <files>apps/coach-web/src/components/layout/app-sidebar.tsx</files>
  <action>
Fix the SidebarHeader and SidebarFooter to adapt when collapsed:

1. **SidebarHeader** (lines 89-96):
   - Hide "STRENLY" text when collapsed using `group-data-[collapsible=icon]:hidden`
   - Keep only the logo icon visible
   ```tsx
   <SidebarHeader className="h-16 border-sidebar-border border-b">
     <div className="flex h-full items-center gap-2 px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
       <div className="flex size-8 items-center justify-center rounded-md bg-primary">
         <ZapIcon className="size-5 text-primary-foreground" />
       </div>
       <span className="font-bold text-xl tracking-tight group-data-[collapsible=icon]:hidden">STRENLY</span>
     </div>
   </SidebarHeader>
   ```

2. **SidebarFooter** (lines 151-164):
   - When collapsed, show only the avatar (no name, email, more icon)
   - Add collapse-aware classes to hide text and center avatar
   ```tsx
   <SidebarFooter className="border-sidebar-border border-t p-4 group-data-[collapsible=icon]:p-2">
     <DropdownMenu>
       <DropdownMenuTrigger className="w-full outline-none">
         <div className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-0">
           <Avatar className="size-9">
             <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
           </Avatar>
           <div className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
             <p className="truncate font-semibold text-sm">{user.name ?? 'Usuario'}</p>
             <p className="truncate text-muted-foreground text-xs">{user.email}</p>
           </div>
           <MoreVerticalIcon className="size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
         </div>
       </DropdownMenuTrigger>
       {/* ... dropdown content unchanged ... */}
     </DropdownMenu>
   </SidebarFooter>
   ```

Note: `group-data-[collapsible=icon]:*` classes work because the parent Sidebar element has `data-collapsible="icon"` when collapsed.
  </action>
  <verify>
Run `pnpm typecheck` - no errors.
Visually inspect:
- Collapsed header shows only the Zap logo icon, centered
- Collapsed footer shows only the avatar, centered
- Expanded state shows full content as before
  </verify>
  <done>
Header and footer adapt to collapsed state, showing only icons when collapsed.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Fixed collapsed sidebar with proper icon sizes and hidden text</what-built>
  <how-to-verify>
1. Start dev server: `pnpm dev:coach`
2. Open http://localhost:5173/{orgSlug}/dashboard
3. Press Cmd+B (or click sidebar trigger) to collapse sidebar
4. Verify:
   - Sidebar collapses to ~80px width
   - Nav items show only centered icons (size-5, 20px)
   - Header shows only the blue Zap logo icon
   - Footer shows only the avatar
   - No text is visible/leaking
5. Press Cmd+B again to expand
6. Verify:
   - All text labels appear
   - Icons remain size-5 (20px)
   - Header shows "STRENLY" text
   - Footer shows full user info
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- `pnpm typecheck` passes
- Collapsed sidebar shows only icons, no text leakage
- Icons are 20px (size-5) in both states
- Header/footer adapt correctly to collapsed state
</verification>

<success_criteria>
- Collapsed sidebar is visually clean with centered icons
- No text visible when collapsed
- Smooth transition between expanded and collapsed
- Maintains functionality (navigation, dropdown menu)
</success_criteria>

<output>
After completion, create `.planning/quick/020-fix-collapsed-sidebar-layout-and-icon-si/020-SUMMARY.md`
</output>
