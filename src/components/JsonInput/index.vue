<template>
  <div class="json-input-wrapper">
    <a-input-search
      v-model:value="displayValue"
      :placeholder="placeholder"
      readonly
      @search="showModal"
      @click="showModal"
    >
      <template #enterButton>
        <a-button type="primary">
          <EditOutlined />
        </a-button>
      </template>
    </a-input-search>
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :width="modalWidth"
      :ok-text="okText"
      :cancel-text="cancelText"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-alert
        v-if="errorMessage"
        :message="errorMessage"
        type="error"
        show-icon
        class="json-error-alert"
      />
      <a-form layout="vertical">
        <template v-if="!useRawEdit">
          <a-form-item
            v-for="(item, index) in formItems"
            :key="item.key"
            :label="item.label"
            :required="item.required"
          >
            <template v-if="item.type === 'object'">
              <JsonInput
                v-model:value="editData[item.key]"
                :label-map="getNestedLabelMap(item.key)"
                :disabled-fields="disabledFields"
                :readonly-fields="readonlyFields"
                :placeholder="`${item.label}...`"
              />
            </template>
            <template v-else-if="item.type === 'array'">
              <a-textarea
                v-model:value="editData[item.key]"
                :placeholder="`JSON Array format: [1, 2, 3] or ['a', 'b']`"
                :auto-size="autoSize"
                @blur="validateArray(item.key)"
              />
            </template>
            <template v-else-if="item.type === 'number'">
              <a-input-number
                v-model:value="editData[item.key]"
                style="width: 100%"
                :placeholder="item.label"
              />
            </template>
            <template v-else-if="item.type === 'boolean'">
              <a-switch v-model:checked="editData[item.key]" />
            </template>
            <template v-else>
              <a-textarea
                v-model:value="editData[item.key]"
                :placeholder="item.label"
                :auto-size="autoSize"
              />
            </template>
          </a-form-item>
        </template>
        <template v-else>
          <a-form-item :label="$t('common.jsonContent') || 'JSON Content'">
            <a-textarea
              v-model:value="rawJsonText"
              :auto-size="{ minRows: 10, maxRows: 20 }"
              :placeholder="$t('common.jsonPlaceholder') || 'Enter valid JSON...'"
            />
          </a-form-item>
        </template>
      </a-form>
      <template #footer>
        <a-space>
          <a-button @click="toggleEditMode">
            {{ useRawEdit ? ($t('common.formEdit') || 'Form Edit') : ($t('common.rawEdit') || 'Raw Edit') }}
          </a-button>
          <a-button @click="handleCancel">
            {{ cancelText }}
          </a-button>
          <a-button type="primary" @click="handleOk">
            {{ okText }}
          </a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue'
import { EditOutlined } from '@antdv-next/icons'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface LabelMap {
  [key: string]: string
}

interface AutoSize {
  minRows?: number
  maxRows?: number
}

const props = defineProps({
  value: {
    type: Object as PropType<Record<string, any> | null>,
    default: null
  },
  displayKey: {
    type: String,
    default: ''
  },
  labelMap: {
    type: Object as PropType<LabelMap>,
    default: () => ({})
  },
  disabledFields: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  readonlyFields: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  placeholder: {
    type: String,
    default: ''
  },
  modalTitle: {
    type: String,
    default: ''
  },
  modalWidth: {
    type: String,
    default: '600px'
  },
  autoSize: {
    type: [Boolean, Object] as PropType<boolean | AutoSize>,
    default: () => ({ minRows: 2, maxRows: 6 })
  },
  maxDepth: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits(['update:value', 'change'])

const displayValue = computed(() => {
  if (!props.value) return ''
  if (props.displayKey && props.value[props.displayKey] !== undefined) {
    return String(props.value[props.displayKey])
  }
  return JSON.stringify(props.value).slice(0, 50) + '...'
})

const modalVisible = ref(false)
const editData = ref<Record<string, any>>({})
const errorMessage = ref('')
const useRawEdit = ref(false)
const rawJsonText = ref('')

const okText = computed(() => t('common.ok') || 'OK')
const cancelText = computed(() => t('common.cancel') || 'Cancel')

const formItems = computed(() => {
  if (!editData.value) return []
  return Object.keys(editData.value).map(key => {
    const value = editData.value[key]
    const type = getValueType(value)
    return {
      key,
      label: props.labelMap[key] || key,
      type,
      required: false,
      disabled: props.disabledFields.includes(key),
      readonly: props.readonlyFields.includes(key)
    }
  })
})

function getValueType(value: any): string {
  if (value === null || value === undefined) return 'string'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  return 'string'
}

function getNestedLabelMap(parentKey: string): LabelMap {
  const nested: LabelMap = {}
  Object.keys(props.labelMap).forEach(key => {
    if (key.startsWith(`${parentKey}.`)) {
      nested[key.slice(parentKey.length + 1)] = props.labelMap[key]
    }
  })
  return nested
}

function showModal() {
  modalVisible.value = true
  errorMessage.value = ''
  useRawEdit.value = false
  if (props.value) {
    editData.value = JSON.parse(JSON.stringify(props.value))
    rawJsonText.value = JSON.stringify(props.value, null, 2)
  } else {
    editData.value = {}
    rawJsonText.value = '{}'
  }
}

function handleCancel() {
  modalVisible.value = false
  errorMessage.value = ''
}

function handleOk() {
  if (useRawEdit.value) {
    try {
      const parsed = JSON.parse(rawJsonText.value)
      emit('update:value', parsed)
      emit('change', parsed)
      modalVisible.value = false
    } catch (e) {
      errorMessage.value = t('common.jsonParseError') || 'Invalid JSON format'
    }
  } else {
    const result: Record<string, any> = {}
    formItems.value.forEach(item => {
      if (item.type === 'array' && typeof editData.value[item.key] === 'string') {
        try {
          result[item.key] = JSON.parse(editData.value[item.key])
        } catch {
          result[item.key] = editData.value[item.key]
        }
      } else {
        result[item.key] = editData.value[item.key]
      }
    })
    emit('update:value', result)
    emit('change', result)
    modalVisible.value = false
  }
}

function toggleEditMode() {
  if (!useRawEdit.value) {
    rawJsonText.value = JSON.stringify(editData.value, null, 2)
  } else {
    try {
      editData.value = JSON.parse(rawJsonText.value)
      errorMessage.value = ''
    } catch (e) {
      errorMessage.value = t('common.jsonParseError') || 'Invalid JSON format'
      return
    }
  }
  useRawEdit.value = !useRawEdit.value
}

function validateArray(key: string) {
  const value = editData.value[key]
  if (typeof value === 'string') {
    try {
      JSON.parse(value)
    } catch {
      errorMessage.value = `${key}: ${t('common.invalidArray') || 'Invalid array format'}`
    }
  }
}

watch(() => props.value, (newVal) => {
  if (newVal && !modalVisible.value) {
    editData.value = JSON.parse(JSON.stringify(newVal))
  }
}, { deep: true })
</script>

<style scoped lang="scss">
.json-input-wrapper {
  width: 100%;
}

.json-error-alert {
  margin-bottom: 16px;
}

:deep(.ant-form-item) {
  margin-bottom: 16px;
}
</style>
