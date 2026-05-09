# Phase 3 Plan — Code Surfaces

## Wave 1 — Audit (parallel)

### 1.1 Inventory code surfaces
- **Action:** for each feature file listed in CONTEXT, read the file and locate every `<pre>`, `<code>`, `<textarea>`, and `prism-react-renderer` usage.
- **Expected output:** table at `.planning/phases/code-surfaces/audit.md` with file, surface (input/output), current styling, gap to spec.
- **Verification:** every feature has at least one row.

### 1.2 Confirm Prism integration shape
- **Action:** `rg -n "prism-react-renderer|Highlight|Prism" src` and read the wrapper(s).
- **Expected output:** note current Prism theme structure (if any) and decide whether to override at theme prop level or via CSS class targeting Prism token classes.
- **Verification:** decision recorded in audit.

## Wave 2 — Shared primitive

### 2.1 Add a shared code-pane utility
- **Action:** in `globals.css` `@layer utilities`, add `.code-pane` (bg `--canvas-soft`, text `--body`, font `var(--font-mono)`, 13px / 1.5, border 1px `--hairline`, radius 12px, padding 16px). Add `.code-pane-editable` extending `.code-pane` with `caret-color: var(--primary)` and `accent-color: var(--primary)` and selection styles.
- **Expected output:** two utility classes available globally.
- **Verification:** apply `.code-pane` to a temporary element; styles compose correctly.

### 2.2 Update `textarea-with-actions.tsx`
- **Action:** replace its current code-textarea styles with `code-pane-editable` plus action-button slot. Keep API stable.
- **Verification:** visit `/sql-placeholder` and confirm editable area styling.

## Wave 3 — Feature edits (parallel by route)

### 3.A `/json-viewer`
- **Action:** in `src/components/features/json-viewer.tsx`, route the JSON tree and raw view through `.code-pane`. Override Prism token colors per CONTEXT palette.
- **Verification:** dev → `/json-viewer`; paste a sample JSON; confirm fonts, surface, palette.

### 3.B `/sql-placeholder`
- **Action:** ensure both input and output use code-pane treatment. Highlight SQL via Prism with the bounded palette.
- **Verification:** dev → `/sql-placeholder`; paste a query with placeholders, render output.

### 3.C `/properties-converter`
- **Action:** update `properties-converter.tsx`, `env-line-item.tsx`, `env-output-list.tsx`. Source pane = editable `.code-pane-editable`; output rows on `.code-pane`.
- **Verification:** dev → `/properties-converter`; paste sample `.properties` and inspect.

### 3.D `/record-protobuf`
- **Action:** ensure the decoded output renders on `.code-pane` with mono.
- **Verification:** dev → `/record-protobuf`; decode a sample.

### 3.E `/totp-generator`
- **Action:** secret display + generated token displayed via `.code-pane` or inline mono token. The current 6-digit token can use a larger mono number — keep that, but ensure it sits on `--canvas-soft` not white.
- **Verification:** dev → `/totp-generator`.

### 3.F `/enhance-prompt`
- **Action:** prompt input → `.code-pane-editable`. Streaming output → `.code-pane`. Confirm AI streaming visuals still legible.
- **Verification:** dev → `/enhance-prompt`; trigger a streamed response.

## Wave 4 — Prism palette

### 4.1 Override Prism token colors globally
- **Action:** in `globals.css` `@layer utilities` (or a new `@layer base` block), target `.token.comment`, `.token.keyword`, `.token.string`, `.token.number`, `.token.boolean`, `.token.null`, `.token.function`, `.token.property`, `.token.punctuation`, `.token.operator` and assign per the CONTEXT palette.
- **Expected output:** consistent code coloring across all Prism-rendered code.
- **Verification:** spot-check JSON, SQL, properties; comments dim, strings peach, keywords orange, numbers mint.

## Wave 5 — Smoke

### 5.1 Cross-route visual smoke
- **Action:** dev-server walk-through across `/`, `/json-viewer`, `/sql-placeholder`, `/properties-converter`, `/record-protobuf`, `/totp-generator`, `/enhance-prompt`. Save findings to `.planning/phases/code-surfaces/smoke.md`.
- **Verification:** every code surface uses JetBrains Mono on `--canvas-soft` with hairline border.

### 5.2 Build + lint
- **Action:** `bun run lint && bun run build`.
- **Verification:** clean.

## Phase exit criteria

- A reusable `.code-pane` / `.code-pane-editable` utility exists and is consumed everywhere code is rendered.
- All feature routes show JetBrains Mono on `--canvas-soft`.
- Prism palette mapping is consistent across the app.
- Caret + selection use Cursor Orange in editable code surfaces.
- Build, lint, smoke pass.
