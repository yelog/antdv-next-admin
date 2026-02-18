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
              class="field-row"
              :class="{ 'is-dragging': draggingIndex === index, 'is-hovered': hoveredField === key }"
              @mouseenter="hoveredField = key"
              @mouseleave="hoveredField = null"
            >
              <!-- Drag Handle -->
              <div class="drag-handle" v-if="allowSort">
                <HolderOutlined />
              </div>
              
              <!-- Left: Label & Key -->
              <div class="field-label-section">
                <div class="field-label">{{ getFieldLabel(key) }}</div>
                <div v-if="hasLabelMap(key)" class="field-key">{{ key }}</div>
              </div>
              
              <!-- Right: Input -->
              <div class="field-input-section">
                <!-- Object Type -->
                <template v-if="getFieldType(key) === 'object'">
                  <JsonInput
                    v-model:value="editData[key]"
                    :label-map="getNestedLabelMap(key)"
                    :disabled-fields="disabledFields"
                    :readonly-fields="readonlyFields"
                    :allow-add="!isFieldReadonly(key)"
                    :allow-delete="!isFieldReadonly(key)"
                    :allow-sort="!isFieldReadonly(key)"
                    :placeholder="`${getFieldLabel(key)}...`"
                  />
                </template>
                
                <!-- Tags Type -->
                <template v-else-if="getFieldType(key) === 'tags' || key === 'tags'">
                  <a-select
                    v-model:value="editData[key]"
                    mode="tags"
                    size="middle"
                    style="width: 100%"
                    :placeholder="输入标签按回车确认"
                    :max-tag-count="2"
                    :disabled="isFieldReadonly(key)"
                  />
                </template>
                
                <!-- Boolean/Status Type -->
                <template v-else-if="getFieldType(key) === 'boolean' || key === 'isActive' || key === 'status'">
                  <div class="boolean-field-wrapper">
                    <a-switch
                      v-model:checked="editData[key]"
                      size="small"
                      :disabled="isFieldReadonly(key)"
                    />
                    <span class="switch-label">
                      {{ editData[key] ? (fieldConfig[key]?.activeLabel || "已启用") : (fieldConfig[key]?.inactiveLabel || "已禁用") }}
                    </span>
                  </div>
                </template>
                
                <!-- Number Type -->
                <template v-else-if="getFieldType(key) === 'number' || key === 'age' || key === 'price' || key === 'stock'">
                  <a-input-number
                    v-model:value="editData[key]"
                    :controls="false"
                    style="width: 100%"
                    :placeholder="getFieldLabel(key)"
                    :min="fieldConfig[key]?.min"
                    :max="fieldConfig[key]?.max"
                    :disabled="isFieldDisabled(key)"
                    :readonly="isFieldReadonly(key)"
                  />
                </template>
                
                <!-- Array Type -->
                <template v-else-if="getFieldType(key) === 'array'">
                  <a-textarea
                    v-model:value="editData[key]"
                    size="middle"
                    placeholder="JSON: [1, 2, 3]"
                    :auto-size="{ minRows: 1, maxRows: 3 }"
                    @blur="validateArray(key)"
                    :disabled="isFieldDisabled(key)"
                    :readonly="isFieldReadonly(key)"
                  />
                </template>
                
                <!-- String Type (Long Text) -->
                <template v-else-if="key === 'address' || key === 'description' || key === 'bio'">
                  <a-textarea
                    v-model:value="editData[key]"
                    size="middle"
                    :placeholder="getFieldLabel(key)"
                    :auto-size="{ minRows: 2, maxRows: 4 }"
                    show-count
                    :maxlength="fieldConfig[key]?.maxLength || 500"
                    :disabled="isFieldDisabled(key)"
                    :readonly="isFieldReadonly(key)"
                  />
                </template>
                
                <!-- Default String -->
                <template v-else>
                  <a-input
                    v-model:value="editData[key]"
                    size="middle"
                    :placeholder="getFieldLabel(key)"
                    :allow-clear="!isFieldReadonly(key)"
                    :disabled="isFieldDisabled(key)"
                    :readonly="isFieldReadonly(key)"
                  />
                </template>
              </div>
              
              <!-- Actions -->
              <div class="field-actions" :class="{ 'is-visible': hoveredField === key }">
                <a-button
                  v-if="allowDelete && !isFieldReadonly(key)"
                  type="text"
                  size="small"
                  danger
                  @click="removeField(key)"
                >
                  <DeleteOutlined />
                </a-button>
              </div>
            </div>
          </template>
        </draggable>
        
        <!-- Add Field Button -->
        <div v-if="allowAdd" class="add-field-section">
          <a-button
            v-if="!showAddFieldDialog"
            type="dashed"
            size="small"
            class="add-field-btn"
            @click="showAddFieldDialog = true"
          >
            <PlusOutlined />
            "新增字段"
          </a-button>
        </div>
      </div>
      
      <!-- Raw Edit Mode -->
      <template v-else>
        <a-form-item label="JSON 内容">
          <a-textarea
            v-model:value="rawJsonText"
            :auto-size="{ minRows: 10, maxRows: 20 }"
            placeholder="输入有效的 JSON..."
            class="raw-editor"
          />
        </a-form-item>
      </template>
      
      <template #footer>
        <a-space>
          <a-button @click="toggleEditMode" size="small">
            {{ useRawEdit ? "表单编辑" : "原始编辑" }}
          </a-button>
          <a-button @click="handleCancel" size="small">
            {{ cancelText }}
          </a-button>
          <a-button type="primary" @click="handleOk" size="small">
            {{ okText }}
          </a-button>
        </a-space>
      </template>
    </a-modal>
    
    <!-- Add Field Dialog -->
    <a-modal
      v-model:open="showAddFieldDialog"
      :title="新增字段"
      :ok-text="确定"
      :cancel-text="取消"
      @ok="handleAddField"
      @cancel="showAddFieldDialog = false"
      width="400px"
    >
      <a-form layout="vertical">
        <a-form-item :label="字段名称" required>
          <a-input
            v-model:value="newField.name"
            size="middle"
            :placeholder="请输入字段名称"
            @pressEnter="handleAddField"
          />
        </a-form-item>
        <a-form-item :label="字段类型">
          <a-select v-model:value="newField.type" size="middle" :placeholder="请选择字段类型">
            <a-select-option value="string">"文本"</a-select-option>
            <a-select-option value="number">"数字"</a-select-option>
            <a-select-option value="boolean">"布尔值"</a-select-option>
            <a-select-option value="tags">"标签"</a-select-option>
            <a-select-option value="array">"数组"</a-select-option>
            <a-select-option value="object">"对象"</a-select-option>
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
  HolderOutlined
} from '@antdv-next/icons'
import { message } from 'antdv-next'
import draggable from 'vuedraggable'

