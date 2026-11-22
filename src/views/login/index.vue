<template>
  <div class="login-shell">
    <div class="brand-pane">
      <div class="brand-lockup">
        <img :src="logoImg" alt="" width="32" height="32" />
        <span>{{ $t('common.appName') }}</span>
      </div>
      <p class="brand-title">{{ $t('login.gridTitle') }}</p>
    </div>

    <main class="login-pane" aria-labelledby="login-form-title">
      <div class="login-tools">
        <LanguageSwitch v-if="settingsStore.showLanguageSwitch" />
        <ThemeToggle />
      </div>

      <div class="form-wrap">
        <h1 id="login-form-title">{{ $t('login.formTitle') }}</h1>
        <p v-if="!demo" class="form-subtitle">{{ $t('login.formSubtitle') }}</p>

        <a-form
          name="login"
          :model="formState"
          :rules="rules"
          :disabled="loading"
          :scroll-to-first-error="{ focus: true }"
          layout="vertical"
          class="login-form"
          @finish="handleSubmit"
        >
          <fieldset
            v-if="demo"
            class="login-fieldset login-demo"
            aria-describedby="login-demo-hint"
            :disabled="loading"
          >
            <legend>{{ $t('login.demoAccount') }}</legend>
            <p id="login-demo-hint">{{ $t('login.demoAccountHint') }}</p>
            <div class="demo-accounts">
              <button
                v-for="account in demo.accounts"
                :key="account.username"
                type="button"
                class="demo-account"
                :aria-pressed="activeDemoAccount === account.username"
                @click="selectDemoAccount(account.username)"
              >
                <strong>{{ $t(account.roleKey) }}</strong>
                <code>{{ account.username }}</code>
                <span
                  v-if="activeDemoAccount === account.username"
                  class="demo-check"
                  aria-hidden="true"
                >
                  ✓
                </span>
              </button>
            </div>
          </fieldset>

          <a-form-item :label="$t('login.username')" name="username">
            <a-input
              v-model:value="formState.username"
              name="username"
              size="large"
              autocomplete="username"
              :placeholder="$t('login.usernamePlaceholder')"
            />
          </a-form-item>

          <a-form-item :label="$t('login.password')" name="password">
            <a-input-password
              v-model:value="formState.password"
              name="password"
              size="large"
              autocomplete="current-password"
              :placeholder="$t('login.passwordPlaceholder')"
            />
          </a-form-item>

          <fieldset v-if="demo" class="login-fieldset" aria-describedby="verification-demo-hint">
            <legend>{{ $t('login.verificationDemo') }}</legend>
            <p id="verification-demo-hint">{{ $t('login.verificationDemoHint') }}</p>
            <SliderCaptcha ref="captchaRef" @success="demoVerified = true" />
          </fieldset>

          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
            :disabled="demoVerificationPending"
            :aria-busy="loading"
          >
            {{ loading ? $t('login.signingIn') : $t('login.login') }}
          </a-button>
          <p
            class="login-error"
            :class="{ 'has-error': loginFailed }"
            role="alert"
            aria-atomic="true"
          >
            {{ loginFailed ? $t('login.loginFailed') : '' }}
          </p>
        </a-form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { message } from 'antdv-next';
