<template>
  <div class="profile-page">
    <a-row :gutter="16">
      <!-- User Info Card -->
      <a-col :xs="24" :lg="8">
        <a-card :bordered="false" class="profile-card">
          <div class="profile-header">
            <a-avatar :src="authStore.user?.avatar" :size="80" class="profile-avatar">
              {{ authStore.user?.username?.charAt(0).toUpperCase() }}
            </a-avatar>
            <h2 class="profile-name">{{ authStore.user?.realName || authStore.user?.username }}</h2>
            <p class="profile-username">@{{ authStore.user?.username }}</p>
          </div>
          
          <a-divider />
          
          <div class="profile-info">
            <div class="info-item">
              <span class="info-label">
                <UserOutlined class="info-icon" />
                {{ $t('profile.username') }}
              </span>
              <span class="info-value">{{ authStore.user?.username }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">
                <MailOutlined class="info-icon" />
                {{ $t('profile.email') }}
              </span>
              <span class="info-value">{{ authStore.user?.email }}</span>
            </div>
            
            <div class="info-item" v-if="authStore.user?.phone">
              <span class="info-label">
                <PhoneOutlined class="info-icon" />
                {{ $t('profile.phone') }}
              </span>
              <span class="info-value">{{ authStore.user?.phone }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">
                <TeamOutlined class="info-icon" />
                {{ $t('profile.role') }}
              </span>
              <span class="info-value">
                <a-tag v-for="role in authStore.user?.roles" :key="role.id" color="blue">
                  {{ role.name }}
                </a-tag>
              </span>
            </div>
            
            <div class="info-item">
              <span class="info-label">
                <ClockCircleOutlined class="info-icon" />
                {{ $t('profile.joinDate') }}
              </span>
              <span class="info-value">{{ formatDate(authStore.user?.createdAt) }}</span>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- Change Password Card -->
      <a-col :xs="24" :lg="16">
        <a-card :bordered="false" :title="$t('profile.changePassword')" class="password-card">
          <a-form
            ref="formRef"
            :model="passwordForm"
            :rules="passwordRules"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
          >
            <a-form-item :label="$t('profile.currentPassword')" name="oldPassword">
              <a-input-password
                v-model:value="passwordForm.oldPassword"
                :placeholder="$t('profile.enterCurrentPassword')"
                autocomplete="current-password"
              />
            </a-form-item>

            <a-form-item :label="$t('profile.newPassword')" name="newPassword">
              <a-input-password
                v-model:value="passwordForm.newPassword"
                :placeholder="$t('profile.enterNewPassword')"
                autocomplete="new-password"
              />
            </a-form-item>

            <a-form-item :label="$t('profile.confirmPassword')" name="confirmPassword">
              <a-input-password
                v-model:value="passwordForm.confirmPassword"
                :placeholder="$t('profile.enterConfirmPassword')"
                autocomplete="new-password"
              />
            </a-form-item>

            <a-form-item :wrapper-col="{ offset: 6, span: 18 }">
              <a-space>
                <a-button type="primary" :loading="loading" @click="handleChangePassword">
                  {{ $t('common.submit') }}
                </a-button>
                <a-button @click="handleReset">
                  {{ $t('common.reset') }}
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>

          <a-alert
            :message="$t('profile.passwordTip')"
            type="info"
            show-icon
            style="margin-top: 16px"
          />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  ClockCircleOutlined
} from '@antdv-next/icons'
import { message } from 'antdv-next'
import type { FormInstance } from 'antdv-next'
import { useAuthStore } from '@/stores/auth'
import { changePassword, type ChangePasswordParams } from '@/api/user'
import { $t } from '@/locales'

const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (_rule: any, value: string) => {
  if (value && value !== passwordForm.newPassword) {
    return Promise.reject($t('profile.passwordMismatch'))
  }
  return Promise.resolve()
}

const passwordRules = {
  oldPassword: [
    { required: true, message: $t('profile.enterCurrentPassword'), trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: $t('profile.enterNewPassword'), trigger: 'blur' },
    { min: 6, message: $t('profile.passwordMinLength'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: $t('profile.enterConfirmPassword'), trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const handleChangePassword = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    const params: ChangePasswordParams = {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    }

    const response = await changePassword(params)
    
    if (response.success) {
      message.success(response.message || $t('profile.passwordChangeSuccess'))
      handleReset()
    } else {
      message.error(response.message || $t('profile.passwordChangeFailed'))
    }
  } catch (error: any) {
    console.error('Change password error:', error)
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  formRef.value?.clearValidate()
}
</script>

<style scoped lang="scss">
.profile-page {
  padding: 16px;

  .profile-card {
    .profile-header {
      text-align: center;
      padding: 16px 0;

      .profile-avatar {
        margin-bottom: 16px;
        box-shadow: var(--shadow-2);
      }

      .profile-name {
        margin: 0 0 8px;
        font-size: 20px;
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
      }

      .profile-username {
        margin: 0;
        color: var(--color-text-tertiary);
        font-size: 14px;
      }
    }

    .profile-info {
      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--color-border-secondary);

        &:last-child {
          border-bottom: none;
        }

        .info-label {
          display: flex;
          align-items: center;
          color: var(--color-text-secondary);
          font-size: 14px;

          .info-icon {
            margin-right: 8px;
            font-size: 16px;
            color: var(--color-primary);
          }
        }

        .info-value {
          color: var(--color-text-primary);
          font-size: 14px;
          text-align: right;
        }
      }
    }
  }

  .password-card {
    height: 100%;

    :deep(.ant-card-head-title) {
      font-weight: var(--font-weight-semibold);
    }
  }

  // Mobile responsive
  @media (max-width: 992px) {
    .profile-card {
      margin-bottom: 16px;
    }
  }
}
</style>
