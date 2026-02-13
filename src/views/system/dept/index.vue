<template>
  <div class="page-container">
    <div class="dept-container">
      <!-- 左侧：部门树 -->
      <div class="dept-tree">
        <div class="dept-tree-header">
          <h3>组织架构</h3>
          <a-button type="primary" size="small" @click="handleAdd(null)">
            <template #icon><PlusOutlined /></template>
            新增
          </a-button>
        </div>
        <div class="dept-tree-search">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索部门"
            allow-clear
            @search="loadDeptTree"
          />
        </div>
        <div class="dept-tree-body">
          <a-tree
            v-if="treeData.length"
            :tree-data="treeData"
            :field-names="{ title: 'name', key: 'id', children: 'children' }"
            :selected-keys="selectedKeys"
            default-expand-all
            block-node
            @select="handleTreeSelect"
          >
            <template #title="{ name, status }">
              <div class="tree-node">
                <span class="tree-node-name">{{ name }}</span>
                <span v-if="status === 'disabled'" class="tree-node-badge">停用</span>
              </div>
            </template>
          </a-tree>
          <a-empty v-else :image="null" description="暂无数据" />
        </div>
      </div>

      <!-- 右侧：部门详情 -->
      <div class="dept-detail">
        <template v-if="selectedDept">
          <div class="dept-detail-header">
            <div class="dept-detail-title">
              <h3>{{ selectedDept.name }}</h3>
              <span class="status-tag" :class="selectedDept.status === 'enabled' ? 'status-enabled' : 'status-disabled'">
                <span class="status-dot" />
                {{ selectedDept.status === 'enabled' ? '正常' : '停用' }}
              </span>
            </div>
            <a-space>
              <a-button type="primary" size="small" @click="handleAdd(selectedDept.id)">
                <template #icon><PlusOutlined /></template>
                新增子部门
              </a-button>
              <a-button size="small" @click="handleEdit(selectedDept)">
                <template #icon><EditOutlined /></template>
                编辑
              </a-button>
              <a-button size="small" danger @click="handleDelete(selectedDept)">
                <template #icon><DeleteOutlined /></template>
                删除
              </a-button>
            </a-space>
          </div>
          <a-descriptions :column="2" bordered size="middle" class="dept-descriptions">
            <a-descriptions-item label="部门名称">{{ selectedDept.name }}</a-descriptions-item>
            <a-descriptions-item label="上级部门">{{ getParentName(selectedDept.parentId) }}</a-descriptions-item>
            <a-descriptions-item label="负责人">{{ selectedDept.leader || '-' }}</a-descriptions-item>
            <a-descriptions-item label="联系电话">{{ selectedDept.phone || '-' }}</a-descriptions-item>
            <a-descriptions-item label="邮箱">{{ selectedDept.email || '-' }}</a-descriptions-item>
            <a-descriptions-item label="排序">{{ selectedDept.sort }}</a-descriptions-item>
            <a-descriptions-item label="创建时间">{{ selectedDept.createTime }}</a-descriptions-item>
            <a-descriptions-item label="更新时间">{{ selectedDept.updateTime }}</a-descriptions-item>
            <a-descriptions-item label="备注" :span="2">{{ selectedDept.remark || '-' }}</a-descriptions-item>
          </a-descriptions>

          <!-- 子部门列表 -->
          <div class="dept-children">
            <ProTable
              :key="selectedDept.id"
              :columns="childColumns"
              :request="loadChildDepts"
              :search="false"
              :pagination="false"
              :toolbar="{
                title: `下级部门 (${childDepts.length})`
              }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <span class="status-tag" :class="record.status === 'enabled' ? 'status-enabled' : 'status-disabled'">
                    <span class="status-dot" />
                    {{ record.status === 'enabled' ? '正常' : '停用' }}
                  </span>
                </template>
                <template v-if="column.key === 'action'">
                  <a-space :size="4">
                    <a-button type="link" size="small" @click="selectDept(record.id)">查看</a-button>
                    <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
                  </a-space>
                </template>
              </template>
            </ProTable>
          </div>
        </template>
        <div v-else class="dept-detail-empty">
          <a-empty description="请选择左侧部门节点" />
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      :width="520"
    >
      <a-form :model="form" :label-col="{ span: 6 }" style="margin-top: 16px">
        <a-form-item label="上级部门">
          <a-tree-select
            v-model:value="form.parentId"
            :tree-data="parentTreeData"
            :field-names="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="无（顶级部门）"
            allow-clear
            tree-default-expand-all
          />
        </a-form-item>
        <a-form-item label="部门名称" required>
          <a-input v-model:value="form.name" placeholder="请输入部门名称" />
        </a-form-item>
        <a-form-item label="负责人">
          <a-input v-model:value="form.leader" placeholder="请输入负责人" />
        </a-form-item>
        <a-form-item label="联系电话">
          <a-input v-model:value="form.phone" placeholder="请输入联系电话" />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input v-model:value="form.email" placeholder="请输入邮箱" />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="form.sort" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model:value="form.status">
            <a-radio value="enabled">正常</a-radio>
            <a-radio value="disabled">停用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="form.remark" placeholder="请输入备注" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message, Modal } from 'antdv-next'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@antdv-next/icons'
import ProTable from '@/components/Pro/ProTable/index.vue'
import type { ProTableColumn } from '@/types/pro'
import type { Department } from '@/types/dept'
import { getDeptTree, getDeptList, createDept, updateDept, deleteDept } from '@/api/dept'

const searchText = ref('')
const treeData = ref<Department[]>([])
const flatList = ref<Department[]>([])
const selectedKeys = ref<string[]>([])

