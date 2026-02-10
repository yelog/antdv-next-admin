<template>
  <div class="page-container">
    <div class="card">
      <h2>{{ $t('form.title') }}</h2>
      <p class="mb-lg">{{ $t('exampleForm.description') }}</p>

      <ProForm
        ref="formRef"
        :form-items="formItems"
        :grid="{ cols: 2, gutter: 16 }"
        @finish="handleSubmit"
      >
        <template #footer>
          <a-space>
            <a-button type="primary" html-type="submit">
              {{ $t('common.submit') }}
            </a-button>
            <a-button @click="handleReset">
              {{ $t('common.reset') }}
            </a-button>
          </a-space>
        </template>
      </ProForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'antdv-next'
import { $t } from '@/locales'
import ProForm from '@/components/Pro/ProForm/index.vue'
import { commonRules } from '@/utils/formRules'
import type { ProFormItem } from '@/types/pro'

const formRef = ref()

const formItems: ProFormItem[] = [
  {
    name: 'username',
    label: $t('user.username'),
    type: 'input',
    required: true,
    rules: [
      commonRules.required(),
      commonRules.length(3, 20),
      commonRules.username()
    ],
    props: {
      placeholder: $t('login.usernamePlaceholder')
    }
  },
  {
    name: 'email',
    label: $t('user.email'),
    type: 'input',
    required: true,
    rules: [
      commonRules.required(),
      commonRules.email()
    ]
  },
  {
    name: 'password',
    label: $t('login.password'),
    type: 'password',
    required: true,
    rules: [
      commonRules.required(),
      commonRules.password()
    ]
  },
  {
    name: 'confirmPassword',
    label: $t('profile.confirmPassword'),
    type: 'password',
    required: true,
    dependencies: ['password'],
    rules: [
      commonRules.required(),
      ({ getFieldValue }: { getFieldValue: (field: string) => any }) => commonRules.confirmPassword(getFieldValue)
    ]
  },
  {
    name: 'phone',
    label: $t('user.phone'),
    type: 'input',
    rules: [commonRules.phone()]
  },
  {
    name: 'age',
    label: $t('exampleForm.age'),
    type: 'number',
    rules: [
      commonRules.range(1, 150, $t('exampleForm.ageRange'))
    ],
    props: {
      min: 1,
      max: 150
    }
  },
  {
    name: 'gender',
    label: $t('user.gender'),
    type: 'radio',
    required: true,
    options: [
      { label: $t('user.male'), value: 'male' },
      { label: $t('user.female'), value: 'female' }
    ]
  },
  {
    name: 'role',
    label: $t('user.role'),
    type: 'select',
    required: true,
    options: [
      { label: $t('exampleForm.roles.admin'), value: 'admin' },
      { label: $t('exampleForm.roles.user'), value: 'user' },
      { label: $t('exampleForm.roles.guest'), value: 'guest' }
    ]
  },
  {
    name: 'interests',
    label: $t('exampleForm.interests'),
    type: 'checkbox',
    options: [
      { label: $t('exampleForm.interestOptions.reading'), value: 'reading' },
      { label: $t('exampleForm.interestOptions.sports'), value: 'sports' },
      { label: $t('exampleForm.interestOptions.music'), value: 'music' },
      { label: $t('exampleForm.interestOptions.travel'), value: 'travel' }
    ]
  },
  {
    name: 'birthDate',
    label: $t('exampleForm.birthDate'),
    type: 'datePicker',
    props: {
      format: 'YYYY-MM-DD'
    }
  },
  {
    name: 'status',
    label: $t('common.status'),
    type: 'switch',
    valuePropName: 'checked',
    initialValue: true
  },
  {
    name: 'score',
    label: $t('exampleForm.score'),
    type: 'rate',
    initialValue: 3
  },
  {
    name: 'progress',
    label: $t('exampleForm.progress'),
    type: 'slider',
    initialValue: 50,
    props: {
      min: 0,
      max: 100
    }
  },
  {
    name: 'bio',
    label: $t('user.bio'),
    type: 'textarea',
    colSpan: 2,
    props: {
      rows: 4,
      maxLength: 500,
      showCount: true,
      placeholder: $t('exampleForm.bioPlaceholder')
    }
  }
]

const handleSubmit = (values: any) => {
  console.log('Form values:', values)
  message.success($t('exampleForm.submitSuccess'))
}

const handleReset = () => {
  formRef.value?.resetFields()
}
</script>

<style scoped lang="scss">
.mb-lg {
  margin-bottom: var(--spacing-lg);
}
</style>
