<template>
  <div class="page-container">
    <div class="search-layout-demo">
      <a-space wrap :size="12">
        <span class="search-layout-demo-label">
          {{ $t('examples.scaffold.proTableAdvanced.searchColumnsPerRow') }}
        </span>
        <a-segmented v-model:value="searchColumnsPerRow" :options="[2, 3, 4, 5]" />
        <code>search.columnsPerRow = {{ searchColumnsPerRow }}</code>
      </a-space>
      <span class="search-layout-demo-hint">
        {{ $t('examples.scaffold.proTableAdvanced.searchColumnsPerRowHint') }}
      </span>
    </div>

    <ProTable
      :columns="columns"
      :request="requestTableData"
      :toolbar="toolbarConfig"
      :search="{
        formItems: searchFormItems,
        labelWidth: 80,
        defaultCollapsed: true,
        collapsedRows: 1,
        columnsPerRow: searchColumnsPerRow,
      }"
      :row-selection="rowSelection"
      row-key="id"
    >
      <template #toolbar-actions>
        <a-space wrap>
          <a-tag color="processing">{{
            $t('examples.scaffold.proTableAdvanced.selectedCount', {
              count: selectedRowKeys.length,
            })
          }}</a-tag>
          <a-button
            :disabled="selectedRowKeys.length === 0"
            @click="handleBatchSetStatus('inactive')"
          >
            {{ $t('examples.scaffold.proTableAdvanced.batchDisable') }}
          </a-button>
          <a-button danger :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete">
            {{ $t('examples.scaffold.proTableAdvanced.batchDelete') }}
          </a-button>
          <a-button type="primary" @click="handleCreate">
            <PlusOutlined /> {{ $t('examples.scaffold.proTableAdvanced.createUser') }}
          </a-button>
          <a-button @click="exportCsv">{{
            $t('examples.scaffold.proTableAdvanced.export')
          }}</a-button>
        </a-space>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'status'">
          <a-switch
            :checked="record.status === 'active'"
            :loading="switchLoadingId === record.id"
            :checked-children="$t('examples.scaffold.proTableAdvanced.statusActive')"
            :un-checked-children="$t('examples.scaffold.proTableAdvanced.statusInactive')"
            @change="handleStatusSwitchChange(record.id, $event as boolean)"
          />
        </template>
      </template>
    </ProTable>

    <ProFormModal
      v-model:open="modalVisible"
      :title="
        editingId
          ? $t('examples.scaffold.proTableAdvanced.editUser')
          : $t('examples.scaffold.proTableAdvanced.createUser')
      "
      :confirm-loading="submitting"
      :session-key="formSessionKey"
      :form-items="formItems"
      :initial-values="formData"
      :grid="{ cols: 2, gutter: 16 }"
      :layout="{ layout: 'vertical' }"
      width="640px"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @closed="finishFormClose"
    />
  </div>
</template>

<script setup lang="ts">
import type { ProFormItem, ProTableColumn } from '@/types/pro';

import { EditOutlined, DeleteOutlined, PlusOutlined } from '@antdv-next/icons';
import { message, Modal } from 'antdv-next';
import { computed, ref } from 'vue';

import ProFormModal from '@/components/Pro/ProFormModal/index.vue';
import ProTable from '@/components/Pro/ProTable/index.vue';
import { useCrudFormSession } from '@/composables/useCrudFormSession';
import { $t } from '@/locales';

interface DemoRow {
  id: string;
  username: string;
  realName: string;
  email: string;
  gender: 'male' | 'female';
  status: 'active' | 'inactive';
  createdAt: string;
}

const createMockRows = (): DemoRow[] => {
  return Array.from({ length: 48 }, (_, index) => {
    const i = index + 1;
    const isMale = i % 2 === 0;

    return {
      id: `demo-${i}`,
      username: `user_${String(i).padStart(3, '0')}`,
      realName: isMale ? `张三${i}` : `李四${i}`,
      email: `user_${i}@example.com`,
      gender: isMale ? 'male' : 'female',
      status: i % 3 === 0 ? 'inactive' : 'active',
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    };
  });
};

const tableRows = ref<DemoRow[]>(createMockRows());
const selectedRowKeys = ref<string[]>([]);
const switchLoadingId = ref<string | null>(null);

type DemoFormValues = Pick<DemoRow, 'username' | 'realName' | 'email' | 'gender'> & {
  status: boolean;
};

function createDefaultFormValues(): DemoFormValues {
  return {
    username: '',
    realName: '',
    email: '',
    gender: 'male',
    status: true,
  };
}

const {
  open: modalVisible,
  record: editingRecord,
  initialValues: formData,
  sessionKey: formSessionKey,
  openCreate: openCreateForm,
  openEdit: openEditForm,
  close: closeFormModal,
  finishClose: finishFormClose,
} = useCrudFormSession<DemoRow, DemoFormValues>(createDefaultFormValues);
const submitting = ref(false);
const searchColumnsPerRow = ref(3);
const editingId = computed(() => editingRecord.value?.id ?? null);

