<template>
  <div class="login-shell">
    <section class="pane-left" aria-hidden="true">
      <div class="grid-bg"></div>
      <div class="grid-bg-fine"></div>
      <div class="grid-cross" style="top: 34%; left: 62%">
        <span class="lbl">N · 32.0612°</span>
      </div>
      <div class="grid-cross" style="top: 68%; left: 18%">
        <span class="lbl">+0.42 / IDX</span>
      </div>

      <div class="pane-left-content">
        <div class="logo-mark">
          <img :src="logoImg" alt="Logo" class="logo-glyph" />
          <span>{{ $t('common.appName') }}</span>
        </div>

        <div class="pane-left-spacer"></div>

        <div class="tag-row">
          <span class="dot"></span>
          <span>{{ $t('login.workspaceLabel') }}</span>
        </div>

        <h1 class="pane-left-title">
          {{ $t('login.gridTitle') }}
          <span class="thin">{{ $t('login.gridSubtitle') }}</span>
        </h1>

        <p class="pane-left-lede">{{ $t('login.gridLede') }}</p>

        <div class="trust-list" role="list">
          <div v-for="item in trustItems" :key="item" class="trust-item" role="listitem">
            <CheckCircleOutlined />
            <span>{{ $t(item) }}</span>
          </div>
        </div>

        <div class="stats">
          <div v-for="stat in capabilityStats" :key="stat.labelKey" class="stat">
            <div class="stat-value">
              {{ stat.value }}<span class="stat-unit">{{ stat.unit }}</span>
            </div>
            <div class="stat-label">{{ $t(stat.labelKey) }}</div>
          </div>
        </div>
      </div>

      <div class="pane-left-foot">
        <span>© {{ currentYear }} {{ $t('common.appName') }}</span>
        <span class="coord">⟶ 31.230 N / 121.473 E · SHA</span>
      </div>
    </section>

    <section class="pane-right" aria-labelledby="login-form-title">
      <div class="mobile-brand">
        <div class="logo-mark">
          <img :src="logoImg" alt="Logo" class="logo-glyph" />
          <span>{{ $t('common.appName') }}</span>
        </div>
        <p>{{ $t('login.gridSubtitle') }}</p>
      </div>

      <div class="pane-right-head">
        <div class="login-tools">
          <LanguageSwitch />
          <ThemeToggle />
        </div>
      </div>

      <div class="form-wrap">
        <div class="login-card">
          <div class="eyebrow">{{ $t('login.securityEyebrow') }}</div>
          <h2 id="login-form-title">{{ $t('login.formTitle') }}</h2>
          <p class="form-sub">{{ $t('login.formSubtitle') }}</p>

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
              <p class="submit-hint">
                {{ captchaVerified ? $t('login.submitReadyHint') : $t('login.submitLockedHint') }}
              </p>
            </a-form-item>
          </a-form>

          <div class="login-demo">
            <div class="demo-title">
              <CheckCircleOutlined />
              <span>{{ $t('login.demoAccount') }}</span>
            </div>
            <p class="demo-sub">{{ $t('login.demoAccountHint') }}</p>
            <div class="demo-accounts">
              <button
                v-for="account in demoAccounts"
                :key="account.username"
                type="button"
                class="demo-account"
                :class="{ active: formState.username === account.username }"
                @click="selectDemoAccount(account.username)"
              >
                <span class="demo-account-name">{{ account.username }}</span>
                <span>{{ $t(account.roleKey) }}</span>
              </button>
            </div>
            <div class="demo-row">
              <span>{{ $t('login.password') }}</span>
              <code>123456</code>
            </div>
          </div>
        </div>
      </div>

      <div class="pane-right-foot">
        <span>build {{ buildLabel }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  CheckCircleOutlined,
  LockOutlined,
  UserOutlined,
} from '@antdv-next/icons';
import { message } from 'antdv-next';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import logoImg from '@/assets/images/logo.png';
import { SliderCaptcha } from '@/components/Captcha';
import LanguageSwitch from '@/components/Layout/LanguageSwitch.vue';
import ThemeToggle from '@/components/Layout/ThemeToggle.vue';
import { $t } from '@/locales';
import { useAuthStore } from '@/stores/auth';

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

