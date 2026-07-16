# Preserve Not Found URL Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Render the existing 404 component at an unmatched URL without changing that URL.

**Architecture:** Replace the catch-all redirect with a component route. Keep dynamic-route refresh recovery in the guard by detecting the catch-all route name and retrying the original full path after permission routes are generated.

**Tech Stack:** Vue 3, Vue Router, TypeScript, Vitest

---

### Task 1: Define the catch-all route contract

**Files:**

- Modify: `tests/unit/router-reset.spec.ts`

1. Add a test asserting that `notFoundRoute` has no redirect and exposes a component.
2. Run `npm run test:unit:run -- tests/unit/router-reset.spec.ts` and verify it fails.

### Task 2: Render 404 without redirecting

**Files:**

- Modify: `src/router/routes.ts`

1. Replace the catch-all redirect with the existing 404 lazy component.
2. Run the target test and verify it passes.

### Task 3: Preserve dynamic-route refresh recovery

**Files:**

- Modify: `src/router/guards.ts`
- Create: `src/router/routeRecovery.ts`
- Create: `tests/unit/router-not-found.spec.ts`

1. Export and test a small predicate that recognizes a catch-all match requiring dynamic-route generation.
2. Update the guard to generate routes and retry `to.fullPath` when the predicate matches.
3. Remove redirect-specific and logged-out fallback logic.
4. Run the target router tests.

### Task 4: Verify the change

**Files:**

- Verify: `src/router/routes.ts`
- Verify: `src/router/guards.ts`
- Verify: `tests/unit/router-reset.spec.ts`
- Verify: `tests/unit/router-not-found.spec.ts`

1. Run target-file formatting checks.
2. Run `npm run test:unit:run`.
3. Run `npm run type-check`.
4. Run `npm run lint`.
5. Run `npm run build`.