defineOptions({
  name: 'JsonInput'
})


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

const okText = '确定'
const cancelText = '取消'

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

function hasLabelMap(key: string): boolean {
  return !!(props.fieldConfig[key]?.label || props.labelMap[key])
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
    if (value.length > 0 && typeof value[0] === 'string') return 'tags'
    return 'array'
  }
  if (typeof value === 'object') return 'object'
  return 'string'
}

function isFieldDisabled(key: string): boolean {
  return props.disabledFields.includes(key)
}

function isFieldReadonly(key: string): boolean {
  return isFieldDisabled(key) || props.readonlyFields.includes(key)
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
      errorMessage.value = "JSON 格式错误"
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
      errorMessage.value = "JSON 格式错误"
      return
    }
  }
  useRawEdit.value = !useRawEdit.value
}

// Field operations
function handleAddField() {
  if (!newField.value.name.trim()) {
    message.warning("请输入字段名")
    return
  }
  if (editData.value[newField.value.name]) {
    message.warning("字段已存在")
    return
  }
  
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
  
  newField.value = { name: '', type: 'string' }
  showAddFieldDialog.value = false
  
  message.success("添加成功")
}

function removeField(key: string) {
  delete editData.value[key]
  fieldOrder.value = fieldOrder.value.filter(k => k !== key)
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
      errorMessage.value = `${key}: ${"无效的数组格式"}`
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
    max-height: 65vh;
    overflow-y: auto;
    padding: 16px 20px;
    background: var(--color-bg-layout);
  }
}

