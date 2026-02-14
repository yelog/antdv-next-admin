<template>
  <div class="login-shell">
    <div class="ambient ambient-left"></div>
    <div class="ambient ambient-right"></div>
    <div class="ambient ambient-bottom"></div>

    <div class="login-tools">
      <LanguageSwitch />
      <ThemeToggle />
    </div>

    <div class="login-box">
      <div class="login-header">
        <!-- Keep consistent with the in-app (top-left) logo style -->
        <div class="logo-wrap">
          <img :src="logoImg" alt="Logo" class="logo" />
        </div>
        <p class="eyebrow">Antdv Next Admin</p>
        <h1 class="title">{{ $t('login.title') }}</h1>
        <p class="subtitle">Secure workspace entrance</p>
      </div>

      <a-form
        :model="formState"
        :rules="rules"
        @finish="handleSubmit"
        class="login-form"
      >
        <a-form-item name="username">
          <a-input
            v-model:value="formState.username"
            size="large"
            :placeholder="$t('login.usernamePlaceholder')"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="password">
          <a-input-password
            v-model:value="formState.password"
            size="large"
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
            :height="46"
            @success="onCaptchaSuccess"
            @fail="onCaptchaFail"
          />
        </a-form-item>

        <a-form-item>
          <a-checkbox v-model:checked="formState.remember">
            {{ $t('login.remember') }}
          </a-checkbox>
        </a-form-item>

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

      <div class="login-tips">
        <p>
          <span>{{ $t('login.username') }}</span>
          <code>admin / user</code>
        </p>
        <p>
          <span>{{ $t('login.password') }}</span>
          <code>123456</code>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined } from '@antdv-next/icons'
import { useAuthStore } from '@/stores/auth'
import { message } from 'antdv-next'
import { $t } from '@/locales'
import ThemeToggle from '@/components/Layout/ThemeToggle.vue'
import LanguageSwitch from '@/components/Layout/LanguageSwitch.vue'
import { SliderCaptcha } from '@/components/Captcha'
import logoImg from '@/assets/images/logo.png'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const captchaVerified = ref(false)
const captchaRef = ref<InstanceType<typeof SliderCaptcha>>()
const formState = reactive({
  username: 'admin',
  password: '123456',
  remember: false
})

const rules = {
  username: [{ required: true, message: $t('login.usernameRequired') }],
  password: [{ required: true, message: $t('login.passwordRequired') }]
}

const onCaptchaSuccess = () => {
  captchaVerified.value = true
}

const onCaptchaFail = () => {
  captchaVerified.value = false
}

