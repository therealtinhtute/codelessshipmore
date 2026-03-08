# shadcn v4 preset a1D2M5sH migration

## Plan
- [x] Apply preset `a1D2M5sH` in merge mode and reconcile global theme/config changes.
- [x] Review priority shared UI primitives and merge only necessary upstream changes.
- [x] Refactor prompt enhancer, JSON viewer, and properties converter to follow shared shadcn composition patterns.
- [x] Run validation checks and record results.

## Results / Review
- Applied shadcn preset `a1D2M5sH` in merge mode and reconciled the generated theme/config changes.
- Added shared `toggle` and `toggle-group` primitives for preset-friendly single and multi-select controls.
- Refactored `prompt-enhancer.tsx`, `json-viewer.tsx`, `properties-converter.tsx`, and `env-output-list.tsx` to use more consistent shadcn composition and semantic styling.
- Added `src/lib/tool-ui-config.ts` plus `src/lib/tool-ui-config.test.ts` and verified the new helpers with `bun test src/lib/tool-ui-config.test.ts`.
- `bun run build` passed.
- Manual checks completed for dark/light theme rendering and the main prompt enhancer, JSON viewer, and properties converter flows.
- `bun run lint` still fails because of pre-existing unrelated repository issues outside the migrated files.

## Next Fix
- [x] Move Sonner toasts to the top-right corner and verify with tests/build.
- Verified `bun run build` after setting `position="top-right"` in `src/components/ui/toaster.tsx`.
