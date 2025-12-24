# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router pages, layouts, and route handlers.
- `src/components`: UI components (kebab-case filenames; feature and layout subfolders).
- `src/contexts`, `src/hooks`, `src/lib`: React contexts, hooks, and shared utilities.
- `public`: Static assets served at the site root.
- `docs`, `plans`: Supplemental documentation and planning artifacts.

## Build, Test, and Development Commands
- `npm run dev` or `bun run dev`: Start the local dev server.
- `npm run build`: Create a production build.
- `npm run start`: Run the production server from the build output.
- `npm run lint`: Run ESLint checks.

## Coding Style & Naming Conventions
- TypeScript + React with Tailwind CSS; follow existing patterns in nearby files.
- Indentation follows the project’s current formatting; keep diffs minimal and consistent.
- Filenames are kebab-case (e.g., `theme-toggle.tsx`); React components use PascalCase exports.
- Hooks are named `useSomething` and live under `src/hooks` when shared.

## Testing Guidelines
- No automated test runner is configured yet; linting is the current quality gate.
- If you add tests, document the command in `package.json` and prefer `*.test.ts(x)` filenames.

## Commit & Pull Request Guidelines
- Commit messages follow Conventional Commit style (e.g., `feat: ...`, `fix: ...`, `chore: ...`).
- Use optional scopes when helpful (e.g., `feat(ai): ...`).
- PRs should include a clear summary, testing notes, and UI screenshots for visual changes.

## Security & Configuration Tips
- API keys are stored client-side (localStorage) and encrypted; avoid logging secrets.
- Do not commit `.env` files or credentials; use local config when needed.
