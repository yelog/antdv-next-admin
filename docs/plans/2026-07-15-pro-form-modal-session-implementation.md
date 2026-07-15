# ProForm Modal Session Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ensure every CRUD modal opens with a fresh Antdv Form instance and no validation state from a previous create or edit session.

**Architecture:** Add a workflow-only `useCrudFormSession` composable and a lifecycle-owning `ProFormModal` component. Keep record-to-form and form-to-payload mapping in each page, then migrate ProTable's built-in CRUD and standalone CRUD pages to the shared lifecycle.

**Tech Stack:** Vue 3 Composition API, TypeScript, Antdv Next Modal/Form, Vitest.

---

### Task 1: CRUD Form Session

**Files:**

- Create: `src/composables/useCrudFormSession.ts`
- Test: `tests/unit/crud-form-session.spec.ts`

**Steps:**

1. Write tests for create/edit session keys, value cloning, close ordering, and rapid reopen protection.
2. Run `npm run test:unit:run -- tests/unit/crud-form-session.spec.ts` and verify the missing module fails.
3. Implement the composable with `openCreate`, `openEdit`, `close`, and `finishClose`.
4. Run the focused test and verify it passes.

### Task 2: ProForm Lifecycle Contract

**Files:**

- Modify: `src/components/Pro/ProForm/index.vue`
- Modify: `src/types/pro.ts`

**Steps:**

1. Add a shared `ProFormInstance<TValues>` type with the Antdv validation return contract.
2. Forward `preserve` and `clearOnDestroy` to `<a-form>`.
3. Clone initial values and return validated values directly from `validate()`.
4. Run `npm run type-check`.

### Task 3: ProFormModal

**Files:**

- Create: `src/components/Pro/ProFormModal/index.vue`

**Steps:**

1. Compose ProModal and ProForm with `destroyOnHidden`, `preserve=false`, and `clearOnDestroy=true`.
2. Key ProForm by `sessionKey`.
3. Catch expected validation failures and guard against stale async validation results.
4. Emit `submit`, `cancel`, `update:open`, and `closed` events.
5. Run `npm run type-check` and `npm run lint`.

### Task 4: ProTable Built-in CRUD

**Files:**

- Modify: `src/components/Pro/ProTable/index.vue`

**Steps:**

1. Replace the local CRUD refs and `clearValidate()` calls with `useCrudFormSession`.
2. Replace the embedded ProModal/ProForm pair with ProFormModal.
3. Preserve existing `openCreateModal`, `openEditModal`, and `form-submit` APIs.
4. Run type-check and the full unit suite.

### Task 5: Standalone CRUD Pages

**Files:**

- Modify: `src/views/system/user/index.vue`
- Modify: `src/views/system/role/index.vue`
- Modify: `src/views/system/permission/index.vue`
- Modify: `src/views/examples/table/index.vue`
- Modify: `src/views/examples/scaffold/pro-table-advanced/index.vue`

**Steps:**

1. Replace each `a-modal + ProForm` pair with ProFormModal.
2. Replace duplicated modal/form refs with `useCrudFormSession`.
3. Remove close-time form mutations and `nextTick(setFieldsValue)` calls.
4. Accept validated values as the submit-handler argument.
5. Keep domain payload mapping and API behavior in each page.
6. Run type-check, lint, and all unit tests.

### Task 6: End-to-End Verification

**Files:**

- No production file changes expected.

**Steps:**

1. Run touched-file `oxfmt --check` and `git diff --check`.
2. Run `npm run type-check`, `npm run lint`, and `npm run test:unit:run`.
3. Run `npm run build:check`.
4. Start the dev server and reproduce create-invalid-close-create on the user page.
5. Verify the reopened form has zero error items and correct defaults.
6. Verify edit-close-create and rapid close/reopen behavior.
