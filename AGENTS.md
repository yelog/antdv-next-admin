# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the application code: `api/`, `router/`, `stores/`, `views/`, `components/`, `composables/`, `directives/`, `utils/`, `types/`, `locales/`, and shared styles in `assets/styles/`.
- `mock/` holds development mock APIs (`handlers/`) and datasets (`data/`).
- `public/` stores static assets copied as-is at build time.
- `dist/` is generated output from Vite builds; do not edit it manually.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start Vite dev server on `http://localhost:3000` with mock endpoints.
- `npm run type-check`: run `vue-tsc --noEmit` for static type checks.
- `npm run build`: run type checks and create a production bundle in `dist/`.
- `npm run preview`: serve the built output locally for final verification.

## Coding Style & Naming Conventions
- Follow `.editorconfig`: UTF-8, LF line endings, 2-space indentation, final newline.
- Prefer TypeScript for new code and keep shared interfaces in `src/types/`.
- Use PascalCase for reusable component files in `src/components/` (for example, `NotificationPanel.vue`).
- Use route-oriented folders with `index.vue` for views (for example, `src/views/system/user/index.vue`).
- Name composables as `useXxx.ts`; keep store modules concise and domain-based (`auth.ts`, `permission.ts`).
- No ESLint/Prettier scripts are configured yet, so keep formatting consistent with nearby code.

## Testing Guidelines
- No dedicated test runner is configured in this repository yet.
- Minimum check before opening a PR: `npm run type-check` and `npm run build` must both pass.
- For UI and RBAC changes, verify login and permission behavior with mock users (`admin/123456`, `user/123456`).
- If introducing automated tests, use `*.spec.ts` and colocate with source files or under a top-level `tests/` folder.

## Commit & Pull Request Guidelines
- The current `main` branch has no commit history; adopt Conventional Commits moving forward.
- Use `type(scope): summary` (example: `feat(router): cache dynamic route records`).
- PRs should include purpose, key changes, validation steps, linked issues, and screenshots/GIFs for visible UI changes.
- Keep PRs focused; separate refactors from feature work when possible.

## Security & Configuration Tips
- Store environment-specific values in `.env`, `.env.development`, and `.env.production`; never commit secrets.
- Configure backend forwarding in `vite.config.ts` (`server.proxy`) instead of hardcoding API hosts in source code.
