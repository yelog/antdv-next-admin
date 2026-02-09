<template>
  <div class="page-container">
    <div class="card page-card">
      <a-form :model="searchForm" layout="inline" class="filter-form">
        <a-form-item :label="$t('common.search')">
          <a-input
            v-model:value="searchForm.keyword"
            allow-clear
            placeholder="菜单名称 / 权限编码 / 路由路径"
          />
        </a-form-item>

        <a-form-item :label="$t('permission.type')">
          <a-select
            v-model:value="searchForm.type"
            style="width: 140px"
            allow-clear
            :options="permissionTypeOptions"
          />
        </a-form-item>

        <a-form-item :label="$t('common.status')">
          <a-select
            v-model:value="searchForm.status"
            style="width: 120px"
            allow-clear
            :options="statusOptions"
          />
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" @click="refreshMenus">
              {{ $t('common.search') }}
            </a-button>
            <a-button @click="handleReset">
              {{ $t('common.reset') }}
            </a-button>
            <a-button type="primary" @click="openCreateRoot">
              {{ $t('permission.createPermission') }}
            </a-button>
            <a-button @click="expandAllRows">展开全部</a-button>
            <a-button @click="collapseAllRows">收起全部</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-table
        v-model:expandedRowKeys="expandedRowKeys"
        row-key="id"
        :loading="loading"
        :columns="columns"
        :data-source="filteredMenus"
        :pagination="false"
        :children-column-name="'children'"
        :scroll="{ x: 1200 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="resolvePermissionTypeColor(record.type)">
              {{ resolvePermissionTypeText(record.type) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 'active' ? 'success' : 'default'">
              {{ record.status === 'active' ? '启用' : '禁用' }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'visible'">
            <a-tag :color="record.visible !== false ? 'processing' : 'default'">
              {{ record.visible !== false ? '显示' : '隐藏' }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'path' || column.key === 'component'">
            <span>{{ record[column.dataIndex] || '-' }}</span>
          </template>

          <template v-else-if="column.key === 'sort'">
            <span>{{ record.sort ?? '-' }}</span>
          </template>

          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button
                v-if="record.type === 'menu'"
                type="link"
                @click="openCreateChild(record)"
              >
                新增子级
              </a-button>
              <a-button type="link" @click="openEdit(record)">
                {{ $t('common.edit') }}
              </a-button>
              <a-button type="link" danger @click="handleDelete(record)">
                {{ $t('common.delete') }}
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <a-modal
      v-model:open="formOpen"
      :title="modalTitle"
      :confirm-loading="submitting"
      width="760px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form ref="formRef" :model="formModel" :rules="formRules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="24" v-if="formModel.parentId">
            <a-alert type="info" show-icon>
              <template #message>
                上级菜单：{{ parentMenuName || '-' }}
              </template>
            </a-alert>
          </a-col>

          <a-col :span="12">
            <a-form-item name="name" :label="$t('permission.name')">
              <a-input v-model:value="formModel.name" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="code" :label="$t('permission.code')">
              <a-input v-model:value="formModel.code" :disabled="Boolean(editingMenuId)" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="type" :label="$t('permission.type')">
              <a-select v-model:value="formModel.type" :options="permissionTypeOptions" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="status" :label="$t('common.status')">
              <a-select v-model:value="formModel.status" :options="statusOptions" />
            </a-form-item>
          </a-col>

          <a-col :span="12" v-if="formModel.type === 'menu'">
            <a-form-item name="path" label="路由路径">
              <a-input v-model:value="formModel.path" />
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="formModel.type === 'menu'">
            <a-form-item name="component" label="组件路径">
              <a-input v-model:value="formModel.component" />
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="formModel.type === 'menu'">
            <a-form-item name="icon" label="图标">
              <a-input v-model:value="formModel.icon" placeholder="例如：UserOutlined" />
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="formModel.type === 'menu'">
            <a-form-item name="sort" label="排序">
              <a-input-number v-model:value="formModel.sort" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item name="resource" :label="$t('permission.resource')">
              <a-input v-model:value="formModel.resource" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="action" :label="$t('permission.action')">
              <a-input v-model:value="formModel.action" />
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item name="description" label="描述">
              <a-textarea v-model:value="formModel.description" :rows="3" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item name="visible" label="显示状态">
              <a-switch
                v-model:checked="formModel.visible"
                checked-children="显示"
                un-checked-children="隐藏"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'antdv-next'
import { useI18n } from 'vue-i18n'
import {
  createPermission,
  deletePermission,
  getPermissionTree,
  updatePermission
} from '@/api/permission'
import type { Permission } from '@/types/auth'

interface MenuSearchForm {
  keyword: string
  type?: Permission['type']
  status?: 'active' | 'inactive'
}

interface MenuFormModel {
  name: string
  code: string
  type: Permission['type']
  description: string
  parentId?: string
  path: string
  component: string
  icon: string
  sort: number
  status: 'active' | 'inactive'
  visible: boolean
  resource: string
  action: string
}

interface PermissionFormRef {
  validate: () => Promise<void>
  resetFields: () => void
}

type ModalMode = 'create' | 'edit'

const { t } = useI18n()

const loading = ref(false)
const submitting = ref(false)
const formOpen = ref(false)
const modalMode = ref<ModalMode>('create')
const editingMenuId = ref<string | null>(null)
const menuTree = ref<Permission[]>([])
const expandedRowKeys = ref<string[]>([])
const formRef = ref<PermissionFormRef | null>(null)

const searchForm = reactive<MenuSearchForm>({
  keyword: '',
  type: undefined,
  status: undefined
})

const createDefaultForm = (): MenuFormModel => ({
  name: '',
  code: '',
  type: 'menu',
  description: '',
  parentId: undefined,
  path: '',
  component: '',
  icon: '',
  sort: 0,
  status: 'active',
  visible: true,
  resource: '',
  action: 'view'
})

const formModel = reactive<MenuFormModel>(createDefaultForm())

const columns = [
  { title: t('permission.name'), dataIndex: 'name', key: 'name', width: 220 },
  { title: t('permission.code'), dataIndex: 'code', key: 'code', width: 220 },
  { title: t('permission.type'), dataIndex: 'type', key: 'type', width: 110 },
  { title: '路由路径', dataIndex: 'path', key: 'path', width: 170 },
  { title: '组件路径', dataIndex: 'component', key: 'component', width: 200 },
  { title: t('common.status'), dataIndex: 'status', key: 'status', width: 100 },
  { title: '显示', dataIndex: 'visible', key: 'visible', width: 90 },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 90 },
  { title: t('common.actions'), key: 'action', width: 220, fixed: 'right' as const }
]

const permissionTypeOptions = [
  { label: t('permission.menu'), value: 'menu' },
  { label: t('permission.button'), value: 'button' },
  { label: t('permission.api'), value: 'api' }
]

const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' }
]

const permissionTypeTextMap: Record<Permission['type'], string> = {
  menu: t('permission.menu'),
  button: t('permission.button'),
  api: t('permission.api')
}

const permissionTypeColorMap: Record<Permission['type'], string> = {
  menu: 'processing',
  button: 'success',
  api: 'purple'
}

const formRules = {
  name: [{ required: true, message: '请输入菜单名称' }],
  code: [
    { required: true, message: '请输入权限编码' },
    { pattern: /^[a-zA-Z0-9_.-]+$/, message: '权限编码仅支持字母、数字、下划线和中划线' }
  ],
  type: [{ required: true, message: '请选择权限类型' }],
  path: [
    {
      validator: () => {
        if (formModel.type === 'menu' && !formModel.path.trim()) {
          return Promise.reject(new Error('菜单类型必须填写路由路径'))
        }
        return Promise.resolve()
      }
    }
  ]
}

const modalTitle = computed(() => {
  if (modalMode.value === 'edit') {
    return t('permission.editPermission')
  }
  return formModel.parentId ? '新增子菜单' : t('permission.createPermission')
})

const parentMenuName = computed(() => {
  if (!formModel.parentId) {
    return ''
  }
  return findPermissionName(menuTree.value, formModel.parentId)
})

const filteredMenus = computed(() => {
  const keyword = searchForm.keyword.trim().toLowerCase()
  const selectedType = searchForm.type
  const selectedStatus = searchForm.status

  const filterTree = (menus: Permission[]): Permission[] => {
    return menus.reduce<Permission[]>((result, menu) => {
      const filteredChildren = menu.children ? filterTree(menu.children) : []
      const matchesKeyword = !keyword ||
        menu.name.toLowerCase().includes(keyword) ||
        menu.code.toLowerCase().includes(keyword) ||
        (menu.path || '').toLowerCase().includes(keyword)
      const matchesType = !selectedType || menu.type === selectedType
      const matchesStatus = !selectedStatus || (menu.status || 'active') === selectedStatus
      const matches = matchesKeyword && matchesType && matchesStatus

      if (matches || filteredChildren.length > 0) {
        result.push({
          ...menu,
          children: filteredChildren.length > 0 ? filteredChildren : undefined
        })
      }

      return result
    }, [])
  }

  return filterTree(menuTree.value)
})

function collectMenuIds(menus: Permission[]): string[] {
  const ids: string[] = []
  menus.forEach(menu => {
    ids.push(menu.id)
    if (menu.children && menu.children.length > 0) {
      ids.push(...collectMenuIds(menu.children))
    }
  })
  return ids
}

function resolvePermissionTypeText(type: unknown): string {
  if (type === 'menu' || type === 'button' || type === 'api') {
    return permissionTypeTextMap[type]
  }
  return '-'
}

function resolvePermissionTypeColor(type: unknown): string {
  if (type === 'menu' || type === 'button' || type === 'api') {
    return permissionTypeColorMap[type]
  }
  return 'default'
}

function findPermissionName(menus: Permission[], id: string): string {
  for (const menu of menus) {
    if (menu.id === id) {
      return menu.name
    }
    if (menu.children && menu.children.length > 0) {
      const childResult = findPermissionName(menu.children, id)
      if (childResult) {
        return childResult
      }
    }
  }
  return ''
}

const resetFormModel = () => {
  Object.assign(formModel, createDefaultForm())
}

const refreshMenus = async () => {
  loading.value = true
  try {
    const response = await getPermissionTree()
    menuTree.value = response.data
    expandedRowKeys.value = collectMenuIds(response.data)
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.type = undefined
  searchForm.status = undefined
}

const openCreateRoot = () => {
  modalMode.value = 'create'
  editingMenuId.value = null
  resetFormModel()
  formOpen.value = true
  formRef.value?.resetFields()
}

const openCreateChild = (record: Permission) => {
  modalMode.value = 'create'
  editingMenuId.value = null
  resetFormModel()
  formModel.parentId = record.id
  formModel.type = 'menu'
  formModel.resource = record.path || ''
  formOpen.value = true
}

const openEdit = (record: Permission) => {
  modalMode.value = 'edit'
  editingMenuId.value = record.id
  Object.assign(formModel, {
    name: record.name,
    code: record.code,
    type: record.type,
    description: record.description || '',
    parentId: record.parentId,
    path: record.path || '',
    component: record.component || '',
    icon: record.icon || '',
    sort: record.sort ?? 0,
    status: record.status || 'active',
    visible: record.visible !== false,
    resource: record.resource || '',
    action: record.action || ''
  })
  formOpen.value = true
}

const handleCancel = () => {
  formOpen.value = false
  resetFormModel()
}

const handleDelete = (record: Permission) => {
  Modal.confirm({
    title: t('permission.deletePermission'),
    content: t('permission.confirmDelete'),
    onOk: async () => {
      await deletePermission(record.id)
      message.success(t('common.success'))
      await refreshMenus()
    }
  })
}

const normalizePath = (path: string) => {
  if (!path) {
    return ''
  }
  return path.startsWith('/') ? path : `/${path}`
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  const payload: Partial<Permission> = {
    name: formModel.name.trim(),
    code: formModel.code.trim(),
    type: formModel.type,
    description: formModel.description.trim(),
    parentId: formModel.parentId,
    status: formModel.status,
    visible: formModel.visible,
    sort: formModel.sort,
    path: formModel.type === 'menu' ? normalizePath(formModel.path.trim()) : undefined,
    component: formModel.type === 'menu' ? formModel.component.trim() || undefined : undefined,
    icon: formModel.type === 'menu' ? formModel.icon.trim() || undefined : undefined,
    resource: formModel.resource.trim() || normalizePath(formModel.path.trim()) || formModel.code.trim(),
    action: formModel.action.trim() || (formModel.type === 'menu' ? 'view' : '*')
  }

  submitting.value = true
  try {
    if (modalMode.value === 'edit' && editingMenuId.value) {
      await updatePermission(editingMenuId.value, payload)
      message.success('菜单更新成功')
    } else {
      await createPermission(payload)
      message.success('菜单创建成功')
    }
    formOpen.value = false
    resetFormModel()
    await refreshMenus()
  } finally {
    submitting.value = false
  }
}

const expandAllRows = () => {
  expandedRowKeys.value = collectMenuIds(filteredMenus.value)
}

const collapseAllRows = () => {
  expandedRowKeys.value = []
}

onMounted(async () => {
  await refreshMenus()
})
</script>

<style scoped lang="scss">
.page-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.filter-form {
  padding: var(--spacing-sm) 0 var(--spacing-xs);
}

@media (max-width: 992px) {
  .filter-form {
    :deep(.ant-form-item) {
      width: 100%;
      margin-right: 0;
    }

    :deep(.ant-form-item-control-input) {
      width: 100%;
    }
  }
}
</style>
