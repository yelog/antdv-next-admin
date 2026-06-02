# ProTable Unification Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make every example table use `ProTable` while preserving existing behavior for remote management tables, local preview tables, virtual tables, and import/export feedback tables.

**Architecture:** Extend `ProTable` from a request-only component into a unified table entry point with remote and local data modes. Keep existing remote behavior unchanged, add local `dataSource` rendering, support `toolbar=false`, and migrate direct `a-table` usages in example pages to lightweight `ProTable` configurations.

**Tech Stack:** Vue 3 `<script setup>`, TypeScript strict mode, Antdv Next, existing `ProTable` and `ProTableColumn` types.

---

## Constraints

- Do not use `as any`, `@ts-ignore`, or `@ts-expect-error`.
- Do not commit changes unless explicitly requested.
- Keep existing remote `ProTable` behavior compatible.
- Keep migrated examples visually and behaviorally equivalent unless the change is required for consistency.

## Task 1: Extend ProTable Types

**Files:**

- Modify: `src/types/pro.ts`
- Modify: `src/components/Pro/ProTable/index.vue`

**Step 1: Inspect existing type definitions**

Read `src/types/pro.ts` and locate `ProTableRequest`, `ProTableColumn`, `ProTableToolbar`, `ProTablePagination`, and related table types.

**Step 2: Update public table props shape**

In `src/components/Pro/ProTable/index.vue`, change the local `Props` interface:

```ts
interface Props {
  columns: ProTableColumn[];
  request?: ProTableRequest;
  dataSource?: Record<string, unknown>[];
  toolbar?: ProTableToolbar | false;
  search?: ProTableSearch | false;
  headerFilter?: ProTableHeaderFilterConfig;
  pagination?: ProTablePagination | false;
  rowKey?: string | ((record: Record<string, unknown>) => string);
  size?: ProTableDensity;
  height?: ProTableHeight;
  resizable?: boolean;
  columnResizable?: boolean;
  ellipsis?: boolean;
  bordered?: boolean;
  fixedHeader?: boolean;
  showIndexColumn?: boolean;
  formItems?: ProFormItem[];
  formGrid?: ProFormGrid;
  formLayout?: ProFormLayout;
  formModalWidth?: number | string;
  formCreateTitle?: string;
  formEditTitle?: string;
}
```

**Step 3: Adjust toolbar computed access**

Anywhere `props.toolbar?.actions`, `props.toolbar.title`, or `props.toolbar.subTitle` is used, ensure `false` is handled safely.

Expected logic:

```ts
const toolbarConfig = computed(() => props.toolbar === false ? undefined : props.toolbar);
```

Then derive toolbar actions from `toolbarConfig`.

**Step 4: Run type check**

Run: `npm run type-check`

Expected: Type errors may still exist until data mode is implemented in Task 2, but no syntax errors should be introduced.

## Task 2: Add Local Data Mode to ProTable

**Files:**

- Modify: `src/components/Pro/ProTable/index.vue`

**Step 1: Rename internal data state**

Rename the internal remote data ref from `dataSource` to `remoteDataSource` to avoid confusion with the new prop.

Expected declaration:

```ts
const remoteDataSource = ref<Record<string, unknown>[]>([]);
```

**Step 2: Add computed rendered data**

Add a computed value that chooses remote or local mode:

```ts
const tableDataSource = computed(() => {
  if (props.request) {
    return remoteDataSource.value;
  }
  return props.dataSource || [];
});
```

Update the template table binding from:

```vue
:data-source="dataSource"
```

to:

```vue
:data-source="tableDataSource"
```

**Step 3: Guard remote loading**

Update `loadData` so local mode does not call a missing request:

```ts
const loadData = async () => {
  if (!props.request) {
    return;
  }

  loading.value = true;
  try {
    // existing remote request logic
  } catch (error: unknown) {
    message.error((error as Error).message || $t("proTable.loadDataFailed"));
  } finally {
    loading.value = false;
  }
};
```

Inside success handling, write to `remoteDataSource.value`.

**Step 4: Adjust total in local mode**

Use local length for pagination total when no request exists:

```ts
const effectiveTotal = computed(() => {
  if (props.request) {
    return total.value;
  }
  return props.dataSource?.length || 0;
});
```

Use `effectiveTotal.value` inside `paginationConfig`.

**Step 5: Adjust watchers and measurement dependencies**

Replace references to internal `dataSource` in measurement watchers with `tableDataSource`.

Expected dependency list should include `tableDataSource`, not the old internal ref.

**Step 6: Confirm mounted behavior**

Ensure `onMounted` only loads remote data when `props.request` exists, while still measuring layout for local mode.

Expected behavior:

```ts
onMounted(() => {
  if (props.request) {
    loadData();
  }
  scheduleMeasureTable();
});
```

**Step 7: Run type check**

Run: `npm run type-check`

Expected: Type check passes for `ProTable` or exposes remaining migration errors.

## Task 3: Migrate Master Detail Table

**Files:**

- Modify: `src/views/examples/scaffold/master-detail/index.vue`

**Step 1: Replace `a-table` with `ProTable`**

Use local data mode:

```vue
<ProTable
  :columns="columns"
  :data-source="listData"
  :search="false"
  :toolbar="false"
  :pagination="{ pageSize: 8 }"
  :show-index-column="false"
  row-key="id"
  :on-row="buildRowProps"
>
  <template #bodyCell="{ column, record }">
    <template v-if="column.dataIndex === 'status'">
      <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
    </template>
  </template>
</ProTable>
```

