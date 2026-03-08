# Brainstorm: shadcn/ui v4 preset a1D2M5sH

## Question
How should this app adopt shadcn/ui v4 preset `a1D2M5sH` and improve existing components without unnecessarily overwriting working product UI?

## Research
- The project already runs Tailwind v4 and shadcn-style source components (`src/app/globals.css`, `src/components/ui/*`).
- shadcn CLI v4 supports switching an existing app to a new preset by rerunning `init --preset <code>`.
- Preset switches can update config, fonts, CSS variables, and installed components.
- shadcn guidance for preset switching offers three practical modes:
  1. reinstall everything
  2. merge config/CSS then selectively update components
  3. skip component reinstalls and only change config/CSS

## Current codebase observations

### Good baseline
- Tailwind v4 `@theme inline` is already in place in `src/app/globals.css:7`.
- Shared UI primitives already use modern shadcn patterns like `data-slot` and plain React component props in files such as:
  - `src/components/ui/button.tsx:7`
  - `src/components/ui/card.tsx:5`
  - `src/components/ui/field.tsx:10`
  - `src/components/ui/select.tsx:9`
- The app already centralizes most design language through semantic tokens in `src/app/globals.css:72` and `.dark` at `src/app/globals.css:129`.

### Friction with a clean preset adoption
- `src/app/globals.css:49` onward contains a custom Geist-specific token layer mixed into the same theme file. A preset swap will likely collide here first.
- Feature UIs still bypass current shadcn composition rules in multiple places:
  - raw `<select>` instead of shared `Select` in `src/components/features/json-viewer.tsx:177`
  - raw layout stacks like `space-y-*` in `src/components/features/json-viewer.tsx:166`, `src/components/features/properties-converter.tsx:137`, and `src/components/features/enhance-prompt/prompt-enhancer.tsx:153`
  - clickable `Badge` used as filter chips in `src/components/features/enhance-prompt/prompt-enhancer.tsx:169`, `:256`, `:276`, `:296`
  - raw checkbox in `src/components/features/enhance-prompt/prompt-enhancer.tsx:377`
  - custom error/empty state markup instead of tighter shadcn composition in several feature files
- Some current UI code leans on custom color styling instead of semantic preset-driven tokens, especially in `src/components/features/enhance-prompt/prompt-enhancer.tsx:172-176`, `:259-263`, `:279-283`, `:299-303`.

## Design goals
- Keep the app’s routes and behaviors unchanged.
- Adopt the new preset at the design-system level first.
- Preserve working customizations where they add product value.
- Refactor feature screens to compose existing shared components instead of ad hoc styling.
- Avoid a destructive full overwrite unless the diff is proven safe.

## Options

### Option A — Full reinstall from preset
Run preset init with reinstall/force semantics and replace components wholesale.

**Pros**
- Fastest path to exact preset parity.
- Lowest manual merge effort.
- Best if the current component source is mostly disposable.

**Cons**
- High blast radius.
- Likely overwrites local component tweaks in `src/components/ui/*`.
- Risks unplanned visual regressions across all tools.

**Verdict**
- Too aggressive for this repo.

### Option B — Preset merge, then targeted component updates
Apply preset config/CSS, inspect diffs for installed components, then selectively merge component source where upstream changes help.

**Pros**
- Safest balance of consistency and control.
- Lets the theme/fonts/radius/tokens move to the new preset first.
- Keeps local component APIs stable while improving internals incrementally.

**Cons**
- Requires disciplined diff review.
- Some visual inconsistency remains until feature screens are cleaned up.

**Verdict**
- Best default path.

### Option C — Preset tokens only, no component updates
Adopt preset config and globals only, leave all component source as-is, then refactor screens later.

**Pros**
- Very low risk.
- Good first checkpoint.

**Cons**
- Leaves value on the table if the preset expects newer component source.
- Can create partial adoption where shared primitives lag behind the theme.

**Verdict**
- Acceptable fallback if component diff quality is poor.

## Recommended approach
Choose **Option B: preset merge + targeted updates**.

### Why
- The repo already has a functioning shared UI layer, so a full reinstall is unnecessary.
- The biggest quality gains are not only in primitives, but in how feature screens compose them.
- Most visual inconsistency appears to come from feature-level custom markup, not from the base primitives themselves.

## Proposed rollout

### Phase 1 — Adopt preset foundation
- Re-run shadcn init with preset `a1D2M5sH` in non-reinstall mode.
- Inspect resulting changes to config and `src/app/globals.css`.
- Preserve only the minimum custom token layer needed by the app.
- Decide whether Geist-specific variables should survive, be renamed, or be removed.

### Phase 2 — Audit installed shared components
Review each installed component against upstream diff, especially:
- `button`
- `card`
- `field`
- `select`
- `dialog`
- `sheet`
- `tabs`
- `sidebar`
- `badge`

Update only where preset or upstream changes materially improve consistency or accessibility.

### Phase 3 — Refactor feature screens to preset-friendly composition
Highest-value screens to clean first:
1. `src/components/features/enhance-prompt/prompt-enhancer.tsx`
2. `src/components/features/json-viewer.tsx`
3. `src/components/features/properties-converter.tsx`

Key refactors:
- replace raw form layout with `FieldGroup` + `Field`
- replace raw `<select>` with shared `Select`
- replace clickable `Badge` chips with a more appropriate choice control pattern
- remove custom gradient color classes in favor of semantic tokens and component variants
- replace ad hoc empty/error blocks with consistent card/field/alert-style composition
- normalize icon placement with `data-icon`

### Phase 4 — Verify
- run `bun run lint`
- run `bun run build`
- visually spot-check the main tools and dark mode

## Design notes for the preset migration
- The preset should own the app’s theme language; feature screens should stop hardcoding color identities.
- The current globals file is doing two jobs: shadcn semantic theme + custom Geist brand system. Splitting “app semantic tokens” from “tool-specific visual helpers” will reduce future preset friction.
- Cards and forms should become the dominant composition primitives. Right now some screens still behave like independently styled mini-apps.

## Risks
- Preset init may modify fonts and radius assumptions used across the app.
- Custom token utilities in `src/app/globals.css:220` may no longer align with the preset’s visual language.
- Some screens may look worse before feature-level cleanup if only the preset foundation changes first.

## Success criteria
- New preset is active at the token/config layer.
- Shared primitives remain stable or improve.
- Feature screens use consistent shadcn composition patterns.
- Manual color styling is materially reduced.
- Build and lint remain green or only show unrelated pre-existing issues.

## Recommendation summary
Use the preset, but **do not reinstall everything**. Apply the preset foundation first, then improve the app by refactoring feature components toward the existing shared shadcn primitives and only selectively updating primitive source files.
