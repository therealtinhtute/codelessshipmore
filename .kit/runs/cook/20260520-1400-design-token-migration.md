# Cook Run: Design Token Migration

**Started:** 2026-05-20
**Mode:** full (bootstrapped from conversation-approved plan)
**Spec:** `.kit/planning/SPEC.md`

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | Fonts | DONE |
| 2 | Color tokens | DONE |
| 3 | Typography | DONE |
| 4 | Radius + Shadows | DONE |
| 5 | Components | DONE |
| 6 | Logo | DONE |
| 7 | Pages | DONE |
| 8 | Cleanup | DONE |

## Task Log

### Phase 1: Fonts
- Imported Inter (400, 500), Space Grotesk (600), kept JetBrains Mono via next/font/google
- Added `--font-sans` (Inter) and `--font-display` (Space Grotesk) CSS variables
- Updated `layout.tsx` to pass all three font variables to html element

### Phase 2: Color Tokens
- Replaced all `:root` and `.dark` CSS custom properties with Supermemory tokens
- Added accent system: `--accent-color: #117dff`, gradient, hover, muted
- Added status colors: success, error, warning, info
- Derived dark mode: `--primary: #3b9eff`, dark surfaces `#111110`/`#1a1917`
- Updated shadcn semantic tokens to use new palette

### Phase 3: Typography
- Headings: h1=24px, h2=20px, h3=18px (Space Grotesk 600)
- Body: 14px Inter 400
- Updated all `.text-display-*` utilities to compact Supermemory scale
- Updated `.text-card-title`, `.text-body`, `.text-button`, `.text-caption`

### Phase 4: Radius + Shadows
- Radius: xs=3, sm=4, md=6, lg=6, xl=16, pill=9999
- Shadows: sm/md/lg standard, focus uses accent ring
- Removed Lovable inset shadow system

### Phase 5: Components
- `button.tsx`: rounded-md, text-sm font-medium, accent hover, standard shadows
- `badge.tsx`: rounded-sm, text-xs, border-border
- `card.tsx`: rounded-md, shadow-sm added
- `tabs.tsx`: replaced `text-ink` → `text-foreground`, `border-hairline` → `border-border`
- `input.tsx`: text-sm, focus ring uses `--ring`
- `dialog.tsx`: bg-black/40 overlay, border-border
- `sheet.tsx`: bg-black/40 overlay, border-border
- `alert-dialog.tsx`: bg-black/40 overlay, border-border
- `sidebar.tsx` (layout): text-ink → text-foreground, text-canvas → dark:text-foreground
- Settings components: bg-surface-strong → bg-accent, text-body → text-muted-foreground

### Phase 6: Logo
- Replaced remote CDN image in `sidebar-logo.tsx` with inline Devin terracotta SVG
- Removed useState, error state, and image loading logic
- Converted to server-compatible component (no "use client" needed)

### Phase 7: Pages
- `page.tsx`: replaced border-hairline, text-ink, text-on-primary with standard tokens
- `totp-generator.tsx`: text-ink → text-foreground

### Phase 8: Cleanup
- Deleted `public/fonts/CameraPlainVariable.woff2` via trash
- Build verified: `npm run build` passes (compiled, TypeScript OK, all 9 routes generated)
- Visual verified: screenshots of homepage + JSON viewer confirm design applied correctly

## Verification
- `npm run build`: PASS (compiled in 1546ms, all pages generated)
- Visual: homepage shows blue accent buttons, terracotta logo, warm cream bg, compact headings
- Visual: JSON viewer shows active sidebar blue highlight, correct fonts, card borders
- Zero remaining Lovable token references in source (grep verified)