const selectedDept = computed(() => {
  if (!selectedKeys.value.length) return null
  return flatList.value.find(d => d.id === selectedKeys.value[0]) || null
})

const childDepts = computed(() => {
  if (!selectedDept.value) return []
  return flatList.value
    .filter(d => d.parentId === selectedDept.value!.id)
    .sort((a, b) => a.sort - b.sort)
})

const parentTreeData = computed(() => {
  const root: Department = { id: '', name: '无（顶级部门）', parentId: null, sort: 0, status: 'enabled', createTime: '', updateTime: '' }
  return [{ ...root, children: treeData.value }]
})

// 弹窗
const modalVisible = ref(false)
const modalTitle = computed(() => form.value.id ? '编辑部门' : '新增部门')
const form = ref<Partial<Department>>({
  name: '',
  parentId: null,
  leader: '',
  phone: '',
  email: '',
  sort: 0,
  status: 'enabled',
  remark: ''
})

const childColumns: ProTableColumn[] = [
  { title: '部门名称', dataIndex: 'name', key: 'name' },
  { title: '负责人', dataIndex: 'leader', key: 'leader', width: 100 },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 70 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 120 }
]

const getParentName = (parentId: string | null) => {
  if (!parentId) return '无（顶级）'
  return flatList.value.find(d => d.id === parentId)?.name || '-'
}

const selectDept = (id: string) => {
  selectedKeys.value = [id]
}

const loadChildDepts = async () => {
  return {
    data: childDepts.value,
    total: childDepts.value.length,
    success: true
  }
}

const loadDeptTree = async () => {
  try {
    const params: any = {}
    if (searchText.value) params.name = searchText.value
    const [treeRes, listRes] = await Promise.all([
      getDeptTree(params) as any,
      getDeptList() as any
    ])
    if (treeRes.code === 200) treeData.value = treeRes.data
    if (listRes.code === 200) flatList.value = listRes.data
    // 默认选中第一个
    if (!selectedKeys.value.length && treeData.value.length) {
      selectedKeys.value = [treeData.value[0].id]
    }
  } catch (error) {
    console.error('加载部门数据失败:', error)
  }
}

const handleTreeSelect = (keys: string[]) => {
  if (keys.length) selectedKeys.value = keys
}

const handleAdd = (parentId: string | null) => {
  form.value = {
    name: '',
    parentId,
    leader: '',
    phone: '',
    email: '',
    sort: 0,
    status: 'enabled',
    remark: ''
  }
  modalVisible.value = true
}

const handleEdit = (dept: Department) => {
  form.value = { ...dept }
  modalVisible.value = true
}

const handleDelete = (dept: Department) => {
  const hasChildren = flatList.value.some(d => d.parentId === dept.id)
  if (hasChildren) {
    message.warning('该部门下存在子部门，请先删除子部门')
    return
  }
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除部门"${dept.name}"吗？`,
    onOk: async () => {
      try {
        const response = await deleteDept(dept.id) as any
        if (response.code === 200) {
          message.success('删除成功')
          selectedKeys.value = []
          loadDeptTree()
        } else {
          message.error(response.message || '删除失败')
        }
      } catch (error) {
        message.error('删除失败')
      }
    }
  })
}

const handleSubmit = async () => {
  if (!form.value.name) {
    message.warning('请输入部门名称')
    return
  }
  try {
    if (form.value.id) {
      const response = await updateDept(form.value.id, form.value) as any
      if (response.code === 200) {
        message.success('更新成功')
        modalVisible.value = false
        loadDeptTree()
      }
    } else {
      const response = await createDept(form.value) as any
      if (response.code === 200) {
        message.success('创建成功')
        modalVisible.value = false
        loadDeptTree()
      }
    }
  } catch (error) {
    message.error('操作失败')
  }
}

// 初始化
loadDeptTree()
</script>

<style scoped lang="scss">
.dept-container {
  display: flex;
  gap: 16px;
  height: calc(100vh - 180px);
}

// 左侧：部门树
.dept-tree {
  width: 280px;
  flex-shrink: 0;
  background: var(--color-bg-container);
  border-radius: 8px;
  padding: 20px 16px 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .dept-tree-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--color-text);
    }
  }

  .dept-tree-search {
    margin-bottom: 12px;
  }

  .dept-tree-body {
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
    }

    :deep(.ant-tree-node-content-wrapper) {
      flex: 1;
    }

    .tree-node {
      display: flex;
      align-items: center;
      gap: 8px;

      .tree-node-name {
        flex: 1;
      }

      .tree-node-badge {
        font-size: 11px;
        padding: 0 6px;
        border-radius: 8px;
        background: #fff1f0;
        color: #cf1322;
        line-height: 18px;
      }
    }
  }
}

// 右侧：部门详情
.dept-detail {
  flex: 1;
  background: var(--color-bg-container);
  border-radius: 8px;
  padding: 20px 24px;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  min-width: 0;

  .dept-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border-secondary, #f0f0f0);

    .dept-detail-title {
      display: flex;
      align-items: center;
      gap: 12px;

      h3 {
        margin: 0;
        font-size: 17px;
        font-weight: 600;
      }
    }
  }

  .dept-descriptions {
    margin-bottom: 24px;
  }

  .dept-children {
    :deep(.ant-table-thead > tr > th) {
      background: #fafafa;
    }
  }

  .dept-detail-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
}

// 状态标签
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 20px;

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &.status-enabled {
    background: #f6ffed;
    color: #389e0d;
    .status-dot { background: #52c41a; }
  }

  &.status-disabled {
    background: #f5f5f5;
    color: #8c8c8c;
    .status-dot { background: #bfbfbf; }
  }
}
</style>
