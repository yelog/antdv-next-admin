<template>
  <div class="page-container">
    <ProTable
      :columns="columns"
      :request="fetchData"
      :toolbar="{
        title: $t('exampleTable.userList'),
        subTitle: $t('exampleTable.subTitle'),
        actions: ['refresh', 'columnSetting'],
      }"
      :search="{
        formItems: searchFormItems,
        labelWidth: 80,
        defaultCollapsed: true,
      }"
      :header-filter="{
        defaultMode: 'server',
        requestPayload: 'flat',
      }"
      row-key="id"
    >
      <template #toolbar-actions>
        <a-button type="primary" @click="handleCreate">
          <PlusOutlined /> {{ $t('exampleTable.createUser') }}
        </a-button>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'status'">
          <a-switch
            :checked="record.status === 'active'"
            @change="handleStatusChange(record, $event as boolean)"
          >
            <template #checkedChildren>{{ $t('user.active') }}</template>
            <template #unCheckedChildren>{{ $t('user.inactive') }}</template>
          </a-switch>
        </template>
        <template v-else-if="column.dataIndex === 'gender'">
          <a-tag :color="genderValueEnum[record.gender]?.color">
            {{ genderValueEnum[record.gender]?.text || record.gender }}
          </a-tag>
        </template>
      </template>
    </ProTable>

    <!-- Create/Edit Modal -->
    <ProFormModal
      v-model:open="modalVisible"
      :title="editingId ? $t('exampleTable.editUser') : $t('exampleTable.createUser')"
      :session-key="formSessionKey"
      :form-items="formItems"
      :initial-values="formData"
      :grid="{ cols: 2, gutter: 16 }"
      width="600px"
      @submit="handleSubmit"
      @cancel="closeFormModal"
      @closed="finishFormClose"
    />
  </div>
</template>

<script setup lang="ts">
import type { PageParams } from '@/types/api';
import type { User } from '@/types/auth';
import type { ProTableColumn, ProFormItem, ProTableRequestParams } from '@/types/pro';

import { PlusOutlined, EditOutlined, DeleteOutlined } from '@antdv-next/icons';
import { message } from 'antdv-next';
import { computed } from 'vue';

import { getUserList, createUser, updateUser, deleteUser } from '@/api/user';
import ProFormModal from '@/components/Pro/ProFormModal/index.vue';
import ProTable from '@/components/Pro/ProTable/index.vue';
import { useCrudFormSession } from '@/composables/useCrudFormSession';
import { $t } from '@/locales';
import { commonRules } from '@/utils/formRules';

type TableFormValues = {
  username: string;
  email: string;
  realName: string;
  phone: string;
  gender: 'male' | 'female';
  status: boolean;
  bio: string;
};

const createDefaultFormValues = (): TableFormValues => ({
  username: '',
  email: '',
  realName: '',
  phone: '',
  gender: 'male',
  status: true,
  bio: '',
});

const {
  open: modalVisible,
  record: editingRecord,
  initialValues: formData,
  sessionKey: formSessionKey,
  openCreate: openCreateForm,
  openEdit: openEditForm,
  close: closeFormModal,
  finishClose: finishFormClose,
} = useCrudFormSession<User, TableFormValues>(createDefaultFormValues);
const editingId = computed(() => editingRecord.value?.id ?? null);

const genderOptions = computed(() => [
  { label: $t('user.male'), value: 'male' },
  { label: $t('user.female'), value: 'female' },
]);

const genderValueEnum = computed<Record<string, { text: string; color?: string }>>(() => ({
  male: { text: $t('user.male'), color: 'blue' },
  female: { text: $t('user.female'), color: 'pink' },
}));

// Search form items configuration
const searchFormItems = computed<ProFormItem[]>(() => [
  { name: 'email', label: $t('user.email'), type: 'input' },
  { name: 'realName', label: $t('user.realName'), type: 'input' },
  { name: 'gender', label: $t('user.gender'), type: 'select', options: genderOptions.value },
  { name: 'createdAt', label: $t('common.createTime'), type: 'dateRange' },
]);

