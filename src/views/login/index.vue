<template>
  <div class="login-shell">
    <header class="login-topbar">
      <div class="login-brand">
        <img :src="logoImg" alt="Logo" class="brand-logo" />
        <span class="brand-title">{{ $t('common.appName') }}</span>
      </div>

      <div class="login-tools">
        <LanguageSwitch />
        <ThemeToggle />
      </div>
    </header>

    <main class="login-main">
      <section class="login-overview" aria-labelledby="login-overview-title">
        <p class="section-kicker">{{ $t('login.workspaceLabel') }}</p>
        <h1 id="login-overview-title">{{ $t('common.appName') }}</h1>
        <p class="overview-copy">{{ $t('login.workspaceDescription') }}</p>

        <div class="module-grid" role="list">
          <article
            v-for="item in moduleItems"
            :key="item.title"
            class="module-card"
            :class="`tone-${item.tone}`"
            role="listitem"
          >
            <span class="module-icon">
              <component :is="item.icon" />
            </span>
            <span class="module-title">{{ item.title }}</span>
            <span class="module-meta">{{ item.meta }}</span>
          </article>
        </div>

        <div class="workspace-preview" aria-hidden="true">
          <div class="preview-path">
            <span>{{ $t('menu.organization') }} / {{ $t('menu.permission') }}</span>
            <span>{{ $t('login.previewSubtitle') }}</span>
          </div>

          <div class="preview-toolbar">
            <strong>{{ $t('menu.permission') }}</strong>
            <span class="preview-action">+ {{ $t('login.previewAddMenu') }}</span>
          </div>

          <div class="preview-table">
            <div class="preview-row preview-head">
              <span>{{ $t('common.menu') }}</span>
              <span>{{ $t('login.permissionCode') }}</span>
              <span>{{ $t('login.permissionType') }}</span>
            </div>
            <div v-for="row in permissionRows" :key="row.code" class="preview-row">
              <span>{{ row.name }}</span>
              <span>{{ row.code }}</span>
              <span>
                <em :class="`type-${row.typeTone}`">{{ row.type }}</em>
              </span>
            </div>
          </div>
        </div>

        <dl class="status-strip">
          <div v-for="item in statusItems" :key="item.label" class="status-item">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>
      </section>

      <section class="login-panel" aria-labelledby="login-form-title">
        <div class="login-panel-heading">
          <p>{{ $t('common.appName') }}</p>
          <h2 id="login-form-title">{{ $t('login.formTitle') }}</h2>
          <span>{{ $t('login.formSubtitle') }}</span>
        </div>

        <a-form
          :model="formState"
          :rules="rules"
          layout="vertical"
          class="login-form"
          @finish="handleSubmit"
        >
          <a-form-item :label="$t('login.username')" name="username">
            <a-input
              v-model:value="formState.username"
              size="large"
              autocomplete="username"
              :placeholder="$t('login.usernamePlaceholder')"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item :label="$t('login.password')" name="password">
            <a-input-password
              v-model:value="formState.password"
              size="large"
              autocomplete="current-password"
              :placeholder="$t('login.passwordPlaceholder')"
            >
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item>
            <SliderCaptcha
              ref="captchaRef"
              :text="$t('login.slideToVerify')"
              :success-text="$t('login.verifySuccess')"
              :height="40"
              @success="onCaptchaSuccess"
              @fail="onCaptchaFail"
            />
          </a-form-item>

          <div class="login-options">
            <a-checkbox v-model:checked="formState.remember">
              {{ $t('login.remember') }}
            </a-checkbox>
          </div>

          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              block
              :loading="loading"
              :disabled="!captchaVerified"
            >
              {{ $t('login.login') }}
            </a-button>
          </a-form-item>
        </a-form>

        <div class="login-demo">
          <div class="demo-title">
            <CheckCircleOutlined />
            <span>{{ $t('login.demoAccount') }}</span>
          </div>
          <div class="demo-row">
            <span>{{ $t('login.username') }}</span>
            <code>admin</code>
            <code>user</code>
          </div>
          <div class="demo-row">
            <span>{{ $t('login.password') }}</span>
            <code>123456</code>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  CheckCircleOutlined,
  DashboardOutlined,
  LockOutlined,
  SafetyOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@antdv-next/icons';
