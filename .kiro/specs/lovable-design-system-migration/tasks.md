# Implementation Plan: Lovable Design System Migration

## Overview

Migrate the CodelessShipMore application from the Cursor Design System to the Lovable-inspired Design System. The implementation follows a safe incremental order: font loading first, then token layer, then component updates, then utility replacement, then cleanup and verification.

## Tasks

- [x] 1. Set up font infrastructure
  - [x] 1.1 Add Camera Plain Variable font file and update font loader in layout.tsx
    - Download/place `CameraPlainVariable.woff2` in `public/fonts/`
    - Replace `Inter` import from `next/font/google` with `localFont` from `next/font/local`
    - Configure weight axis `"400 600"`, `font-display: swap`, CSS variable `--font-sans`
    - Define fallback stack: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
    - Rename JetBrains Mono variable from `--font-code` to `--font-mono`
    - Update `<html>` className to use new variable names
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. Rewrite token layer in globals.css
  - [x] 2.1 Update `@theme inline` block with Lovable primitives and remove Cursor-specific mappings
    - Replace `--font-sans: var(--font-inter)` with `--font-sans: var(--font-sans)`
    - Replace `--font-mono: var(--font-code)` with `--font-mono: var(--font-mono)`
    - Remove Cursor primitive color mappings (`--color-canvas-soft`, `--color-primary-active`, `--color-ink-elevated`, `--color-ink-soft`, `--color-muted-soft`, `--color-hairline-soft`, `--color-timeline-*`, `--color-semantic-*`)
    - Add Lovable primitive mappings (`--color-ink`, `--color-body`, `--color-canvas`)
    - Keep radius scale unchanged
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_

  - [x] 2.2 Rewrite `:root` selector with Lovable light mode primitives and shadcn token mappings
    - Replace all Cursor primitive values with Lovable values (canvas `#f7f4ed`, ink `#1c1c1c`, body `#5f5f5d`, etc.)
    - Define opacity gray scale (`--gray-3`, `--gray-4`, `--gray-40`, `--gray-82`, `--gray-83`, `--gray-100`)
    - Define shadow custom properties (`--shadow-inset`, `--shadow-focus`)
    - Map all shadcn semantic tokens to Lovable palette values
    - Remove Cursor-specific tokens (`--timeline-*`, `--primary-active`, `--ink-elevated`, `--ink-soft`, `--semantic-*`, `--canvas-soft`, `--muted-soft`)
    - Update chart tokens to use Lovable palette colors
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10_

  - [x] 2.3 Rewrite `.dark` selector with Lovable dark mode tokens
    - Set dark canvas to warm dark `#1c1a16` (hsl ~45°, 10% lightness)
    - Set dark ink to `#f7f7f4`, body to `#d4d2cc`, muted-fg to `#a8a59c`
    - Define dark borders using cream at opacity 0.06/0.10/0.18
    - Set card surface to `#242219` (3% lighter than canvas)
    - Map all dark mode shadcn semantic tokens
    - Define dark sidebar tokens
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 9.11_

- [x] 3. Checkpoint - Verify token layer compiles
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Update base layer and typography
  - [x] 4.1 Update `@layer base` styles for Lovable typography
    - Update heading styles (h1: 60px/600/1.1/-1.5px, h2: 48px/600/1.0/-1.2px, h3: 36px/600/1.1/-0.9px)
    - Update body element font-family reference
    - Update Prism syntax highlighting tokens to use Lovable palette colors (replace `--primary`, `--timeline-thinking`, `--timeline-grep` references)
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.8, 4.9, 11.6_

  - [x] 4.2 Replace `@layer utilities` with Lovable typography utilities and code-pane styles
    - Remove all Cursor typography utilities (`.text-display-mega`, `.text-display-lg`, `.text-display-md`, `.text-display-sm`, `.text-title-md`, `.text-title-sm`, `.text-body-md`, `.text-body-tracked`, `.text-body-sm`, `.text-caption`, `.text-caption-uppercase`, `.text-code`, `.text-button`, `.text-nav-link`)
    - Add Lovable typography utilities (`.text-display-hero`, `.text-display-section`, `.text-display-sub`, `.text-card-title`, `.text-body`, `.text-button`, `.text-caption`)
    - Remove timeline pill utilities (`.timeline-pill`, `.timeline-pill-thinking`, `.timeline-pill-grep`, `.timeline-pill-read`, `.timeline-pill-edit`, `.timeline-pill-done`)
    - Replace `.code-pane` and `.code-pane-editable` with Lovable-styled equivalents
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.10, 11.1, 11.2, 11.3_

