# Follow-up Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Clean quality warnings and reduce ProTable/router guard complexity without changing runtime behavior.

**Architecture:** First remove lint noise so quality checks are useful. Then extract pure ProTable logic into composables and add tests around the extracted behavior. Finally, extract same-file router guard helpers that return decisions while the main guard keeps navigation control.

**Tech Stack:** Vue 3, TypeScript, Pinia, Vue Router, Vitest, oxlint, Vite.

---

### Task 1: Clean Lint Warnings

**Files:**
- Modify: `src/router/utils.ts`
- Modify: `src/stores/tabs.ts`
- Modify: `src/stores/theme.ts`
- Modify: `src/utils/storage.ts`
- Modify: `src/api/auth.ts`
- Modify: `src/main.ts`
- Modify: `src/components/Editor/index.vue`
- Modify: `src/views/system/user/index.vue`
- Modify: `mock/data/dashboard.data.ts`
- Modify: `src/components/Pro/ProTable/ValueTypeRender.vue`

**Steps:**

1. Rename shadowed variables and unused parameters.
2. Alias Tiptap default imports.
3. Convert independent import loop calls to `Promise.allSettled`.
4. Configure lint to allow style side-effect imports.
5. Run `npm run lint` and ensure zero warnings.

### Task 2: Add ProTable Pure Logic Tests

**Files:**
- Create: `tests/unit/pro-table-header-filters.spec.ts`
- Create: `tests/unit/pro-table-search.spec.ts`
- Create: `tests/unit/pro-table-request.spec.ts`

**Steps:**

1. Write tests for filter value normalization, keyword matching, and request param building.
2. Write tests for search option and placeholder resolution.
3. Write tests for request reset and pagination parameter behavior.
4. Run `npm run test:unit:run` and verify tests fail until composables exist.

### Task 3: Extract ProTable Header Filter Logic

**Files:**
- Create: `src/components/Pro/ProTable/composables/useProTableHeaderFilters.ts`
- Modify: `src/components/Pro/ProTable/index.vue`

**Steps:**

1. Move pure header-filter helpers and `tableFilters` state into the composable.
2. Keep icon creation and template rendering in `index.vue` if needed.
3. Preserve public names used by the current template and computed columns.
4. Run type-check and unit tests.

### Task 4: Extract ProTable Search Logic

**Files:**
- Create: `src/components/Pro/ProTable/composables/useProTableSearch.ts`
- Modify: `src/components/Pro/ProTable/index.vue`

**Steps:**

1. Move search state and computed search columns into the composable.
2. Keep `searchRef` measurement and DOM resize logic in `index.vue`.
3. Run type-check and unit tests.

### Task 5: Extract ProTable Request Logic

**Files:**
- Create: `src/components/Pro/ProTable/composables/useProTableRequest.ts`
- Modify: `src/components/Pro/ProTable/index.vue`

**Steps:**

1. Move loading, dataSource, pagination state, sorter state, and request handlers.
2. Inject existing dependencies such as `buildHeaderFilterRequestParams` and `scheduleMeasureTable`.
3. Preserve reset behavior for search, filters, sorter, and page.
4. Run type-check and unit tests.

### Task 6: Extract Router Guard Helpers

**Files:**
- Modify: `src/router/guards.ts`
- Add or update: `tests/unit/router-guards.spec.ts`

**Steps:**

1. Extract same-file helpers for title, not-found recovery checks, dynamic route generation, tab init, access check, and add-tab eligibility.
2. Keep `next()` calls in the main guard.
3. Add helper tests where practical.
4. Run type-check and tests.

### Task 7: Final Verification

Run:

```bash
npm run type-check
npm run lint
npm run test:unit:run
npm run build
```

Expected: all commands pass and lint reports zero warnings.
