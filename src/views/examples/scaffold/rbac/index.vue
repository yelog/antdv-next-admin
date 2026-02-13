<template>
  <div class="page-container">
    <div class="card mb-lg">
      <h2>{{ $t('examples.scaffold.rbac.title') }}</h2>
      <p class="text-secondary">
        {{ $t('examples.scaffold.rbac.description') }}
      </p>
    </div>

    <div class="card mb-lg">
      <div class="top-row">
        <div>
          <div class="title">{{ $t('examples.scaffold.rbac.currentSession') }}</div>
          <div class="meta">{{ $t('examples.scaffold.rbac.accountInfo', { username: authStore.user?.username || '-', role: roleText }) }}</div>
        </div>
        <a-space>
          <a-button type="primary" @click="switchAccount('admin')">{{ $t('examples.scaffold.rbac.switchToAdmin') }}</a-button>
          <a-button @click="switchAccount('user')">{{ $t('examples.scaffold.rbac.switchToUser') }}</a-button>
        </a-space>
      </div>

      <div class="tags-wrap">
        <a-tag v-for="perm in displayPermissions" :key="perm">{{ perm }}</a-tag>
      </div>
    </div>

    <div class="grid-two">
      <div class="card">
        <div class="title mb-sm">{{ $t('examples.scaffold.rbac.section1Title') }}</div>
        <div class="check-list">
          <div v-for="check in pageChecks" :key="check.title" class="check-item">
            <div class="check-title">{{ check.title }}</div>
            <a-tag :color="check.pass ? 'success' : 'error'">
              {{ check.pass ? $t('examples.scaffold.rbac.passed') : $t('examples.scaffold.rbac.denied') }}
            </a-tag>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="title mb-sm">{{ $t('examples.scaffold.rbac.section2Title') }}</div>
        <a-space wrap>
          <PermissionButton permission="system.user.create">
            <a-button type="primary">{{ $t('examples.scaffold.rbac.createUserButton') }}</a-button>
          </PermissionButton>

          <PermissionButton permission="system.user.edit">
            <a-button>{{ $t('examples.scaffold.rbac.editUserButton') }}</a-button>
          </PermissionButton>

          <PermissionButton permission="system.user.delete">
            <a-button danger>{{ $t('examples.scaffold.rbac.deleteUserButton') }}</a-button>
          </PermissionButton>
        </a-space>

        <a-alert
          class="mt-md"
          type="info"
          show-icon
          :message="$t('examples.scaffold.rbac.buttonPermissionHint')"
        />
      </div>

      <div class="card">
        <div class="title mb-sm">{{ $t('examples.scaffold.rbac.section3Title') }}</div>
        <div class="field-row">
          <span>{{ $t('examples.scaffold.rbac.phoneLabel') }}</span>
          <strong>{{ phoneText }}</strong>
        </div>
        <div class="field-row">
          <span>{{ $t('examples.scaffold.rbac.emailLabel') }}</span>
          <strong>{{ emailText }}</strong>
        </div>
        <div class="field-row">
          <span>{{ $t('examples.scaffold.rbac.realNameLabel') }}</span>
          <strong>{{ authStore.user?.realName || '-' }}</strong>
        </div>
      </div>

      <div class="card">
        <div class="title mb-sm">{{ $t('examples.scaffold.rbac.section4Title') }}</div>
        <a-space wrap>
          <a-button @click="callApiWithPermission('system.user.view', $t('examples.scaffold.rbac.viewUserAction'))">{{ $t('examples.scaffold.rbac.callViewApi') }}</a-button>
          <a-button @click="callApiWithPermission('system.user.export', $t('examples.scaffold.rbac.exportUserAction'))">{{ $t('examples.scaffold.rbac.callExportApi') }}</a-button>
          <a-button @click="callApiWithPermission('system.user.delete', $t('examples.scaffold.rbac.deleteUserAction'))">{{ $t('examples.scaffold.rbac.callDeleteApi') }}</a-button>
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
import { $t } from '@/locales'

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
  return [...permissions.slice(0, 8), $t('examples.scaffold.rbac.permissionTotal', { count: permissions.length })]
})

const pageChecks = computed(() => {
  return [
    {
      title: $t('examples.scaffold.rbac.checkUserManage'),
      pass: can('system.user.view')
    },
    {
      title: $t('examples.scaffold.rbac.checkMenuManage'),
      pass: can('system.permission.view')
    },
    {
      title: $t('examples.scaffold.rbac.checkAdminRole'),
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
    message.success($t('examples.scaffold.rbac.switchSuccess', { username }))
  } catch (error: any) {
    message.error(error?.message || $t('examples.scaffold.rbac.switchFailed'))
  }
}

const callApiWithPermission = async (permission: string, actionName: string) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 260))

    if (!can(permission)) {
      throw new Error($t('examples.scaffold.rbac.missingPermission', { permission }))
    }

    apiResult.value = {
      type: 'success',
      message: $t('examples.scaffold.rbac.apiSuccess', { action: actionName })
    }
  } catch (error: any) {
    apiResult.value = {
      type: 'error',
      message: $t('examples.scaffold.rbac.apiFailed', { action: actionName, error: error.message || $t('examples.scaffold.rbac.noPermission') })
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
