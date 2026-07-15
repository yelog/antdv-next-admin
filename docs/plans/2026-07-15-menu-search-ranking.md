# Menu Search Ranking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Sort global menu search results by explainable match quality so stronger continuous matches appear first.

**Architecture:** Extract matching and stable ranking into a framework-independent TypeScript module. `GlobalSearch.vue` supplies leaf title, breadcrumb title, and path, while the module compares structured match metrics and returns a limited result list.

**Tech Stack:** Vue 3 Composition API, TypeScript, pinyin-pro, Vitest

---

### Task 1: Define ranking contracts with tests

**Files:**

- Create: `tests/unit/menu-search.spec.ts`

1. Add a failing test proving four continuous characters outrank a three-character run with a gap.
2. Cover title/path precedence, exact/prefix precedence, pinyin matching, stable ties, whitespace and post-sort limiting.
3. Run `npx vitest run tests/unit/menu-search.spec.ts` and confirm failure before implementation.

### Task 2: Implement the menu-search domain module

**Files:**

- Create: `src/utils/menuSearch.ts`

1. Normalize the query and obtain direct or `pinyin-pro` match indices.
2. Derive match type, longest continuous run, gaps, span, start position and field length.
3. Select the best candidate field per item and sort by the comparison tuple with original index as the stable tie-breaker.
4. Apply the result limit only after sorting.
5. Run the focused test and confirm it passes.

### Task 3: Integrate with global search

**Files:**

- Modify: `src/components/Layout/GlobalSearch.vue`

1. Preserve the localized leaf title while flattening the menu tree.
2. Replace inline filtering and truncation with the pure search function.
3. Keep highlighting, keyboard navigation and debounce behavior unchanged.

### Task 4: Verify regressions and change boundaries

**Files:**

- Verify: `src/utils/menuSearch.ts`
- Verify: `src/components/Layout/GlobalSearch.vue`
- Verify: `tests/unit/menu-search.spec.ts`

1. Run `npm run test:unit:run`.
2. Run `npm run lint`, `npm run type-check`, and `npm run build`.
3. Review the focused diff and confirm pre-existing working-tree changes remain intact.
