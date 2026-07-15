# Complex Form Progress Feedback Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance the multi-step complex form with clear current-step context and overall completion progress.

**Architecture:** Keep `ProStepForm` as the single owner of step state and progress presentation. Extract progress normalization into a pure utility for boundary testing, then supply localized step descriptions from the complex-form page.

**Tech Stack:** Vue 3, TypeScript, Antdv Next Steps and Progress, vue-i18n, Vitest, scoped SCSS.

---

### Task 1: Define and test progress calculation

**Files:**

- Create: `src/components/Pro/ProStepForm/progress.ts`
- Create: `tests/unit/pro-step-form-progress.spec.ts`

1. Write tests for first, middle, last, empty, negative, and overflow step values.
2. Run `npx vitest run tests/unit/pro-step-form-progress.spec.ts` and verify the missing utility causes failure.
3. Implement a pure function returning safe current number, total, and percentage.
4. Run the target test and verify all cases pass.

### Task 2: Enhance ProStepForm progress presentation

**Files:**

- Modify: `src/components/Pro/ProStepForm/index.vue`
- Modify: `src/locales/zh-CN.ts`
- Modify: `src/locales/en-US.ts`
- Modify: `src/locales/ja-JP.ts`
- Modify: `src/locales/ko-KR.ts`

1. Add a progress summary with localized “step N of M” text and percentage.
2. Render the active step description when provided.
3. Add a compact `a-progress` line with duplicate built-in text disabled.
4. Add responsive styling that hides the full steps map below 600px.
5. Add the shared progress-summary translation to all four locales.

### Task 3: Supply complex-form step descriptions

**Files:**

- Modify: `src/views/examples/scaffold/complex-form/index.vue`
- Modify: `src/locales/zh-CN.ts`
- Modify: `src/locales/en-US.ts`
- Modify: `src/locales/ja-JP.ts`
- Modify: `src/locales/ko-KR.ts`

1. Add concise, outcome-oriented descriptions for each of the three steps.
2. Pass the descriptions through the existing computed step definitions.
3. Confirm no validation or navigation handler changes are needed.

### Task 4: Verify the delivery

**Files:**

- Check only the files listed above.

1. Run the target Vitest test.
2. Run `npx oxfmt --check` for touched source and test files.
3. Run `npm run type-check`.
4. Run `npm run lint`.
5. Run `npm run build`.
6. Start the demo and inspect desktop and narrow-screen layouts when browser tooling is available.
7. Run `git diff --check` and review the scoped diff.
