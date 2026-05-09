# Roadmap — Migrate Design System to Cursor

## Source

- `DESIGN.md` (treated as locked spec per user instruction; no `.planning/SPEC.md` was authored)
- Current state: Claude design system (cream canvas + terracotta + Cormorant Garamond serif) wired in `src/app/globals.css` and `src/app/layout.tsx`

## Goal

Replace the active Claude design system with the Cursor design system described in `DESIGN.md`: warm cream canvas, scarce Cursor Orange CTA, CursorGothic-style sans (Inter substitute, weight 400 with negative tracking) for display, JetBrains Mono on every code surface, hairline-only depth, 8px CTA / 12px card radii.

## Scope decisions (assumed from DESIGN.md + repo audit)

- **Font substitute:** Use Inter for CursorGothic (already loaded in `layout.tsx`). Drop Cormorant Garamond.
- **Display weight stays at 400.** All headings re-tuned to sans + negative letter-spacing per the typography table.
- **Timeline pills:** Add tokens + utility classes, but defer rendering them — no agent-timeline UI exists in this app yet. Pills become available primitives, unused until a surface adopts them.
- **Marketing-only components (hero-band, IDE mockup card, pricing-tier-card, cta-band):** Out of scope. The app is a dev-tools dashboard with no marketing pages. Documented in CONTEXT, not implemented.
- **Dark mode:** Keep dark mode working but re-derived from Cursor tokens (Cursor brand has no published dark spec; we keep the existing inversion strategy with new ink/canvas).
- **Token naming:** Adopt Cursor-aligned semantic names (`--canvas`, `--ink`, `--primary`, `--timeline-*`, etc.). Drop `--claude-*` and `--ds-*` (Geist) families.
- **Backward compatibility:** Not required. Find and replace all callsites.

## Out of scope

- New product surfaces (hero pages, pricing pages, marketing routes).
- Agent timeline UI itself (only the design tokens / pill primitives).
- Animation timings.
- New form-validation states beyond focus.
- Authoring CursorGothic license setup.

## Phases

| # | Phase | Slug | Goal | Depends on |
|---|---|---|---|---|
| 1 | Token Foundation | `foundation-tokens` | Replace color, radius, typography tokens in `globals.css` and font setup in `layout.tsx`. Add timeline palette as primitives. | — |
| 2 | Component Re-skin | `component-reskin` | Re-tune `src/components/ui/*` and layout components (sidebar, navigation, settings) to use Cursor tokens. Buttons → 8px radius + Cursor Orange. Cards → 12px hairline-only. | Phase 1 |
| 3 | Code Surfaces | `code-surfaces` | Ensure every code-bearing feature (json-viewer, sql-placeholder, properties-converter, record-protobuf, totp-generator, enhance-prompt) renders code in JetBrains Mono on `canvas-soft` panes with correct hairlines. | Phase 1, Phase 2 |
| 4 | Cleanup & Verification | `cleanup-verify` | Remove legacy `--claude-*` and `--ds-*` tokens, dead utility classes, Cormorant font. Visual QA across all routes (light + dark). Update `DESIGN.md` references and `ARCHITECTURE.md` if needed. | Phases 1–3 |

## Risks

- Removing Geist `--ds-*` and Claude `--claude-*` tokens may break callsites that aren't found by grep (e.g. dynamically-built class names). Mitigation: ripgrep audit before deletion in Phase 4.
- Inter at 400 with negative tracking can look thin — visually validate at hero/section sizes before committing.
- Dark-mode contrast: Cursor brand spec is light-only; dark mode must be re-derived without an authoritative reference.

## Handoff

- After implementation: run `review` for quality gates and `git` for commit grouping.
- After full migration: consider `watzup` to summarize the design-system swap.
