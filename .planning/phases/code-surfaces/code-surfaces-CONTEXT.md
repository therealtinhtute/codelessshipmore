# Phase 3 Context — Code Surfaces

## Phase goal

Cursor's design treats code as roughly half the page surface. This app is dev-tools-first — almost every route renders code. Bring all code-bearing surfaces into spec: JetBrains Mono, `--canvas-soft` pane background, 12px radius, 16px padding, hairline border, `text-code` (13px / 1.5 line-height) typography.

## In-scope surfaces

| Route / component | File(s) | What changes |
|---|---|---|
| Home | `src/app/page.tsx` | Any inline code or showcase blocks |
| JSON viewer | `src/app/json-viewer/`, `src/components/features/json-viewer.tsx` | Tree + raw view both render in JetBrains Mono on `--canvas-soft` |
| SQL placeholder | `src/app/sql-placeholder/`, `src/components/features/sql-placeholder.tsx` | Input + output panes |
| Properties converter | `src/app/properties-converter/`, `src/components/features/properties-converter.tsx` + `env-line-item.tsx` + `env-output-list.tsx` | Both source and converted output panes |
| Record protobuf | `src/app/record-protobuf/`, `src/components/features/record-protobuf.tsx` | Decoded output |
| TOTP generator | `src/app/totp-generator/`, `src/components/features/totp-generator.tsx` | Secret + token displays |
| Enhance prompt | `src/app/enhance-prompt/`, `src/components/features/enhance-prompt/*` | Prompt textarea + AI streaming output |
| Shared | `src/components/features/textarea-with-actions.tsx` | Mono code textarea variant |
| Syntax highlighting | `prism-react-renderer` consumers (search) | Token colors swapped to Cursor-compatible palette |

## Locked decisions

### Shared "code-pane" pattern

Introduce one shared visual treatment used everywhere code is shown:

```
bg: var(--canvas-soft)         /* #fafaf7 */
text: var(--body)              /* #5a5852 */ on default tokens
font: var(--font-mono), JetBrains Mono fallback
font-size: 13px
line-height: 1.5
border: 1px solid var(--hairline)
border-radius: 12px            /* --radius-lg */
padding: 16px
```

This becomes a Tailwind utility class `.code-pane` (or composed via existing utilities — pick whichever is cleaner during implementation). Every code surface adopts this base; feature-specific overrides only when justified.

### Editable code inputs (textarea variants)

Where the surface is *editable* (SQL input, JSON input, properties input, prompt textarea):

- Background stays `--canvas-soft`
- Caret + selection use `--primary` (Cursor Orange) — this is one of the few permitted Cursor Orange usages outside CTAs
- Focus ring `--primary`
- Min-height tuned per surface; do not constrain

### Read-only output panes

For converted/decoded output panes:

- Same `--canvas-soft` bg
- Hairline border
- An optional inline "copy" button uses `button-secondary` (from Phase 2)

### Prism / syntax highlighting palette

`prism-react-renderer` is in dependencies. Map syntax tokens to:

- comment → `--muted-soft`
- keyword → `--primary` (sparingly — only keywords, not the entire highlight)
- string → `--timeline-thinking` (peach, the "noun" color)
- number / boolean / null → `--timeline-grep` (mint)
- function / property → `--ink`
- punctuation / operator → `--body`

This is one explicit, bounded violation of the "timeline pastels stay scoped to agent timeline" rule — code highlighting is a code-only surface, not system action color, and the alternative (no color in code) makes JSON unreadable.

> If this trade-off is undesired, fall back to all-ink syntax highlighting with only comments dimmed. Decide during implementation; default is the bounded palette above.

### What this phase does NOT touch

- Non-code feature UI on these routes (page headers, toolbars, save buttons) — those are already tuned in Phase 2.
- Streaming animation styling for `enhance-prompt`.
- Adding a real "agent timeline" UI; pills remain unused primitives.

## Open assumptions

- Some feature components likely render code via `<pre>` or `<code>` elements without dedicated wrapper components. They'll need light refactor to consume the shared `.code-pane` treatment.
- `textarea-with-actions.tsx` already wraps `textarea` for mono editing; align its styles to the editable-code-input rules above instead of inventing new ones.
- Prism palette mapping requires reading current usage — confirm theme integration shape before committing.

## Canonical refs

- `DESIGN.md` §Code, §Hero & IDE Mockups (`ide-pane`), §Typography (`code` token: 13px JetBrains Mono)
- All files under `src/components/features/` and `src/app/*/`
- Phase 1 + 2 CONTEXT and PLAN

## Rejected options

- Using a darker code background (`--ink` or near-black) — rejected; conflicts with the cream-canvas + hairline-only philosophy.
- Removing syntax highlighting entirely — rejected; this app's value is code I/O readability.
- Building a full "IDE mockup" mock home page — rejected as out of scope per ROADMAP.

## Deferred to later phases

- Cleanup of unused `--claude-*` aliases → Phase 4.
- Visual QA across all routes → Phase 4.
