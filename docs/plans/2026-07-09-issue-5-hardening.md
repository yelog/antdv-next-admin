# Issue 5 Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the issue #5 bug fixes and component enhancements without leaving session, theme, layout, or validation regressions.

**Architecture:** Keep cross-cutting application concerns at the root or store layer: Antdv Next context comes from `ConfigProvider` plus `App`, session reset owns auth/permission/tabs/router state, and Pro components own form/search lifecycle. Keep ProTable search layout compatible with its current container, but expose explicit helpers so behavior can be tested without mounting the whole table.

**Tech Stack:** Vue 3 `<script setup>`, Pinia, Vue Router, antdv-next, vue-i18n, dayjs, Vitest, TypeScript strict.

---

## Task 1: Guard Core Regressions With Unit Tests

- Add tests for router static/basic route preservation during reset.
- Add tests for `columnsPerRow` responsive config and generated ProForm grid bindings.
- Add tests for ProForm select helpers: local filtering, remote request race handling, and option fallback.

## Task 2: Fix Session And Router Reset

- Move route-name collection into a testable helper.
- Preserve all static routes and all nested basic routes.
- Reset auth, permissions, tabs, and generated routes through one session reset utility used by logout and pre-login account switching.

## Task 3: Complete ProTable Search Layout

- Convert `columnsPerRow` into actual grid column bindings.
- Keep the existing ProTable search container/collapse behavior.
- Update tests to prove layout and collapsed field limits stay aligned.

## Task 4: Harden ProForm Select Search

- Use local search by default for Select and TreeSelect.
- Support async `remoteSearch` with loading state, stale response protection, and fallback to local options when search is cleared or fails.
- Keep caller-provided `props.filterOption`, `props.filterTreeNode`, and `props.showSearch` overrides.

## Task 5: Context-Aware Modal And Remaining UX Fixes

- Wrap the app content in `a-app` under `a-config-provider`.
- Use `App.useApp().modal.confirm` for ProTable row confirms and avatar logout confirms.
- Remove remaining deprecated/undefined primary-color variables in touched issue surfaces.
- Avoid notification badge first-render flicker by initializing mock notifications before first paint or rendering only after initialization.

## Task 6: Verification

- Run focused Vitest tests after each behavior change.
- Run `npm run type-check`, `npm run lint`, `npm run test:unit:run`, `npm run build`.
- Run format check on modified app files and fix formatting.
- Start the dev server and verify login/language/theme/search/modal flows in the browser.