.json-error-alert {
  margin-bottom: 12px;
}

.form-edit-container {
  background: var(--color-bg-layout);
  
  .field-list {
    display: flex;
    flex-direction: column;
  }
  
  .field-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
    background: var(--color-bg-container);
    border-bottom: 1px solid var(--color-border-secondary);
    transition: all 0.15s ease;
    
    &:hover,
    &.is-hovered {
      background: var(--color-primary-bg);
    }
    
    &.is-dragging {
      background: var(--color-primary-bg);
      opacity: 0.9;
    }
    
    &:first-child {
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
    }
    
    &:last-child {
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
      border-bottom: none;
    }
    
    .drag-handle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      cursor: grab;
      color: var(--color-text-quaternary);
      transition: color 0.2s;
      flex-shrink: 0;
      margin-top: 4px;
      
      &:hover {
        color: var(--color-text-secondary);
      }
      
      &:active {
        cursor: grabbing;
      }
    }
    
    .field-label-section {
      width: 120px;
      flex-shrink: 0;
      padding-top: 4px;
      
      .field-label {
        font-weight: 500;
        font-size: 13px;
        color: var(--color-text-primary);
        line-height: 1.4;
      }
      
      .field-key {
        font-size: 11px;
        color: var(--color-text-tertiary);
        line-height: 1.3;
        margin-top: 2px;
      }
    }
    
    .field-input-section {
      flex: 1;
      min-width: 0;
      
      // Ensure all inputs have consistent width and height
      :deep(.ant-input),
      :deep(.ant-select),
      :deep(.ant-input-affix-wrapper) {
        width: 100%;
      }
      
      // InputNumber needs special handling for alignment
      :deep(.ant-input-number) {
        width: 100%;
        box-sizing: border-box;
        
        .ant-input-number-input-wrap {
          box-sizing: border-box;
        }
        
        .ant-input-number-input {
          height: 30px;
          box-sizing: border-box;
        }
      }
      
      .boolean-field-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 32px;
      }
      
      .switch-label {
        font-size: 12px;
        color: var(--color-text-secondary);
      }
    }
    
    .field-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      gap: 6px;
      opacity: 0;
      transition: opacity 0.15s ease;
      flex-shrink: 0;
      margin-top: 2px;
      
      &.is-visible {
        opacity: 1;
      }
      
      :deep(.ant-btn) {
        padding: 0 6px;
        height: 22px;
        font-size: 11px;
      }
      
      :deep(.ant-btn-group) {
        display: flex;
        gap: 6px;
        
        .ant-btn {
          padding: 0 8px;
          height: 28px;
          font-size: 12px;
          border-radius: 4px;
          margin: 0;
        }
      }
    }
  }
  
  .add-field-section {
    margin-top: 12px;
    padding: 0 12px;
    
    .add-field-btn {
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
@media (max-width: 576px) {
  .form-edit-container {
    .field-row {
      flex-wrap: wrap;
      
      .field-label-section {
        width: 100%;
        padding-top: 0;
        margin-bottom: 6px;
        
        .field-label,
        .field-key {
          display: inline;
          margin-right: 8px;
        }
      }
      
      .field-input-section {
        width: calc(100% - 28px);
      }
      
      .field-actions {
        width: 100%;
        justify-content: flex-end;
        margin-top: 8px;
        opacity: 1;
      }
    }
  }
}
</style>