const capabilityStats = [
  { value: 'RBAC', unit: '', labelKey: 'login.statPermission' },
  { value: 'Mock', unit: '', labelKey: 'login.statMock' },
  { value: '4', unit: ' locales', labelKey: 'login.statI18n' },
];

const trustItems = [
  'login.trustPermission',
  'login.trustAudit',
  'login.trustTheme',
];

const demoAccounts = [
  { username: 'admin', roleKey: 'login.demoAdminRole' },
  { username: 'user', roleKey: 'login.demoUserRole' },
];

const rules = {
  username: [{ required: true, message: $t('login.usernameRequired') }],
  password: [{ required: true, message: $t('login.passwordRequired') }],
};

const currentYear = new Date().getFullYear();
const buildLabel = `${currentYear}.${String(new Date().getMonth() + 1).padStart(2, '0')}`;

const onCaptchaSuccess = () => {
  captchaVerified.value = true;
};

const onCaptchaFail = () => {
  captchaVerified.value = false;
};

const selectDemoAccount = (username: string) => {
  formState.username = username;
  formState.password = '123456';
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
/* ================================================================
   Tokens — local design system for login
   ================================================================ */
.login-shell {
  --login-ink: var(--color-text-primary);
  --login-ink-2: var(--color-text-secondary);
  --login-ink-3: var(--color-text-tertiary);
  --login-ink-4: var(--color-text-quaternary);
  --login-bg: var(--color-bg-layout);
  --login-bg-elev: var(--color-bg-container);
  --login-bg-subtle: color-mix(in srgb, var(--color-bg-layout) 72%, var(--color-bg-container));
  --login-line: var(--color-border-secondary);
  --login-line-strong: var(--color-border);
  --login-brand: var(--color-primary);
  --login-accent: var(--color-primary-5);
  --login-ease: cubic-bezier(0.2, 0.7, 0.2, 1);

  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  color: var(--login-ink);
  font-family: var(--font-family);
}

/* ================================================================
   LEFT PANE — Precision Grid
   ================================================================ */
.pane-left {
  position: relative;
  background: var(--login-bg-subtle);
  overflow: hidden;
  border-right: 1px solid var(--login-line);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 56px 64px;
}

/* Grid backgrounds */
.grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, var(--login-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--login-line) 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 0.9;
  mask-image: radial-gradient(ellipse at 30% 40%, #000 0%, #000 40%, transparent 85%);
  -webkit-mask-image: radial-gradient(ellipse at 30% 40%, #000 0%, #000 40%, transparent 85%);
}

.grid-bg-fine {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, var(--login-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--login-line) 1px, transparent 1px);
  background-size: 12px 12px;
  opacity: 0.35;
  mask-image: radial-gradient(ellipse at 30% 40%, #000 0%, transparent 50%);
  -webkit-mask-image: radial-gradient(ellipse at 30% 40%, #000 0%, transparent 50%);
}

/* Animated accent dots on grid */
.grid-bg::before,
.grid-bg::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--login-accent);
  box-shadow: 0 0 0 4px color-mix(in oklab, var(--login-accent) 20%, transparent);
}

.grid-bg::before {
  top: 30%;
  left: 25%;
  animation: gridDot1 12s var(--login-ease) infinite;
}

.grid-bg::after {
  top: 55%;
  left: 45%;
  width: 6px;
  height: 6px;
  animation: gridDot2 15s var(--login-ease) infinite;
}

@keyframes gridDot1 {
  0%, 100% { transform: translate(0, 0); opacity: 0.9; }
  25%      { transform: translate(96px, 48px); opacity: 0.5; }
  50%      { transform: translate(48px, 144px); opacity: 0.9; }
  75%      { transform: translate(-48px, 96px); opacity: 0.4; }
}

@keyframes gridDot2 {
  0%, 100% { transform: translate(0, 0); opacity: 0.8; }
  33%      { transform: translate(-72px, 48px); opacity: 0.3; }
  66%      { transform: translate(96px, -48px); opacity: 0.9; }
}

/* Crosshair callouts */
.grid-cross {
  position: absolute;
  width: 16px;
  height: 16px;
  pointer-events: none;
}

.grid-cross::before,
.grid-cross::after {
  content: '';
  position: absolute;
  background: var(--login-accent);
}

.grid-cross::before {
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  transform: translateX(-50%);
}

.grid-cross::after {
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  transform: translateY(-50%);
}

.grid-cross .lbl {
  position: absolute;
  left: 22px;
  top: -4px;
  font-family: var(--font-family-code);
  font-size: 10px;
  color: var(--login-accent);
  white-space: nowrap;
  letter-spacing: 0.04em;
}

/* Left pane content */
.pane-left-content {
  position: relative;
  z-index: 1;
  max-width: 460px;
}

.logo-mark {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: -0.01em;
  color: var(--login-ink);
  font-size: 15px;
}

.logo-glyph {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: contain;
  flex: 0 0 auto;
}

.pane-left-spacer {
  height: 80px;
}

.tag-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-family-code);
  font-size: 11px;
  color: var(--login-ink-3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 28px;
}

