<template>
  <JsonInput
    v-model:value="innerValue"
    :display-key="displayLocale"
    :label-map="localeLabelMap"
    :placeholder="placeholder"
    :modal-title="modalTitle"
    :auto-size="autoSize"
    :allow-add="false"
    :allow-delete="false"
    :allow-sort="false"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue'
import JsonInput from '@/components/JsonInput/index.vue'
import { getLocale } from '@/locales'

interface AutoSize {
  minRows?: number
  maxRows?: number
}

const props = defineProps({
  value: {
    type: [String, Object] as PropType<string | Record<string, string>>,
    default: () => ({})
  },
  locale: {
    type: String,
    default: () => getLocale()
  },
  placeholder: {
    type: String,
    default: ''
  },
  modalTitle: {
    type: String,
    default: ''
  },
  autoSize: {
    type: [Boolean, Object] as PropType<boolean | AutoSize>,
    default: () => ({ minRows: 2, maxRows: 6 })
  },
  strictLocales: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:value', 'change'])

// Available locales configuration
const availableLocales = [
  { locale: 'zh-CN', display: '简体中文', flag: '🇨🇳' },
  { locale: 'en-US', display: 'English', flag: '🇺🇸' }
]

const displayLocale = computed(() => props.locale || getLocale())

// Generate label map for locales
const localeLabelMap = computed(() => {
  const map: Record<string, string> = {}
  availableLocales.forEach(item => {
    map[item.locale] = `${item.flag} ${item.display}`
  })
  return map
})

const innerValue = ref<Record<string, string>>({})
const valueType = ref<'string' | 'object'>('object')
const syncingFromProps = ref(false)

// Initialize default value with all locales
function getDefaultValue(): Record<string, string> {
  const defaultValue: Record<string, string> = {}
  availableLocales.forEach(item => {
    defaultValue[item.locale] = ''
  })
  return defaultValue
}

function isRecordEqual(a: Record<string, string>, b: Record<string, string>): boolean {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)

  if (aKeys.length !== bKeys.length) {
    return false
  }

  return aKeys.every(key => a[key] === b[key])
}

// Parse and normalize value
function normalizeValue(value: string | Record<string, string> | null | undefined): Record<string, string> {
  let parsed: Record<string, string> = {}
  
  if (!value) {
    parsed = getDefaultValue()
  } else if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value)
      if (typeof parsed !== 'object' || parsed === null) {
        parsed = getDefaultValue()
      }
    } catch {
      parsed = getDefaultValue()
    }
  } else if (typeof value === 'object') {
    valueType.value = 'object'
    parsed = { ...value }
  }
  
  // Fill missing locales with empty string
  availableLocales.forEach(item => {
    if (!parsed[item.locale]) {
      parsed[item.locale] = ''
    }
  })
  
  // Remove locales not in available list when strict mode is enabled
  if (props.strictLocales) {
    Object.keys(parsed).forEach(key => {
      if (!availableLocales.find(item => item.locale === key)) {
        delete parsed[key]
      }
    })
  }
  
  return parsed
}

// Watch for external value changes
watch(
  () => props.value,
  (newValue) => {
    valueType.value = typeof newValue === 'string' ? 'string' : 'object'
    const normalized = normalizeValue(newValue)

    if (isRecordEqual(normalized, innerValue.value)) {
      return
    }

    syncingFromProps.value = true
    innerValue.value = normalized
  },
  { immediate: true }
)

// Watch for internal value changes and emit
watch(
  () => innerValue.value,
  (newValue) => {
    if (syncingFromProps.value) {
      syncingFromProps.value = false
      return
    }

    if (isRecordEqual(newValue, normalizeValue(props.value))) {
      return
    }

    const returnValue = valueType.value === 'string' ? JSON.stringify(newValue) : newValue
    emit('update:value', returnValue)
    emit('change', returnValue)
  },
  { deep: true }
)
</script>