const toolbarConfig = computed(() => ({
  title: $t('examples.scaffold.proTableAdvanced.title'),
  subTitle: $t('examples.scaffold.proTableAdvanced.description'),
  actions: ['refresh', 'density', 'columnSetting'] as Array<
    'refresh' | 'density' | 'columnSetting'
  >,
}));

const searchFormItems = computed<ProFormItem[]>(() => [
  { name: 'username', label: $t('examples.scaffold.proTableAdvanced.username'), type: 'input' },
  { name: 'realName', label: $t('examples.scaffold.proTableAdvanced.realName'), type: 'input' },
  { name: 'email', label: $t('examples.scaffold.proTableAdvanced.email'), type: 'input' },
  {
    name: 'gender',
    label: $t('examples.scaffold.proTableAdvanced.gender'),
    type: 'select',
    options: [
      { label: $t('user.male'), value: 'male' },
      { label: $t('user.female'), value: 'female' },
    ],
  },
  {
    name: 'status',
    label: $t('examples.scaffold.proTableAdvanced.status'),
    type: 'select',
    options: [
      {
        label: $t('examples.scaffold.proTableAdvanced.statusActive'),
        value: 'active',
      },
      {
        label: $t('examples.scaffold.proTableAdvanced.statusInactive'),
        value: 'inactive',
      },
    ],
  },
]);

const formItems = computed<ProFormItem[]>(() => [
  {
    name: 'username',
    label: $t('examples.scaffold.proTableAdvanced.username'),
    type: 'input',
    required: true,
    props: {
      disabled: Boolean(editingId.value),
    },
    rules: [
      { required: true, message: $t('examples.scaffold.proTableAdvanced.usernameRequired') },
      { min: 3, max: 20, message: $t('user.usernameLength') },
    ],
  },
  {
    name: 'realName',
    label: $t('examples.scaffold.proTableAdvanced.realName'),
    type: 'input',
    required: true,
  },
  {
    name: 'email',
    label: $t('examples.scaffold.proTableAdvanced.email'),
    type: 'input',
    required: true,
    rules: [
      { required: true, message: $t('examples.scaffold.proTableAdvanced.emailRequired') },
      { type: 'email', message: $t('validation.email') },
    ],
  },
  {
    name: 'gender',
    label: $t('examples.scaffold.proTableAdvanced.gender'),
    type: 'select',
    options: [
      { label: $t('user.male'), value: 'male' },
      { label: $t('user.female'), value: 'female' },
    ],
  },
  {
    name: 'status',
    label: $t('examples.scaffold.proTableAdvanced.status'),
    type: 'switch',
    valuePropName: 'checked',
    required: true,
    props: {
      checkedChildren: $t('examples.scaffold.proTableAdvanced.statusActive'),
      unCheckedChildren: $t('examples.scaffold.proTableAdvanced.statusInactive'),
    },
  },
]);

const columns = computed<ProTableColumn[]>(() => [
  {
    title: $t('examples.scaffold.proTableAdvanced.username'),
    dataIndex: 'username',
    width: 150,
  },
  {
    title: $t('examples.scaffold.proTableAdvanced.realName'),
    dataIndex: 'realName',
    width: 140,
  },
  {
    title: $t('examples.scaffold.proTableAdvanced.email'),
    dataIndex: 'email',
    width: 220,
  },
  {
    title: $t('examples.scaffold.proTableAdvanced.gender'),
    dataIndex: 'gender',
    valueType: 'tag',
    valueEnum: {
      male: { text: $t('user.male'), color: 'blue' },
      female: { text: $t('user.female'), color: 'pink' },
    },
    width: 120,
  },
  {
    title: $t('examples.scaffold.proTableAdvanced.status'),
    dataIndex: 'status',
    width: 140,
  },
  {
    title: $t('examples.scaffold.proTableAdvanced.createdAt'),
    dataIndex: 'createdAt',
    valueType: 'dateTime',
    width: 190,
  },
  {
    title: $t('common.actions'),
    dataIndex: 'action',
    width: 180,
    fixed: 'right',
    actions: [
      {
        label: $t('common.edit'),
        icon: EditOutlined,
        onClick: (record) => handleEdit(record as unknown as DemoRow),
      },
      {
        label: $t('common.delete'),
        icon: DeleteOutlined,
        danger: true,
        confirm: $t('examples.scaffold.proTableAdvanced.deleteConfirm'),
        onClick: (record) => {
          tableRows.value = tableRows.value.filter((item) => item.id !== record.id);
          selectedRowKeys.value = selectedRowKeys.value.filter((id) => id !== record.id);
          message.success($t('examples.scaffold.proTableAdvanced.deleteSuccess'));
        },
      },
    ],
  },
]);

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: Array<string | number>) => {
    selectedRowKeys.value = keys.map((item) => String(item));
  },
}));