const handleSubmit = async () => {
  loading.value = true
  try {
    await authStore.login(formState.username, formState.password)
    message.success($t('login.loginSuccess'))
    router.push('/')
  } catch (error: any) {
    message.error(error.message || $t('login.loginFailed'))
    captchaVerified.value = false
    captchaRef.value?.reset()
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-shell {
  --login-font-family: 'Outfit', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --login-bg: radial-gradient(circle at 10% 20%, rgba(67, 160, 255, 0.35), transparent 46%),
    radial-gradient(circle at 92% 15%, rgba(122, 214, 255, 0.36), transparent 44%),
    radial-gradient(circle at 85% 88%, rgba(90, 136, 255, 0.24), transparent 36%),
    linear-gradient(132deg, #e8f5ff 0%, #cfe8ff 42%, #b9e0ff 100%);
  --login-panel-bg: rgba(255, 255, 255, 0.72);
  --login-panel-border: rgba(255, 255, 255, 0.65);
  --login-text: #132640;
  --login-muted: rgba(19, 38, 64, 0.7);
  --login-input-bg: rgba(255, 255, 255, 0.88);
  --login-input-border: rgba(148, 185, 225, 0.55);
  --login-tip-bg: rgba(239, 248, 255, 0.95);
  --login-tip-border: rgba(148, 185, 225, 0.45);
  --login-shadow: 0 28px 64px rgba(41, 103, 184, 0.25);

  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 88px 16px 32px;
  min-height: 100vh;
  background: var(--login-bg);
  font-family: var(--login-font-family);
  transition:
    background var(--duration-slower) var(--ease-in-out),
    color var(--duration-base) var(--ease-out);

  .ambient {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(8px);
    opacity: 0.85;
    animation: float 12s ease-in-out infinite;
    transition:
      background var(--duration-slower) var(--ease-in-out),
      opacity var(--duration-base) var(--ease-out);
  }

  .ambient-left {
    width: 420px;
    height: 420px;
    left: -160px;
    top: -120px;
    background: radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.88), rgba(80, 174, 255, 0.22));
  }

  .ambient-right {
    width: 460px;
    height: 460px;
    right: -170px;
    top: -90px;
    background: radial-gradient(circle at 45% 45%, rgba(210, 243, 255, 0.9), rgba(105, 173, 255, 0.2));
    animation-delay: -2.2s;
  }

  .ambient-bottom {
    width: 500px;
    height: 500px;
    right: 12%;
    bottom: -300px;
    background: radial-gradient(circle at 45% 30%, rgba(167, 210, 255, 0.4), rgba(134, 170, 255, 0.08));
    animation-delay: -4.5s;
  }

  .login-tools {
    position: absolute;
    top: var(--spacing-md);
    right: var(--spacing-md);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    z-index: 4;

    :deep(.header-action) {
      font-size: 18px;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-base);
      color: var(--login-text);
      background: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.78);
      backdrop-filter: blur(10px);
      transition: all var(--duration-base) var(--ease-out);

      &:hover {
        background: rgba(255, 255, 255, 0.92);
        transform: translateY(-1px);
      }
    }
  }

  .login-box {
    position: relative;
    z-index: 2;
    width: min(440px, 100%);
    padding: 38px 34px 30px;
    background: var(--login-panel-bg);
    border: 1px solid var(--login-panel-border);
    border-radius: 26px;
    box-shadow: var(--login-shadow);
    backdrop-filter: blur(14px) saturate(150%);
    transition:
      background var(--duration-slower) var(--ease-in-out),
      border-color var(--duration-slower) var(--ease-in-out),
      box-shadow var(--duration-slower) var(--ease-in-out);

    .login-header {
      text-align: center;
      margin-bottom: 24px;

      .logo-wrap {
        width: 78px;
        height: 78px;
        margin: 0 auto 14px;
        border-radius: 22px;
        background: linear-gradient(145deg, rgba(255, 255, 255, 0.85), rgba(208, 232, 255, 0.8));
        border: 1px solid rgba(255, 255, 255, 0.8);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.88);
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
          background var(--duration-slower) var(--ease-in-out),
          border-color var(--duration-slower) var(--ease-in-out);
      }

      .logo {
        width: 48px;
        height: 48px;
        object-fit: contain;
      }

      .eyebrow {
        margin-bottom: 6px;
        font-size: 13px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--login-muted);
      }

      .title {
        font-size: 34px;
        font-weight: var(--font-weight-bold);
        margin-bottom: 2px;
        color: var(--login-text);
        line-height: 1.2;
      }

      .subtitle {
        font-size: 14px;
        color: var(--login-muted);
      }
    }

    .login-form {
      margin-top: 20px;
    }

    :deep(.ant-form-item) {
      margin-bottom: 14px;
    }

    :deep(.ant-form-item-explain-error) {
      font-size: 12px;
      color: #ff6b6b;
    }

    :deep(.ant-input-affix-wrapper),
    :deep(.ant-input-password),
    :deep(.ant-input) {
      border-radius: 12px;
      border: 1px solid var(--login-input-border);
      background: var(--login-input-bg);
      color: var(--login-text);
      transition: all var(--duration-base) var(--ease-out);
      box-shadow: none;
    }

    :deep(.ant-input-affix-wrapper),
    :deep(.ant-input-password) {
      height: 46px;
    }

    :deep(.ant-input-affix-wrapper input),
    :deep(.ant-input-password input) {
      color: var(--login-text);
      font-weight: 500;
      background: transparent !important;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    }

    :deep(.ant-input-affix-wrapper input::placeholder),
    :deep(.ant-input-password input::placeholder) {
      color: var(--login-muted);
    }

    :deep(.ant-input-prefix),
    :deep(.ant-input-password-icon) {
      color: var(--login-muted);
    }

    :deep(.ant-input-affix-wrapper:hover),
    :deep(.ant-input-password:hover),
    :deep(.ant-input-affix-wrapper-focused),
    :deep(.ant-input-password-focused) {
      border-color: rgba(47, 132, 255, 0.68);
      box-shadow: 0 0 0 3px rgba(47, 132, 255, 0.12);
    }

    :deep(.ant-checkbox-wrapper) {
      color: var(--login-muted);
      font-weight: 500;
    }

    :deep(.ant-checkbox-inner) {
      border-color: var(--login-input-border);
      background: var(--login-input-bg);
    }

    :deep(.ant-btn-primary) {
      height: 46px;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      letter-spacing: 0.08em;
      background: linear-gradient(135deg, #1f83ff 0%, #1467ff 100%);
      box-shadow: 0 12px 24px rgba(20, 103, 255, 0.25);
      transition: all var(--duration-base) var(--ease-out);
    }

    :deep(.ant-btn-primary:hover) {
      background: linear-gradient(135deg, #2f92ff 0%, #1d74ff 100%);
      transform: translateY(-1px);
      box-shadow: 0 14px 28px rgba(20, 103, 255, 0.3);
    }

    :deep(.ant-btn-primary:disabled) {
      background: linear-gradient(135deg, #1f83ff 0%, #1467ff 100%);
      opacity: 0.5;
      box-shadow: none;
      transform: none;
      color: #fff;
      border: none;
    }

    :deep(.slider-captcha) {
      .slider-bg {
        border-radius: 12px;
        border-color: var(--login-input-border);
        background: var(--login-input-bg);
        transition: border-color var(--duration-base) var(--ease-out),
          background var(--duration-base) var(--ease-out);
      }

      .slider-bg.success {
        background: rgba(82, 196, 26, 0.08);
        border-color: rgba(82, 196, 26, 0.5);
      }

      .slider-text {
        color: var(--login-muted);
        font-weight: 500;
        font-size: 13px;
        letter-spacing: 0.04em;
      }

      .slider-track {
        background: linear-gradient(90deg, rgba(47, 132, 255, 0.08), rgba(47, 132, 255, 0.15));
        border-right: 1px solid rgba(47, 132, 255, 0.3);
        border-radius: 12px 0 0 12px;
      }

      .slider-handle {
        border-radius: 0 12px 12px 0;
        background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(230, 242, 255, 0.9));
        border-color: rgba(47, 132, 255, 0.4);
        box-shadow: 0 2px 8px rgba(47, 132, 255, 0.15);
        color: rgba(47, 132, 255, 0.8);
        font-weight: 600;
        transition: background var(--duration-base) var(--ease-out),
          border-color var(--duration-base) var(--ease-out),
          box-shadow var(--duration-base) var(--ease-out),
          color var(--duration-base) var(--ease-out);

        &:hover {
          border-color: rgba(47, 132, 255, 0.6);
          box-shadow: 0 0 0 3px rgba(47, 132, 255, 0.12), 0 2px 8px rgba(47, 132, 255, 0.2);
          color: rgba(47, 132, 255, 1);
        }

        &:active {
          background: linear-gradient(135deg, #1f83ff 0%, #1467ff 100%);
          border-color: rgba(47, 132, 255, 0.7);
          color: #fff;
          cursor: grabbing;
        }
      }

      .slider-handle.success {
        background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
        border-color: rgba(82, 196, 26, 0.6);
        box-shadow: 0 2px 8px rgba(82, 196, 26, 0.25);
        color: #fff;
      }
    }

    .login-tips {
      margin-top: 18px;
      padding: 12px 14px;
      border-radius: 14px;
      border: 1px solid var(--login-tip-border);
      background: var(--login-tip-bg);
      display: grid;
      gap: 8px;

      p {
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--login-muted);
        font-size: 13px;
      }

      code {
        font-family: var(--font-family-code);
        font-size: 12px;
        color: var(--login-text);
        background: rgba(255, 255, 255, 0.55);
        border: 1px solid rgba(175, 203, 232, 0.56);
        border-radius: 999px;
        padding: 2px 10px;
        transition:
          color var(--duration-base) var(--ease-out),
          background var(--duration-slower) var(--ease-in-out),
          border-color var(--duration-slower) var(--ease-in-out);
      }
    }
  }
}