**Step 2: Import ProTable and type columns**

Add:

```ts
import type { ProDescriptionItem, ProDetailTab, ProTableColumn } from '@/types/pro';
import ProTable from '@/components/Pro/ProTable/index.vue';
```

Update columns:

```ts
const columns = computed<ProTableColumn[]>(() => [
  // existing column definitions
]);
```

**Step 3: Run type check**

Run: `npm run type-check`

Expected: No type errors from `master-detail`.

## Task 4: Migrate Advanced Filter Preview Table

**Files:**

- Modify: `src/views/examples/scaffold/advanced-filter/index.vue`

**Step 1: Replace preview `a-table` with `ProTable`**

Use lightweight local mode:

```vue
<ProTable
  row-key="id"
  size="small"
  :columns="columns"
  :data-source="previewRows"
  :search="false"
  :toolbar="false"
  :pagination="false"
  :show-index-column="false"
/>
```

**Step 2: Import ProTable and type columns**

Add:

```ts
import type { ProTableColumn } from '@/types/pro';
import ProTable from '@/components/Pro/ProTable/index.vue';
```

Update columns:

```ts
const columns = computed<ProTableColumn[]>(() => [
  // existing column definitions
]);
```

**Step 3: Run type check**

Run: `npm run type-check`

Expected: No type errors from `advanced-filter`.

## Task 5: Migrate Virtual Table

**Files:**

- Modify: `src/views/examples/scaffold/virtual-table/index.vue`

**Step 1: Replace `a-table` with `ProTable`**

Use local virtual mode:

```vue
<ProTable
  row-key="id"
  size="small"
  bordered
  virtual
  :columns="columns"
  :data-source="filteredRows"
  :search="false"
  :toolbar="false"
  :pagination="false"
  :show-index-column="false"
  :scroll="{ y: 520, x: 1200 }"
>
  <template #bodyCell="{ column, record }">
    <template v-if="column.dataIndex === 'status'">
      <a-tag :color="getStatusColor(record.status)">
        {{ getStatusText(record.status) }}
      </a-tag>
    </template>
  </template>
</ProTable>
```

**Step 2: Import ProTable and type columns**

Add:

```ts
import type { ProTableColumn } from '@/types/pro';
import ProTable from '@/components/Pro/ProTable/index.vue';
```

Update columns:

```ts
const columns = computed<ProTableColumn[]>(() => [
  // existing column definitions
]);
```

**Step 3: Run type check**

Run: `npm run type-check`

Expected: No type errors from `virtual-table`.

## Task 6: Migrate Import Export Tables

**Files:**

- Modify: `src/views/examples/scaffold/import-export/index.vue`

**Step 1: Replace product data table**

Use:

```vue
<ProTable
  row-key="code"
  size="small"
  :columns="dataColumns"
  :data-source="rows"
  :search="false"
  :toolbar="false"
  :pagination="{ pageSize: 8 }"
  :show-index-column="false"
/>
```

**Step 2: Replace error table**

Use:

```vue
<ProTable
  row-key="id"
  size="small"
  :columns="errorColumns"
  :data-source="importErrors"
  :search="false"
  :toolbar="false"
  :pagination="{ pageSize: 6 }"
  :show-index-column="false"
/>
```

**Step 3: Import ProTable and type columns**

Add:

```ts
import type { ProTableColumn } from '@/types/pro';
import ProTable from '@/components/Pro/ProTable/index.vue';
```

Update both column computed values:

```ts
const dataColumns = computed<ProTableColumn[]>(() => [
  // existing product columns
]);

const errorColumns = computed<ProTableColumn[]>(() => [
  // existing error columns
]);
```

**Step 4: Run type check**

Run: `npm run type-check`

Expected: No type errors from `import-export`.

## Task 7: Verify No Example Tables Use Direct a-table

**Files:**

- Check: `src/views/examples/**/*.vue`

**Step 1: Search for direct table usage**

Run a content search for:

```txt
<a-table
```

Expected: No matches under `src/views/examples`.

Matches inside `src/components/Pro/ProTable/index.vue` are expected and valid.

**Step 2: Search for ProTable usage in migrated pages**

Confirm these files contain `<ProTable`:

- `src/views/examples/scaffold/master-detail/index.vue`
- `src/views/examples/scaffold/advanced-filter/index.vue`
- `src/views/examples/scaffold/virtual-table/index.vue`
- `src/views/examples/scaffold/import-export/index.vue`

## Task 8: Final Verification

**Files:**

- Check full project build.

**Step 1: Run type check**

Run: `npm run type-check`

Expected: exits 0.

**Step 2: Run production build**

Run: `npm run build`

Expected: exits 0 and generates `dist/`.

**Step 3: Inspect git diff**

Run: `git diff -- src/components/Pro/ProTable/index.vue src/views/examples/scaffold/master-detail/index.vue src/views/examples/scaffold/advanced-filter/index.vue src/views/examples/scaffold/virtual-table/index.vue src/views/examples/scaffold/import-export/index.vue docs/plans/2026-06-02-pro-table-unification-design.md docs/plans/2026-06-02-pro-table-unification.md`

Expected: Diff only contains the planned ProTable unification changes.

**Step 4: Do not commit**

Do not run `git commit` unless the user explicitly asks for it.
