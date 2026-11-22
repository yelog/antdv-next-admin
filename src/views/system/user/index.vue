<template>
  <div ref="pageRef" class="page-container user-management">
    <ProTable
      ref="tableRef"
      :columns="columns"
      :request="fetchTableData"
      :toolbar="toolbarConfig"
      :search="searchConfig"
      :show-index-column="false"
      :expandable="{ columnWidth: 36 }"
      :row-class-name="getRowClassName"
      instant-scroll-on-change
      row-key="id"
    >
      <template #toolbar-subtitle="{ total, params }">
        <div class="user-table-context">
          <span v-if="params" ref="resultsSummaryRef" tabindex="-1">
            {{ $t('user.resultsSummary', { count: total, filters: describeFilters(params) }) }}
          </span>
          <span role="status" class="user-save-feedback">
            {{ saveFeedback ? $t(saveFeedback) : '' }}
          </span>
        </div>
      </template>

      <template #toolbar-actions>
        <a-space wrap>
          <a-upload
            v-if="canCreate"
            :show-upload-list="false"
            accept=".csv"
            :before-upload="handleImport"
          >
            <a-button> <UploadOutlined /> {{ $t('common.import') }} </a-button>
          </a-upload>
          <a-button @click="handleExport">
            <DownloadOutlined /> {{ $t('common.export') }}
          </a-button>
          <a-button v-if="canCreate" type="primary" @click="handleCreate">
            <PlusOutlined /> {{ $t('user.createUser') }}
          </a-button>
        </a-space>
      </template>

      <template #bodyCell="{ column, record, text }">
        <a-space v-if="column.dataIndex === 'action'" :size="0">
          <a-button
            v-if="canEdit"
            type="link"
            size="small"
            :data-user-edit="record.id"
            @click="handleEdit(record as User)"
          >
            {{ $t('common.edit') }}
          </a-button>
          <a-dropdown
            v-if="canDelete"
            :menu="moreActions"
            :trigger="['click']"
            placement="bottomRight"
            auto-focus
            @menu-click="handleDelete(record as User)"
          >
            <a-button type="text" size="small" aria-haspopup="menu">
              {{ $t('common.more') }}
            </a-button>
          </a-dropdown>
        </a-space>
        <strong v-else-if="column.dataIndex === 'username'">{{ text }}</strong>
        <a-badge
          v-else-if="column.dataIndex === 'status'"
          :status="record.status === 'active' ? 'success' : 'default'"
          :text="record.status === 'active' ? $t('user.active') : $t('user.inactive')"
        />
        <template v-else-if="column.dataIndex">{{ text || '—' }}</template>
      </template>

      <template #expandedRowRender="{ record }">
        <dl class="user-details">
          <div>
            <dt>{{ $t('user.email') }}</dt>
            <dd>{{ record.email || '—' }}</dd>
          </div>
          <div>
            <dt>{{ $t('user.phone') }}</dt>
            <dd>{{ record.phone || '—' }}</dd>
          </div>
          <div>
            <dt>{{ $t('user.gender') }}</dt>
            <dd>{{ record.gender ? $t(`user.${record.gender}`) : '—' }}</dd>
          </div>
          <div>
            <dt>{{ $t('common.createTime') }}</dt>
            <dd>
              {{ record.createdAt ? dayjs(record.createdAt).format('YYYY-MM-DD HH:mm') : '—' }}
            </dd>
          </div>
        </dl>
      </template>
    </ProTable>

    <ProFormModal
      v-model:open="modalVisible"
      :title="editingUserId ? $t('user.editUser') : $t('user.createUser')"
      :footer="renderFormFooter"
      :ok-text="$t('common.save')"
      :cancel-text="$t('common.cancel')"
      :confirm-loading="submitting"
      :closable="{ disabled: submitting }"
      :focusable="{ focusTriggerAfterClose: !pendingEditFeedback }"
      :session-key="formSessionKey"
      :form-items="formItems"
      :initial-values="formData"
      :grid="{ cols: 2, gutter: 16 }"
      :layout="{ layout: 'vertical' }"
      width="760px"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @closed="handleFormClosed"
    />
  </div>
