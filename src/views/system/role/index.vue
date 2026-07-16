<template>
  <div class="page-container">
    <ProTable
      ref="tableRef"
      :columns="columns"
      :request="fetchTableData"
      :toolbar="toolbarConfig"
      :search="{
        formItems: searchFormItems,
        labelWidth: 6,
        defaultCollapsed: true,
      }"
      row-key="id"
    >
      <template #toolbar-actions>
        <a-button type="primary" @click="handleCreate">
          <PlusOutlined /> {{ $t('role.createRole') }}
        </a-button>
      </template>
    </ProTable>

    <ProFormModal
      v-model:open="modalVisible"
      :title="editingRoleId ? $t('role.editRole') : $t('role.createRole')"
      :confirm-loading="submitting"
      :session-key="formSessionKey"
      :form-items="formItems"
      :initial-values="formData"
      :grid="{ cols: 2, gutter: 16 }"
      :layout="{ layout: 'vertical' }"
      width="820px"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @closed="finishFormClose"
    />
  </div>
</template>

<script setup lang="ts">
import type { Permission, Role } from '@/types/auth';
import type { ProFormItem, ProTableColumn } from '@/types/pro';

import { PlusOutlined, EditOutlined, DeleteOutlined } from '@antdv-next/icons';
import { message, Modal } from 'antdv-next';
import { computed, onMounted, ref } from 'vue';

import { getPermissionTree } from '@/api/permission';
import { createRole, deleteRole, getRoleList, updateRole } from '@/api/role';
import ProFormModal from '@/components/Pro/ProFormModal/index.vue';
import ProTable from '@/components/Pro/ProTable/index.vue';
import { useCrudFormSession } from '@/composables/useCrudFormSession';
import { $t, getLocale } from '@/locales';
import { resolveLocalizedText } from '@/utils/localizedText';

type RoleFormValues = {
  name: string;
  code: string;
  description: string;
  permissionIds: string[];
};

type PermissionOption = {
  label: string;
  value: string;
  children?: PermissionOption[];
};

const tableRef = ref<{
  refresh: () => void;
  reload: () => void;
} | null>(null);
const {
  open: modalVisible,
  record: editingRole,
  initialValues: formData,
  sessionKey: formSessionKey,
  openCreate: openCreateForm,
  openEdit: openEditForm,
  close: closeFormModal,
  finishClose: finishFormClose,
} = useCrudFormSession<Role, RoleFormValues>(createDefaultFormValues);
const submitting = ref(false);
const editingRoleId = computed(() => editingRole.value?.id ?? null);
const permissionTree = ref<Permission[]>([]);

const toolbarConfig = computed(() => ({
  title: $t('role.title'),
  subTitle: 'ProTable + ProForm',
  actions: ['refresh', 'density', 'columnSetting'] as Array<
    'refresh' | 'density' | 'columnSetting'
  >,
}));

const permissionOptions = computed<PermissionOption[]>(() => {
  const buildOptions = (nodes: Permission[]): PermissionOption[] => {
    return nodes.map((node) => ({
      label: `${resolveLocalizedText(node.name, getLocale())} (${node.code})`,
      value: node.id,
      children: node.children && node.children.length > 0 ? buildOptions(node.children) : undefined,
    }));
  };
  return buildOptions(permissionTree.value);
});

