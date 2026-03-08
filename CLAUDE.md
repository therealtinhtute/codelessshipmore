# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

Always use `bun` instead of npm, yarn, or pnpm.

## Development Commands

- `bun run dev` — start the Next.js dev server on `http://localhost:3001`
- `bun run build` — build the production app
- `bun run start` — run the production server
- `bun run lint` — run ESLint

## Tests

There is currently no dedicated test script in `package.json` and no established test runner configured in this repository.

- Treat `bun run lint` and `bun run build` as the current verification commands.
- If you add a test runner, update this file with the exact command for running the full suite and a single test.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript (strict mode)
- Tailwind CSS v4
- shadcn/ui with Radix primitives
- Vercel AI SDK with multiple provider adapters
- Browser-only persistence via `localStorage`

## High-Level Architecture

### App shell and global providers

`src/app/layout.tsx` is the root composition point. It wraps all pages with:
- `ThemeProvider` for theming
- `AuthProvider` for auth state
- `AISettingsProvider` for provider/profile configuration
- `AppSidebar` for the shared tool navigation
- `Toaster` for global notifications

If a feature needs AI settings or profile state, it should live inside this existing provider tree rather than introducing parallel state.

### Product shape

This app is a collection of developer utilities exposed as App Router pages under `src/app/`. The notable tools are:
- JSON viewer
- SQL placeholder utility
- Properties converter
- Record-to-Protobuf converter
- Prompt enhancer
- Settings UI for AI providers

Most feature work is page-driven: route in `src/app`, feature UI in `src/components/features`, shared UI in `src/components/ui`.

### AI provider system

The AI integration is profile-first, not provider-first:
- A profile is an isolated workspace such as Personal or Work.
- Each profile owns its own provider configurations.
- Multiple providers can be configured per profile, and enabled providers are tracked in profile state.

Key files:
- `src/contexts/ai-settings-context.tsx` — central orchestration for profiles, active profile selection, provider CRUD, encrypted key handling, fallback mode, and migration bootstrap
- `src/lib/ai/providers.ts` — built-in provider catalog, default models, placeholders, and provider metadata
- `src/hooks/use-ai.ts` — runtime adapter that resolves the active saved provider config into a Vercel AI SDK model and exposes `generate`, `chat`, and `streamGenerate`

When adding a provider, the change usually spans all three of those files.

### Storage model

Persistence is abstracted behind a storage layer even though the active implementation is browser localStorage:
- `src/lib/storage/storage-provider.ts` defines the contract
- `src/lib/storage/local-storage-provider.ts` is the concrete implementation
- `src/lib/storage/local-storage-migration.ts` migrates legacy IndexedDB data into localStorage on startup

Data is organized around three buckets in localStorage:
- profiles
- provider configs
- app metadata

Provider configs are keyed by a composite profile/provider identity, so provider state is always scoped to a profile.

### Secret handling

API keys are never meant to be stored in plain text.
- `src/lib/ai/encryption.ts` encrypts API keys with AES-GCM before persistence
- `AISettingsProvider` stores encrypted values and decrypts them on demand through `getDecryptedApiKey`
- `useAI()` pulls decrypted keys only when instantiating the selected provider client

If you touch provider persistence, preserve this encrypted-at-rest flow.

### Built-in vs custom providers

The provider layer supports both:
- built-in providers defined in `src/lib/ai/providers.ts`
- custom OpenAI-compatible providers created from user-supplied base URLs and model lists

`useAI()` treats unknown provider IDs as custom providers and routes them through the OpenAI-compatible adapter. For built-in providers, check `src/lib/ai/providers.ts` and the switch in `src/hooks/use-ai.ts` together, since those two files define the supported provider set and any provider-specific runtime handling.

## Repository Conventions That Matter

- Use the `@/*` path alias for imports from `src/`.
- Prefer extending existing contexts, hooks, and storage abstractions instead of adding parallel state or ad hoc localStorage access.
- For AI-related changes, verify both configuration-time behavior (`AISettingsProvider`) and runtime behavior (`useAI()`).
- This repository already has an `AGENTS.md`; if guidance overlaps, follow the more repository-specific instruction closest to the code you are changing.
