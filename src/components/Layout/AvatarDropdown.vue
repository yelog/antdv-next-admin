<template>
  <a-dropdown :trigger="['click']" placement="bottomRight" :menu="menuProps">
    <div class="avatar-dropdown">
      <a-avatar :src="authStore.user?.avatar" :size="32">
        {{ authStore.user?.username?.charAt(0).toUpperCase() }}
      </a-avatar>
      <span class="username desktop-only">{{ authStore.user?.realName || authStore.user?.username }}</span>
      <DownOutlined class="dropdown-icon desktop-only" />
    </div>
  </a-dropdown>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  DownOutlined,
  UserOutlined,
  GithubOutlined,
  BookOutlined,
  LogoutOutlined
} from '@antdv-next/icons'
import { useAuthStore } from '@/stores/auth'
import { Modal } from 'antdv-next'
import { $t } from '@/locales'

const router = useRouter()
const authStore = useAuthStore()

const handleMenuClick = ({ key }: { key: string }) => {
  switch (key) {
    case 'profile':
      router.push('/profile')
      break
    case 'github':
      window.open('https://github.com/yelog/antdv-next-admin', '_blank')
      break
    case 'docs':
      window.open('https://antdv-next-admin-doc.yelog.org', '_blank')
      break
    case 'logout':
      Modal.confirm({
        title: $t('layout.logout'),
        content: $t('layout.logoutConfirm'),
        okText: $t('common.confirm'),
        cancelText: $t('common.cancel'),
        onOk: () => {
          authStore.logout()
          router.push('/login')
        }
      })
      break
  }
}

const menuProps = computed(() => ({
  items: [
    {
      key: 'profile',
      label: $t('layout.profile'),
      icon: h(UserOutlined)
    },
    {
      key: 'github',
      label: 'GitHub',
      icon: h(GithubOutlined)
    },
    {
      key: 'docs',
      label: $t('layout.documentation'),
      icon: h(BookOutlined)
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: $t('layout.logout'),
      icon: h(LogoutOutlined)
    }
  ],
  onClick: handleMenuClick
}))
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

  // Mobile styles
  @media (max-width: 768px) {
    padding: 0;

    .desktop-only {
      display: none;
    }
  }
}
</style>
