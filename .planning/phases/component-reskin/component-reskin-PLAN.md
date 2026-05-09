# Phase 2 Plan — Component Re-skin

## Wave 1 — Read pass (parallel)

### 1.1 Read all `src/components/ui/*` files
- **Action:** open each of: `button.tsx`, `card.tsx`, `input.tsx`, `badge.tsx`, `tabs.tsx`, `dialog.tsx`, `sheet.tsx`, `alert-dialog.tsx`, `select.tsx`, `combobox.tsx`, `dropdown-menu.tsx`, `tooltip.tsx`, `toggle.tsx`, `toggle-group.tsx`, `separator.tsx`, `field.tsx`, `label.tsx`, `input-group.tsx`, `scroll-area.tsx`, `skeleton.tsx`, `textarea.tsx`, `toaster.tsx`, `sidebar.tsx`.
- **Expected output:** notes per component listing: hard-coded `--claude-*` refs, `shadow-*` utilities, hard-coded radii (`rounded-md`/`rounded-lg`/`rounded-xl`), variant maps that need tuning.
- **Verification:** notes saved to `.planning/phases/component-reskin/audit.md`.

### 1.2 Read layout chrome
- **Action:** read `src/components/layout/sidebar.tsx`, `navigation.tsx`, `notifications-popover.tsx`, `page-container.tsx`, `page-header-context.tsx`, `theme-toggle.tsx`.
- **Expected output:** same audit form.
- **Verification:** notes appended to the same audit doc.

## Wave 2 — Component edits (parallel; one PR-style group per component)

Group A — primitives:

### 2.A.1 `button.tsx`
- **Action:** update CVA variant map. `default`/`primary` → `bg-[--primary] text-[--on-primary] hover:bg-[--primary-active] h-10 px-[18px] rounded-md text-button`. `secondary` → `bg-[--surface-card] text-[--ink] border border-[--hairline-strong] h-10 rounded-md`. `download` (new variant) → `bg-[--ink] text-[--canvas] h-11 px-5 rounded-md`. `ghost`/`link` → tertiary text style. Strip any `shadow-*` classes.
- **Expected output:** new variant map; old shadow utilities gone.
- **Verification:** dev → `/`; primary CTA renders Cursor Orange at 40px height, 8px radius.

### 2.A.2 `card.tsx`
- **Action:** set base classes to `bg-card text-card-foreground rounded-lg border border-[--hairline] p-6`; remove shadows.
- **Verification:** dev → `/settings`; cards visibly hairline-only on cream.

### 2.A.3 `input.tsx` + `textarea.tsx` + `field.tsx` + `label.tsx`
- **Action:** input/textarea bg `--surface-card`, ink text, `rounded-md` (8px), `h-11` for input, `px-4 py-3`, focus ring `--primary`. Label uses `text-caption-uppercase` color `--ink`. Field stack uses 8px gap.
- **Verification:** dev → `/settings` form fields render at 44px height with hairline border.

### 2.A.4 `badge.tsx`
- **Action:** base = `bg-[--surface-strong] text-[--ink] text-caption-uppercase rounded-pill px-2.5 py-1`. Drop colored variants unless used; if used, map to neutral by default.
- **Verification:** dev → wherever a badge appears (search for `<Badge`); pill shape, uppercase 11px tracked.

Group B — overlays:

### 2.B.1 `dialog.tsx` + `alert-dialog.tsx` + `sheet.tsx` + `tooltip.tsx` + `popover` (`notifications-popover.tsx`)
- **Action:** content surface `bg-[--surface-card] rounded-lg border border-[--hairline]`; remove `shadow-*`. Overlay scrim `bg-[rgba(38,37,30,0.32)]`. Tooltip = `bg-[--ink] text-[--canvas] rounded-sm text-caption`.
- **Verification:** open a dialog (e.g. settings or alert); confirm scrim + hairline panel.

Group C — selection:

### 2.C.1 `select.tsx` + `combobox.tsx` + `dropdown-menu.tsx` + `tabs.tsx` + `toggle.tsx` + `toggle-group.tsx`
- **Action:** trigger reuses input style; menu surface reuses card style. Active/selected row bg = `--surface-strong` (NOT `--primary`). Tabs list bg `--canvas-soft`, active tab bg `--surface-card` with hairline.
- **Verification:** dev → `/settings` (tabs) + any select; active states are neutral surface, not orange.

Group D — chrome:

### 2.D.1 `sidebar.tsx` (layout)
- **Action:** sidebar bg `--canvas`, foreground `--body`, active item bg `--surface-strong` ink text, sidebar border `--hairline`. Drop any `--claude-*` direct refs in favor of shadcn semantic tokens.
- **Verification:** dev → all routes; sidebar reads cream-on-cream with subtle active state.

### 2.D.2 `navigation.tsx` + `page-header-context.tsx` + `page-container.tsx` + `theme-toggle.tsx`
- **Action:** nav height 64px, links use `text-nav-link`. Page container max-width 1200px, section padding `5rem` (80px). Theme toggle reuses `button-secondary`.
- **Verification:** dev → page header chrome on `/json-viewer` (or any route) renders at 64px with editorial neutrals.

## Wave 3 — Cursor Orange discipline pass

### 3.1 Grep for accidental Cursor Orange usage
- **Action:** `rg -n "bg-primary|bg-\[--primary\]|primary-foreground" src/components` and review every match. Outside of `button.tsx` primary variant and focus rings, replace with `--surface-strong` or remove.
- **Expected output:** Cursor Orange appears only on (a) primary CTA, (b) focus rings, (c) wordmark / logo if any.
- **Verification:** documented exception list in `.planning/phases/component-reskin/orange-callsites.md`.

## Wave 4 — Smoke test

### 4.1 Lint + build + dev
- **Action:** `bun run lint && bun run build`, then `bun run dev` and visit `/`, `/settings`, `/json-viewer`, `/sql-placeholder`, `/totp-generator`, `/properties-converter`, `/record-protobuf`, `/enhance-prompt`.
- **Expected output:** every primitive on these pages adopts the Cursor look (cream surfaces, ink text, 8px CTAs, 12px cards, hairline-only).
- **Verification:** screenshots or a checklist saved to `.planning/phases/component-reskin/smoke.md`.

### 4.2 Dark mode spot check
- **Action:** toggle dark theme on `/`, `/settings`. Confirm sidebar, primary button, and dialogs render coherently.
- **Verification:** no white-on-white or invisible text issues; orange remains the same hex.

## Phase exit criteria

- All `src/components/ui/*` and layout components consume shadcn semantic tokens (no direct `--claude-*` references in JSX class strings).
- Buttons render Cursor Orange at 8px radius for primary, 8px radius secondary on cream.
- Cards render hairline-only at 12px radius.
- No drop shadows remain in components.
- Active/selected states use `--surface-strong`, not Cursor Orange.
- Build, lint, and visual smoke pass.
