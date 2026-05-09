# Phase 2 Context — Component Re-skin

## Phase goal

Tune `src/components/ui/*` and the layout chrome (sidebar, navigation, settings, theme toggle) so each visible primitive matches its Cursor spec from `DESIGN.md` §Components: button radius 8px with Cursor Orange CTA, cards 12px hairline-only, badges as pill, ink-on-cream contrast, no drop shadows.

## Locked decisions

### Component-by-component target

| Component | Source spec | Key change |
|---|---|---|
| `button.tsx` | `button-primary` / `button-secondary` / `button-download` / `button-tertiary-text` | Variants: `primary` → bg `--primary`, text `--on-primary`, height 40px, radius 8px. `secondary` → bg `--surface-card`, ink text, hairline-strong border. `download` → bg `--ink`, text `--canvas`, height 44px. `ghost`/`link` → tertiary text, no fill. Drop any drop-shadow utility. |
| `card.tsx` | `feature-card` / `comparison-card` / `testimonial-card` | Bg `--surface-card`, 1px `--hairline`, radius `--radius-lg` (12px), padding 24px, no shadow. |
| `input.tsx` | `text-input` | Bg `--surface-card`, ink text, radius 8px, height 44px, padding 12px×16px, hairline border, focus ring `--primary`. |
| `badge.tsx` | `badge-pill` | Bg `--surface-strong`, ink text, `text-caption-uppercase`, radius pill, padding 4px×10px. |
| `sidebar.tsx` | `top-nav` (closest analog) + Cursor neutrals | Bg `--canvas`, foreground `--ink`, sidebar-accent `--surface-card`, sidebar-border `--hairline`. Active item uses `--surface-strong` background, not Cursor Orange. |
| `navigation.tsx` | `top-nav` | Height 64px, ink text, `text-nav-link` (14px / 500). |
| `tabs.tsx` | (not directly specified, derive) | Tab list bg `--canvas-soft`, active tab bg `--surface-card`, text ink, hairline divider. |
| `dialog.tsx` / `sheet.tsx` / `alert-dialog.tsx` / `popover` | (derive from card) | Surface `--surface-card`, radius 12px, hairline border, no shadow — instead overlay scrim `rgba(38,37,30,0.32)`. |
| `select.tsx` / `combobox.tsx` / `dropdown-menu.tsx` | (derive from card + input) | Trigger uses input rules; menu uses card rules; selected row uses `--surface-strong`. |
| `tooltip.tsx` | (derive) | Bg `--ink`, text `--canvas`, radius 6px, `text-caption`. |
| `toggle.tsx` / `toggle-group.tsx` | (derive from button-secondary) | Bg `--surface-card`, ink text, hairline border, on-state bg `--surface-strong`. |
| `separator.tsx` | `hairline` | 1px `--hairline`. |
| `theme-toggle.tsx` | (derive) | Use `button-secondary` shape. |
| `notifications-popover.tsx` / `page-container.tsx` / `page-header-context.tsx` | (chrome) | Re-tune to Cursor neutrals; ensure 80px section rhythm via `--spacing-section: 5rem` if surfaces use it. |
| `field.tsx` / `label.tsx` | (derive) | Label uses `text-caption-uppercase`, ink color, 8px gap to input. |

### Cursor Orange discipline

- `--primary` (Cursor Orange) appears only on the *primary CTA* variant of `button-primary`, on focus rings, and (later) any wordmark. It must NOT appear on:
  - Sidebar active item background (uses `--surface-strong`)
  - Tab active state (uses `--surface-card` against `--canvas-soft`)
  - Toggle on-state (uses `--surface-strong`)
  - Selected dropdown row (uses `--surface-strong`)
- This is enforced by code review during Wave 3.

### Hairline-only depth

- All components drop `box-shadow` utilities. Elevation comes from 1px hairline + white-on-cream contrast.
- Drawer/dialog uses an overlay scrim, not a shadow.

### What this phase does NOT touch

- Code surfaces (json-viewer, sql-placeholder bodies, properties-converter output, record-protobuf code blocks, totp-generator code displays). Those move in Phase 3.
- Final deletion of legacy `--claude-*` tokens. Those remain as aliases until Phase 4.
- New components (timeline pills, IDE mockup card, hero band). Those are deferred.

## Open assumptions

- Existing components likely use Tailwind utility classes (`bg-card`, `bg-primary`, `text-foreground`) that already resolve through shadcn semantic tokens — most components should re-skin "for free" once Phase 1 lands. This phase is mostly about flushing out hard-coded `--claude-*` references and tuning radii / heights / variant naming.
- `class-variance-authority` (CVA) is in dependencies; expect button variants to be CVA maps that we update in place.
- Some components may have `shadow-*` classes — those need stripping per the no-shadow rule.

## Canonical refs

- `DESIGN.md` §Components, §Buttons, §Hero & IDE Mockups (skip), §Cards, §Forms & Tags, §CTA / Footer
- `src/components/ui/`
- `src/components/layout/`
- Phase 1 CONTEXT and PLAN

## Rejected options

- Adding a colored ribbon on featured cards — rejected; Cursor uses ink inversion, not color.
- Using Cursor Orange as the active-state color across nav/tabs/toggles — rejected; Cursor Orange stays scarce.
- Bringing back drop shadows for "elevation hierarchy" — rejected per the "hairline-only depth" rule.

## Deferred to later phases

- Code surface re-skin → Phase 3.
- Legacy token deletion → Phase 4.
- Visual QA across all routes → Phase 4.
