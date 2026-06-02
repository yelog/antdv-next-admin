# ProTable Unification Design

## Goal

Make `ProTable` the unified table entry point for all example pages. Pages should not use `a-table` directly for example functionality; they should express both management tables and lightweight preview tables through `ProTable`.

This keeps frontend styling, column configuration, slot usage, and development patterns consistent across examples.

## Current State

The example pages currently mix `ProTable` and direct `a-table` usage.

Direct `a-table` usage appears in:

- `src/views/examples/scaffold/master-detail/index.vue`
- `src/views/examples/scaffold/advanced-filter/index.vue`
- `src/views/examples/scaffold/virtual-table/index.vue`
- `src/views/examples/scaffold/import-export/index.vue`

`ProTable` currently assumes a remote request model through a required `request` prop. This makes it awkward for local data, preview results, virtual tables, and import/export feedback tables.

## Design

### Data Modes

`ProTable` will support two data modes:

- Remote mode: use `request` to load data, preserving the existing behavior.
- Local mode: use `dataSource` when `request` is not provided.

Rules:

- If `request` exists, remote mode wins.
- If `request` does not exist and `dataSource` exists, local mode renders that data.
- If neither exists, the table renders an empty list.
- Existing remote tables should not change behavior.

### Lightweight Mode

Examples can turn off management features through existing props and a small toolbar extension:

- `search=false` disables the generated search form.
- `toolbar=false` disables the table title toolbar and built-in actions.
- `pagination=false` disables pagination.
- `showIndexColumn=false` disables the generated index column.

This keeps the public API compact while allowing `ProTable` to represent preview tables, error tables, and virtual tables.

### Attribute Passthrough

`ProTable` already passes `$attrs` to the inner `a-table`. This behavior remains important for table-specific features such as:

- `row-selection`
- `on-row`
- `virtual`
- `scroll`
- `bordered`

The migration should preserve these passthrough scenarios.

### Example Migration

`master-detail` will use `ProTable` with local data, disabled search and toolbar, and row click passthrough.

`advanced-filter` will keep the advanced condition builder in the page and render preview rows through `ProTable` in lightweight mode.

`virtual-table` will use `ProTable` with local data, `virtual`, fixed scroll, disabled pagination, and disabled management features.

`import-export` will use two `ProTable` instances: one for imported product data and one for import errors.

## Data Flow

Remote mode:

1. Search, header filters, sorters, and pagination update internal state.
2. `ProTable` builds request params.
3. `request` returns `{ success, data, total }`.
4. `ProTable` renders returned data and total.

Local mode:

1. The page owns local rows through refs or computed values.
2. `ProTable` receives rows through `dataSource`.
3. `ProTable` renders the rows directly.
4. Pagination, when enabled, is delegated to the underlying `a-table` pagination behavior.

## Error Handling

Remote mode keeps the existing `try/catch` behavior and shows `message.error()` on request failure.

Local mode does not perform async loading, so no additional error handling is needed inside `ProTable`.

## Testing

Verification should include:

- `npm run type-check`
- `npm run build`
- Manual smoke check of the migrated examples if a dev server is available.

Important behavior to verify:

- Existing remote `ProTable` pages still load.
- Local `dataSource` tables render without `request`.
- `toolbar=false` removes the toolbar.
- `virtual` table still renders with fixed scroll.
- `bodyCell` slots still work in migrated pages.
