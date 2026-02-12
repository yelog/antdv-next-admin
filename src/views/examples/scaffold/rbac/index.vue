<template>
  <div class="page-container">
    <div class="card mb-lg">
      <h2>RBAC 全链路示例</h2>
      <p class="text-secondary">
        覆盖页面权限、按钮权限、字段权限、接口权限 4 个维度。可直接切换 admin / user 观察差异。
      </p>
    </div>

    <div class="card mb-lg">
      <div class="top-row">
        <div>
          <div class="title">当前会话</div>
          <div class="meta">账号：{{ authStore.user?.username || '-' }} | 角色：{{ roleText }}</div>
        </div>
        <a-space>
          <a-button type="primary" @click="switchAccount('admin')">切换为 admin</a-button>
          <a-button @click="switchAccount('user')">切换为 user</a-button>
        </a-space>
      </div>

      <div class="tags-wrap">
        <a-tag v-for="perm in displayPermissions" :key="perm">{{ perm }}</a-tag>
      </div>
    </div>

    <div class="grid-two">
      <div class="card">
        <div class="title mb-sm">1. 页面权限判定</div>
        <div class="check-list">
          <div v-for="check in pageChecks" :key="check.title" class="check-item">
            <div class="check-title">{{ check.title }}</div>
            <a-tag :color="check.pass ? 'success' : 'error'">
              {{ check.pass ? '通过' : '拒绝' }}
            </a-tag>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="title mb-sm">2. 按钮权限</div>
        <a-space wrap>
          <PermissionButton permission="system.user.create">
            <a-button type="primary">新建用户</a-button>
          </PermissionButton>

          <PermissionButton permission="system.user.edit">
            <a-button>编辑用户</a-button>
          </PermissionButton>

          <PermissionButton permission="system.user.delete">
            <a-button danger>删除用户</a-button>
          </PermissionButton>
        </a-space>

        <a-alert
          class="mt-md"
          type="info"
          show-icon
          message="提示：按钮是否渲染由 PermissionButton 控制"
        />
      </div>

      <div class="card">
        <div class="title mb-sm">3. 字段权限（脱敏）</div>
        <div class="field-row">
          <span>手机号：</span>
          <strong>{{ phoneText }}</strong>
        </div>
        <div class="field-row">
          <span>邮箱：</span>
          <strong>{{ emailText }}</strong>
        </div>
        <div class="field-row">
          <span>真实姓名：</span>
          <strong>{{ authStore.user?.realName || '-' }}</strong>
        </div>
      </div>

      <div class="card">
        <div class="title mb-sm">4. 接口权限失败兜底</div>
        <a-space wrap>
          <a-button @click="callApiWithPermission('system.user.view', '查看用户列表')">调用查看接口</a-button>
          <a-button @click="callApiWithPermission('system.user.export', '导出用户')">调用导出接口</a-button>
          <a-button @click="callApiWithPermission('system.user.delete', '删除用户')">调用删除接口</a-button>
        </a-space>

        <a-alert
          v-if="apiResult"
          class="mt-md"
          :type="apiResult.type"
          show-icon
          :message="apiResult.message"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { message } from 'antdv-next'
import { useAuthStore } from '@/stores/auth'
import { usePermission } from '@/composables/usePermission'
import PermissionButton from '@/components/Permission/PermissionButton.vue'

const authStore = useAuthStore()
const { can, hasAnyRole } = usePermission()

const apiResult = ref<{ type: 'success' | 'error'; message: string } | null>(null)

onMounted(() => {
  authStore.initAuth()
})

const roleText = computed(() => {
  const roleCodes = authStore.userRoles
  return roleCodes.length > 0 ? roleCodes.join(', ') : '-'
})

const displayPermissions = computed(() => {
  const permissions = authStore.userPermissions
  if (permissions.length <= 8) {
    return permissions
  }
  return [...permissions.slice(0, 8), `...共 ${permissions.length} 项`]
})

const pageChecks = computed(() => {
  return [
    {
      title: '用户管理页访问（system.user.view）',
      pass: can('system.user.view')
    },
    {
      title: '菜单管理页访问（system.permission.view）',
      pass: can('system.permission.view')
    },
    {
      title: '管理员角色访问（admin）',
      pass: hasAnyRole(['admin'])
    }
  ]
})

const maskText = (value: string, reserve = 2) => {
  if (!value) {
    return '-'
  }
  if (value.length <= reserve * 2) {
    return `${value.slice(0, reserve)}***`
  }
  return `${value.slice(0, reserve)}***${value.slice(-reserve)}`
}

const phoneText = computed(() => {
  const raw = authStore.user?.phone || ''
  if (can('system.user.view.phone') || can('*')) {
    return raw || '-'
  }
  return maskText(raw, 3)
})

const emailText = computed(() => {
  const raw = authStore.user?.email || ''
  if (can('system.user.view.email') || can('*')) {
    return raw || '-'
  }
  return maskText(raw, 2)
})

const switchAccount = async (username: 'admin' | 'user') => {
  try {
    await authStore.login(username, '123456')
    apiResult.value = null
    message.success(`已切换为 ${username}`)
  } catch (error: any) {
    message.error(error?.message || '切换失败')
  }
}

const callApiWithPermission = async (permission: string, actionName: string) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 260))

    if (!can(permission)) {
      throw new Error(`403: 缺少权限 ${permission}`)
    }

    apiResult.value = {
      type: 'success',
      message: `${actionName} 成功`
    }
  } catch (error: any) {
    apiResult.value = {
      type: 'error',
      message: `${actionName} 失败：${error.message || '无权限'}`
    }
  }
}
</script>

<style scoped lang="scss">
.mb-lg {
  margin-bottom: var(--spacing-lg);
}

.mb-sm {
  margin-bottom: var(--spacing-sm);
}

.mt-md {
  margin-top: var(--spacing-md);
}

.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.title {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.meta {
  margin-top: 4px;
  color: var(--color-text-secondary);
}

.tags-wrap {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.grid-two {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.check-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.check-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 8px;
  padding: 8px 10px;
}

.check-title {
  color: var(--color-text-secondary);
}

.field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px dashed var(--color-border-secondary);

  &:last-child {
    border-bottom: none;
  }
}

@media (max-width: 900px) {
  .grid-two {
    grid-template-columns: 1fr;
  }
}
</style>