:root.dark .login-shell {
  --login-bg: radial-gradient(circle at 12% 18%, rgba(80, 140, 255, 0.34), transparent 44%),
    radial-gradient(circle at 88% 12%, rgba(48, 191, 255, 0.22), transparent 34%),
    radial-gradient(circle at 80% 85%, rgba(119, 80, 255, 0.2), transparent 35%),
    linear-gradient(130deg, #060b18 0%, #0a1327 48%, #101c33 100%);
  --login-panel-bg: rgba(9, 15, 30, 0.7);
  --login-panel-border: rgba(138, 168, 230, 0.24);
  --login-text: rgba(241, 248, 255, 0.95);
  --login-muted: rgba(192, 210, 237, 0.8);
  --login-input-bg: rgba(12, 22, 44, 0.72);
  --login-input-border: rgba(127, 165, 234, 0.34);
  --login-tip-bg: rgba(12, 24, 48, 0.74);
  --login-tip-border: rgba(122, 165, 243, 0.3);
  --login-shadow: 0 30px 70px rgba(2, 8, 22, 0.66), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

:root.dark .login-shell {
  .ambient-left {
    background: radial-gradient(circle at 38% 36%, rgba(91, 163, 255, 0.4), rgba(42, 94, 198, 0.08));
  }

  .ambient-right {
    background: radial-gradient(circle at 45% 45%, rgba(61, 213, 255, 0.34), rgba(64, 102, 210, 0.08));
  }

  .ambient-bottom {
    background: radial-gradient(circle at 45% 30%, rgba(112, 136, 255, 0.35), rgba(62, 72, 130, 0.08));
  }

  .login-tools {
    :deep(.header-action) {
      background: rgba(10, 18, 36, 0.72);
      border-color: rgba(125, 162, 234, 0.36);
      color: var(--login-text);

      &:hover {
        background: rgba(16, 28, 53, 0.88);
      }
    }
  }

  .login-box {
    .login-header {
      .logo-wrap {
        background: linear-gradient(145deg, rgba(26, 44, 84, 0.92), rgba(13, 25, 52, 0.86));
        border-color: rgba(124, 161, 233, 0.34);
      }
    }

    :deep(.slider-captcha) {
      .slider-handle {
        background: linear-gradient(145deg, rgba(18, 32, 62, 0.95), rgba(12, 22, 44, 0.9));
        border-color: rgba(47, 132, 255, 0.45);
        color: rgba(100, 170, 255, 0.9);

        &:hover {
          border-color: rgba(47, 132, 255, 0.65);
          box-shadow: 0 0 0 3px rgba(47, 132, 255, 0.15), 0 2px 8px rgba(47, 132, 255, 0.25);
        }

        &:active {
          background: linear-gradient(135deg, #1f83ff 0%, #1467ff 100%);
          color: #fff;
        }
      }

      .slider-handle.success {
        background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
        border-color: rgba(82, 196, 26, 0.5);
        box-shadow: 0 2px 8px rgba(82, 196, 26, 0.3);
      }

      .slider-bg.success {
        background: rgba(82, 196, 26, 0.06);
        border-color: rgba(82, 196, 26, 0.35);
      }
    }

    .login-tips {
      code {
        color: #e8f1ff;
        background: rgba(21, 36, 67, 0.72);
        border-color: rgba(117, 157, 228, 0.34);
      }
    }
  }
}

@media (max-width: 768px) {
  .login-shell {
    .login-tools {
      top: var(--spacing-md);
      right: var(--spacing-md);
    }

    .login-box {
      width: min(420px, 100%);
      padding: 30px 22px 24px;

      .login-header {
        .title {
          font-size: 30px;
        }
      }

      .login-tips p {
        font-size: 12px;
      }
    }
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) translateX(0px);
  }

  50% {
    transform: translateY(-10px) translateX(6px);
  }
}
</style>
