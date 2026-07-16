# ProTable Search Compact Form Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the default `Form.Item` bottom margin in ProTable search forms with explicit compact grid spacing while preserving normal ProForm spacing and validation behavior elsewhere.

**Architecture:** Add an opt-in `compact` presentation prop to ProForm and map it to a root modifier class. In compact mode, remove the FormItem bottom margin that distorts the container edge spacing and replace it with an explicit responsive-grid row gap. Keep these rules inside ProForm so callers do not depend on Antdv internals, then enable the mode only for ProTable's search form.

**Tech Stack:** Vue 3, TypeScript, scoped SCSS, Antdv Next, vue-tsc, Vite

---

### Task 1: Add the ProForm compact presentation contract

**Files:**

- Modify: `src/components/Pro/ProForm/index.vue`

**Step 1: Add the public prop**

Add `compact?: boolean` to `Props` and default it to `false`, preserving the current layout for every existing ProForm caller.

**Step 2: Map the prop to the root modifier class**

Extend the root form class binding with `'pro-form--compact': compact`.

**Step 3: Add the scoped spacing rule**

Under `.pro-form`, add a compact modifier that applies `margin-bottom: 0` to descendant Antdv `.ant-form-item` elements and `row-gap: var(--spacing-sm)` to the responsive grid. This separates inter-row spacing from container edge spacing. Do not hide validation explanations or change their rendering.

### Task 2: Enable compact mode for ProTable search

**Files:**

- Modify: `src/components/Pro/ProTable/index.vue`

**Step 1: Opt the search form into compact mode**

Pass `compact` to the ProForm rendered inside `.pro-table-search`. Do not change regular ProForm call sites or global Antdv styles.

### Task 3: Verify the focused change

**Files:**

- Verify: `src/components/Pro/ProForm/index.vue`
- Verify: `src/components/Pro/ProTable/index.vue`

**Step 1: Check touched-file formatting**

Run: `npx oxfmt --check src/components/Pro/ProForm/index.vue src/components/Pro/ProTable/index.vue`

Expected: both files pass formatting.

**Step 2: Run unit tests**

Run: `npm run test:unit:run`

Expected: all existing unit tests pass; compact mode is a presentation-only Vue/SCSS contract and does not introduce business logic requiring a new pure unit test.

**Step 3: Run type checking and production build**

Run: `npm run build:check`

Expected: vue-tsc and Vite both exit successfully.

**Step 4: Run lint and diff checks**

Run: `npm run lint` and `git diff --check`

Expected: no lint errors or whitespace errors.

**Step 5: Perform browser QA**

Open single-row and multi-row ProTable search pages. Confirm that the controls have visually balanced container edge spacing, separate rows by 8px, search/reset still work, and ordinary ProForm pages retain their existing spacing.
