# Header Overlay First-Open Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make global search and preference settings open on the first trigger while preserving lazy loading.

**Architecture:** Header owns both the lazy-load and open states and passes visibility through `v-model:open`. Each overlay becomes a controlled component; global search reacts to visibility changes to reset state, focus the input, and manage its keyboard listener.

**Tech Stack:** Vue 3 Composition API, TypeScript, Antdv Next Drawer, Vitest, Vite

---

### Task 1: Replace imperative header overlay refs

**Files:**

- Modify: `src/components/Layout/Header.vue`

**Step 1:** Keep the existing lazy-render flags, add parent-owned open refs, and bind both asynchronous components with `v-model:open`.

**Step 2:** Change the search and settings trigger functions to synchronously set the lazy-render flag and desired open state. Remove component refs and manual loader/`nextTick` waiting.

### Task 2: Convert overlays to controlled components

**Files:**

- Modify: `src/components/Layout/GlobalSearch.vue`
- Modify: `src/components/Layout/SettingsDrawer.vue`

**Step 1:** Replace each private visibility ref and exposed imperative API with a typed `defineModel<boolean>('open')` contract.

**Step 2:** Move global-search initialization and keyboard-listener cleanup into an immediate visibility watcher so an asynchronously mounted component observes `open=true` on its first render.

### Task 3: Verify behavior and regressions

**Files:**

- Verify: `src/components/Layout/Header.vue`
- Verify: `src/components/Layout/GlobalSearch.vue`
- Verify: `src/components/Layout/SettingsDrawer.vue`

**Step 1:** Run targeted formatting checks for the touched Vue files and this plan.

**Step 2:** Run `npm run type-check`, `npm run lint`, and `npm run test:unit:run`.

**Step 3:** Run `npm run build` and manually verify the first click for search, Cmd/Ctrl+K, desktop settings, closing, and reopening.
