# ProForm Modal Session Design

## Problem

CRUD pages keep Antdv Form instances mounted while their Modal is hidden. Closing a modal also mutates the parent form data before the close animation completes, so validation runs again on the still-mounted form and leaves errors for the next open.

The previous issue #5 fix only added `clearValidate()` to ProTable's built-in CRUD path. User, role, permission, and example pages use independent `Modal + ProForm` implementations and therefore do not share that fix.

## Architecture

The solution introduces two reusable boundaries:

- `useCrudFormSession` owns workflow state: open state, mode, current record, initial values, and a monotonically increasing session key.
- `ProFormModal` owns Modal/Form lifecycle: destroy content after close, disable field preservation, ignore stale validation results, and emit already validated values.

Pages continue to own domain mapping between records, form values, and API payloads. ProTable remains responsible for list behavior and delegates its built-in form lifecycle to the same session abstraction.

## Session Lifecycle

1. A create or edit action builds a fresh initial-values object.
2. The session key increments before the modal opens.
3. `ProFormModal` mounts a ProForm keyed by that session.
4. Cancel only changes `open` to `false`; it does not mutate form values during the close animation.
5. The Modal destroys its child content after becoming hidden.
6. The session clears record/default state only after the close transition completes.
7. Reopening always mounts a new Form instance with no validation metadata from the previous session.

## Component Contracts

### ProForm

- Accept `preserve` and `clearOnDestroy` and forward them to Antdv Form.
- Expose `validate(): Promise<Record<string, unknown>>` with the same contract as Antdv Form.
- Clone incoming initial values so nested form values do not mutate records by reference.

### ProFormModal

- Always use `destroyOnHidden`.
- Render ProForm with `preserve=false` and `clearOnDestroy=true`.
- Catch validation rejection because it is an expected UI state.
- Emit `submit(values)` only when the modal is still open and the session key is unchanged.
- Emit `closed` only after the close animation finishes.

### useCrudFormSession

- `openCreate(values?)` starts a new create session.
- `openEdit(record, values)` starts a new edit session.
- `close()` only closes the current session.
- `finishClose()` clears retained state only if no newer session has opened.

## Compatibility

Existing standalone ProForm usage keeps its current defaults. Modal-specific cleanup is opt-in through ProFormModal, avoiding behavior changes for search forms and dynamic forms that intentionally preserve hidden fields.

## Verification

- Unit-test session creation, close ordering, deep-cloned values, and rapid reopen protection.
- Run type-check, lint, all unit tests, production build, and touched-file formatting checks.
- Browser-test create validation, close, and reopen on the user page; also test edit-to-create and repeated opens.