- [x] 5. Update shadcn/ui components
  - [x] 5.1 Update button.tsx with Lovable variants and inset shadow
    - Replace `buttonVariants` with Lovable variant map (default, outline, secondary, ghost, destructive, link, pill)
    - Remove `claude`, `claude-primary`, `claude-dark` variants
    - Apply `shadow-[var(--shadow-inset)]` to default and pill variants
    - Update base classes for opacity-based hover/active transitions
    - Update size variants (default, sm, lg, icon)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [x] 5.2 Update card.tsx with Lovable border-only styling
    - Replace `cardVariants` — remove `claude` and `dark` variants
    - Add size variants (default, sm, featured, compact) with appropriate border-radius
    - Apply `border border-border` with no box-shadow
    - Update `CardTitle` to remove `text-display-md` reference (use `text-card-title`)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 5.3 Update input.tsx with Lovable focus style
    - Replace className with Lovable styling: `bg-background`, `border border-border`, `rounded-sm`
    - Update focus style to `focus-visible:outline-2 focus-visible:outline-[rgba(59,130,246,0.5)] focus-visible:outline-offset-2`
    - Set placeholder color to `text-muted-foreground`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 6. Create sidebar logo component and update sidebar
  - [x] 6.1 Create `src/components/layout/sidebar-logo.tsx`
    - Implement `SidebarLogo` component with `collapsed` prop
    - Load SVG from mintcdn URL
    - Implement `onError` fallback to neutral placeholder div
    - Apply `h-7 w-auto` sizing with collapsed-state handling
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 6.2 Update sidebar.tsx to use SidebarLogo and fix utility class references
    - Replace the orange circle/asterisk logo element with `<SidebarLogo collapsed={isCollapsed} />`
    - Replace `text-display-sm` with `text-card-title`
    - Replace `text-display-md` in `SidebarInsetContent` with `text-display-sub`
    - _Requirements: 8.2, 11.5_

- [x] 7. Update all component references to removed utilities
  - [x] 7.1 Update page.tsx and feature components to use Lovable utility classes
    - Replace `text-display-mega` → `text-display-hero` in `src/app/page.tsx`
    - Replace `text-display-lg` → `text-display-section` in `src/app/page.tsx`
    - Replace `text-display-sm` → `text-card-title` where used
    - Replace `text-body-sm` → `text-caption` where used
    - Replace `text-title-sm` → Tailwind `text-base font-semibold` where used
    - Replace `text-caption-uppercase` → remove or use `text-caption` with manual uppercase
    - Replace `text-code` → `font-mono` where used
    - Remove references to `bg-timeline-grep`, `bg-timeline-read`, `text-muted-soft`
    - _Requirements: 11.3, 11.5_

  - [x] 7.2 Update feature components to replace `claude` button/card variants
    - In `json-viewer.tsx`: replace `variant="claude"` with `variant="outline"` on buttons and remove variant on cards (use default)
    - In `sql-placeholder.tsx`: same replacements
    - In `totp-generator.tsx`: same replacements
    - In `properties-converter.tsx`: same replacements
    - In `record-protobuf.tsx`: same replacements
    - In `provider-card.tsx`: same replacements
    - _Requirements: 11.5, 2.13_

  - [x] 7.3 Update dialog.tsx to use Lovable typography class
    - Replace `text-display-md` with `text-display-sub` in dialog title
    - _Requirements: 11.5_

- [x] 8. Checkpoint - Verify build passes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Final verification
  - [x] 9.1 Run `next build` and verify zero errors and no Tailwind warnings about undefined theme values
    - Grep for any remaining references to removed Cursor tokens in `.tsx` and `.css` files
    - Verify no references to `--timeline-*`, `--primary-active`, `--ink-elevated`, `--ink-soft` remain
    - Verify no references to `.timeline-pill*` classes remain
    - Confirm build completes successfully
    - _Requirements: 2.13, 11.4, 11.5, 11.6_

## Notes

- Tasks are ordered for safe incremental migration: font → tokens → components → references → verification
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation between major phases
- The `claude` and `claude-primary`/`claude-dark` button variants are replaced by `outline` (for `claude`) and `default` (for `claude-primary`/`claude-dark`)
- Card `claude` variant maps to the new `default` variant (border-only, no shadow)
- Typography utility class renames follow the mapping table in the design document

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3"] },
    { "id": 3, "tasks": ["4.1", "4.2"] },
    { "id": 4, "tasks": ["5.1", "5.2", "5.3"] },
    { "id": 5, "tasks": ["6.1"] },
    { "id": 6, "tasks": ["6.2", "7.1", "7.2", "7.3"] },
    { "id": 7, "tasks": ["9.1"] }
  ]
}
```