.tag-row .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--login-accent);
  box-shadow: 0 0 0 4px color-mix(in oklab, var(--login-accent) 18%, transparent);
  animation: pulse 2.4s var(--login-ease) infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 4px color-mix(in oklab, var(--login-accent) 18%, transparent); }
  50%      { box-shadow: 0 0 0 8px color-mix(in oklab, var(--login-accent) 5%, transparent); }
}

.pane-left-title {
  font-size: 38px;
  line-height: 1.1;
  font-weight: var(--font-weight-semibold);
  letter-spacing: -0.02em;
  margin: 0 0 20px;
  color: var(--login-ink);

  .thin {
    display: block;
    font-size: 15px;
    font-weight: var(--font-weight-normal);
    color: var(--login-ink-3);
    line-height: 1.6;
    margin-top: 10px;
    letter-spacing: 0;
  }
}

.pane-left-lede {
  font-size: 15px;
  color: var(--login-ink-3);
  line-height: 1.65;
  max-width: 420px;
  margin: 0 0 22px;
}

.trust-list {
  display: grid;
  gap: 10px;
  margin-bottom: 34px;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--login-ink-2);
  font-size: var(--font-size-sm);

  :deep(svg) {
    color: var(--color-success);
    font-size: 14px;
  }
}

/* Stats */
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding-top: 28px;
  border-top: 1px solid var(--login-line-strong);
}

.stat-value {
  font-family: var(--font-family-code);
  font-size: 24px;
  font-weight: var(--font-weight-medium);
  color: var(--login-ink);
  letter-spacing: -0.02em;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stat-unit {
  font-size: 12px;
  color: var(--login-ink-4);
  font-weight: var(--font-weight-normal);
}

.stat-label {
  font-size: 11px;
  color: var(--login-ink-4);
  margin-top: 4px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* Left pane footer */
.pane-left-foot {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  color: var(--login-ink-4);
  font-family: var(--font-family-code);
  font-size: 11px;
  letter-spacing: 0.04em;
}

.pane-left-foot .coord {
  color: var(--login-ink-3);
}

/* ================================================================
   RIGHT PANE — Form
   ================================================================ */
.pane-right {
  display: flex;
  flex-direction: column;
  padding: 32px 64px 40px;
  background: var(--login-bg);
  position: relative;
}

.mobile-brand {
  display: none;
}

.pane-right-head {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-height: 36px;
  margin-bottom: 16px;
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
    color: var(--login-ink-3);
    transition:
      background-color var(--duration-base) var(--ease-out),
      color var(--duration-base) var(--ease-out);
  }

  :deep(.header-action:hover) {
    color: var(--login-ink);
    background: var(--login-bg-subtle);
  }
}

.form-wrap {
  margin: auto 0;
  max-width: 420px;
  width: 100%;
  align-self: center;
}

.login-card {
  padding: 28px;
  border: 1px solid color-mix(in srgb, var(--login-line) 78%, transparent);
  border-radius: calc(var(--radius-lg) + 4px);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--login-bg-elev) 92%, transparent), var(--login-bg-elev)),
    var(--login-bg-elev);
  box-shadow: 0 24px 70px color-mix(in srgb, #000 7%, transparent);
}

