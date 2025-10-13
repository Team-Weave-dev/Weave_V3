# Repository Guidelines

## Project Structure & Module Organization
- `src/app/` – Next.js App Router pages and routes (e.g., `page.tsx`).
- `src/components/` – Reusable UI and feature components; `ui/` contains shadcn-style primitives (e.g., `avatar.tsx`).
- `src/hooks/` – Custom React hooks.
- `src/lib/` – Utilities, stores, and service helpers (e.g., `supabase/`).
- `src/config/` – Centralized configuration.
- `public/` – Static assets.
- `docs/` – Project documentation; see `claude.md` and related files.
- `scripts/` – Maintenance utilities (e.g., `update-claude-docs.js`).

## Build, Test, and Development Commands
- `npm run dev` – Start local dev server.
- `npm run build` – Build production bundle.
- `npm start` – Run production server.
- `npm run lint` – Lint with Next/ESLint.
- `npm run type-check` – TypeScript check without emit.
- `npm run format` – Prettier format all files.
- Docs utilities: `npm run docs:update`, `npm run docs:watch`, `npm run dev:docs` (dev + auto-docs).

## Coding Style & Naming Conventions
- TypeScript, React 19, Next.js 15, TailwindCSS.
- Formatting via Prettier (2 spaces, semicolons off per project defaults if configured). Run `npm run format` before PRs.
- ESLint: `eslint-config-next`. Fix warnings where feasible.
- Components: PascalCase for component names. File names follow local convention: primitives in `components/ui/` are lowercase (e.g., `input.tsx`); feature components use `PascalCase` (e.g., `ChartWidget.tsx`).
- Use absolute imports with `@/` alias where available.

## Testing Guidelines
- No formal test runner is configured. Minimum: `npm run type-check` and `npm run lint` must pass.
- For new tests, prefer React Testing Library or Playwright; place unit tests near source as `*.test.tsx` and keep them fast.
- Add test instructions to PR if introducing a new test setup.

## Commit & Pull Request Guidelines
- Use Conventional Commits where possible (e.g., `feat:`, `fix:`, `chore:`). Keep subject lines concise.
- PRs should include: summary, rationale, screenshots for UI changes, and steps to verify.
- Ensure `npm run lint`, `npm run type-check`, and `npm run build` succeed before requesting review.
- Reference related issues (e.g., `Closes #123`).

## Security & Configuration
- Use `.env.local` based on `.env.local.example`. Do not commit secrets.
- Supabase keys and external API tokens must be provided via env vars.

## Agent-Specific Instructions
- Keep diffs minimal and aligned with existing folder conventions.
- Update docs with `npm run docs:update` (or run `dev:docs` during development).
- Avoid renaming files or broad refactors unless requested; focus on the task’s scope.
