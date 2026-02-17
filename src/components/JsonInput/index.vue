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
      class="json-input-modal"
    >
      <a-alert
        v-if="errorMessage"
        :message="errorMessage"
        type="error"
        show-icon
        class="json-error-alert"
      />
      
      <div v-if="!useRawEdit" class="form-edit-container">
        <draggable
          v-model="fieldOrder"
          item-key="key"
          handle=".drag-handle"
          class="field-list"
          @end="onDragEnd"
        >
          <template #item="{ element: key, index }">
            <div
              v-if="editData[key] !== undefined"
              class="field-card"
              :class="{ 'is-dragging': draggingIndex === index }"
              @mouseenter="hoveredField = key"
              @mouseleave="hoveredField = null"
            >
              <div class="field-header">
                <div class="drag-handle" v-if="allowSort">
                  <HolderOutlined />
                </div>
                <div class="field-info">
                  <span class="field-label">{{ getFieldLabel(key) }}</span>
                  <span class="field-key">{{ key }}</span>
                </div>
                <div class="field-actions" :class="{ 'is-visible': hoveredField === key }">
                  <a-tooltip :title="t('common.moveUp')" v-if="allowSort && index > 0">
                    <a-button type="text" size="small" @click="moveField(index, 'up')">
                      <ArrowUpOutlined />
                    </a-button>
                  </a-tooltip>
                  <a-tooltip :title="t('common.moveDown')" v-if="allowSort && index < fieldOrder.length - 1">
                    <a-button type="text" size="small" @click="moveField(index, 'down')">
                      <ArrowDownOutlined />
                    </a-button>
                  </a-tooltip>
                  <a-tooltip :title="t('common.delete')" v-if="allowDelete && !isFieldDisabled(key)">
                    <a-button type="text" size="small" danger @click="removeField(key)">
                      <DeleteOutlined />
                    </a-button>
                  </a-tooltip>
                </div>
              </div>
              
              <div class="field-body">
                <!-- Object Type -->
                <template v-if="getFieldType(key) === 'object'">
                  <JsonInput
                    v-model:value="editData[key]"
                    :label-map="getNestedLabelMap(key)"
                    :disabled-fields="disabledFields"
                    :readonly-fields="readonlyFields"
                    :placeholder="`${getFieldLabel(key)}...`"
                  />
                </template>
                
                <!-- Tags Type -->
                <template v-else-if="getFieldType(key) === 'tags' || key === 'tags'">
                  <a-select
                    v-model:value="editData[key]"
                    mode="tags"
                    style="width: 100%"
                    :placeholder="t('common.inputTags')"
                    :max-tag-count="3"
                  />
                </template>
                
                <!-- Boolean/Status Type -->
                <template v-else-if="getFieldType(key) === 'boolean' || key === 'isActive' || key === 'status'">
                  <div class="switch-with-label">
                    <a-switch v-model:checked="editData[key]" />
                    <span class="switch-label">
                      {{ editData[key] ? (fieldConfig[key]?.activeLabel || t('common.enabled')) : (fieldConfig[key]?.inactiveLabel || t('common.disabled')) }}
                    </span>
                  </div>
                </template>
                
                <!-- Number Type -->
                <template v-else-if="getFieldType(key) === 'number' || key === 'age' || key === 'price' || key === 'stock'">
                  <a-input-number
                    v-model:value="editData[key]"
                    style="width: 100%"
                    :placeholder="getFieldLabel(key)"
                    :min="fieldConfig[key]?.min"
                    :max="fieldConfig[key]?.max"
                  />
                </template>
                
                <!-- Array Type -->
                <template v-else-if="getFieldType(key) === 'array'">
                  <a-textarea
                    v-model:value="editData[key]"
                    placeholder="JSON Array: [1, 2, 3] or ['a', 'b']"
                    :auto-size="{ minRows: 2, maxRows: 4 }"
                    @blur="validateArray(key)"
                  />
                </template>
                
                <!-- String Type (Long Text) -->
                <template v-else-if="key === 'address' || key === 'description' || key === 'bio'">
                  <a-textarea
                    v-model:value="editData[key]"
                    :placeholder="getFieldLabel(key)"
                    :auto-size="{ minRows: 3, maxRows: 6 }"
                    show-count
                    :maxlength="fieldConfig[key]?.maxLength || 500"
                  />
                </template>
                
                <!-- Default String -->
                <template v-else>
                  <a-input
                    v-model:value="editData[key]"
                    :placeholder="getFieldLabel(key)"
                    allow-clear
                  />
                </template>
              </div>
            </div>
          </template>
        </draggable>
        
        <!-- Add Field Button -->
        <div v-if="allowAdd" class="add-field-section">
          <a-button
            v-if="!showAddFieldDialog"
            type="dashed"
            block
            class="add-field-btn"
            @click="showAddFieldDialog = true"
          >
            <PlusOutlined />
            {{ t('common.addField') }}
          </a-button>
        </div>
      </div>
      
      <!-- Raw Edit Mode -->
      <template v-else>
        <a-form-item :label="t('common.jsonContent')">
          <a-textarea
            v-model:value="rawJsonText"
            :auto-size="{ minRows: 10, maxRows: 20 }"
            :placeholder="t('common.jsonPlaceholder')"
            class="raw-editor"
          />
        </a-form-item>
      </template>
      
      <template #footer>
        <a-space>
          <a-button @click="toggleEditMode">
            {{ useRawEdit ? t('common.formEdit') : t('common.rawEdit') }}
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
    
    <!-- Add Field Dialog -->
    <a-modal
      v-model:open="showAddFieldDialog"
      :title="t('common.addField')"
      :ok-text="t('common.confirm')"
      :cancel-text="t('common.cancel')"
      @ok="handleAddField"
      @cancel="showAddFieldDialog = false"
      width="400px"
    >
      <a-form layout="vertical">
        <a-form-item :label="t('common.fieldName')" required>
          <a-input
            v-model:value="newField.name"
            :placeholder="t('common.inputFieldName')"
            @pressEnter="handleAddField"
          />
        </a-form-item>
        <a-form-item :label="t('common.fieldType')">
          <a-select v-model:value="newField.type" :placeholder="t('common.selectFieldType')">
            <a-select-option value="string">{{ t('common.typeString') }}</a-select-option>
            <a-select-option value="number">{{ t('common.typeNumber') }}</a-select-option>
            <a-select-option value="boolean">{{ t('common.typeBoolean') }}</a-select-option>
            <a-select-option value="tags">{{ t('common.typeTags') }}</a-select-option>
            <a-select-option value="array">{{ t('common.typeArray') }}</a-select-option>
            <a-select-option value="object">{{ t('common.typeObject') }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue'
import { 
  EditOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  HolderOutlined
} from '@antdv-next/icons'
import { useI18n } from 'vue-i18n'
import { message } from 'antdv-next'
import draggable from 'vuedraggable'

defineOptions({
  name: 'JsonInput'
})

const { t } = useI18n()

interface LabelMap {
  [key: string]: string
}

interface FieldConfig {
  type?: 'string' | 'number' | 'boolean' | 'tags' | 'array' | 'object'
  label?: string
  min?: number
  max?: number
  maxLength?: number
  activeLabel?: string
  inactiveLabel?: string
}

interface FieldConfigMap {
  [key: string]: FieldConfig
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
  fieldConfig: {
    type: Object as PropType<FieldConfigMap>,
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
  allowAdd: {
    type: Boolean,
    default: true
  },
  allowDelete: {
    type: Boolean,
    default: true
  },
  allowSort: {
    type: Boolean,
    default: true
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

// State
const modalVisible = ref(false)
const editData = ref<Record<string, any>>({})
const fieldOrder = ref<string[]>([])
const errorMessage = ref('')
const useRawEdit = ref(false)
const rawJsonText = ref('')
const hoveredField = ref<string | null>(null)
const draggingIndex = ref<number>(-1)
const showAddFieldDialog = ref(false)
const newField = ref({ name: '', type: 'string' })

const okText = computed(() => t('common.ok') || 'OK')
const cancelText = computed(() => t('common.cancel') || 'Cancel')

const displayValue = computed(() => {
  if (!props.value) return ''
  if (props.displayKey && props.value[props.displayKey] !== undefined) {
    return String(props.value[props.displayKey])
  }
  return JSON.stringify(props.value).slice(0, 50) + '...'
})

// Helper functions
function getFieldLabel(key: string): string {
  return props.fieldConfig[key]?.label || props.labelMap[key] || key
}

function getFieldType(key: string): string {
  const value = editData.value[key]
  const configType = props.fieldConfig[key]?.type
  
  if (configType) return configType
  
  // Auto detect type
  if (value === null || value === undefined) return 'string'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  if (Array.isArray(value)) {
    // Check if it's a tags array (array of strings)
    if (value.length > 0 && typeof value[0] === 'string') return 'tags'
    return 'array'
  }
  if (typeof value === 'object') return 'object'
  return 'string'
}

function isFieldDisabled(key: string): boolean {
  return props.disabledFields.includes(key)
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

// Modal functions
function showModal() {
  modalVisible.value = true
  errorMessage.value = ''
  useRawEdit.value = false
  if (props.value) {
    editData.value = JSON.parse(JSON.stringify(props.value))
    fieldOrder.value = Object.keys(editData.value)
    rawJsonText.value = JSON.stringify(props.value, null, 2)
  } else {
    editData.value = {}
    fieldOrder.value = []
    rawJsonText.value = '{}'
  }
}

function handleCancel() {
  modalVisible.value = false
  showAddFieldDialog.value = false
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
    fieldOrder.value.forEach(key => {
      if (key in editData.value) {
        const type = getFieldType(key)
        if (type === 'array' && typeof editData.value[key] === 'string') {
          try {
            result[key] = JSON.parse(editData.value[key])
          } catch {
            result[key] = editData.value[key]
          }
        } else {
          result[key] = editData.value[key]
        }
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
      fieldOrder.value = Object.keys(editData.value)
      errorMessage.value = ''
    } catch (e) {
      errorMessage.value = t('common.jsonParseError') || 'Invalid JSON format'
      return
    }
  }
  useRawEdit.value = !useRawEdit.value
}

// Field operations
function handleAddField() {
  if (!newField.value.name.trim()) {
    message.warning(t('common.pleaseInputFieldName'))
    return
  }
  if (editData.value[newField.value.name]) {
    message.warning(t('common.fieldExists'))
    return
  }
  
  // Initialize with default value based on type
  let defaultValue: any = ''
  switch (newField.value.type) {
    case 'boolean':
      defaultValue = false
      break
    case 'number':
      defaultValue = 0
      break
    case 'tags':
    case 'array':
      defaultValue = []
      break
    case 'object':
      defaultValue = {}
      break
    default:
      defaultValue = ''
  }
  
  editData.value[newField.value.name] = defaultValue
  fieldOrder.value.push(newField.value.name)
  
  // Reset
  newField.value = { name: '', type: 'string' }
  showAddFieldDialog.value = false
  
  message.success(t('common.addSuccess'))
}

function removeField(key: string) {
  delete editData.value[key]
  fieldOrder.value = fieldOrder.value.filter(k => k !== key)
}

function moveField(index: number, direction: 'up' | 'down') {
  if (direction === 'up' && index > 0) {
    const temp = fieldOrder.value[index]
    fieldOrder.value[index] = fieldOrder.value[index - 1]
    fieldOrder.value[index - 1] = temp
  } else if (direction === 'down' && index < fieldOrder.value.length - 1) {
    const temp = fieldOrder.value[index]
    fieldOrder.value[index] = fieldOrder.value[index + 1]
    fieldOrder.value[index + 1] = temp
  }
}

function onDragEnd() {
  draggingIndex.value = -1
}

function validateArray(key: string) {
  const value = editData.value[key]
  if (typeof value === 'string') {
    try {
      JSON.parse(value)
    } catch {
      errorMessage.value = `${key}: ${t('common.invalidArray')}`
    }
  }
}

// Watchers
watch(() => props.value, (newVal) => {
  if (newVal && !modalVisible.value) {
    editData.value = JSON.parse(JSON.stringify(newVal))
    fieldOrder.value = Object.keys(editData.value)
  }
}, { deep: true })
</script>

<style scoped lang="scss">
.json-input-wrapper {
  width: 100%;
}

.json-input-modal {
  :deep(.ant-modal-body) {
    max-height: 60vh;
    overflow-y: auto;
    padding: 20px 24px;
  }
}

.json-error-alert {
  margin-bottom: 16px;
}

.form-edit-container {
  .field-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .field-card {
    background: var(--color-bg-container);
    border: 1px solid var(--color-border-secondary);
    border-radius: 8px;
    padding: 16px;
    transition: all 0.2s ease;
    
    &:hover {
      border-color: var(--color-primary);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
    
    &.is-dragging {
      opacity: 0.8;
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .field-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      
      .drag-handle {
        cursor: grab;
        color: var(--color-text-tertiary);
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s;
        
        &:hover {
          color: var(--color-text-secondary);
          background: var(--color-bg-layout);
        }
        
        &:active {
          cursor: grabbing;
        }
      }
      
      .field-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        
        .field-label {
          font-weight: 500;
          font-size: 14px;
          color: var(--color-text-primary);
        }
        
        .field-key {
          font-size: 12px;
          color: var(--color-text-tertiary);
        }
      }
      
      .field-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s ease;
        
        &.is-visible {
          opacity: 1;
        }
        
        :deep(.ant-btn) {
          padding: 0 4px;
          height: 24px;
        }
      }
    }
    
    .field-body {
      padding-left: 32px;
      
      .switch-with-label {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .switch-label {
          font-size: 14px;
          color: var(--color-text-secondary);
        }
      }
    }
  }
  
  .add-field-section {
    margin-top: 20px;
    
    .add-field-btn {
      height: 44px;
      border-style: dashed;
      
      &:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
      }
    }
  }
}

.raw-editor {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
}

// Responsive
@media (max-width: 768px) {
  .form-edit-container {
    .field-card {
      .field-body {
        padding-left: 0;
      }
    }
  }
}
</style>
