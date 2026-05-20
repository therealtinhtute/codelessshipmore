# SPEC: Design Token Migration — Lovable → Supermemory Console

**Status:** LOCKED
**Approved:** 2026-05-20
**Source:** Conversation-approved plan

## Goal

Fully replace the Lovable design system with the Supermemory Console token system and replace the remote logo with the local Devin terracotta mark SVG.

## Scope

### In Scope
- Replace all CSS custom properties (colors, typography, spacing, radius, shadows)
- Swap fonts: Camera Plain Variable → Space Grotesk (headings) + Inter (body)
- Introduce blue accent color system (#117dff)
- Add semantic status colors (success/error/warning/info)
- Replace remote logo with inline Devin terracotta SVG
- Adopt compact typography scale (20-24px headings) across all pages
- Update all UI components using Lovable tokens
- Derive dark mode from new palette
- Delete Camera Plain Variable font file
- Rewrite DESIGN.md

### Out of Scope
- New pages or features
- Component API changes
- Dark mode full redesign (adapt, not redesign)

## Key Decisions

1. Full replacement, no hybrid
2. Compact Supermemory typography scale everywhere (no editorial scale)
3. Delete Camera Plain woff2
4. Two Google Fonts via next/font/google (Space Grotesk + Inter)
5. Blue accent (#117dff) with gradient for CTAs and active states

## Token Sources

- `design-tokens-console-supermemory-ai.json` — color, typography, spacing, radius, shadow tokens
- `devin-mark-terracotta-gradient.svg` — application logo mark