const permissionMap = computed(() => {
  const map = new Map<string, Permission>();
  const traverse = (nodes: Permission[]) => {
    nodes.forEach((node) => {
      map.set(node.id, {
        ...node,
        children: node.children ? [...node.children] : undefined,
      });
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  traverse(permissionTree.value);
  return map;
});

const searchFormItems = computed<ProFormItem[]>(() => [
  { name: 'name', label: $t('role.name'), type: 'input' },
  { name: 'code', label: $t('role.code'), type: 'input' },
]);

const columns = computed<ProTableColumn[]>(() => [
  {
    title: $t('role.name'),
    dataIndex: 'name',
    width: 200,
  },
  {
    title: $t('role.code'),
    dataIndex: 'code',
    width: 200,
  },
  {
    title: $t('role.description'),
    dataIndex: 'description',
  },
  {
    title: $t('role.permissions'),
    dataIndex: 'permissionCount',
    width: 120,
  },
  {
    title: $t('common.updateTime'),
    dataIndex: 'updatedAt',
    width: 200,
    valueType: 'dateTime',
  },
  {
    title: $t('common.actions'),
    dataIndex: 'action',
    width: 160,
    fixed: 'right',
    actions: [
      {
        label: $t('common.edit'),
        icon: EditOutlined,
        onClick: (record) => handleEdit(record as unknown as Role),
      },
      {
        label: $t('common.delete'),
        icon: DeleteOutlined,
        danger: true,
        confirm: $t('role.confirmDelete'),
        onClick: (record) => handleDelete(record as unknown as Role),
      },
    ],
  },
]);

const formItems = computed<ProFormItem[]>(() => [
  {
    name: 'name',
    label: $t('role.name'),
    type: 'input',
    required: true,
  },
  {
    name: 'code',
    label: $t('role.code'),
    type: 'input',
    required: true,
    props: {
      disabled: Boolean(editingRoleId.value),
    },
    rules: [
      { required: true, message: $t('role.codeRequired') },
      { pattern: /^[a-zA-Z0-9_.-]+$/, message: $t('role.codePattern') },
    ],
  },
  {
    name: 'description',
    label: $t('role.description'),
    type: 'textarea',
    colSpan: 2,
    props: {
      rows: 3,
    },
  },
  {
    name: 'permissionIds',
    label: $t('role.permissions'),
    type: 'treeSelect',
    colSpan: 2,
    options: permissionOptions.value,
    props: {
      treeCheckable: true,
      allowClear: true,
      treeDefaultExpandAll: true,
      showCheckedStrategy: 'SHOW_PARENT',
      maxTagCount: 2,
    },
    rules: [{ type: 'array', required: true, message: $t('role.selectPermissions') }],
  },
]);

function createDefaultFormValues(): RoleFormValues {
  return {
    name: '',
    code: '',
    description: '',
    permissionIds: [],
  };
}

const fetchPermissionTreeData = async () => {
  const response = await getPermissionTree();
  permissionTree.value = response.data;
};

const fetchTableData = async (params: Record<string, unknown>) => {
  const response = await getRoleList({
    current: Number(params.current || 1),
    pageSize: Number(params.pageSize || 10),
    name: (params.name as string)?.trim() || undefined,
    code: (params.code as string)?.trim() || undefined,
  });

  const list = response.data.list.map((item) => ({
    ...item,
    permissionCount: item.permissions?.length || 0,
  }));

  return {
    data: list,
    total: response.data.total,
    success: true,
  };
};

const refreshTable = () => {
  tableRef.value?.refresh();
};

const reloadTable = () => {
  tableRef.value?.reload();
};

const handleCreate = () => {
  openCreateForm();
};

const handleEdit = (record: Role) => {
  const initialValues: RoleFormValues = {
    name: record.name,
    code: record.code,
    description: record.description || '',
    permissionIds: (record.permissions || []).map((permission) => permission.id),
  };
  openEditForm(record, initialValues);
};

const handleCancel = () => {
  closeFormModal();
};

const handleDelete = async (record: Role) => {
  Modal.confirm({
    title: $t('role.deleteRole'),
    content: $t('role.confirmDelete'),
    onOk: async () => {
      await deleteRole(record.id);
      message.success($t('common.success'));
      refreshTable();
    },
  });
};

const handleSubmit = async (rawValues: Record<string, unknown>) => {
  const values = rawValues as RoleFormValues;

  const permissionIds: string[] = values.permissionIds || [];

  const selectedPermissions = permissionIds
    .map((id) => permissionMap.value.get(id))
    .filter((permission): permission is Permission => Boolean(permission));

  const payload: Partial<Role> = {
    name: values.name?.trim(),
    code: values.code?.trim(),
    description: values.description?.trim(),
    permissions: selectedPermissions,
  };

  submitting.value = true;
  try {
    if (editingRoleId.value) {
      await updateRole(editingRoleId.value, payload);
      message.success($t('role.updateSuccess'));
      refreshTable();
    } else {
      await createRole(payload);
      message.success($t('role.createSuccess'));
      reloadTable();
    }
    closeFormModal();
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  await fetchPermissionTreeData();
});
</script>