import { message } from 'antdv-next';
import { computed, reactive, ref, type Component } from 'vue';
import { useRouter } from 'vue-router';

import logoImg from '@/assets/images/logo.png';
import { SliderCaptcha } from '@/components/Captcha';
import LanguageSwitch from '@/components/Layout/LanguageSwitch.vue';
import ThemeToggle from '@/components/Layout/ThemeToggle.vue';
import { $t } from '@/locales';
import { useAuthStore } from '@/stores/auth';

interface ModuleItem {
  title: string;
  meta: string;
  icon: Component;
  tone: 'blue' | 'green' | 'orange' | 'purple';
}

interface PermissionRow {
  name: string;
  code: string;
  type: string;
  typeTone: 'menu' | 'button';
}

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const captchaVerified = ref(false);
const captchaRef = ref<InstanceType<typeof SliderCaptcha>>();
const formState = reactive({
  username: 'admin',
  password: '123456',
  remember: false,
});

const rules = {
  username: [{ required: true, message: $t('login.usernameRequired') }],
  password: [{ required: true, message: $t('login.passwordRequired') }],
};

const moduleItems = computed<ModuleItem[]>(() => [
  {
    title: $t('menu.dashboard'),
    meta: $t('login.moduleDashboardMeta'),
    icon: DashboardOutlined,
    tone: 'blue',
  },
  {
    title: $t('menu.organization'),
    meta: $t('login.modulePermissionMeta'),
    icon: TeamOutlined,
    tone: 'green',
  },
  {
    title: $t('menu.permission'),
    meta: $t('login.moduleMenuMeta'),
    icon: SafetyOutlined,
    tone: 'orange',
  },
  {
    title: $t('menu.system'),
    meta: $t('login.moduleSystemMeta'),
    icon: SettingOutlined,
    tone: 'purple',
  },
]);

const permissionRows = computed<PermissionRow[]>(() => [
  {
    name: $t('menu.dashboard'),
    code: 'dashboard.view',
    type: $t('login.menuType'),
    typeTone: 'menu',
  },
  {
    name: $t('menu.organization'),
    code: 'organization.menu',
    type: $t('login.menuType'),
    typeTone: 'menu',
  },
  {
    name: $t('login.previewCreateUser'),
    code: 'system.user.create',
    type: $t('login.buttonType'),
    typeTone: 'button',
  },
]);

const statusItems = computed(() => [
  { label: $t('login.statusMock'), value: $t('login.statusEnabled') },
  { label: 'RBAC', value: $t('login.statusVerified') },
  { label: $t('login.statusI18n'), value: $t('login.statusSynced') },
]);

const onCaptchaSuccess = () => {
  captchaVerified.value = true;
};

const onCaptchaFail = () => {
  captchaVerified.value = false;
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    await authStore.login(formState.username, formState.password);
    message.success($t('login.loginSuccess'));
    router.push('/');
  } catch (error: unknown) {
    message.error(
      (error instanceof Error ? error.message : String(error)) || $t('login.loginFailed'),
    );
    captchaVerified.value = false;
    captchaRef.value?.reset();
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.login-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: var(--color-text-primary);
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--color-primary) 7%, transparent) 0,
      transparent 260px
    ),
    var(--color-bg-layout);
  font-family: var(--font-family);
}

.login-topbar {
  position: relative;
  z-index: 2;
  height: 50px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: color-mix(in srgb, var(--color-bg-container) 92%, transparent);
  border-bottom: 1px solid var(--color-border-secondary);
  box-shadow: var(--shadow-1);
  backdrop-filter: blur(12px);
}

