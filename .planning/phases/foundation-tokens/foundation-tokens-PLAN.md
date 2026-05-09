# Phase 1 Plan — Token Foundation

## Wave 1 — Audit (parallel)

### 1.1 Inventory current token callsites
- **Action:** `rg -n "claude-|ds-|--claude|--ds-|font-display|Cormorant|text-heading-|text-copy-" src` and save the output to `.planning/phases/foundation-tokens/audit.txt`.
- **Expected output:** complete list of files referencing tokens slated for removal/rename.
- **Verification:** open `audit.txt`; confirm coverage includes `globals.css`, `layout.tsx`, `components/ui/*`, `components/layout/*`, feature components.

### 1.2 Confirm shadcn import surface
- **Action:** read `components.json` and `node_modules/shadcn/tailwind.css` (or wherever `@import "shadcn/tailwind.css"` resolves) to confirm it does not override our `@theme inline` tokens with `!important` or reordering.
- **Expected output:** note in CONTEXT confirming or correcting the assumption.
- **Verification:** the `:root` block in `globals.css` wins for all custom-property names.

## Wave 2 — Token rewrite (sequential, single file)

### 2.1 Rewrite `:root` in `src/app/globals.css`
- **Action:** replace the `--claude-*` and `--ds-*` blocks with the Cursor primitives table from CONTEXT. Keep the legacy `--claude-*` aliases pointing at new primitives temporarily so Phase 2 callsites don't break before they're migrated. Add `--canvas`, `--canvas-soft`, `--surface-card`, `--surface-strong`, `--ink`, `--body`, `--muted`, `--muted-soft`, `--on-primary`, `--primary` (`#f54e00`), `--primary-active` (`#d04200`), `--hairline`, `--hairline-soft`, `--hairline-strong`, `--timeline-thinking`, `--timeline-grep`, `--timeline-read`, `--timeline-edit`, `--timeline-done`, `--semantic-success`, `--semantic-error`.
- **Expected output:** `:root` section reorganized; legacy `--claude-*` aliases retained as thin pointers to new primitives.
- **Verification:** `bun run build` succeeds; visually load `/` in dev — page renders without console errors.

### 2.2 Rewrite radius scale and shadcn semantic mappings
- **Action:** in the `@theme inline` block, replace the `--radius-*` calc-based scale with concrete values per CONTEXT. Re-point `--background`, `--foreground`, `--card`, `--primary`, etc. to the new primitives. Remove `--radius: 0.75rem`.
- **Expected output:** shadcn semantic tokens resolve to Cursor primitives; radii are explicit.
- **Verification:** sample a button (`/`) and a card (`/settings`) — borders and corners visibly use 8px CTA / 12px card.

### 2.3 Rewrite dark mode block
- **Action:** in the `.dark` block, set `--background` to a deep ink derived from `--ink` (`#1a1916`), `--foreground` to `--canvas`, card/popover to a single elevated dark surface, border to `rgba(247,247,244,0.10)`. Drop `--ds-*` dark redefinitions. Add comment: "Dark palette derived; Cursor brand has no published dark spec."
- **Expected output:** dark mode renders coherent without `--ds-*` or `--claude-dark-*` references.
- **Verification:** toggle theme in dev; spot-check sidebar, primary button, and a card.

## Wave 3 — Typography + fonts (parallel)

### 3.1 Rewrite typography utility classes in `globals.css`
- **Action:** delete `.text-claude-*` and `.text-heading-*` / `.text-copy-*` (Geist) utility classes. Add `.text-display-mega`, `.text-display-lg`, `.text-display-md`, `.text-display-sm`, `.text-title-md`, `.text-title-sm`, `.text-body-md`, `.text-body-tracked`, `.text-body-sm`, `.text-caption`, `.text-caption-uppercase`, `.text-code`, `.text-button`, `.text-nav-link` per the typography table in `DESIGN.md`. Each utility uses Inter (sans) except `.text-code` which uses JetBrains Mono.
- **Expected output:** new utility set lives in `@layer utilities`; Cursor letter-spacing values applied (e.g. `letter-spacing: -2.16px` on display-mega).
- **Verification:** apply `text-display-mega` on a temporary `<h1>` in `/` page and visually confirm size + tracking.

### 3.2 Rewrite base element styles in `globals.css`
- **Action:** in `@layer base`, change `h1`–`h3` from `var(--font-serif)` to `var(--font-sans)`; set weight 400, negative tracking per spec. Update `body` to use `--font-sans`. Update `code, pre, .font-mono` to keep JetBrains Mono unchanged.
- **Expected output:** headings render in Inter 400 with negative tracking; body in Inter 400.
- **Verification:** spot-check `/` and `/settings`; headings should look editorial sans, not serif.

### 3.3 Drop Cormorant Garamond from `src/app/layout.tsx`
- **Action:** remove the `Cormorant_Garamond` import and instance, drop `--font-display`/`cormorantGaramond.variable` from `<html className>`. Remove `--font-serif: var(--font-display);` mapping in `globals.css` `@theme inline`.
- **Expected output:** only Inter and JetBrains Mono load via `next/font/google`.
- **Verification:** Network tab in dev shows no Cormorant font request; `bun run build` succeeds.

## Wave 4 — Smoke test

### 4.1 Run dev server visual smoke
- **Action:** `bun run dev`, open `/`, `/settings`, `/json-viewer`, `/sql-placeholder` in light + dark.
- **Expected output:** pages render; primary buttons visible in Cursor Orange (still on old shape until Phase 2); no console errors; no missing-token CSS warnings.
- **Verification:** screenshot or note observed regressions; flag any blocker for Phase 2.

### 4.2 Run lint + build
- **Action:** `bun run lint && bun run build`.
- **Expected output:** both succeed.
- **Verification:** zero new lint warnings tied to design-system changes.

## Phase exit criteria

- `globals.css` contains the Cursor primitives, new radius scale, new typography utilities, and a re-derived dark mode.
- `layout.tsx` no longer imports Cormorant Garamond.
- Shadcn semantic tokens resolve to Cursor primitives.
- Legacy `--claude-*` aliases remain as thin pointers (deletion happens in Phase 4 after callsite migration).
- `bun run build` and dev visual smoke pass.
