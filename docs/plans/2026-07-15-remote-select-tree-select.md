# Remote Select and TreeSelect Examples Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add remote Select, lazy-loaded TreeSelect, and remote-search TreeSelect as real fields in the existing ProForm example.

**Architecture:** Reuse ProForm's existing `remoteSearch` contract for remote Select and TreeSelect fields, and pass `loadData` through field props for lazy TreeSelect expansion. Use a small page-local data module for deterministic records and tree transformations; all three selected values remain part of the same ProForm model.

**Tech Stack:** Vue 3, TypeScript, Antdv Next, Vitest, project locale resources.

---

### Task 1: Add deterministic remote data helpers

**Files:**

- Create: `src/views/examples/form/remoteData.ts`
- Test: `tests/unit/form-remote-data.spec.ts`

**Step 1:** Write unit tests covering case-insensitive user search, tree search with matching ancestors, and lazy child creation.

**Step 2:** Run `npm run test:unit:run -- tests/unit/form-remote-data.spec.ts` and verify the missing module causes failure.

**Step 3:** Implement typed mock records, filtering functions, and deterministic lazy child generation in `remoteData.ts`.

**Step 4:** Re-run the focused test and verify it passes.

### Task 2: Add the three remote fields to ProForm

**Files:**

- Modify: `src/views/examples/form/index.vue`

**Step 1:** Add remote Select, lazy TreeSelect, and remote-search TreeSelect entries to `formItems`.

**Step 2:** Reuse ProForm's remote request ordering and loading handling; add delayed Promise loaders and duplicate-load protection for lazy nodes.

**Step 3:** Ensure the remote fields participate in the existing submit and reset flow, and remove the standalone remote card.

### Task 3: Add localized copy

**Files:**

- Modify: `src/locales/zh-CN.ts`
- Modify: `src/locales/en-US.ts`
- Modify: `src/locales/ja-JP.ts`
- Modify: `src/locales/ko-KR.ts`

**Step 1:** Add titles, descriptions, labels, placeholders, loading text, empty text, and interaction hints under `exampleForm.remote` in all four locales.

**Step 2:** Search the modified template for hard-coded user-facing strings and replace them with `$t()` calls.

### Task 4: Verify behavior and quality

**Files:**

- Verify all files above.

**Step 1:** Run targeted formatting on touched source and test files, then `git diff --check`.

**Step 2:** Run `npm run lint`, `npm run type-check`, `npm run test:unit:run`, and `npm run build:check`; all commands must exit successfully.

**Step 3:** Start the development server, open `/examples/form`, exercise all three examples, and verify no browser console errors or warnings.

**Step 4:** Review `git diff` for unrelated changes and summarize the component support evidence and delivered behavior.