import { computed, nextTick, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import logoImg from '@/assets/images/logo.png';
import { SliderCaptcha } from '@/components/Captcha';
import LanguageSwitch from '@/components/Layout/LanguageSwitch.vue';
import ThemeToggle from '@/components/Layout/ThemeToggle.vue';
import { usesMockData } from '@/constants/environment';
import { $t } from '@/locales';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { clearSessionState } from '@/utils/session';

const demo = usesMockData
  ? {
      password: '123456',
      accounts: [
        { username: 'admin', roleKey: 'login.demoAdminRole' },
        { username: 'user', roleKey: 'login.demoUserRole' },
      ],
    }
  : undefined;

const router = useRouter();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();

const loading = ref(false);
const loginFailed = ref(false);
const demoVerified = ref(false);
const demoVerificationPending = computed(() => Boolean(demo) && !demoVerified.value);
const captchaRef = ref<InstanceType<typeof SliderCaptcha>>();
const formState = reactive({
  username: demo?.accounts[0].username ?? '',
  password: demo?.password ?? '',
});

const activeDemoAccount = computed(() =>
  demo && formState.password === demo.password ? formState.username : '',
);
const rules = computed(() => ({
  username: [{ required: true, message: $t('login.usernameRequired') }],
  password: [{ required: true, message: $t('login.passwordRequired') }],
}));

function selectDemoAccount(username: string): void {
  if (!demo) return;

  formState.username = username;
  formState.password = demo.password;
  loginFailed.value = false;
}

async function handleSubmit(): Promise<void> {
  if (demoVerificationPending.value || loading.value) return;

  loginFailed.value = false;
  loading.value = true;
  try {
    clearSessionState(router);
    await authStore.login(formState.username, formState.password);
    message.success($t('login.loginSuccess'));
    await router.push('/');
  } catch {
    loginFailed.value = true;
    if (demo) {
      demoVerified.value = false;
      captchaRef.value?.reset();
      await nextTick();
      captchaRef.value?.focus();
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-shell {
  --login-surface: var(--color-bg-container);
  --login-muted: var(--color-text-secondary);
  --login-line: var(--color-border);

  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  min-height: 100vh;
  min-height: 100dvh;
  color: var(--color-text-primary);
  background: var(--login-surface);
}

.brand-pane {
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-rows: auto 1fr;
  align-items: center;
  padding: clamp(28px, 5vw, 80px);
  border-inline-end: 1px solid var(--login-line);
  background: var(--color-bg-layout);
}

.brand-pane::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  content: '';
  background-image:
    linear-gradient(to right, var(--login-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--login-line) 1px, transparent 1px),
    linear-gradient(to right, var(--color-border-secondary) 1px, transparent 1px),
    linear-gradient(to bottom, var(--color-border-secondary) 1px, transparent 1px);
  background-size:
    48px 48px,
    48px 48px,
    12px 12px,
    12px 12px;
  mask-image: radial-gradient(ellipse at 22% 52%, black 8%, transparent 82%);
  pointer-events: none;
}

.brand-lockup {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: var(--font-weight-semibold);
}

.brand-lockup img {
  flex: none;
  object-fit: contain;
}

.brand-title {
  max-width: 16ch;
  margin: 0;
  font-size: clamp(30px, 3.6vw, 56px);
  font-weight: var(--font-weight-semibold);
  line-height: 1.14;
  text-wrap: balance;
}

.login-pane {
  display: grid;
  grid-template-rows: auto 1fr;
  align-items: center;
  gap: 28px;
  padding: 24px clamp(24px, 5vw, 80px) 44px;
}

.login-tools {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.form-wrap {
  width: min(100%, 400px);
  margin-inline: auto;
}

.form-wrap h1 {
  margin: 0 0 20px;
  font-size: clamp(24px, 3.5vw, 32px);
  font-weight: var(--font-weight-semibold);
  line-height: 1.25;
}

.form-subtitle {
  margin: -10px 0 24px;
  color: var(--login-muted);
}

.login-fieldset {
  min-inline-size: 0;
  margin: 0 0 16px;
  padding: 0;
  border: 0;
}

.login-demo {
  margin-bottom: 20px;
}

.login-fieldset legend {
  margin: 0 0 4px;
  padding: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.login-fieldset > p {
  margin: 0 0 10px;
  color: var(--login-muted);
}

.demo-accounts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.demo-account {
  position: relative;
  display: grid;
  gap: 2px;
  min-height: 54px;
  padding: 8px 26px 8px 12px;
  border: 1px solid var(--login-line);
  border-radius: var(--radius-base);
  color: var(--color-text-primary);
  background: var(--login-surface);
  text-align: start;
  overflow-wrap: anywhere;
  cursor: pointer;
}

.demo-account:hover:not(:disabled),
.demo-account[aria-pressed='true'] {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 8%, var(--login-surface));
}

.demo-account code {
  color: var(--login-muted);
  font-family: var(--font-family-code);
  font-size: var(--font-size-xs);
}

.demo-check {
  position: absolute;
  inset-block-start: 8px;
  inset-inline-end: 10px;
}

.login-form :deep(.ant-form-item) {
  margin-bottom: 16px;
}

.login-form :deep(.ant-form-item-label) {
  padding-bottom: 4px;
}

.login-form :deep(.ant-btn) {
  min-height: 44px;
}

.demo-account:focus-visible,
.login-pane :deep(.ant-btn:focus-visible),
.login-pane :deep(.ant-input-affix-wrapper:has(> .ant-input:focus-visible)),
.login-pane :deep(.ant-input-clear-icon:focus-visible),
.login-pane :deep(.ant-input-password-icon:focus-visible) {
  outline: 2px solid var(--color-text-primary);
  outline-offset: 2px;
}

.login-error {
  margin: 0;
}

.login-error.has-error {
  margin-top: 12px;
  padding: 8px 12px;
  border-inline-start: 3px solid var(--color-error);
  background: color-mix(in srgb, var(--color-error) 9%, var(--login-surface));
}

@media (prefers-reduced-motion: reduce) {
  .login-form :deep(.ant-btn-loading-icon),
  .login-form :deep(.ant-btn-loading-icon .anticon-spin) {
    animation: none;
    transition: none;
  }
}

@media (max-width: 720px) {
  .login-shell {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto 1fr;
  }

  .brand-pane {
    padding: 20px 24px;
    border-inline-end: 0;
    border-block-end: 1px solid var(--login-line);
  }

  .brand-title {
    display: none;
  }

  .login-pane {
    align-items: start;
    gap: 12px;
    padding-top: 12px;
  }
}
</style>
