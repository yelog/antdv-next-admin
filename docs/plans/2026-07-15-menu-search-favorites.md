# Menu Search Favorites Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a remembered Recent/Favorites collection switch to global menu search and make menu favorites independent from temporary tabs.

**Architecture:** Store favorite menu paths and the selected collection in a dedicated Pinia preference store. Parse and migrate persisted data through framework-independent helpers, then derive visible recent and favorite rows from the current permission-filtered, localized menu source.

**Tech Stack:** Vue 3 Composition API, TypeScript, Pinia, Antdv Next Segmented, vue-i18n, Vitest

---

### Task 1: Define navigation preference contracts and failing tests

**Files:**

- Create: `src/types/navigation.ts`
- Create: `tests/unit/menu-preferences.spec.ts`

**Step 1:** Define the `MenuSearchView` union and shared `MenuHistoryItem` contract.

**Step 2:** Write tests for valid favorite arrays, duplicate/invalid path removal, legacy `app-tabs-state` migration, invalid JSON fallback, view-value validation, and current-menu intersection ordering.

**Step 3:** Run `npm run test:unit:run -- tests/unit/menu-preferences.spec.ts` and verify it fails because the preference module does not exist.

### Task 2: Implement pure persistence and selection helpers

**Files:**

- Create: `src/utils/menuPreferences.ts`
- Test: `tests/unit/menu-preferences.spec.ts`

**Step 1:** Parse current favorite JSON and fall back to legacy favorite tabs only when the new value is absent or invalid.

**Step 2:** Normalize path arrays without duplicates and validate stored collection values against the union.

**Step 3:** Select visible menu records by ordered paths using current menu objects as the source of truth.

**Step 4:** Re-run the focused test and verify it passes.

### Task 3: Add the menu preference store and migrate callers

**Files:**

- Create: `src/stores/menuPreferences.ts`
- Modify: `src/stores/index.ts`
- Modify: `src/stores/tabs.ts`
- Modify: `src/types/layout.ts`
- Modify: `src/components/Layout/TabBar.vue`

**Step 1:** Initialize favorite paths and search view from guarded localStorage reads; persist every explicit toggle or view change.

**Step 2:** Persist migrated legacy favorites under the new key.

**Step 3:** Replace TabBar favorite reads and writes with the menu preference store.

**Step 4:** Remove the tabs-store favorite action and mark `Tab.favorite` as a legacy migration field.

### Task 4: Build the remembered Recent/Favorites global-search UI

**Files:**

- Modify: `src/components/Layout/GlobalSearch.vue`
- Modify: `src/router/guards.ts`
- Modify: `src/utils/menuPreferences.ts`
- Test: `tests/unit/menu-preferences.spec.ts`

**Step 1:** Reuse the shared history type and derive visible recent and favorite rows by intersecting persisted paths with `searchSource`.

**Step 2:** Add an Antdv Next Segmented toolbar with icons, item counts, contextual history clearing, and remembered selection.

**Step 3:** Route no-query arrow/Enter behavior through the active collection; reset active index and scroll after every collection switch.

**Step 4:** Write a failing unit test proving empty-query `ArrowLeft` / `ArrowRight` resolve to the adjacent remembered collection, while `Tab` and arrow keys with a query do not trigger collection switching.

**Step 5:** Add a pure `resolveMenuSearchViewShortcut` helper that cycles through the typed collection order and returns `null` for non-shortcut states.

**Step 6:** Handle `ArrowLeft` / `ArrowRight` only for an empty focused search input, and leave `Tab`, `Shift+Tab`, and arrow keys in search mode to their native behavior.

**Step 7:** Add collection-specific empty states, accessible favorite labels, dialog semantics, and internal/external navigation handling.

### Task 5: Add localized UI copy

**Files:**

- Modify: `src/locales/zh-CN.ts`
- Modify: `src/locales/en-US.ts`
- Modify: `src/locales/ja-JP.ts`
- Modify: `src/locales/ko-KR.ts`

**Step 1:** Add favorite collection, empty-state, switch-hint, clear-history, and dialog labels in all four locales.

**Step 2:** Verify all newly visible strings use `$t()` or `t()` and do not rely on hard-coded fallbacks.

### Task 6: Verify behavior and change boundaries

**Files:**

- Verify all files above.

**Step 1:** Run focused tests, then `npm run test:unit:run`.

**Step 2:** Run `npm run lint`, `npm run type-check`, `npm run format:check`, and `npm run build:check`.

**Step 3:** Run `git diff --check` and review the focused diff against the pre-existing dirty worktree.

**Step 4:** Exercise click/left-right switching, native Tab navigation, view memory, favorite persistence, search mode, empty states, external links, themes, and console output in a browser session when the demo login is available.
