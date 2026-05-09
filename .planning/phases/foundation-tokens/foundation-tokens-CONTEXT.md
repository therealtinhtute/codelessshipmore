# Phase 1 Context — Token Foundation

## Phase goal

Replace the active design-system tokens (colors, typography, radii, fonts) in `src/app/globals.css` and `src/app/layout.tsx` with the Cursor system described in `DESIGN.md`. Add the AI-timeline pastel palette as primitives even though no surface consumes them yet.

## Locked decisions

### Font strategy

- CursorGothic is licensed and unavailable. Use **Inter** (already imported) as the substitute for both display and body. Drop **Cormorant Garamond** entirely — the Cursor system is sans-only.
- Display runs Inter at **weight 400** with **negative letter-spacing** (-2.16px to -0.11px depending on size). Never bold.
- JetBrains Mono stays loaded and is mandatory on every code surface.
- Layout `layout.tsx` removes the `Cormorant_Garamond` import and `--font-display` variable.

### Color tokens (CSS custom properties)

Replace the `--claude-*` family with Cursor-aligned names. Final names live as primitives plus shadcn semantic mappings.

| Token | Value | Purpose |
|---|---|---|
| `--canvas` | `#f7f7f4` | Page floor (warm cream) |
| `--canvas-soft` | `#fafaf7` | IDE / code pane background |
| `--surface-card` | `#ffffff` | White card surface |
| `--surface-strong` | `#e6e5e0` | Badges, tag pills |
| `--ink` | `#26251e` | Display + body emphasis |
| `--body` | `#5a5852` | Default running text |
| `--muted` | `#807d72` | Sub-titles |
| `--muted-soft` | `#a09c92` | Disabled text |
| `--on-primary` | `#ffffff` | Text on Cursor Orange |
| `--primary` | `#f54e00` | Cursor Orange — CTA only |
| `--primary-active` | `#d04200` | Press state |
| `--hairline` | `#e6e5e0` | 1px divider |
| `--hairline-soft` | `#efeee8` | Lighter divider |
| `--hairline-strong` | `#cfcdc4` | Stronger panel outline |
| `--timeline-thinking` | `#dfa88f` | Peach — agent timeline only |
| `--timeline-grep` | `#9fc9a2` | Mint |
| `--timeline-read` | `#9fbbe0` | Pastel blue |
| `--timeline-edit` | `#c0a8dd` | Lavender |
| `--timeline-done` | `#c08532` | Warm gold |
| `--semantic-success` | `#1f8a65` | Confirmation |
| `--semantic-error` | `#cf2d56` | Validation error |

### Radius scale

Replace the single `--radius: 0.75rem` with a scale.

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | 4px | Inline tags |
| `--radius-sm` | 6px | Compact rows |
| `--radius-md` | 8px | CTA buttons, inputs |
| `--radius-lg` | 12px | Cards, IDE panes |
| `--radius-xl` | 16px | Larger feature cards |
| `--radius-pill` | 9999px | Timeline pills, badges |

shadcn defaults that read `--radius` (e.g. `--radius-sm: calc(var(--radius) - 4px)`) get rewritten to read concrete values from the new scale.

### Typography utilities

Replace the `.text-claude-*` and `.text-heading-*` / `.text-copy-*` (Geist) utilities with `.text-display-mega`, `.text-display-lg`, `.text-display-md`, `.text-display-sm`, `.text-title-md`, `.text-title-sm`, `.text-body-md`, `.text-body-tracked`, `.text-body-sm`, `.text-caption`, `.text-caption-uppercase`, `.text-code`, `.text-button`, `.text-nav-link` per the table in `DESIGN.md` §Typography.

Base element styles (`h1`–`h6`, `body`) re-derive from the new tokens; `h1`–`h3` move from serif to sans + negative tracking.

### shadcn semantic remap

`--background`, `--foreground`, `--primary`, `--card`, `--border`, `--ring`, `--sidebar*` keep their existing names but resolve to the new Cursor primitives:

- `--background` → `var(--canvas)`
- `--foreground` → `var(--ink)`
- `--card` → `var(--surface-card)`
- `--card-foreground` → `var(--ink)`
- `--primary` → `var(--primary)` (Cursor Orange)
- `--primary-foreground` → `var(--on-primary)`
- `--secondary` → `var(--surface-card)`
- `--muted` → `var(--surface-strong)`
- `--muted-foreground` → `var(--muted)`
- `--border` → `var(--hairline)`
- `--input` → `var(--surface-card)`
- `--ring` → `var(--primary)`
- Sidebar tokens mirror the above (sidebar = canvas, sidebar-accent = surface-card, sidebar-border = hairline).

### Dark mode

Keep `.dark` selector intact. Re-derive: `--background: #1a1916` (deep ink), `--foreground: var(--canvas)`, cards = elevated dark, border = `rgba(247,247,244,0.10)`. Cursor Orange and timeline pastels remain identical across modes. Cursor publishes no dark spec — mark this section in `globals.css` as "derived, not authoritative."

### Tokens to delete in this phase

- `--claude-*` family (canvas, surface-soft, surface-card, primary, primary-active, dark, dark-elevated, dark-soft, ink, body, body-strong, muted, muted-soft, hairline, hairline-soft, teal, amber, success, warning, error, parchment, ivory, warm-sand, terracotta, coral, near-black, charcoal-warm, olive-gray, stone-gray, dark-warm, warm-silver, dark-surface, border-cream, border-warm, border-dark, ring-warm, ring-deep, focus, primary-disabled).
- `--ds-*` Geist family (gray-100/400/700/800/1000, blue-700/800, purple-700, pink-800, red-800, amber-800, green-800, teal-800).
- `.bg-claude-*`, `.text-claude-*`, `.border-claude-*` utility classes.
- `.bg-ds-*`, `.text-ds-*`, `.border-ds-*` utility classes.
- `.text-claude-display`, `.text-claude-heading`, `.text-claude-subheading`, `.text-claude-feature-title`, `.text-claude-body-serif`, `.text-claude-body-lg`, `.text-claude-body`, `.text-heading-*`, `.text-copy-*`.

> Deleting these will break callsites. Phase 1 only deletes if zero callsites remain after grep; otherwise tokens stay until Phases 2–3 migrate the callsites, then Phase 4 deletes.

## Open assumptions (verify during work)

- shadcn's `tailwind.css` import (`@import "shadcn/tailwind.css";`) does not redefine these tokens with priority. If it does, ordering / overrides need adjustment.
- Tailwind v4's `@theme inline` block is the correct extension point for our token surface.
- `next/font/google` Inter import is the correct mechanism (already used).

## Canonical refs

- `DESIGN.md` — full token + typography spec
- `src/app/globals.css` — current design tokens
- `src/app/layout.tsx` — font wiring
- `components.json` — shadcn config (verify base color expectations)

## Rejected options

- Keeping Cormorant Garamond as a "fallback editorial display" — rejected because the Cursor voice is sans-only.
- Importing a custom CursorGothic file — rejected because it's licensed and not legally available to us.
- Adding all five timeline pill components in this phase — rejected because no host surface exists; only the tokens land here.

## Deferred to later phases

- Updating component callsites to consume the new tokens — Phases 2 and 3.
- Removing legacy `--claude-*` and `--ds-*` definitions — Phase 4 (after callsite migration).
