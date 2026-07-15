# ProForm Grid Overflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the unintended horizontal scrollbar caused by `ProForm` grid gutters without restricting generic `ProModal` content.

**Architecture:** Contain the Antdv Row negative gutter margin inside `ProForm` with a dedicated grid viewport. Keep modal scrolling, responsive grid configuration, form lifecycle, and footer behavior unchanged.

**Tech Stack:** Vue 3, TypeScript, Antdv Next, scoped SCSS, Vitest, agent-browser

---

### Task 1: Record the failing browser measurement

**Files:**

- Inspect: `src/components/Pro/ProForm/index.vue`
- Inspect: `src/components/Pro/ProModal/index.vue`

**Step 1: Open the advanced ProTable edit modal**

Run the app and navigate to `/examples/pro-table-advanced`, then open the first edit action.

**Step 2: Measure the modal body**

Evaluate `clientWidth`, `scrollWidth`, and the first form Row's computed margins.

Expected before the fix: `scrollWidth > clientWidth`, with the difference matching half of the Row gutter.

### Task 2: Contain the ProForm grid overflow

**Files:**

- Modify: `src/components/Pro/ProForm/index.vue:13-41`
- Modify: `src/components/Pro/ProForm/index.vue:255-285`

**Step 1: Add the grid viewport**

Wrap the existing `a-row` and its inline footer column in:

```vue
<div class="pro-form-grid-viewport">
  <a-row>...</a-row>
</div>
```

Keep the non-inline footer outside this wrapper.

**Step 2: Add horizontal containment**

```scss
.pro-form-grid-viewport {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow-x: hidden;
  overflow-x: clip;
}
```

**Step 3: Run the targeted format check**

Run: `npx oxfmt --check src/components/Pro/ProForm/index.vue`

Expected: the file uses the repository format.

### Task 3: Verify browser behavior

**Files:**

- Verify: `src/components/Pro/ProForm/index.vue`

**Step 1: Reopen create and edit modals**

Expected: no horizontal scrollbar and `body.scrollWidth === body.clientWidth`.

**Step 2: Resize the modal**

Verify narrower and wider sizes. Expected: responsive columns continue to reflow and no horizontal scrollbar appears.

**Step 3: Verify form behavior**

Trigger validation, open Select controls, close the modal, and reopen it. Expected: validation and session cleanup behavior remain correct.

### Task 4: Run quality gates

**Files:**

- Verify: all touched files

**Step 1: Run focused and full checks**

Run:

```bash
npm run type-check
npm run test:unit:run
npm run lint
npm run build:check
npx oxfmt --check src/components/Pro/ProForm/index.vue docs/plans/2026-07-15-pro-form-grid-overflow-design.md docs/plans/2026-07-15-pro-form-grid-overflow.md
git diff --check
```

Expected: all commands pass; existing unrelated build-size warnings may remain.
