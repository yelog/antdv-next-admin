# Complex Form Progress Theme Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the complex form progress track follow the active preset or custom primary color.

**Architecture:** Keep theme ownership in the existing settings store and CSS variables. Bind the reusable `ProStepForm` progress track directly to `--color-primary`, avoiding global changes to the semantic information and success tokens used by other Progress instances.

**Tech Stack:** Vue 3, TypeScript, Antdv Next 1.3.3, SCSS, Vitest.

---

### Task 1: Bind the step progress track to the primary theme color

**Files:**

- Modify: `src/components/Pro/ProStepForm/index.vue`
- Test: `tests/unit/pro-step-form-progress.spec.ts`

**Step 1: Implement the minimal binding**

Add `stroke-color="var(--color-primary)"` to the existing `a-progress`. A string prop is sufficient because CSS custom properties remain live when the root theme changes.

**Step 2: Run the focused regression test**

Run: `npm run test:unit:run -- tests/unit/pro-step-form-progress.spec.ts`

Expected: all `getStepProgress` cases pass, including the 100% final step.

**Step 3: Run static verification**

Run: `npm run type-check && npm run lint && npm run format:check && npm run build`

Expected: every command exits successfully.

**Step 4: Review the diff**

Run: `git diff --check` and inspect `git diff -- src/components/Pro/ProStepForm/index.vue docs/plans/2026-07-16-complex-form-progress-theme-design.md docs/plans/2026-07-16-complex-form-progress-theme.md`.

Expected: only the approved theme-color binding and its documentation appear; existing unrelated working-tree changes remain untouched.