const requestTableData = async (params: Record<string, unknown>) => {
  const current = Number(params.current || 1);
  const pageSize = Number(params.pageSize || 10);

  let filtered = [...tableRows.value];

  if (params.username) {
    const keyword = String(params.username).toLowerCase();
    filtered = filtered.filter((item) => item.username.toLowerCase().includes(keyword));
  }

  if (params.realName) {
    const keyword = String(params.realName).toLowerCase();
    filtered = filtered.filter((item) => item.realName.toLowerCase().includes(keyword));
  }

  if (params.email) {
    const keyword = String(params.email).toLowerCase();
    filtered = filtered.filter((item) => item.email.toLowerCase().includes(keyword));
  }

  if (params.gender) {
    filtered = filtered.filter((item) => item.gender === params.gender);
  }

  if (params.status) {
    filtered = filtered.filter((item) => item.status === params.status);
  }

  const start = (current - 1) * pageSize;
  const list = filtered.slice(start, start + pageSize);

  return {
    success: true,
    data: list,
    total: filtered.length,
  };
};

const handleStatusChange = (id: string, checked: boolean) => {
  const row = tableRows.value.find((item) => item.id === id);
  if (!row) {
    return;
  }

  row.status = checked ? 'active' : 'inactive';
  message.success(
    $t('examples.scaffold.proTableAdvanced.statusChangeSuccess', {
      status: checked
        ? $t('examples.scaffold.proTableAdvanced.statusActive')
        : $t('examples.scaffold.proTableAdvanced.statusInactive'),
      username: row.username,
    }),
  );
};

const handleStatusSwitchChange = async (id: string, checked: boolean) => {
  switchLoadingId.value = id;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    handleStatusChange(id, checked);
  } finally {
    switchLoadingId.value = null;
  }
};

const handleCreate = () => {
  openCreateForm();
};

const handleEdit = (record: DemoRow) => {
  const initialValues: DemoFormValues = {
    username: record.username,
    realName: record.realName,
    email: record.email,
    gender: record.gender,
    status: record.status === 'active',
  };
  openEditForm(record, initialValues);
};

const handleCancel = () => {
  closeFormModal();
};

const handleSubmit = async (rawValues: Record<string, unknown>) => {
  const values = rawValues as DemoFormValues;

  submitting.value = true;
  try {
    const statusValue = values.status ? 'active' : 'inactive';

    if (editingId.value) {
      const row = tableRows.value.find((item) => item.id === editingId.value);
      if (row) {
        row.username = values.username.trim();
        row.realName = values.realName.trim();
        row.email = values.email.trim();
        row.gender = values.gender;
        row.status = statusValue;
      }
      message.success($t('examples.scaffold.proTableAdvanced.updateSuccess'));
    } else {
      const newId = `demo-${Date.now()}`;
      tableRows.value.unshift({
        id: newId,
        username: values.username.trim(),
        realName: values.realName.trim(),
        email: values.email.trim(),
        gender: values.gender,
        status: statusValue,
        createdAt: new Date().toISOString(),
      });
      message.success($t('examples.scaffold.proTableAdvanced.createSuccess'));
    }

    closeFormModal();
  } finally {
    submitting.value = false;
  }
};

const handleBatchSetStatus = (status: DemoRow['status']) => {
  if (selectedRowKeys.value.length === 0) {
    return;
  }

  const set = new Set(selectedRowKeys.value);
  tableRows.value = tableRows.value.map((item) => {
    if (set.has(item.id)) {
      return {
        ...item,
        status,
      };
    }
    return item;
  });

  message.success(
    $t('examples.scaffold.proTableAdvanced.batchSetStatusSuccess', {
      count: selectedRowKeys.value.length,
    }),
  );
};

const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    return;
  }

  Modal.confirm({
    title: $t('examples.scaffold.proTableAdvanced.batchDeleteTitle'),
    content: $t('examples.scaffold.proTableAdvanced.batchDeleteContent', {
      count: selectedRowKeys.value.length,
    }),
    onOk: () => {
      const set = new Set(selectedRowKeys.value);
      tableRows.value = tableRows.value.filter((item) => !set.has(item.id));
      selectedRowKeys.value = [];
      message.success($t('examples.scaffold.proTableAdvanced.batchDeleteSuccess'));
    },
  });
};

const exportCsv = () => {
  const headers = ['id', 'username', 'realName', 'email', 'gender', 'status', 'createdAt'];
  const rows = tableRows.value.map((item) => [
    item.id,
    item.username,
    item.realName,
    item.email,
    item.gender,
    item.status,
    item.createdAt,
  ]);

  const csv = [headers, ...rows]
    .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pro-table-advanced-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);

  message.success($t('examples.scaffold.proTableAdvanced.exportSuccess'));
};
</script>

<style scoped>
.search-layout-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  margin-bottom: 16px;
  padding: 12px 16px;
  color: var(--color-text-secondary);
  background: var(--color-bg-container);
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-base);
}

.search-layout-demo-label {
  color: var(--color-text-primary);
  font-weight: 500;
}

.search-layout-demo code {
  padding: 2px 8px;
  color: var(--color-primary);
  background: var(--color-primary-bg);
  border-radius: var(--radius-sm);
}

.search-layout-demo-hint {
  font-size: 12px;
}
</style>
