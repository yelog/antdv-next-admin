<template>
  <span class="value-type-render">
    <!-- Text -->
    <span v-if="type === 'text'" :class="{ copyable }" @click="handleCopy">
      {{ value }}
    </span>

    <!-- Date -->
    <span v-else-if="type === 'date'">
      {{ formatDate(value, 'YYYY-MM-DD') }}
    </span>

    <!-- DateTime -->
    <span v-else-if="type === 'dateTime'">
      {{ formatDate(value, 'YYYY-MM-DD HH:mm:ss') }}
    </span>

    <!-- Tag -->
    <a-tag v-else-if="type === 'tag'" :color="getEnumConfig(value)?.color">
      {{ getEnumConfig(value)?.text || value }}
    </a-tag>

    <!-- Badge -->
    <a-badge
      v-else-if="type === 'badge'"
      :status="getEnumConfig(value)?.status as any"
      :text="getEnumConfig(value)?.text || value"
    />

    <!-- Money -->
    <span v-else-if="type === 'money'" class="money">
      ¥{{ formatMoney(value) }}
    </span>

    <!-- Percent -->
    <span v-else-if="type === 'percent'">
      {{ formatPercent(value) }}%
    </span>

    <!-- Avatar -->
    <a-avatar v-else-if="type === 'avatar'" :src="value" :size="32" />

    <!-- Image -->
    <a-image v-else-if="type === 'image'" :src="value" :width="80" />

    <!-- Link -->
    <a v-else-if="type === 'link'" :href="value" target="_blank" class="link">
      {{ value }}
    </a>

    <!-- Progress -->
    <a-progress
      v-else-if="type === 'progress'"
      :percent="value"
      :status="value >= 100 ? 'success' : 'active'"
    />

    <!-- Default -->
    <span v-else>{{ value }}</span>
  </span>
</template>

<script setup lang="ts">
import { message } from 'antdv-next'
import dayjs from 'dayjs'
import type { ValueType } from '@/types/pro'
import { copyToClipboard } from '@/utils/helpers'
import { $t } from '@/locales'

interface Props {
  value: any
  type?: ValueType
  enum?: Record<string, { text: string; status?: string; color?: string }>
  record?: any
  copyable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  copyable: false
})

const getEnumConfig = (value: any) => {
  return props.enum?.[value]
}

const formatDate = (value: any, format: string) => {
  if (!value) return '-'
  return dayjs(value).format(format)
}

const formatMoney = (value: any) => {
  if (value === null || value === undefined) return '0.00'
  return Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const formatPercent = (value: any) => {
  if (value === null || value === undefined) return '0'
  return Number(value).toFixed(2)
}

const handleCopy = async () => {
  if (props.copyable && props.value) {
    const success = await copyToClipboard(String(props.value))
    if (success) {
      message.success($t('common.copySuccess'))
    } else {
      message.error($t('common.copyFailed'))
    }
  }
}
</script>

<style scoped lang="scss">
.value-type-render {
  .copyable {
    cursor: pointer;
    &:hover {
      color: var(--color-primary);
    }
  }

  .money {
    font-weight: var(--font-weight-medium);
    color: var(--color-error);
  }

  .link {
    color: var(--color-primary);
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