.eyebrow {
  font-family: var(--font-family-code);
  font-size: 11px;
  color: var(--login-ink-4);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 14px;
}

.form-wrap h2 {
  font-size: 28px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: -0.02em;
  margin: 0 0 8px;
  color: var(--login-ink);
}

.form-sub {
  font-size: 14px;
  color: var(--login-ink-3);
  margin: 0 0 24px;
  line-height: 1.6;
}

/* Form styles */
.login-form {
  :deep(.ant-form-item) {
    margin-bottom: 14px;
  }

  :deep(.ant-form-item-label) {
    padding-bottom: 4px;
  }

  :deep(.ant-form-item-label > label) {
    color: var(--login-ink-3);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-sm);
  }

  :deep(.ant-input-affix-wrapper) {
    border-radius: var(--radius-base);
    border-color: var(--login-line-strong);
    transition:
      border-color var(--duration-base) var(--ease-out),
      box-shadow var(--duration-base) var(--ease-out);
  }

  :deep(.ant-input-prefix),
  :deep(.ant-input-password-icon) {
    color: var(--login-ink-4);
  }

  :deep(.ant-input-affix-wrapper:hover) {
    border-color: var(--login-ink-3);
  }

  :deep(.ant-input-affix-wrapper-focused) {
    border-color: var(--login-brand);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--login-brand) 12%, transparent);
  }

  :deep(.ant-btn-primary) {
    height: 42px;
    border-radius: var(--radius-base);
    box-shadow: none;
    font-weight: var(--font-weight-medium);
    letter-spacing: 0.02em;
    transition: all 0.15s var(--login-ease);
  }

  :deep(.ant-btn-primary:not(:disabled):hover) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px color-mix(in srgb, var(--login-brand) 25%, transparent);
  }

  :deep(.ant-btn-primary:not(:disabled):active) {
    transform: translateY(0);
  }

  :deep(.ant-form-item:last-child) {
    margin-bottom: 0;
  }

  :deep(.slider-captcha) {
    .slider-bg {
      border-color: var(--login-line-strong);
      border-radius: var(--radius-base);
      background: var(--login-bg-elev);
    }

    .slider-bg.success {
      color: var(--color-success);
      border-color: var(--color-success-border);
      background: color-mix(in srgb, var(--color-success) 9%, var(--login-bg-elev));
    }

    .slider-text {
      color: var(--login-ink-3);
      font-weight: var(--font-weight-medium);
    }

    .slider-track {
      background: color-mix(in srgb, var(--login-brand) 10%, transparent);
      border-right-color: var(--login-brand);
    }

    .slider-handle {
      color: var(--login-brand);
      border-color: var(--login-line-strong);
      border-radius: var(--radius-base);
      background: var(--login-bg-elev);
      box-shadow: var(--shadow-1);
    }

    .slider-handle:active {
      color: #fff;
      background: var(--login-brand);
    }

    .slider-handle.success {
      color: #fff;
      border-color: var(--color-success);
      background: var(--color-success);
    }
  }
}

