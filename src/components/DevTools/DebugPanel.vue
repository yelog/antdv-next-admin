<script setup lang="ts">
import {
  DeleteOutlined,
  ReloadOutlined,
} from '@antdv-next/icons'
import { message } from 'antdv-next'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLayoutStore } from '@/stores/layout'
import { useThemeStore } from '@/stores/theme'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const layoutStore = useLayoutStore()

// Route info
const routeInfo = computed(() => ({
  path: route.path,
  name: route.name as string,
  meta: route.meta,
  query: Object.keys(route.query).length > 0 ? route.query : undefined,
  params: Object.keys(route.params).length > 0 ? route.params : undefined,
}))

// Auth info
const authInfo = computed(() => ({
  isLoggedIn: authStore.isLoggedIn,
  username: authStore.user?.username || '-',
  roles: authStore.userRoles,
  permissions: authStore.userPermissions.slice(0, 10),
  totalPermissions: authStore.userPermissions.length,
}))

// Theme info
const themeInfo = computed(() => ({
  mode: themeStore.mode,
  primaryColor: '', // Placeholder - theme store doesn't have this property
  isDark: themeStore.isDark,
}))

// Layout info
const layoutInfo = computed(() => ({
  mode: 'vertical', // Placeholder - layout store doesn't have this property
  collapsed: layoutStore.collapsed,
  sidebarCollapsed: layoutStore.collapsed,
  isMobile: layoutStore.isMobile,
}))

// Mock users for quick role switch
const mockUsers = [
  { label: 'Admin (all permissions)', value: 'admin' },
  { label: 'User (limited permissions)', value: 'user' },
]

const selectedUser = ref<string>('')

// Quick actions
function clearStorage() {
  localStorage.clear()
  sessionStorage.clear()
  message.success('Storage cleared!')
}

function reloadPage() {
  window.location.reload()
}

async function switchUser(username: string) {
  if (!username)
    return

  // In demo mode, re-login with selected user
  try {
    // Clear current auth state
    authStore.logout()

    // Mock login - in real app, call login API
    if (username === 'admin') {
      authStore.setToken('mock-admin-token')
      authStore.setUserInfo({
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        realName: 'Administrator',
        avatar: '',
        phone: '',
        status: 'active',
        roles: [{ id: '1', name: 'Admin', code: 'admin', description: '', permissions: [], createdAt: '', updatedAt: '' }],
        permissions: [{ id: '1', name: 'All', code: '*', description: '', resource: '*', action: '*', type: 'api' }],
        createdAt: '',
        updatedAt: '',
      })
    }
    else {
      authStore.setToken('mock-user-token')
      authStore.setUserInfo({
        id: '2',
        username: 'user',
        email: 'user@example.com',
        realName: 'Normal User',
        avatar: '',
        phone: '',
        status: 'active',
        roles: [{ id: '2', name: 'User', code: 'user', description: '', permissions: [], createdAt: '', updatedAt: '' }],
        permissions: [
          { id: '1', name: 'View', code: 'dashboard.view', description: '', resource: 'dashboard', action: 'view', type: 'api' },
          { id: '2', name: 'View', code: 'user.view', description: '', resource: 'user', action: 'view', type: 'api' },
        ],
        createdAt: '',
        updatedAt: '',
      })
    }

    message.success(`Switched to ${username}`)
    router.push('/dashboard')
  }
  catch (error) {
    console.error('Failed to switch user:', error)
  }
}

// JSON display helper
const formatJson = (obj: any) => JSON.stringify(obj, null, 2)
</script>

