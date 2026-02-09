<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="/logo.svg" alt="Logo" class="logo" />
        <h1 class="title">Antdv Next Admin</h1>
        <p class="subtitle">{{ $t('login.title') }}</p>
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
          >
            {{ $t('login.login') }}
          </a-button>
        </a-form-item>
      </a-form>

      <div class="login-tips">
        <p>{{ $t('login.username') }}: admin / user</p>
        <p>{{ $t('login.password') }}: 123456</p>
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
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const loading = ref(false)
const formState = reactive({
  username: 'admin',
  password: '123456',
  remember: false
})

const rules = {
  username: [{ required: true, message: t('login.usernameRequired') }],
  password: [{ required: true, message: t('login.passwordRequired') }]
}

const handleSubmit = async () => {
  loading.value = true
  try {
    await authStore.login(formState.username, formState.password)
    message.success(t('login.loginSuccess'))
    router.push('/')
  } catch (error: any) {
    message.error(error.message || t('login.loginFailed'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-primary-1) 0%, var(--color-primary-3) 100%);

  .login-box {
    width: 400px;
    padding: var(--spacing-3xl) var(--spacing-2xl);
    background: var(--color-bg-container);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-modal);

    .login-header {
      text-align: center;
      margin-bottom: var(--spacing-2xl);

      .logo {
        width: 64px;
        height: 64px;
        margin-bottom: var(--spacing-md);
      }

      .title {
        font-size: var(--font-size-3xl);
        font-weight: var(--font-weight-bold);
        margin-bottom: var(--spacing-xs);
        color: var(--color-text-primary);
      }

      .subtitle {
        font-size: var(--font-size-base);
        color: var(--color-text-secondary);
      }
    }

    .login-form {
      margin-top: var(--spacing-xl);
    }

    .login-tips {
      margin-top: var(--spacing-lg);
      padding: var(--spacing-md);
      background: var(--color-info-bg);
      border-radius: var(--radius-base);
      text-align: center;

      p {
        margin: var(--spacing-xs) 0;
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
      }
    }
  }
}
</style>