</template>

<script setup lang="ts">
import type { ApiResponse, PageResult } from '@/types/api';
import type { Role, User } from '@/types/auth';
import type {
  ProFormItem,
  ProTableColumn,
  ProTableLoadStatus,
  ProTableRequestParams,
  ProTableSearch,
} from '@/types/pro';
import type { VNodeChild } from 'vue';

import { PlusOutlined, UploadOutlined, DownloadOutlined } from '@antdv-next/icons';
import { App } from 'antdv-next';
import dayjs from 'dayjs';
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';

import { createUser, deleteUser, getUserList, updateUser } from '@/api/user';
import ProFormModal from '@/components/Pro/ProFormModal/index.vue';
import ProTable from '@/components/Pro/ProTable/index.vue';
import { useCrudFormSession } from '@/composables/useCrudFormSession';
import { usePermission } from '@/composables/usePermission';
import { $t } from '@/locales';
import { exportToCSV, parseCSV } from '@/utils/export';
import { request } from '@/utils/request';

type UserFormValues = {
  username: string;
  realName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female';
  status: boolean;
  roleIds: string[];
  bio: string;
};

const { can } = usePermission();
const { message, modal } = App.useApp();
const canCreate = computed(() => can('system.user.create'));
const canEdit = computed(() => can('system.user.edit'));
const canDelete = computed(() => can('system.user.delete'));

const pageRef = ref<HTMLElement>();
const resultsSummaryRef = ref<HTMLElement>();
const tableRef = ref<InstanceType<typeof ProTable>>();
const {
  open: modalVisible,
  record: editingUser,
  initialValues: formData,
  sessionKey: formSessionKey,
  openCreate: openCreateForm,
  openEdit: openEditForm,
  close: closeFormModal,
  finishClose: finishFormClose,
} = useCrudFormSession<User, UserFormValues>(createDefaultFormValues);
const submitting = ref(false);
const editingUserId = computed(() => editingUser.value?.id ?? null);
const roleOptions = ref<Role[]>([]);
const pendingEditFeedback = shallowRef<{ id: string; status: ProTableLoadStatus }>();
const saveFeedback = ref<string>();
const highlightedUserId = ref<string>();
let highlightTimer: ReturnType<typeof setTimeout> | undefined;

const toolbarConfig = computed(() => ({
  title: $t('user.title'),
}));

const moreActions = computed(() => ({
  items: [{ key: 'delete', label: $t('common.delete'), danger: true }],
}));

const statusOptions = computed(() => [
  { label: $t('user.active'), value: 'active' },
  { label: $t('user.inactive'), value: 'inactive' },
]);

const genderOptions = computed(() => [
  { label: $t('user.male'), value: 'male' },
  { label: $t('user.female'), value: 'female' },
]);

const editableRolesById = computed(() => {
  const rolesById = new Map(roleOptions.value.map((role) => [role.id, role]));
  for (const role of editingUser.value?.roles ?? []) {
    if (!rolesById.has(role.id)) rolesById.set(role.id, role);
  }
  return rolesById;
});

const roleSelectOptions = computed(() =>
  Array.from(editableRolesById.value.values(), (role) => ({
    label: role.name,
    value: role.id,
  })),
);

const searchFormItems = computed<ProFormItem[]>(() => [
  { name: 'username', label: $t('user.username'), type: 'input' },
  { name: 'email', label: $t('user.email'), type: 'input' },
  { name: 'status', label: $t('user.status'), type: 'select', options: statusOptions.value },
]);

const searchConfig = computed<ProTableSearch>(() => ({
  formItems: searchFormItems.value,
  labelWidth: 6,
  defaultCollapsed: true,
  submitOnly: true,
}));

const columns = computed((): ProTableColumn[] => [
  {
    title: $t('user.username'),
    dataIndex: 'username',
    width: 132,
    fixed: canEdit.value || canDelete.value ? undefined : 'left',
  },
  {
    title: $t('user.role'),
    dataIndex: 'roleNames',
    width: 150,
  },
  {
    title: $t('user.status'),
    dataIndex: 'status',
    width: 100,
  },
  {
    title: $t('user.realName'),
    dataIndex: 'realName',
    width: 145,
  },
  ...(canEdit.value || canDelete.value
    ? [
        {
          title: $t('common.actions'),
          dataIndex: 'action',
          width: 124,
          fixed: 'right' as const,
        },
      ]
    : []),
]);

