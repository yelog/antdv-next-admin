<template>
  <a-button @click="open = true"> <FilterOutlined /> {{ t('log.intent.title') }} </a-button>
  <a-modal :open="open" :title="t('log.intent.title')" @cancel="close">
    <div class="filter-assistant">
      <label for="operation-filter-prompt">{{ t('log.intent.prompt') }}</label>
      <a-textarea
        id="operation-filter-prompt"
        v-model:value="prompt"
        :maxlength="LOG_FILTER_PROMPT_LIMIT"
        :rows="2"
        :placeholder="t('log.intent.example')"
        aria-describedby="operation-filter-hint"
      />
      <div class="prompt-hint">
        <span id="operation-filter-hint">{{ t('log.intent.hint') }}</span>
        <a-button type="link" size="small" @click="prompt = t('log.intent.example')">
          {{ t('log.intent.useExample') }}
        </a-button>
      </div>
      <div aria-live="polite">
        <a-alert v-if="failed" type="error" show-icon :message="t('log.intent.unavailable')" />
        <a-alert
          v-else-if="result && !result.filters"
          type="info"
          show-icon
          :message="t('log.intent.clarify')"
        />
        <template v-if="result">
          <p class="result-source">
            {{ t(result.source === 'rules' ? 'log.intent.rulesSource' : 'log.intent.modelSource') }}
          </p>
          <template v-if="result.filters">
            <dl class="filter-preview">
              <div v-for="condition in conditions" :key="condition.field">
                <dt>{{ t(condition.label) }}</dt>
                <dd>{{ t(condition.value) }}</dd>
              </div>
            </dl>
            <p>{{ t('log.intent.applyHint') }}</p>
          </template>
        </template>
      </div>
    </div>
    <template #footer>
      <a-button @click="close">{{ t('common.cancel') }}</a-button>
      <a-button
        v-if="!result?.filters"
        type="primary"
        :loading="loading"
        :disabled="!prompt.trim()"
        @click="preview"
      >
        {{ t('log.intent.preview') }}
      </a-button>
      <a-button v-else type="primary" @click="apply">{{ t('log.intent.apply') }}</a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { FilterOutlined } from '@antdv-next/icons';
import { computed, onBeforeUnmount, onDeactivated, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { proposeOperationLogFilters } from '@/api/log';
import {
  LOG_FILTER_PROMPT_LIMIT,
  logFilterLabelKey,
  type LogFilterIntent,
  type LogFilterResult,
} from '@/utils/logFilterIntent';

const emit = defineEmits<{ apply: [filters: LogFilterIntent] }>();
const { t, locale } = useI18n();
const open = ref(false);
const prompt = ref('');
const result = ref<LogFilterResult | null>(null);
const failed = ref(false);
const loading = ref(false);
let activeRequest: AbortController | undefined;

const fieldLabels = {
  module: 'log.operationModule',
  action: 'log.operationType',
  status: 'common.status',
} as const;
const conditions = computed(() => {
  const filters = result.value?.filters;
  return (Object.keys(fieldLabels) as Array<keyof LogFilterIntent>).flatMap((field) => {
    const value = filters?.[field];
    return value
      ? [{ field, label: fieldLabels[field], value: logFilterLabelKey(field, value) }]
      : [];
  });
});

function discardPreview(): void {
  activeRequest?.abort();
  activeRequest = undefined;
  loading.value = false;
  failed.value = false;
  result.value = null;
}

function close(): void {
  discardPreview();
  open.value = false;
  prompt.value = '';
}

async function preview(): Promise<void> {
  if (loading.value || !prompt.value.trim()) return;
  const request = new AbortController();
  activeRequest = request;
  loading.value = true;
  failed.value = false;
  try {
    const next = await proposeOperationLogFilters(
      prompt.value.trim(),
      locale.value,
      request.signal,
    );
    if (!request.signal.aborted) result.value = next;
  } catch {
    if (!request.signal.aborted) failed.value = true;
  } finally {
    if (activeRequest === request) {
      activeRequest = undefined;
      loading.value = false;
    }
  }
}

function apply(): void {
  if (!result.value?.filters) return;
  const { module, action, status } = result.value.filters;
  emit('apply', { module, action, status });
  close();
}

watch([prompt, locale], discardPreview, { flush: 'sync' });
onDeactivated(close);
onBeforeUnmount(discardPreview);
</script>

<style scoped>
.filter-assistant {
  display: grid;
  gap: 8px;
}

.prompt-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px;
  color: var(--color-text-secondary);
}

.result-source {
  margin: 8px 0;
  color: var(--color-text-secondary);
}

.filter-preview {
  margin: 0 0 8px;
}

.filter-preview div {
  display: flex;
  gap: 16px;
}

.filter-preview dt {
  min-width: 6em;
  color: var(--color-text-secondary);
}

.filter-preview dd {
  margin: 0;
}
</style>
