# Follow-up Refactor Design

## Goal

Continue the enterprise-readiness work with low-risk refactors: clean lint warnings, extract pure ProTable logic, and make router guards easier to maintain without changing route behavior.

## Scope

This phase uses a steady sequence:

- Clean all current lint warnings and preserve required side-effect style imports.
- Extract ProTable non-DOM logic into composables with focused unit tests.
- Extract router guard helper functions inside `guards.ts` while keeping all `next()` calls in the main guard.

This phase does not move DOM measurement, resize logic, fixed-column scroll calculation, or `ResizableTitle` out of `ProTable`. It also does not split router helpers into a separate file yet.

## Architecture

ProTable remains a single rendering component, but request/search/header-filter behavior moves into composables under `src/components/Pro/ProTable/composables`. These composables expose the same reactive state and handlers the template already uses. Router guard extraction is behavior-preserving: helpers return booleans or redirect decisions, and `setupRouterGuards` remains the only place that calls `next()`.

## Validation

Run these commands from `antdv-next-admin/`:

```bash
npm run type-check
npm run lint
npm run test:unit:run
npm run build
```

Success means all four commands pass, and lint produces no warnings.