const formItems = computed<ProFormItem[]>(() => [
  {
    name: 'username',
    label: $t('user.username'),
    type: 'input',
    required: true,
    props: {
      disabled: Boolean(editingUserId.value),
    },
    rules: [
      { required: true, message: $t('user.usernameRequired') },
      { min: 3, max: 20, message: $t('user.usernameLength') },
    ],
  },
  {
    name: 'realName',
    label: $t('user.realName'),
    type: 'input',
    required: true,
  },
  {
    name: 'email',
    label: $t('user.email'),
    type: 'input',
    required: true,
    rules: [
      { required: true, message: $t('user.emailRequired') },
      { type: 'email', message: $t('validation.email') },
    ],
  },
  {
    name: 'phone',
    label: $t('user.phone'),
    type: 'input',
    rules: [{ pattern: /^1[3-9]\d{9}$/, message: $t('validation.phone') }],
  },
  {
    name: 'gender',
    label: $t('user.gender'),
    type: 'select',
    options: genderOptions.value,
  },
  {
    name: 'status',
    label: $t('user.status'),
    type: 'switch',
    valuePropName: 'checked',
    required: true,
    props: {
      checkedChildren: $t('user.active'),
      unCheckedChildren: $t('user.inactive'),
    },
  },
  {
    name: 'roleIds',
    label: $t('user.role'),
    type: 'select',
    options: roleSelectOptions.value,
    props: {
      mode: 'multiple',
      allowClear: true,
    },
    rules: [{ type: 'array', required: true, message: $t('user.selectRole') }],
  },
  {
    name: 'bio',
    label: $t('user.bio'),
    type: 'textarea',
    colSpan: 2,
    props: {
      rows: 3,
      maxLength: 200,
      showCount: true,
    },
  },
]);

function createDefaultFormValues(): UserFormValues {
  return {
    username: '',
    realName: '',
    email: '',
    phone: '',
    gender: 'male',
    status: true,
    roleIds: [],
    bio: '',
  };
}

function renderFormFooter({ originNode }: { originNode: VNodeChild }): VNodeChild {
  return originNode;
}

function getUserFilters(params: ProTableRequestParams) {
  return {
    username: typeof params.username === 'string' ? params.username.trim() || undefined : undefined,
    email: typeof params.email === 'string' ? params.email.trim() || undefined : undefined,
    status: params.status === 'active' || params.status === 'inactive' ? params.status : undefined,
  };
}

function describeFilters(params: ProTableRequestParams): string {
  const filters = getUserFilters(params);
  const entries = [
    { label: $t('user.username'), value: filters.username },
    { label: $t('user.email'), value: filters.email },
    { label: $t('user.status'), value: filters.status ? $t(`user.${filters.status}`) : undefined },
  ];
  return (
    entries
      .filter(({ value }) => value)
      .map(({ label, value }) => $t('user.filterValue', { label, value }))
      .join(' · ') || $t('user.noActiveFilters')
  );
}

const fetchTableData = async (params: ProTableRequestParams) => {
  const response = await getUserList({
    current: params.current ?? 1,
    pageSize: params.pageSize ?? 10,
    ...getUserFilters(params),
  });
  if (!response.success) return { success: false, data: [] };

  return {
    data: response.data.list.map((item) => ({
      ...item,
      roleNames: item.roles?.map((role) => role.name).join(', '),
    })),
    total: response.data.total,
    success: true,
  };
};

const fetchRoleOptions = async () => {
  try {
    const response = await request.get<ApiResponse<PageResult<Role>>>('/roles', {
      params: { current: 1, pageSize: 200 },
      skipRedirect: true,
    });
    if (response.success) roleOptions.value = response.data.list;
  } catch {
    return;
  }
};

function getRowClassName(record: { id: string }): string {
  return record.id === highlightedUserId.value ? 'user-row-updated' : '';
}