.login-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.brand-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex: 0 0 auto;
}

.brand-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
}

.login-tools {
  display: flex;
  align-items: center;
  gap: 4px;

  :deep(.header-action) {
    width: 32px;
    height: 32px;
    padding: 0 !important;
    border-radius: var(--radius-base);
    color: var(--color-text-secondary);
    transition:
      background-color var(--duration-base) var(--ease-out),
      color var(--duration-base) var(--ease-out);
  }

  :deep(.header-action:hover) {
    color: var(--color-text-primary);
    background: var(--color-bg-layout);
  }
}

.login-main {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 40px 32px;
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  align-items: center;
  gap: 56px;
}

.login-overview {
  min-width: 0;
}

.section-kicker {
  margin-bottom: 10px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
}

.login-overview h1 {
  margin: 0;
  font-size: var(--font-size-4xl);
  line-height: 1.16;
}

.overview-copy {
  max-width: 560px;
  margin-top: 14px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 28px;
}

.module-card {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  grid-template-rows: auto auto;
  column-gap: 12px;
  row-gap: 2px;
  align-items: center;
  padding: 15px;
  background: var(--color-bg-container);
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-1);
}

.module-icon {
  grid-row: 1 / span 2;
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-base);
  font-size: 18px;
}

.module-title {
  min-width: 0;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.module-meta {
  min-width: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tone-blue .module-icon {
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 9%, var(--color-bg-container));
}

.tone-green .module-icon {
  color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 11%, var(--color-bg-container));
}

.tone-orange .module-icon {
  color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 13%, var(--color-bg-container));
}

.tone-purple .module-icon {
  color: #722ed1;
  background: color-mix(in srgb, #722ed1 10%, var(--color-bg-container));
}

.workspace-preview {
  margin-top: 20px;
  overflow: hidden;
  background: var(--color-bg-container);
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.preview-path {
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border-secondary);
  background: color-mix(in srgb, var(--color-bg-layout) 72%, var(--color-bg-container));

  span:first-child {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
  }
}

.preview-toolbar {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
  border-bottom: 1px solid var(--color-border-secondary);
}

.preview-action {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  color: #fff;
  background: var(--color-primary);
  border-radius: var(--radius-base);
  font-weight: var(--font-weight-medium);
}

.preview-table {
  display: grid;
  overflow: hidden;
}

.preview-row {
  display: grid;
  grid-template-columns: 1fr 1.2fr 88px;
  min-height: 40px;
  border-bottom: 1px solid var(--color-border-secondary);

  &:last-child {
    border-bottom: none;
  }

  span {
    min-width: 0;
    display: flex;
    align-items: center;
    padding: 0 14px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    border-right: 1px solid var(--color-border-secondary);

    &:last-child {
      border-right: none;
    }
  }
}

.preview-head {
  min-height: 36px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  background: color-mix(in srgb, var(--color-bg-layout) 68%, var(--color-bg-container));
}

.preview-row em {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: var(--radius-sm);
  font-style: normal;
  font-size: var(--font-size-xs);
}

.type-menu {
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, var(--color-bg-container));
}

.type-button {
  color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 12%, var(--color-bg-container));
}

.status-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.status-item {
  padding: 12px 14px;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-base);
  background: color-mix(in srgb, var(--color-bg-container) 76%, transparent);
}

