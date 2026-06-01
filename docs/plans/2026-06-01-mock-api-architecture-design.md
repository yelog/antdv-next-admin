# Mock API Architecture Design

## Goal

Move all mock behavior to the Vite dev-server mock layer, keep `src/api` as HTTP-only request declarations, and prepare the admin scaffold for safer enterprise maintenance.

## Scope

This phase prioritizes low-risk architectural boundaries:

- API modules always call HTTP endpoints through `request`.
- Mock data access and in-memory mutations live only under `mock/`.
- Authentication and token refresh always use `/api/auth/*` endpoints.
- Request options support opt-outs for auth, error messages, redirects, and token refresh.
- Permission constants and route filtering use a single effective permission input.
- Pro component types remove explicit `any` from request contracts.
- Unit test and CI foundations are added for pure logic.

This phase does not split `ProTable` into composables or rewrite router guards. Those are larger follow-up refactors.

## Architecture

The browser app treats mock mode and real backend mode identically: both go through Axios and receive the same `ApiResponse<T>` shape. The dev server intercepts `/api` requests during development, while production talks to the configured backend. Stores and views do not import from `mock/` and do not branch on `VITE_USE_MOCK`.

Request behavior remains compatible by default. Optional flags on request config allow future code to skip auth headers, global error messages, redirects, or refresh handling without adding new Axios instances.

Permission checks keep the existing public API but begin moving toward centralized constants and a single effective permission source.

## Validation

Run these commands from `antdv-next-admin/`:

```bash
npm run type-check
npm run lint
npm run test:unit:run
npm run build
```

Manual checks:

- Login with `admin/123456`.
- Login with `user/123456`.
- Refresh a dynamic route after login.
- Verify user list search, pagination, create, update, and delete.
- Verify limited user menus and permission-controlled buttons.
