# Project Theme Color Consistency Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate remaining theme-color desynchronization when switching from custom to preset colors and align captcha interaction accents with the active theme.

**Architecture:** Keep Antdv Next driven by the existing reactive `ConfigProvider`. Restore the CSS preset theme as the source of truth by removing custom inline overrides, and use existing project theme variables for custom interactive UI while retaining semantic status colors.

**Tech Stack:** Vue 3, Pinia, TypeScript, CSS custom properties, Antdv Next, Vitest.

---

### Task 1: Add a regression test for custom-to-preset switching

**Files:**

- Create: `tests/unit/settings-theme.spec.ts`

**Steps:**

1. Stub the root element style and local storage APIs.
2. Apply a custom primary color, then switch to the green preset.
3. Assert that `--color-primary` and all ten custom color-scale declarations are removed.
4. Assert that the preset attribute and compatibility variable use green.
5. Run the test and confirm it fails before implementation.

### Task 2: Restore preset CSS variables

**Files:**

- Modify: `src/stores/settings.ts`

**Steps:**

1. Add a private helper that removes the custom base color and ten scale declarations.
2. Call it from `setPrimaryColor` before activating the preset attribute.
3. Run `tests/unit/settings-theme.spec.ts` and confirm it passes.

### Task 3: Align slider captcha interaction colors

**Files:**

- Modify: `src/components/Captcha/src/SliderCaptcha.vue`

**Steps:**

1. Replace the pending track background and border information colors with primary theme variables.
2. Replace the active handle information color with the primary theme color.
3. Preserve the success-state colors.

### Task 4: Verify the complete change

**Steps:**

1. Run focused unit tests and `npm run type-check`.
2. Run `npm run lint` and targeted formatting checks.
3. Run `npm run build`.
4. Run `git diff --check` and review only the files in this plan.