const handleCreate = () => {
  if (!canCreate.value || submitting.value) return;
  saveFeedback.value = undefined;
  openCreateForm();
};

const handleEdit = (record: User) => {
  if (!canEdit.value || submitting.value) return;
  saveFeedback.value = undefined;
  const statusStr = record.status || 'active';
  const initialValues: UserFormValues = {
    username: record.username,
    realName: record.realName,
    email: record.email,
    phone: record.phone,
    gender: record.gender || 'male',
    status: statusStr === 'active',
    roleIds: (record.roles || []).map((role) => role.id),
    bio: record.bio || '',
  };
  openEditForm(record, initialValues);
};

const handleCancel = () => {
  closeFormModal();
};

function handleFormClosed(): void {
  finishFormClose();
  const pending = pendingEditFeedback.value;
  if (!pending || modalVisible.value) return;
  pendingEditFeedback.value = undefined;

  const row = pageRef.value?.querySelector<HTMLTableRowElement>(
    `tr[data-row-key="${CSS.escape(pending.id)}"]`,
  );
  if (pending.status === 'success') {
    saveFeedback.value = row ? 'user.updateSuccess' : 'user.updatedOutsideResults';
    if (row) {
      clearTimeout(highlightTimer);
      highlightedUserId.value = pending.id;
      highlightTimer = setTimeout(() => {
        highlightedUserId.value = undefined;
      }, 600);
    }
  } else {
    saveFeedback.value =
      pending.status === 'failed' ? 'user.updatedRefreshFailed' : 'user.updatedQueryChanged';
  }

  if (pageRef.value?.isConnected) {
    const editControl =
      pending.status === 'success' ? row?.querySelector<HTMLElement>('[data-user-edit]') : null;
    (editControl ?? resultsSummaryRef.value)?.focus({ preventScroll: true });
  }
}

const handleDelete = (record: User) => {
  if (!canDelete.value) return;
  modal.confirm({
    title: $t('user.deleteUser'),
    content: $t('user.confirmDelete'),
    okText: $t('common.delete'),
    cancelText: $t('common.cancel'),
    okButtonProps: { danger: true },
    autoFocusButton: 'cancel',
    onOk: async () => {
      const response = await deleteUser(record.id);
      if (!response.success) {
        message.error(response.message || $t('common.error'));
        return;
      }
      message.success($t('common.success'));
      await tableRef.value?.refreshWithResult();
    },
  });
};

const handleSubmit = async (rawValues: Record<string, unknown>) => {
  const record = editingUser.value;
  if (submitting.value || !modalVisible.value || !(record ? canEdit.value : canCreate.value)) {
    return;
  }

  const values = rawValues as UserFormValues;

  const roleIds = values.roleIds ?? record?.roles?.map((role) => role.id) ?? [];
  const selectedRoles: Role[] = [];
  for (const roleId of roleIds) {
    const role = editableRolesById.value.get(roleId);
    if (!role) {
      message.error($t('user.roleUnavailable'));
      return;
    }
    selectedRoles.push(role);
  }

  const payload: Partial<User> = {
    username: values.username?.trim(),
    realName: values.realName?.trim(),
    email: values.email?.trim(),
    phone: values.phone?.trim(),
    gender: values.gender,
    status: values.status ? 'active' : 'inactive',
    bio: values.bio?.trim(),
    roles: selectedRoles,
  };

  submitting.value = true;
  try {
    const response = record ? await updateUser(record.id, payload) : await createUser(payload);
    if (!response.success) {
      message.error(response.message || $t('common.error'));
      return;
    }

    if (record) {
      const status = (await tableRef.value?.refreshWithResult()) ?? 'superseded';
      pendingEditFeedback.value = { id: record.id, status };
    } else {
      message.success($t('user.createSuccess'));
      tableRef.value?.reload();
    }
    closeFormModal();
  } catch {
    return;
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  if (canCreate.value || canEdit.value) void fetchRoleOptions();
});

onBeforeUnmount(() => {
  clearTimeout(highlightTimer);
});

