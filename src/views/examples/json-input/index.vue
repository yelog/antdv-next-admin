<template>
  <div class="page-container">
    <div class="card">
      <h2>JsonInput {{ $t('common.component') || 'Component' }}</h2>
      <p class="mb-lg">
        {{ $t('exampleJsonInput.description') || 'A powerful JSON input component that supports both form and raw JSON editing modes. It can handle nested objects, arrays, and various data types.' }}
      </p>

      <a-divider orientation="left">{{ $t('common.basicUsage') || 'Basic Usage' }}</a-divider>
      
      <a-form :model="formState" layout="vertical">
        <a-form-item :label="$t('exampleJsonInput.userConfig') || 'User Configuration'">
          <JsonInput
            v-model:value="formState.userConfig"
            :label-map="{
              name: $t('user.username') || 'Username',
              email: $t('user.email') || 'Email',
              age: $t('user.age') || 'Age',
              isActive: $t('user.status') || 'Status',
              tags: $t('user.tags') || 'Tags',
              address: $t('user.address') || 'Address'
            }"
            :placeholder="$t('exampleJsonInput.clickToEdit') || 'Click to edit JSON'"
            :modal-title="$t('exampleJsonInput.editUserConfig') || 'Edit User Configuration'"
          />
        </a-form-item>

        <a-form-item :label="$t('exampleJsonInput.displayValue') || 'Display Value (using displayKey)'">
          <JsonInput
            v-model:value="formState.productInfo"
            display-key="name"
            :label-map="{
              name: $t('exampleJsonInput.productName') || 'Product Name',
              price: $t('exampleJsonInput.price') || 'Price',
              stock: $t('exampleJsonInput.stock') || 'Stock',
              description: $t('exampleJsonInput.description') || 'Description'
            }"
            :placeholder="$t('exampleJsonInput.selectProduct') || 'Select product'"
          />
        </a-form-item>

        <a-divider orientation="left">{{ $t('common.advancedUsage') || 'Advanced Usage' }}</a-divider>

        <a-form-item :label="$t('exampleJsonInput.withDisabledFields') || 'With Disabled Fields'">
          <JsonInput
            v-model:value="formState.systemConfig"
            :label-map="{
              id: 'ID',
              apiKey: $t('exampleJsonInput.apiKey') || 'API Key',
              endpoint: $t('exampleJsonInput.endpoint') || 'Endpoint',
              timeout: $t('exampleJsonInput.timeout') || 'Timeout (seconds)'
            }"
            :disabled-fields="['id', 'apiKey']"
            :placeholder="$t('exampleJsonInput.systemConfig') || 'System Configuration'"
          />
        </a-form-item>

        <a-form-item :label="$t('exampleJsonInput.nestedObject') || 'Nested Object Support'">
          <JsonInput
            v-model:value="formState.nestedData"
            :label-map="{
              user: $t('user.info') || 'User Info',
              'user.name': $t('user.name') || 'Name',
              'user.email': $t('user.email') || 'Email',
              settings: $t('user.settings') || 'Settings',
              'settings.theme': $t('user.theme') || 'Theme',
              'settings.language': $t('user.language') || 'Language'
            }"
            :placeholder="$t('exampleJsonInput.nestedData') || 'Nested Data Structure'"
          />
        </a-form-item>

        <a-form-item :label="$t('exampleJsonInput.emptyObject') || 'Empty Object (creates new)'">
          <JsonInput
            v-model:value="formState.newConfig"
            :label-map="{}"
            :placeholder="$t('exampleJsonInput.createNew') || 'Create new configuration'"
          />
        </a-form-item>
      </a-form>

      <a-divider orientation="left">{{ $t('common.preview') || 'Preview' }}</a-divider>
      
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
  padding: 24px;
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

:deep(.ant-divider) {
  margin: 24px 0;
}
</style>
