# shadcn v4 preset a1D2M5sH migration plan

## Goal
Adopt shadcn/ui preset `a1D2M5sH` in the existing Next.js + Tailwind v4 app, then improve the current feature components so they align with the new preset and existing shadcn composition rules without overwriting valuable local UI behavior.

## Scope
In scope:
- apply preset `a1D2M5sH` using a non-destructive merge-first workflow
- update config and global theme foundation affected by the preset
- selectively review and update installed shared UI primitives only where beneficial
- refactor the highest-value feature components to use current shared UI primitives consistently
- verify lint/build after the migration

Out of scope:
- full reinstall or forced overwrite of all shadcn components
- adding unrelated new product features
- route restructuring
- broad redesign of every page in the app
- introducing a parallel theming system

## Existing architecture fit
- Global theme and token definitions live in `src/app/globals.css`.
- Shared primitives live in `src/components/ui/*`.
- Product feature UIs live in `src/components/features/*`.
- The app already uses Tailwind v4 and shadcn-style source components, so the migration should build on that baseline rather than restart it.

## Implementation approach

### Step 1 — Apply the preset foundation in merge mode
Run shadcn init with preset `a1D2M5sH` in a non-reinstall mode so the preset updates config/CSS without blindly replacing all existing components.

Actions:
- run the shadcn preset init command using `bunx --bun shadcn@latest`
- avoid reinstall/overwrite behavior
- inspect changed config and `src/app/globals.css`
- keep only the custom theme tokens still needed by the app

Acceptance criteria:
- preset foundation is applied without a wholesale component overwrite
- `src/app/globals.css` remains valid Tailwind v4 theme syntax
- custom token carryover is intentional rather than accidental

### Step 2 — Audit shared UI primitives against upstream diffs
Review the installed components most affected by preset assumptions and upstream shadcn v4 conventions.

Priority components:
- `button`
- `card`
- `field`
- `select`
- `dialog`
- `sheet`
- `tabs`
- `sidebar`
- `badge`

Actions:
- use shadcn CLI dry-run and diff flows per component
- only merge upstream changes that improve consistency, accessibility, or compatibility with the preset
- preserve local APIs and styling behavior that feature code already depends on unless there is a clear reason to change them

Acceptance criteria:
- no unnecessary churn in `src/components/ui/*`
- shared primitives remain compatible with existing feature code
- component changes are selective and explainable

### Step 3 — Refactor the prompt enhancer screen to use proper shadcn composition
Clean up the most styling-heavy feature first: `src/components/features/enhance-prompt/prompt-enhancer.tsx`.

Actions:
- replace raw `Label` + loose layout groupings with `FieldGroup` and `Field`
- remove clickable `Badge`-as-toggle patterns in favor of a more suitable choice control pattern from the installed UI system
- remove hardcoded gradient/palette classes and use semantic tokens / component variants
- replace the raw checkbox area with proper field composition
- normalize button icons with `data-icon`

Acceptance criteria:
- the feature keeps the same behavior
- styling relies more on shared primitives and semantic tokens
- manual color classes are materially reduced

### Step 4 — Refactor the JSON viewer screen
Improve `src/components/features/json-viewer.tsx` so it aligns with the current shadcn component system.

Actions:
- replace the raw `<select>` with the shared `Select` composition
- replace `space-y-*` style layout stacks with `flex flex-col gap-*`
- normalize empty/error state presentation using card-compatible composition
- normalize icon placement and button usage

Acceptance criteria:
- existing JSON processing behavior is unchanged
- example selection uses the shared Select component
- layout and state presentation are more consistent with the rest of the app

### Step 5 — Refactor the properties converter screen
Improve `src/components/features/properties-converter.tsx` using the same preset-friendly composition approach.

Actions:
- replace loose form grouping with `FieldGroup` and `Field` where appropriate
- remove `space-y-*` usage in favor of gap-based layout
- normalize action rows, empty states, and error states to the shared design language
- review icon usage inside buttons and align with shadcn guidance

Acceptance criteria:
- converter behavior remains unchanged
- styling becomes more consistent with shared primitives
- screen-level custom styling is reduced

### Step 6 — Verify the migration
Run repository verification after implementation.

Validation commands:
- `bun run lint`
- `bun run build`

Manual checks:
- verify light and dark mode still render correctly
- verify prompt enhancer selection controls still work
- verify JSON example loading and mode switching still work
- verify properties converter conversion flows still work
- spot-check sidebar, cards, dialogs, and tabs after preset application

Acceptance criteria:
- build succeeds
- lint succeeds or only reports pre-existing unrelated issues
- the migrated screens remain functional and visually coherent

## Suggested file impact
- `src/app/globals.css` — preset token and theme updates
- `components.json` or equivalent shadcn config files if changed by init
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/field.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/sidebar.tsx`
- `src/components/ui/badge.tsx`
- `src/components/features/enhance-prompt/prompt-enhancer.tsx`
- `src/components/features/json-viewer.tsx`
- `src/components/features/properties-converter.tsx`

## Task breakdown
1. Apply preset `a1D2M5sH` in merge mode.
2. Inspect and reconcile global theme/token changes.
3. Diff the priority shared UI primitives and merge only needed updates.
4. Refactor `prompt-enhancer.tsx` to proper shared UI composition.
5. Refactor `json-viewer.tsx` to proper shared UI composition.
6. Refactor `properties-converter.tsx` to proper shared UI composition.
7. Run lint/build and perform manual UI checks.

## Risks and mitigations
- Risk: preset changes conflict with the custom Geist token layer in `src/app/globals.css`.
  - Mitigation: treat custom token retention as an explicit review step, not an automatic carryover.
- Risk: selective component updates drift from upstream in inconsistent ways.
  - Mitigation: only touch components with clear value and preserve stable local APIs.
- Risk: feature screens break if primitive markup expectations change.
  - Mitigation: refactor the three targeted screens immediately after primitive review.
- Risk: styling regressions appear in dark mode.
  - Mitigation: include dark mode in manual verification and favor semantic tokens over custom color classes.

## Definition of done
- Preset `a1D2M5sH` is applied without a full reinstall.
- Global theme configuration is aligned with the preset and still supports required app styling.
- Shared UI primitives are updated only where worthwhile.
- `prompt-enhancer.tsx`, `json-viewer.tsx`, and `properties-converter.tsx` use more consistent shadcn composition.
- Manual color-heavy custom styling is reduced.
- `bun run lint` is executed.
- `bun run build` is executed.
