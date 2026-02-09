<template>
  <div class="page-container">
    <div class="card">
      <h2>{{ $t('form.title') }}</h2>
      <p class="mb-lg">ProForm 高级表单示例 - 展示各种表单控件</p>

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
import { message } from 'ant-design-vue'
import ProForm from '@/components/Pro/ProForm/index.vue'
import { commonRules } from '@/utils/formRules'
import type { ProFormItem } from '@/types/pro'

const formRef = ref()

const formItems: ProFormItem[] = [
  {
    name: 'username',
    label: '用户名',
    type: 'input',
    required: true,
    rules: [
      commonRules.required(),
      commonRules.length(3, 20),
      commonRules.username()
    ],
    props: {
      placeholder: '请输入用户名'
    }
  },
  {
    name: 'email',
    label: '邮箱',
    type: 'input',
    required: true,
    rules: [
      commonRules.required(),
      commonRules.email()
    ]
  },
  {
    name: 'password',
    label: '密码',
    type: 'password',
    required: true,
    rules: [
      commonRules.required(),
      commonRules.password()
    ]
  },
  {
    name: 'confirmPassword',
    label: '确认密码',
    type: 'password',
    required: true,
    dependencies: ['password'],
    rules: [
      commonRules.required(),
      ({ getFieldValue }) => commonRules.confirmPassword(getFieldValue)
    ]
  },
  {
    name: 'phone',
    label: '手机号',
    type: 'input',
    rules: [commonRules.phone()]
  },
  {
    name: 'age',
    label: '年龄',
    type: 'number',
    rules: [
      commonRules.range(1, 150, '年龄必须在1-150之间')
    ],
    props: {
      min: 1,
      max: 150
    }
  },
  {
    name: 'gender',
    label: '性别',
    type: 'radio',
    required: true,
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ]
  },
  {
    name: 'role',
    label: '角色',
    type: 'select',
    required: true,
    options: [
      { label: '管理员', value: 'admin' },
      { label: '普通用户', value: 'user' },
      { label: '访客', value: 'guest' }
    ]
  },
  {
    name: 'interests',
    label: '兴趣爱好',
    type: 'checkbox',
    options: [
      { label: '阅读', value: 'reading' },
      { label: '运动', value: 'sports' },
      { label: '音乐', value: 'music' },
      { label: '旅游', value: 'travel' }
    ]
  },
  {
    name: 'birthDate',
    label: '出生日期',
    type: 'datePicker',
    props: {
      format: 'YYYY-MM-DD'
    }
  },
  {
    name: 'status',
    label: '状态',
    type: 'switch',
    valuePropName: 'checked',
    initialValue: true
  },
  {
    name: 'score',
    label: '评分',
    type: 'rate',
    initialValue: 3
  },
  {
    name: 'progress',
    label: '进度',
    type: 'slider',
    initialValue: 50,
    props: {
      min: 0,
      max: 100
    }
  },
  {
    name: 'bio',
    label: '个人简介',
    type: 'textarea',
    colSpan: 2,
    props: {
      rows: 4,
      maxLength: 500,
      showCount: true,
      placeholder: '请输入个人简介'
    }
  }
]

const handleSubmit = (values: any) => {
  console.log('Form values:', values)
  message.success('提交成功！')
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
