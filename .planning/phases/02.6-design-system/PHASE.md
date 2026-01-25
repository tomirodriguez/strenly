# Phase 2.6: Design System & Visual Refresh

## Goal

Transform the coach web app visual identity to match the dark, professional aesthetic with blue primary accent, establishing a consistent design system for all future development.

## Depends On

Phase 2.5 (Coach Web Foundation)

## Success Criteria

1. App uses dark slate color palette (slate-950 background, slate-900 surfaces, slate-800 borders)
2. Primary color is blue-600 (#2563eb) used for active states, buttons, and accent elements
3. Sidebar matches reference design with icon + label navigation, section dividers, and user profile footer
4. Header has breadcrumb navigation, search/notification icons, and primary action button
5. All existing UI components (DataTable, forms, modals) work correctly with new design tokens
6. Design tokens documented in docs/design-system.md for future development consistency

## Visual Reference

Reference design: `docs/ux-ui/dashboard-look-and-feel.png` and `.html`

Key characteristics:
- Background: `#0f172a` (slate-950)
- Surface: `#1e293b` (slate-900) with `#334155` (slate-800) borders
- Primary: `#2563eb` (blue-600)
- Text: white primary, slate-400 secondary, slate-500 tertiary
- Font: Inter
- Nav items: rounded-lg, subtle hover states
- Cards: rounded-xl with subtle borders
- Stat cards: icon badges with color tint backgrounds (blue-500/10, etc.)

## Scope

### In Scope
- CSS custom properties (tokens) update in index.css
- Sidebar component redesign (app-sidebar.tsx)
- Header/app-shell redesign
- Button, Card, Badge, Input, Select, Dialog component styling updates
- DataTable styling updates
- Design system documentation

### Out of Scope
- New features or pages
- Dashboard widget implementation (stats, activity feed)
- Backend changes
- Athlete PWA styling (separate phase)

## Technical Approach

1. **Update CSS tokens** - Replace oklch neutral values with slate palette, add blue primary
2. **Update component variants** - Adjust shadcn components to use new tokens properly
3. **Redesign layout** - Update app-shell.tsx and app-sidebar.tsx structure
4. **Test all screens** - Verify login, onboarding, athletes, exercises pages render correctly
5. **Document** - Create design-system.md with color, typography, spacing, component guidelines

## Estimated Plans

3-4 plans:
1. Design tokens + base styles (CSS variables, tailwind config)
2. Layout components (sidebar, header, app-shell)
3. UI components (button, card, input, badge, dialog, etc.)
4. Design system documentation + verification
