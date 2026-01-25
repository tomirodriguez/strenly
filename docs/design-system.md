# Strenly Design System

This document defines the design tokens and visual language for the Strenly coach web application.

## Color Palette

### Dark Mode (Primary Theme)

| Token | Color | Hex | OKLCH | Usage |
|-------|-------|-----|-------|-------|
| `--background` | Slate 950 | #0f172a | oklch(0.129 0.042 264.695) | Page background |
| `--card` | Slate 900 | #1e293b | oklch(0.208 0.042 265.755) | Card, popover, elevated surfaces |
| `--border` | Slate 800 | #334155 | oklch(0.279 0.041 264.532) | Borders, dividers, inputs |
| `--muted-foreground` | Slate 500 | #64748b | oklch(0.554 0.046 257.417) | Secondary text, placeholders |
| `--foreground` | White | #ffffff | oklch(0.985 0 0) | Primary text |
| `--primary` | Blue 600 | #2563eb | oklch(0.546 0.245 262.881) | Primary actions, active states |
| `--destructive` | Red 500 | - | oklch(0.704 0.191 22.216) | Destructive actions, errors |

### Sidebar Tokens

| Token | Color | Usage |
|-------|-------|-------|
| `--sidebar` | Slate 950 | Sidebar background |
| `--sidebar-primary` | Blue 600 | Active nav item background |
| `--sidebar-accent` | Slate 800 | Hover state background |
| `--sidebar-border` | Slate 800 | Sidebar borders |

## Typography

- **Font Family:** Inter Variable
- **Sizes:** text-xs (10px), text-sm (14px), text-base (16px), text-lg (18px), text-xl (20px), text-2xl (24px)
- **Weights:** font-medium (500), font-semibold (600), font-bold (700)

## Component Usage

### Buttons

| Variant | Usage | Example |
|---------|-------|---------|
| `default` | Primary actions | Save, Submit, Create |
| `secondary` | Secondary actions | Cancel, Back |
| `outline` | Tertiary actions | Filter, Sort |
| `ghost` | Icon buttons, subtle actions | Search, Notification |
| `destructive` | Dangerous actions | Delete, Remove |

### Cards

Use `bg-card` for elevated surfaces. Cards should have:
- `border border-border` for definition
- `rounded-xl` for corners
- `p-6` for padding
- `shadow-sm` optional for subtle elevation

### Forms

- Inputs use `bg-input` (same as border for dark mode)
- Focus ring uses `ring-primary` (blue-600)
- Labels use `text-foreground`
- Helper text uses `text-muted-foreground`

### Navigation

- Active nav items: `bg-sidebar-primary text-sidebar-primary-foreground font-medium`
- Inactive nav items: `text-muted-foreground`
- Hover state: `bg-sidebar-accent text-sidebar-accent-foreground`

## Layout

### Sidebar
- Width: 240px (16rem)
- Fixed left position
- Border right: `border-r border-sidebar-border`

### Header
- Height: 64px (h-16)
- Sticky top with backdrop blur
- Contains: breadcrumb, search, notifications, primary CTA

### Content Area
- Padding: p-4 (mobile), p-8 (desktop)
- Max width: max-w-7xl for wide screens

## Icons

Use Lucide React icons with:
- Size: `size-4` (16px) for inline, `size-5` (20px) for icon buttons
- Color: inherit from text color

## Accessibility

- Maintain 4.5:1 contrast ratio for text
- Blue-600 on slate-950 passes WCAG AA
- Use `sr-only` for icon button labels
- Focus rings use blue-600 (`ring-primary`)

## Implementation Notes

### Theme Provider
The app defaults to dark mode. Theme is controlled via `.dark` class on `<html>`.

### CSS Variables
All colors use OKLCH format for perceptually uniform lightness. Variables are defined in `apps/coach-web/src/index.css`.

### Tailwind Usage
Use semantic tokens (`bg-background`, `text-primary`) instead of raw colors (`bg-slate-950`, `text-blue-600`).