<template>
  <a-drawer
    :open="props.visible"
    title="Dev Debug Panel"
    placement="right"
    :width="400"
    @update:open="emit('update:visible', $event)"
  >
    <a-tabs>
      <!-- Route Tab -->
      <a-tab-pane key="route" tab="Route">
        <a-descriptions :column="1" size="small">
          <a-descriptions-item label="Path">
            <a-typography-text copyable code>
              {{ routeInfo.path }}
            </a-typography-text>
          </a-descriptions-item>
          <a-descriptions-item label="Name">
            {{ routeInfo.name }}
          </a-descriptions-item>
          <a-descriptions-item label="Auth Required">
            <a-tag :color="routeInfo.meta?.requiresAuth ? 'green' : 'default'">
              {{ routeInfo.meta?.requiresAuth ? 'Yes' : 'No' }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>

        <a-divider>Query Params</a-divider>
        <pre v-if="routeInfo.query" class="code-block">{{ formatJson(routeInfo.query) }}</pre>
        <a-empty v-else description="No query params" :image="null" />

        <a-divider>Route Params</a-divider>
        <pre v-if="routeInfo.params" class="code-block">{{ formatJson(routeInfo.params) }}</pre>
        <a-empty v-else description="No route params" :image="null" />
      </a-tab-pane>

      <!-- Auth Tab -->
      <a-tab-pane key="auth" tab="Auth">
        <a-descriptions :column="1" size="small">
          <a-descriptions-item label="Logged In">
            <a-tag :color="authInfo.isLoggedIn ? 'green' : 'red'">
              {{ authInfo.isLoggedIn ? 'Yes' : 'No' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Username">
            {{ authInfo.username }}
          </a-descriptions-item>
        </a-descriptions>

        <a-divider>Roles</a-divider>
        <a-space wrap>
          <a-tag v-for="role in authInfo.roles" :key="role" color="blue">
            {{ role }}
          </a-tag>
          <a-empty v-if="!authInfo.roles.length" description="No roles" :image="null" />
        </a-space>

        <a-divider>Permissions ({{ authInfo.totalPermissions }})</a-divider>
        <a-space wrap>
          <a-tag v-for="perm in authInfo.permissions" :key="perm" color="purple">
            {{ perm }}
          </a-tag>
          <a-tag v-if="authInfo.totalPermissions > 10" color="default">
            +{{ authInfo.totalPermissions - 10 }} more
          </a-tag>
        </a-space>
      </a-tab-pane>

      <!-- Theme Tab -->
      <a-tab-pane key="theme" tab="Theme">
        <a-descriptions :column="1" size="small">
          <a-descriptions-item label="Mode">
            <a-tag :color="themeInfo.isDark ? 'purple' : 'gold'">
              {{ themeInfo.mode }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Primary Color">
            <a-space>
              <span
                class="color-preview"
                :style="{ backgroundColor: themeInfo.primaryColor }"
              />
              <code>{{ themeInfo.primaryColor }}</code>
            </a-space>
          </a-descriptions-item>
        </a-descriptions>
      </a-tab-pane>

      <!-- Layout Tab -->
      <a-tab-pane key="layout" tab="Layout">
        <a-descriptions :column="1" size="small">
          <a-descriptions-item label="Mode">
            <a-tag color="cyan">
              {{ layoutInfo.mode }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Sidebar">
            <a-tag :color="layoutInfo.sidebarCollapsed ? 'orange' : 'green'">
              {{ layoutInfo.sidebarCollapsed ? 'Collapsed' : 'Expanded' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Mobile">
            <a-tag :color="layoutInfo.isMobile ? 'red' : 'default'">
              {{ layoutInfo.isMobile ? 'Yes' : 'No' }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-tab-pane>

      <!-- Actions Tab -->
      <a-tab-pane key="actions" tab="Actions">
        <a-space direction="vertical" style="width: 100%">
          <a-card title="Quick Role Switch" size="small">
            <a-select
              v-model:value="selectedUser"
              style="width: 100%"
              placeholder="Select user to switch"
              @change="switchUser"
            >
              <a-select-option
                v-for="user in mockUsers"
                :key="user.value"
                :value="user.value"
              >
                {{ user.label }}
              </a-select-option>
            </a-select>
          </a-card>

          <a-card title="Cache Actions" size="small">
            <a-space>
              <a-button @click="clearStorage">
                <template #icon>
                  <DeleteOutlined />
                </template>
                Clear Storage
              </a-button>
              <a-button @click="reloadPage">
                <template #icon>
                  <ReloadOutlined />
                </template>
                Reload Page
              </a-button>
            </a-space>
          </a-card>
        </a-space>
      </a-tab-pane>
    </a-tabs>
  </a-drawer>
</template>

<style scoped>
.code-block {
  background: var(--ant-color-bg-container);
  border: 1px solid var(--ant-color-border);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
  overflow: auto;
  max-height: 150px;
}

.color-preview {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid var(--ant-color-border);
}

:deep(.ant-descriptions-item-label) {
  font-weight: 500;
}
</style>
