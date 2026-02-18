<template>
  <div class="page-container">
    <div class="card">
      <h2>JsonInput {{ $t('common.component') || 'Component' }}</h2>
      <p class="mb-lg">
        {{ $t('examples.jsonInput.description') }}
      </p>

      <a-divider orientation="left">{{ $t('common.basicUsage') }}</a-divider>

      <a-form :model="formState" layout="vertical">
        <a-form-item :label="$t('examples.jsonInput.userConfig')">
          <JsonInput
            v-model:value="formState.userConfig"
            :placeholder="$t('examples.jsonInput.clickToEdit')"
            :modal-title="$t('examples.jsonInput.editUserConfig')"
          />
        </a-form-item>

        <a-form-item :label="$t('examples.jsonInput.displayValue')">
          <JsonInput
            v-model:value="formState.productInfo"
            display-key="name"
            :placeholder="$t('examples.jsonInput.selectProduct')"
          />
        </a-form-item>

        <a-divider orientation="left">{{ $t('common.advancedUsage') }}</a-divider>

        <a-form-item :label="$t('examples.jsonInput.withI18nKeys')">
          <div class="hint">{{ $t('examples.jsonInput.i18nKeysHint') }}</div>
          <JsonInput
            v-model:value="formState.i18nConfig"
            :label-map="{
              name: $t('user.username'),
              email: $t('user.email'),
              age: $t('user.age'),
              department: $t('user.department'),
              position: $t('user.position')
            }"
            :placeholder="$t('examples.jsonInput.clickToEdit')"
          />
        </a-form-item>

        <a-form-item :label="$t('examples.jsonInput.withDisabledFields')">
          <JsonInput
            v-model:value="formState.systemConfig"
            :disabled-fields="['id', 'apiKey']"
            :placeholder="$t('examples.jsonInput.systemConfig')"
          />
        </a-form-item>

        <a-form-item :label="$t('examples.jsonInput.nestedObject')">
          <JsonInput
            v-model:value="formState.nestedData"
            :placeholder="$t('examples.jsonInput.nestedData')"
          />
        </a-form-item>

        <a-form-item :label="$t('examples.jsonInput.emptyObject')">
          <JsonInput
            v-model:value="formState.newConfig"
            :placeholder="$t('examples.jsonInput.createNew')"
          />
        </a-form-item>
      </a-form>

      <a-divider orientation="left">{{ $t('common.preview') }}</a-divider>
      
      <a-card title="Data Preview" size="small">
        <pre class="json-preview">{{ JSON.stringify(formState, null, 2) }}</pre>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import JsonInput from '@/components/JsonInput/index.vue'

const formState = reactive({
  userConfig: {
    name: 'John Doe',
    email: 'john@example.com',
    age: 28,
    isActive: true,
    tags: ['developer', 'admin'],
    address: '123 Main St, City'
  },
  productInfo: {
    name: 'MacBook Pro',
    price: 1999,
    stock: 50,
    description: 'High-performance laptop for professionals'
  },
  i18nConfig: {
    name: '张三',
    email: 'zhangsan@example.com',
    age: 30,
    department: '技术部',
    position: '高级工程师'
  },
  systemConfig: {
    id: 'sys-001',
    apiKey: 'sk-1234567890abcdef',
    endpoint: 'https://api.example.com',
    timeout: 30
  },
  nestedData: {
    user: {
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    settings: {
      theme: 'dark',
      language: 'zh-CN'
    }
  },
  newConfig: null as Record<string, any> | null
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 0;
}

.card {
  background: var(--color-bg-container);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.mb-lg {
  margin-bottom: 24px;
}

.json-preview {
  background: var(--color-bg-layout);
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 12px;
}

.hint {
  color: var(--color-text-secondary);
  font-size: 12px;
  margin-bottom: 8px;
}

:deep(.ant-divider) {
  margin: 24px 0;
}
</style>
