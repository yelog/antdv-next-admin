<template>
  <a-dropdown>
    <div class="avatar-dropdown">
      <a-avatar :src="authStore.user?.avatar" :size="32">
        {{ authStore.user?.username?.charAt(0).toUpperCase() }}
      </a-avatar>
      <span class="username">{{ authStore.user?.realName || authStore.user?.username }}</span>
      <DownOutlined class="dropdown-icon" />
    </div>
    <template #overlay>
      <a-menu @click="handleMenuClick">
        <a-menu-item key="profile">
          <UserOutlined />
          <span>{{ $t('layout.profile') }}</span>
        </a-menu-item>
        <a-menu-item key="settings">
          <SettingOutlined />
          <span>{{ $t('layout.settings') }}</span>
        </a-menu-item>
        <a-menu-divider />
        <a-menu-item key="logout">
          <LogoutOutlined />
          <span>{{ $t('layout.logout') }}</span>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  DownOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@antdv-next/icons'
import { useAuthStore } from '@/stores/auth'
import { Modal } from 'antdv-next'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const handleMenuClick = ({ key }: { key: string }) => {
  switch (key) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      // Open settings drawer
      break
    case 'logout':
      Modal.confirm({
        title: t('layout.logout'),
        content: 'Are you sure you want to logout?',
        onOk: () => {
          authStore.logout()
          router.push('/login')
        }
      })
      break
  }
}
</script>

<style scoped lang="scss">
.avatar-dropdown {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 0 var(--spacing-sm);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out);

  &:hover {
    background: var(--color-bg-layout);
    border-radius: var(--radius-base);
  }

  .username {
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .dropdown-icon {
    font-size: 12px;
    color: var(--color-text-tertiary);
  }
}
</style>