.submit-hint {
  margin: 9px 0 0;
  color: var(--login-ink-4);
  font-size: var(--font-size-xs);
  line-height: 1.5;
  text-align: center;
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
  margin: -2px 0 14px;

  :deep(.ant-checkbox-wrapper) {
    color: var(--login-ink-3);
    font-size: var(--font-size-sm);
  }
}

/* Demo account info */
.login-demo {
  display: grid;
  gap: 10px;
  margin-top: 18px;
  padding: 14px;
  border: 1px solid var(--login-line);
  border-radius: var(--radius-base);
  background: var(--login-bg-subtle);
}

.demo-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-success);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
}

.demo-sub {
  margin: -4px 0 0;
  color: var(--login-ink-3);
  font-size: var(--font-size-xs);
  line-height: 1.5;
}

.demo-accounts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.demo-account {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  min-height: 54px;
  padding: 9px 10px;
  color: var(--login-ink-3);
  text-align: left;
  cursor: pointer;
  border: 1px solid var(--login-line);
  border-radius: var(--radius-base);
  background: var(--login-bg-elev);
  transition:
    border-color var(--duration-base) var(--ease-out),
    background-color var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-out);

  &:hover,
  &.active {
    color: var(--login-brand);
    border-color: color-mix(in srgb, var(--login-brand) 52%, var(--login-line));
    background: color-mix(in srgb, var(--login-brand) 8%, var(--login-bg-elev));
  }

  &:hover {
    transform: translateY(-1px);
  }
}

.demo-account-name {
  color: var(--login-ink);
  font-family: var(--font-family-code);
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
}

.demo-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--login-ink-3);
  font-size: var(--font-size-xs);
}

.demo-row span {
  min-width: 48px;
}

.demo-row code {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 7px;
  color: var(--login-ink-2);
  background: var(--login-bg-elev);
  border: 1px solid var(--login-line);
  border-radius: var(--radius-xs);
  font-family: var(--font-family-code);
  font-size: 11px;
}

/* Right pane footer */
.pane-right-foot {
  margin-top: auto;
  padding-top: 24px;
  font-family: var(--font-family-code);
  font-size: 11px;
  color: var(--login-ink-4);
  letter-spacing: 0.04em;
  text-align: right;
}

/* ================================================================
   Dark mode overrides
   ================================================================ */
:root.dark .login-shell {
  --login-bg-subtle: color-mix(in srgb, #1a1a1f 80%, var(--login-bg-elev));

  .grid-bg,
  .grid-bg-fine {
    opacity: 0.4;
  }
}

/* ================================================================
   Responsive
   ================================================================ */
@media (max-width: 1100px) {
  .pane-left {
    padding: 40px 40px;
  }

  .pane-right {
    padding: 32px 40px 40px;
  }

  .pane-left-title {
    font-size: 30px;
  }
}

@media (max-width: 960px) {
  .login-shell {
    grid-template-columns: 1fr;
  }

  .pane-left {
    display: none;
  }

  .pane-right {
    padding: 28px 32px 40px;
    max-width: 520px;
    margin: 0 auto;
  }

  .mobile-brand {
    display: grid;
    gap: 8px;
    margin-bottom: 28px;

    p {
      margin: 0;
      color: var(--login-ink-3);
      font-size: var(--font-size-sm);
      line-height: 1.5;
    }
  }

  .form-wrap {
    max-width: 100%;
    margin: 0;
  }
}

@media (max-width: 640px) {
  .pane-right {
    padding: 24px 20px 32px;
  }

  .pane-right-head {
    margin-bottom: 12px;
  }

  .form-wrap h2 {
    font-size: 24px;
  }

  .form-sub {
    font-size: var(--font-size-sm);
  }

  .login-card {
    padding: 22px;
    border-radius: var(--radius-lg);
  }

  .demo-accounts {
    grid-template-columns: 1fr;
  }
}
</style>
