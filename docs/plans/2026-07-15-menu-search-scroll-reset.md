# Menu Search Scroll Reset Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reset the global menu result list to its top whenever the search keyword changes.

**Architecture:** Keep scroll ownership inside `GlobalSearch.vue` by referencing its `.search-body` element directly. Reset `scrollTop` only after the debounced result update and Vue DOM flush, keeping the visible scroll position aligned with `activeIndex = 0`.

**Tech Stack:** Vue 3 Composition API, TypeScript, Vitest, Vite

---

### Task 1: Reset the result container after search updates

**Files:**

- Modify: `src/components/Layout/GlobalSearch.vue`

1. Add a template ref to the `.search-body` scroll container.
2. Add a typed element ref in `<script setup>`.
3. After each search result update, wait for `nextTick` and set the container's `scrollTop` to zero.
4. Apply the same reset when the keyword becomes empty and history replaces search results.

### Task 2: Verify the behavior boundary

**Files:**

- Verify: `src/components/Layout/GlobalSearch.vue`

1. Run the focused formatting check.
2. Run unit tests, lint, type checking, and the production build.
3. Confirm the focused diff does not alter menu ranking or unrelated working-tree changes.
