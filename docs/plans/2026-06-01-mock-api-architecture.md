# Mock API Architecture Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move mock behavior fully to the dev-server layer while improving request, permission, typing, and test foundations.

**Architecture:** API modules become thin HTTP-only wrappers. Mock handlers own all in-memory data and demo behavior. Request defaults remain compatible while adding typed strategy options for future needs.

**Tech Stack:** Vue 3, TypeScript, Vite, Pinia, Axios, vite-plugin-mock-dev-server, Vitest, oxlint, oxfmt.

---

### Task 1: API and Mock Boundary

**Files:**
- Modify: `src/api/user.ts`
- Modify: `src/api/role.ts`
- Modify: `src/api/permission.ts`
- Modify: `src/api/log.ts`
- Modify: `src/api/file.ts`
- Modify: `src/api/dict.ts`
- Modify: `src/api/config.ts`
- Modify: `src/api/dept.ts`
- Modify: `mock/handlers/*.mock.ts`

**Steps:**

1. Replace each API module's mock branches with direct `request` calls.
2. Move any missing filtering, pagination, create, update, delete, or special-case behavior into matching mock handlers.
3. Run `npm run type-check` and fix type errors.

### Task 2: Auth HTTP Unification

**Files:**
- Modify: `src/stores/auth.ts`
- Modify: `mock/handlers/auth.mock.ts`

**Steps:**

1. Remove demo login and demo refresh branches from the auth store.
2. Ensure login, user info, and refresh token all use `src/api/auth.ts`.
3. Preserve mock token user identity across refresh.
4. Validate `admin/123456` and `user/123456` through dev server mock endpoints.

### Task 3: Request Strategy Options

**Files:**
- Modify: `src/utils/request.ts`

**Steps:**

1. Add typed request config flags: `skipAuth`, `skipErrorMessage`, `skipAuthRefresh`, `skipRedirect`.
2. Keep existing defaults unchanged.
3. Use `skipAuthRefresh` for refresh-token requests to avoid recursive refresh.
4. Run `npm run type-check`.

### Task 4: Permission Source Foundation

**Files:**
- Create: `src/constants/permissions.ts`
- Modify: `src/stores/permission.ts`
- Modify: `src/router/routes.ts`
- Modify: `src/composables/usePermission.ts`
- Modify: `src/directives/permission.ts`

**Steps:**

1. Add common permission constants.
2. Stop silently overriding route-generation permissions with `/permissions/user`.
3. Keep existing auth-store permission methods as compatibility wrappers.
4. Run type-check.

### Task 5: Pro Type Cleanup

**Files:**
- Modify: `src/types/pro.ts`

**Steps:**

1. Replace explicit `any` in `ProTableRequest` with generic record and parameter types.
2. Keep default generic types compatible with existing code.
3. Run type-check.

### Task 6: Unit Test and CI Foundation

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create/modify: `tests/unit/*.spec.ts`
- Modify: `.github/workflows/build.yml`
- Modify: `.github/workflows/deploy.yml`

**Steps:**

1. Add Vitest dev dependency and scripts.
2. Add pure logic tests for route permission filtering.
3. Update CI to run type-check, lint, unit tests, and build.
4. Run `npm run test:unit:run`.

### Task 7: Final Verification

Run:

```bash
npm run type-check
npm run lint
npm run test:unit:run
npm run build
```

Manual verification:

- `npm run dev`
- Login as `admin/123456`.
- Login as `user/123456`.
- Test user list CRUD and permission-limited navigation.