// export user data
const handleExport = async () => {
  try {
    const response = await getUserList({ current: 1, pageSize: 9999 });
    const list = response.data.list;
    exportToCSV(
      [
        { title: $t('user.username'), dataIndex: 'username' },
        { title: $t('user.realName'), dataIndex: 'realName' },
        { title: $t('user.email'), dataIndex: 'email' },
        { title: $t('user.phone'), dataIndex: 'phone' },
        {
          title: $t('user.gender'),
          dataIndex: 'gender',
          render: (v: unknown) => (v === 'male' ? $t('user.male') : $t('user.female')),
        },
        {
          title: $t('user.status'),
          dataIndex: 'status',
          render: (v: unknown) => (v === 'active' ? $t('user.active') : $t('user.inactive')),
        },
        {
          title: $t('user.role'),
          dataIndex: 'roles',
          render: (_: unknown, r: unknown) =>
            (((r as Record<string, unknown>).roles as Array<{ name: string }>) || [])
              .map((role) => role.name)
              .join(', '),
        },
        { title: $t('common.createTime'), dataIndex: 'createdAt' },
      ],
      list,
      `${$t('user.title')}_${new Date().toISOString().slice(0, 10)}`,
    );
    message.success($t('user.exportSuccess'));
  } catch {
    message.error($t('user.exportFailed'));
  }
};

// import user data
const handleImport = async (file: File) => {
  if (!canCreate.value) return false;

  try {
    const rows = await parseCSV(file);
    if (rows.length < 2) {
      message.warning($t('user.importEmpty'));
      return false;
    }
    const header = rows[0];
    const findColumn = (label: string, ...aliases: string[]) => {
      const names = [label.toLowerCase(), ...aliases];
      return header.findIndex((cell) => names.includes(cell.toLowerCase()));
    };
    const usernameIdx = findColumn($t('user.username'), 'username', 'user name', 'user_name');
    const realNameIdx = findColumn(
      $t('user.realName'),
      'name',
      'real name',
      'realname',
      'real_name',
    );
    const emailIdx = findColumn($t('user.email'), 'email', 'e-mail');

    if (usernameIdx === -1 || realNameIdx === -1 || emailIdx === -1) {
      message.error($t('user.importFormatError'));
      return false;
    }

    const importTasks = rows
      .slice(1)
      .filter((row) => row[usernameIdx])
      .map((row) =>
        createUser({
          username: row[usernameIdx],
          realName: row[realNameIdx] || '',
          email: row[emailIdx] || '',
          status: 'active',
        }),
      );
    const results = await Promise.allSettled(importTasks);
    const successCount = results.filter(
      (result) => result.status === 'fulfilled' && result.value.success,
    ).length;
    message.success($t('user.importSuccess', { count: successCount }));
    await tableRef.value?.refreshWithResult();
  } catch {
    message.error($t('user.importFailed'));
  }
  return false;
};
</script>

<style scoped>
.user-management :deep(.pro-table-toolbar) {
  height: auto;
  flex-wrap: wrap;
  gap: 6px 16px;
  padding-block: 6px;
}

.user-management :deep(.toolbar-left) {
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.user-management :deep(.toolbar-right) {
  flex-wrap: wrap;
  flex-shrink: 1;
  min-inline-size: 0;
}

.user-table-context {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 12px;
  overflow-wrap: anywhere;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.user-table-context [tabindex]:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.user-save-feedback {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.user-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
  gap: 8px 16px;
  margin: 0;
  overflow-wrap: anywhere;
}

.user-details dt {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.user-details dd {
  margin: 2px 0 0;
}

.user-management :deep(.user-row-updated > td) {
  --user-row-highlight: color-mix(in srgb, var(--color-primary) 14%, transparent);
  animation: user-row-saved 600ms ease-out;
}

@keyframes user-row-saved {
  from {
    box-shadow: inset 0 0 0 9999px var(--user-row-highlight);
  }
  to {
    box-shadow: inset 0 0 0 9999px transparent;
  }
}

@media (prefers-reduced-motion: reduce) {
  .user-management :deep(.user-row-updated > td) {
    animation: none;
    box-shadow: inset 0 0 0 9999px var(--user-row-highlight);
  }
}
</style>
