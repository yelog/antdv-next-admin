<template>
  <div class="page-container">
    <div class="card">
      <h2>I18nInput {{ $t('common.component') }}</h2>
      <p class="mb-lg">
        {{ $t('examples.i18nInput.description') }}
      </p>

      <a-divider orientation="left">{{ $t('common.basicUsage') }}</a-divider>
      
      <a-form :model="formState" layout="vertical">
        <a-form-item :label="$t('examples.i18nInput.productName')">
          <I18nInput
            v-model:value="formState.productName"
            :placeholder="$t('examples.i18nInput.clickToEdit')"
            :modal-title="$t('examples.i18nInput.editProductName')"
          />
        </a-form-item>

        <a-form-item :label="$t('examples.i18nInput.productDescription')">
          <I18nInput
            v-model:value="formState.productDescription"
            :placeholder="$t('examples.i18nInput.clickToEdit')"
            :modal-title="$t('examples.i18nInput.editProductDesc')"
          />
        </a-form-item>

        <a-divider orientation="left">{{ $t('common.advancedUsage') }}</a-divider>

        <a-form-item :label="$t('examples.i18nInput.stringFormat')">
          <div class="hint">{{ $t('examples.i18nInput.stringFormatHint') }}</div>
          <I18nInput
            v-model:value="formState.stringFormat"
            :placeholder="$t('examples.i18nInput.clickToEdit')"
          />
        </a-form-item>

        <a-form-item :label="$t('examples.i18nInput.currentLocale')">
          <div class="hint">{{ $t('examples.i18nInput.currentLocaleHint') }}</div>
          <I18nInput
            v-model:value="formState.withLocale"
            locale="ja-JP"
            :placeholder="$t('examples.i18nInput.clickToEdit')"
          />
        </a-form-item>

        <a-form-item :label="$t('examples.i18nInput.emptyValue')">
          <I18nInput
            v-model:value="formState.emptyValue"
            :placeholder="$t('examples.i18nInput.clickToEdit')"
          />
        </a-form-item>
      </a-form>

      <a-divider orientation="left">{{ $t('common.preview') }}</a-divider>
      
      <a-card :title="$t('examples.i18nInput.dataPreview')" size="small">
        <pre class="json-preview">{{ JSON.stringify(formState, null, 2) }}</pre>
      </a-card>

      <a-divider orientation="left">{{ $t('examples.i18nInput.valueType') }}</a-divider>

      <a-space>
        <a-button @click="toggleValueType">
          {{ showAsString ? $t('examples.i18nInput.showAsObject') : $t('examples.i18nInput.showAsString') }}
        </a-button>
      </a-space>

      <div v-if="showAsString" class="value-preview">
        <h4>{{ $t('examples.i18nInput.stringValue') }}</h4>
        <pre>{{ JSON.stringify(formState.productName) }}</pre>
      </div>
      <div v-else class="value-preview">
        <h4>{{ $t('examples.i18nInput.objectValue') }}</h4>
        <pre>{{ formState.productName }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import I18nInput from '@/components/I18nInput/index.vue'

const formState = reactive({
  productName: {
    'zh-CN': '苹果手机',
    'en-US': 'iPhone',
    'ja-JP': 'iPhone',
    'ko-KR': '아이폰'
  },
  productDescription: {
    'zh-CN': '这是最新款的智能手机，拥有强大的性能和优秀的拍照功能。',
    'en-US': 'This is the latest smartphone with powerful performance and excellent camera capabilities.',
    'ja-JP': 'これは最新のスマートフォンで、強力な性能と優れたカメラ機能を備えています。',
    'ko-KR': '강력한 성능과 뛰어난 카메라 기능을 갖춘 최신 스마트폰입니다.'
  },
  stringFormat: '{"zh-CN": "字符串格式", "en-US": "String Format", "ja-JP": "文字列形式", "ko-KR": "문자열 형식"}',
  withLocale: {
    'zh-CN': '指定显示日语',
    'en-US': 'Show Japanese value',
    'ja-JP': '日本語表示を指定',
    'ko-KR': '일본어 표시 지정'
  },
  emptyValue: null as Record<string, string> | string | null
})

const showAsString = ref(false)

function toggleValueType() {
  showAsString.value = !showAsString.value
}
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

.hint {
  color: var(--color-text-secondary);
  font-size: 12px;
  margin-bottom: 8px;
}

.json-preview {
  background: var(--color-bg-layout);
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 12px;
}

.value-preview {
  margin-top: 16px;
  padding: 16px;
  background: var(--color-bg-layout);
  border-radius: 4px;

  h4 {
    margin-bottom: 8px;
    color: var(--color-text-secondary);
  }

  pre {
    font-family: monospace;
    font-size: 12px;
    overflow-x: auto;
  }
}

:deep(.ant-divider) {
  margin: 24px 0;
}
</style>
