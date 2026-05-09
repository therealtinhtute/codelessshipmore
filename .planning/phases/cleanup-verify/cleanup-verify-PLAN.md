# Phase 4 Plan — Cleanup & Verification

## Wave 1 — Callsite safety net (parallel)

### 1.1 Grep for legacy token references
- **Action:** run each in parallel:
  - `rg -n "claude-" src`
  - `rg -n "ds-gray|ds-blue|ds-purple|ds-pink|ds-red|ds-amber|ds-green|ds-teal" src`
  - `rg -n "font-display|--font-serif|font-serif" src`
  - `rg -n "text-heading-|text-copy-" src`
  - `rg -n "Cormorant" src`
- **Expected output:** save all results to `.planning/phases/cleanup-verify/leftover-callsites.md`.
- **Verification:** if any non-trivial callsite remains, patch it before proceeding to Wave 2 (small edits stay in this phase; big surfaces send the work back to Phase 2 or 3).

### 1.2 Grep for `box-shadow` / `shadow-*` inside the design layer
- **Action:** `rg -n "shadow-(sm|md|lg|xl|2xl|inner|none)" src`.
- **Expected output:** any remaining shadow utilities in components.
- **Verification:** strip shadows from any non-overlay component (overlays already use scrim, not shadow).

## Wave 2 — Token deletions (sequential)

### 2.1 Delete legacy color aliases in `globals.css`
- **Action:** in `:root`, remove every `--claude-*` line (canvas, surface-soft, surface-card, surface-cream-strong, primary, primary-active, primary-disabled, dark, dark-elevated, dark-soft, ink, body-strong, body, muted, muted-soft, hairline, hairline-soft, teal, amber, success, warning, error, parchment, ivory, warm-sand, terracotta, coral, near-black, charcoal-warm, olive-gray, stone-gray, dark-warm, warm-silver, dark-surface, border-cream, border-warm, border-dark, ring-warm, ring-deep, focus). Remove every `--ds-*` line.
- **Expected output:** `:root` block contains only Cursor primitives + shadcn semantic mappings + sidebar/chart tokens.
- **Verification:** `bun run build` succeeds; visual smoke unchanged.

### 2.2 Delete legacy aliases in `.dark`
- **Action:** remove `--ds-*` dark redefinitions. Keep only the Cursor-derived dark palette set in Phase 1.
- **Verification:** dev → toggle dark; sidebar, primary CTA, dialogs render correctly.

### 2.3 Delete legacy `@theme inline` mappings
- **Action:** remove `--color-claude-*` and `--color-ds-*` lines from the `@theme inline` block. Remove `--font-serif: var(--font-display);`. Keep Cursor-aligned `--color-*` references and the new `--font-mono` / `--font-sans` mapping.
- **Verification:** `bun run build` succeeds.

### 2.4 Delete legacy utility classes
- **Action:** in `@layer utilities`, remove `.bg-claude-*`, `.text-claude-*`, `.border-claude-*`, `.bg-ds-*`, `.text-ds-*`, `.border-ds-*`, `.text-claude-display`, `.text-claude-heading`, `.text-claude-subheading`, `.text-claude-subheading-sm`, `.text-claude-feature-title`, `.text-claude-body-serif`, `.text-claude-body-lg`, `.text-claude-body`, `.text-heading-*`, `.text-copy-*`. Keep `.code-pane` / `.code-pane-editable` and the new Cursor typography utilities from Phase 1.
- **Verification:** `bun run build` succeeds; spot-check that no removed class is referenced by a component.

### 2.5 Decide on `.grid-*` Geist utilities
- **Action:** `rg -n "grid-container|grid-full|grid-half|grid-third|grid-quarter" src` — if zero callsites, delete. If used, rename to neutral names (e.g. `.grid-12`, `.col-full`, `.col-half`) and update callsites.
- **Verification:** grep returns clean.

## Wave 3 — Doc updates (parallel)

### 3.1 Update `DESIGN.md` status header
- **Action:** add a `## Implementation Status` section near the top listing: implemented (tokens, typography, components, code surfaces), deferred (hero-band, IDE mockup card, pricing tier, CTA band, agent timeline UI, CursorGothic font).
- **Expected output:** readers know which spec sections are live in code and which are aspirational.
- **Verification:** the section is concise; no spec content is rewritten.

### 3.2 Update `ARCHITECTURE.md`
- **Action:** if the file describes the design-token layer or font wiring, update it to reference the Cursor system. If the file does not mention design tokens, leave it alone.
- **Verification:** diff is minimal.

## Wave 4 — Visual + functional QA

### 4.1 Light-mode walkthrough
- **Action:** `bun run dev`. Visit `/`, `/settings`, `/json-viewer`, `/sql-placeholder`, `/properties-converter`, `/record-protobuf`, `/totp-generator`, `/enhance-prompt`. For each, exercise primary interactions (paste sample, run conversion, open dialog, change setting).
- **Expected output:** filled-out matrix in `.planning/phases/cleanup-verify/qa-matrix.md` with PASS / regression notes per row.
- **Verification:** every row PASSes or has a tracked follow-up.

### 4.2 Dark-mode walkthrough
- **Action:** toggle dark; repeat the same routes and interactions.
- **Verification:** no invisible text, no white-on-white, primary CTA orange unchanged across themes.

### 4.3 Lint + build + typecheck
- **Action:** `bun run lint && bun run build`.
- **Verification:** clean. Capture any warnings.

### 4.4 Bundle / font sanity check
- **Action:** in dev, open Network panel; confirm Inter + JetBrains Mono load and Cormorant Garamond does NOT.
- **Verification:** font-family count matches expectations.

## Wave 5 — Wrap up

### 5.1 Stage and review
- **Action:** stop. The skill does not commit. Suggest `review` for quality gates, then `git` to stage and commit, then `watzup` or `handoff` for end-of-session capture.

## Phase exit criteria

- No `--claude-*` or `--ds-*` token survives in `globals.css`.
- No legacy utility classes survive (`text-claude-*`, `text-heading-*`, `text-copy-*`, `bg-ds-*`, etc.).
- Cormorant Garamond is fully gone (import + variable + utility).
- `DESIGN.md` has an `Implementation Status` section.
- QA matrix is filled and clean across light + dark on every route.
- `bun run lint && bun run build` succeed.
