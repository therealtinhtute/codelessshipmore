# Phase 4 Context — Cleanup & Verification

## Phase goal

Now that callsites consume Cursor primitives via shadcn semantic tokens, remove the legacy `--claude-*` and `--ds-*` token families, dead utility classes, and the unused Cormorant font path. Run a full visual + functional QA across light + dark on every route, then update repo docs to reflect what's actually shipped.

## Locked decisions

### What gets deleted

In `src/app/globals.css`:

- All `--claude-*` token aliases left in `:root` and `.dark` (now unused after Phases 1–3).
- All `--ds-*` (Geist) token definitions in `:root` and `.dark`.
- All `.bg-claude-*`, `.text-claude-*`, `.border-claude-*` utility classes.
- All `.bg-ds-*`, `.text-ds-*`, `.border-ds-*` utility classes.
- All `.text-claude-display`, `.text-claude-heading`, `.text-claude-subheading`, `.text-claude-subheading-sm`, `.text-claude-feature-title`, `.text-claude-body-serif`, `.text-claude-body-lg`, `.text-claude-body` utilities.
- All `.text-heading-*` and `.text-copy-*` (Geist) utilities.
- The `--font-serif` mapping in `@theme inline` (Cormorant is already removed in Phase 1).
- Geist grid utilities (`.grid-container`, `.grid-full`, `.grid-half`, `.grid-third`, `.grid-quarter`) only if no callsites remain — otherwise keep them as plain layout utilities renamed to neutral names.

### What gets kept (verify zero callsites first)

- Sidebar tokens (`--sidebar-*`) — required by shadcn sidebar primitive; keep but ensure they resolve to Cursor primitives.
- Chart tokens (`--chart-1`–`--chart-5`) — keep for any future chart use, mapped to Cursor neutrals + accent.

### Doc updates

- Update `DESIGN.md` to add a "Status" note at the top: which sections are implemented, which are deferred (hero-band, IDE mockup card, pricing, CTA band, agent timeline UI). Keep the spec itself intact.
- Update `ARCHITECTURE.md` if it describes the design-token layer.
- Do NOT auto-update `CLAUDE.md`, `KNOWNS.md`, or `AGENTS.md` — those are agent guidance files unrelated to the design system.

### Visual QA matrix

For each route, verify in light + dark:

| Route | Smoke checks |
|---|---|
| `/` | Sidebar, primary CTA orange, no shadows |
| `/settings` | Form fields 44px, badges pill shape, tabs neutral active |
| `/json-viewer` | JetBrains Mono, canvas-soft pane, Prism palette |
| `/sql-placeholder` | Editable code pane, Cursor Orange caret |
| `/properties-converter` | Source + output panes |
| `/record-protobuf` | Output pane |
| `/totp-generator` | Mono token display |
| `/enhance-prompt` | Streaming output legible |

Capture findings to `.planning/phases/cleanup-verify/qa-matrix.md`.

## Open assumptions

- All callsites of legacy tokens were caught in Phases 1–3. Wave 1 grep is the safety net — anything still found requires patching before deletion.
- Sidebar shadcn primitive truly needs `--sidebar-*` tokens; if it doesn't, those can be removed too.

## Canonical refs

- `DESIGN.md`
- `ARCHITECTURE.md`
- `src/app/globals.css`
- All Phase 1–3 audit and smoke artifacts under `.planning/phases/`

## Rejected options

- Keeping legacy tokens "for safety" — rejected; they confuse future maintainers and bloat the token surface.
- Auto-formatting `globals.css` aggressively during deletion — rejected; deletions only, formatting can come in a separate change to keep diffs reviewable.

## Deferred to later work (post-roadmap)

- Building actual hero / pricing / CTA / IDE-mockup-card components if a marketing surface is later introduced.
- Standing up an agent timeline UI that consumes the timeline pill primitives.
- Loading a licensed CursorGothic font if rights are obtained.