// Table columns configuration
const columns = computed<ProTableColumn[]>(() => [
  {
    title: $t('user.username'),
    dataIndex: 'username',
    width: 150,
    fixed: 'left',
    headerFilter: {
      type: 'keyword',
      mode: 'server',
      icon: 'search',
      placeholder: `搜索${$t('user.username')}`,
      matchAllKeywords: true,
    },
  },
  {
    title: $t('user.email'),
    dataIndex: 'email',
    copyable: true,
  },
  {
    title: $t('user.realName'),
    dataIndex: 'realName',
  },
  {
    title: $t('user.phone'),
    dataIndex: 'phone',
  },
  {
    title: $t('user.gender'),
    dataIndex: 'gender',
    headerFilter: {
      type: 'select',
      mode: 'server',
      icon: 'filter',
      multiple: true,
      options: genderOptions.value,
    },
    valueType: 'tag',
    valueEnum: genderValueEnum.value,
  },
  {
    title: $t('common.status'),
    dataIndex: 'status',
    width: 150,
    headerFilter: {
      type: 'select',
      mode: 'server',
      icon: 'filter',
      multiple: false,
      options: [
        { label: $t('user.active'), value: 'active' },
        { label: $t('user.inactive'), value: 'inactive' },
      ],
    },
  },
  {
    title: $t('common.createTime'),
    dataIndex: 'createdAt',
    valueType: 'dateTime',
    sorter: true,
  },
  {
    title: $t('common.actions'),
    dataIndex: 'action',
    width: 200,
    fixed: 'right',
    actions: [
      {
        label: $t('common.edit'),
        icon: EditOutlined,
        onClick: (record) => handleEdit(record as unknown as User),
      },
      {
        label: $t('common.delete'),
        icon: DeleteOutlined,
        danger: true,
        confirm: $t('user.confirmDelete'),
        onClick: (record) => handleDelete(record as unknown as User),
      },
    ],
  },
]);

// Form items configuration
const formItems = computed<ProFormItem[]>(() => [
  {
    name: 'username',
    label: $t('user.username'),
    type: 'input',
    required: true,
    rules: [commonRules.required(), commonRules.length(3, 20), commonRules.username()],
  },
  {
    name: 'email',
    label: $t('user.email'),
    type: 'input',
    required: true,
    rules: [commonRules.required(), commonRules.email()],
  },
  {
    name: 'realName',
    label: $t('user.realName'),
    type: 'input',
    required: true,
  },
  {
    name: 'phone',
    label: $t('user.phone'),
    type: 'input',
    rules: [commonRules.phone()],
  },
  {
    name: 'gender',
    label: $t('user.gender'),
    type: 'select',
    required: true,
    options: genderOptions.value,
  },
  {
    name: 'status',
    label: $t('common.status'),
    type: 'switch',
    valuePropName: 'checked',
    required: true,
    initialValue: true,
    props: {
      checkedChildren: $t('user.active'),
      unCheckedChildren: $t('user.inactive'),
    },
  },
  {
    name: 'bio',
    label: $t('user.bio'),
    type: 'textarea',
    colSpan: 2,
    props: {
      rows: 4,
      maxLength: 200,
      showCount: true,
    },
  },
]);

// Methods
const fetchData = async (params: ProTableRequestParams) => {
  const res = await getUserList({
    ...params,
    current: Number(params.current || 1),
    pageSize: Number(params.pageSize || 10),
  } as PageParams);
  return {
    data: res.data.list,
    total: res.data.total,
    success: true,
  };
};

const handleCreate = () => {
  openCreateForm();
};

const handleEdit = (record: User) => {
  openEditForm(record, {
    username: record.username,
    email: record.email,
    realName: record.realName,
    phone: record.phone,
    gender: record.gender || 'male',
    status: record.status === 'active',
    bio: record.bio || '',
  });
};

const handleDelete = async (record: User) => {
  await deleteUser(record.id);
  message.success($t('exampleTable.deleteSuccess'));
};

const handleSubmit = async (rawValues: Record<string, unknown>) => {
  const values = rawValues as TableFormValues;
  const payload: Partial<User> = {
    ...values,
    status: values.status ? 'active' : 'inactive',
  };

  try {
    if (editingId.value) {
      await updateUser(editingId.value, payload);
      message.success($t('exampleTable.updateSuccess'));
    } else {
      await createUser(payload);
      message.success($t('exampleTable.createSuccess'));
    }
    closeFormModal();
  } catch (error: unknown) {
    message.error((error as Error).message || $t('exampleTable.createSuccess'));
  }
};

const handleStatusChange = async (record: User, checked: boolean) => {
  try {
    const newStatus = checked ? 'active' : 'inactive';
    await updateUser(record.id, { ...record, status: newStatus });
    record.status = newStatus;
    message.success($t('exampleTable.updateSuccess'));
  } catch (error: unknown) {
    message.error((error as Error).message || $t('common.error'));
  }
};
</script>