.status-item dt {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.status-item dd {
  margin: 4px 0 0;
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.login-panel {
  width: 100%;
  padding: 24px;
  background: var(--color-bg-container);
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.login-panel-heading {
  margin-bottom: 20px;
}

.login-panel-heading p {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.login-panel-heading h2 {
  margin-top: 4px;
  font-size: var(--font-size-2xl);
  line-height: 1.25;
}

.login-panel-heading span {
  display: block;
  margin-top: 6px;
  color: var(--color-text-secondary);
}

.login-form {
  :deep(.ant-form-item) {
    margin-bottom: 14px;
  }

  :deep(.ant-form-item-label) {
    padding-bottom: 4px;
  }

  :deep(.ant-form-item-label > label) {
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
  }

  :deep(.ant-input-affix-wrapper) {
    border-radius: var(--radius-base);
    transition:
      border-color var(--duration-base) var(--ease-out),
      box-shadow var(--duration-base) var(--ease-out);
  }

  :deep(.ant-input-prefix),
  :deep(.ant-input-password-icon) {
    color: var(--color-text-tertiary);
  }

  :deep(.ant-input-affix-wrapper:hover),
  :deep(.ant-input-affix-wrapper-focused) {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 11%, transparent);
  }

  :deep(.ant-btn-primary) {
    height: 40px;
    border-radius: var(--radius-base);
    box-shadow: none;
    font-weight: var(--font-weight-medium);
  }

  :deep(.ant-btn-primary:not(:disabled):hover) {
    box-shadow: 0 6px 16px color-mix(in srgb, var(--color-primary) 20%, transparent);
  }

  :deep(.slider-captcha) {
    .slider-bg {
      border-color: var(--color-border);
      border-radius: var(--radius-base);
      background: var(--color-bg-container);
    }

    .slider-bg.success {
      color: var(--color-success);
      border-color: var(--color-success-border);
      background: color-mix(in srgb, var(--color-success) 9%, var(--color-bg-container));
    }

    .slider-text {
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-medium);
    }

    .slider-track {
      background: color-mix(in srgb, var(--color-primary) 10%, transparent);
      border-right-color: var(--color-primary);
    }

    .slider-handle {
      color: var(--color-primary);
      border-color: var(--color-border);
      border-radius: var(--radius-base);
      background: var(--color-bg-container);
      box-shadow: var(--shadow-1);
    }

    .slider-handle:active {
      color: #fff;
      background: var(--color-primary);
    }

    .slider-handle.success {
      color: #fff;
      border-color: var(--color-success);
      background: var(--color-success);
    }
  }
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
  margin: -2px 0 14px;

  :deep(.ant-checkbox-wrapper) {
    color: var(--color-text-secondary);
  }
}

.login-demo {
  display: grid;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-base);
  background: color-mix(in srgb, var(--color-bg-layout) 72%, var(--color-bg-container));
}

.demo-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-success);
  font-weight: var(--font-weight-semibold);
}

.demo-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
}

.demo-row span {
  min-width: 56px;
}

.demo-row code {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  color: var(--color-text-primary);
  background: var(--color-bg-container);
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-sm);
  font-family: var(--font-family-code);
  font-size: var(--font-size-xs);
}

:root.dark .login-shell {
  .tone-purple .module-icon {
    color: #b37feb;
    background: color-mix(in srgb, #b37feb 12%, var(--color-bg-container));
  }

  .preview-action {
    color: #fff;
  }
}

@media (max-width: 960px) {
  .login-main {
    grid-template-columns: 1fr;
    max-width: 680px;
    gap: 32px;
  }

  .login-panel {
    order: 1;
  }

  .login-overview {
    order: 2;
  }
}

@media (max-width: 640px) {
  .login-topbar {
    height: 50px;
    padding: 0 16px;
  }

  .brand-title {
    font-size: var(--font-size-base);
  }

  .login-main {
    padding: 28px 16px 36px;
  }

  .login-panel {
    padding: 22px;
  }

  .login-overview h1 {
    font-size: var(--font-size-3xl);
  }

  .overview-copy {
    font-size: var(--font-size-sm);
  }

  .module-grid,
  .status-strip {
    grid-template-columns: 1fr;
  }

  .preview-path,
  .preview-toolbar {
    align-items: flex-start;
    flex-direction: column;
    padding: 12px;
  }

  .preview-row {
    grid-template-columns: 1fr 1.1fr 70px;

    span {
      padding: 0 10px;
    }
  }
}
</style>
