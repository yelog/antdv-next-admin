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

      <template v-if="!useRawEdit">
        <div class="tree-edit-container">
          <div class="editor-panel">
            <div class="editor-toolbar">
              <a-space>
                <span class="panel-title">结构列表</span>
                <a-tag color="blue">{{ rootFieldCount }} 个字段</a-tag>
              </a-space>
              <a-space size="small">
                <a-button type="link" size="small" @click="expandAllObjectFields">展开全部</a-button>
                <a-button type="link" size="small" @click="collapseAllObjectFields">全部收起</a-button>
              </a-space>
            </div>

            <div class="editor-content">
              <JsonFieldTreeList
                :path="[]"
                :depth="0"
                :allow-add="allowAdd"
                :allow-delete="allowDelete"
                :allow-sort="allowSort"
                :hovered-path-key="hoveredFieldPathKey"
                :dragging-path-key="draggingFieldPathKey"
                :api="treeEditorApi"
                @hover-change="onHoverChange"
                @request-add-field="openAddFieldDialog"
                @remove-field="onRemoveField"
                @drag-start="onDragStart"
                @drag-end="onDragEnd"
              />
            </div>
          </div>
        </div>
      </template>

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
            {{ useRawEdit ? '结构编辑' : '原始编辑' }}
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

    <a-modal
      v-model:open="showAddFieldDialog"
      title="新增字段"
      ok-text="确定"
      cancel-text="取消"
      @ok="handleAddField"
      @cancel="showAddFieldDialog = false"
      width="400px"
    >
      <a-form layout="vertical">
        <a-form-item label="目标对象">
          <a-input :value="formatPathLabel(addFieldTargetPath)" size="middle" disabled />
        </a-form-item>
        <a-form-item label="字段名称" required>
          <a-input
            v-model:value="newField.name"
            size="middle"
            placeholder="请输入字段名称"
            @pressEnter="handleAddField"
          />
        </a-form-item>
        <a-form-item label="字段类型">
          <a-select v-model:value="newField.type" size="middle" placeholder="请选择字段类型">
            <a-select-option value="string">文本</a-select-option>
            <a-select-option value="number">数字</a-select-option>
            <a-select-option value="boolean">布尔值</a-select-option>
            <a-select-option value="tags">标签</a-select-option>
            <a-select-option value="array">数组</a-select-option>
            <a-select-option value="object">对象</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue'
import { EditOutlined } from '@antdv-next/icons'
import { message } from 'antdv-next'
import JsonFieldTreeList, { type FieldType, type JsonObject, type FieldConfig, type JsonTreeEditorApi } from './JsonFieldTreeList.vue'

defineOptions({
  name: 'JsonInput'
})

interface LabelMap {
  [key: string]: string
}

interface FieldConfigMap {
  [key: string]: FieldConfig
}

interface RemoveFieldPayload {
  path: string[]
  key: string
}

interface DragStartPayload {
  path: string[]
  oldIndex?: number
}

const props = defineProps({
  value: {
    type: Object as PropType<JsonObject | null>,
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
    default: '900px'
  }
})

const emit = defineEmits(['update:value', 'change'])

const modalVisible = ref(false)
const editData = ref<JsonObject>({})
const fieldOrderMap = ref<Record<string, string[]>>({})
const dynamicTypeMap = ref<Record<string, FieldType>>({})
const arrayTextBuffer = ref<Record<string, string>>({})
const expandedPathKeys = ref<string[]>([])
const errorMessage = ref('')
const useRawEdit = ref(false)
const rawJsonText = ref('')
const hoveredFieldPathKey = ref('')
const draggingFieldPathKey = ref('')
const showAddFieldDialog = ref(false)
const addFieldTargetPath = ref<string[]>([])
const newField = ref<{ name: string; type: FieldType }>({ name: '', type: 'string' })

const okText = '确定'
const cancelText = '取消'

const displayValue = computed(() => {
  if (!props.value) {
    return ''
  }
  if (props.displayKey && props.value[props.displayKey] !== undefined) {
    return String(props.value[props.displayKey])
  }
  return `${JSON.stringify(props.value).slice(0, 50)}...`
})

const rootFieldCount = computed(() => getFieldOrderByPath([]).length)

function isPlainObject(value: unknown): value is JsonObject {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function deepCloneObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function normalizeInputValue(value: JsonObject | null): JsonObject {
  if (!value || !isPlainObject(value)) {
    return {}
  }
  return deepCloneObject(value)
}

function serializePath(path: string[]): string {
  return JSON.stringify(path)
}

function parsePath(pathKey: string): string[] {
  try {
    const parsed: unknown = JSON.parse(pathKey)
    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
      return parsed
    }
  } catch {
    return []
  }
  return []
}

function isPathPrefix(prefix: string[], target: string[]): boolean {
  if (prefix.length > target.length) {
    return false
  }
  return prefix.every((segment, index) => segment === target[index])
}

function getValueByPath(root: unknown, path: string[]): unknown {
  let current: unknown = root
  for (const segment of path) {
    if (Array.isArray(current)) {
      const index = Number(segment)
      if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        return undefined
      }
      current = current[index]
      continue
    }
    if (isPlainObject(current)) {
      current = current[segment]
      continue
    }
    return undefined
  }
  return current
}

function getObjectByPath(path: string[]): JsonObject | null {
  const value = getValueByPath(editData.value, path)
  if (isPlainObject(value)) {
    return value
  }
  return null
}

function getFieldPath(path: string[], key: string): string[] {
  return [...path, key]
}

function getFieldPathKey(path: string[], key: string): string {
  return serializePath(getFieldPath(path, key))
}

function getFieldConfigByPath(path: string[], key: string): FieldConfig | undefined {
  const fullPathKey = getFieldPath(path, key).join('.')
  return props.fieldConfig[fullPathKey] || props.fieldConfig[key]
}

function getFieldLabelByPath(path: string[], key: string): string {
  const config = getFieldConfigByPath(path, key)
  const fullPathKey = getFieldPath(path, key).join('.')
  return config?.label || props.labelMap[fullPathKey] || props.labelMap[key] || key
}

function hasLabelMapByPath(path: string[], key: string): boolean {
  const config = getFieldConfigByPath(path, key)
  const fullPathKey = getFieldPath(path, key).join('.')
  return Boolean(config?.label || props.labelMap[fullPathKey] || props.labelMap[key])
}

function isLongTextFieldByPath(path: string[], key: string): boolean {
  return getFieldConfigByPath(path, key)?.component === 'textarea'
}

function setDynamicFieldType(path: string[], key: string, type: FieldType) {
  dynamicTypeMap.value[getFieldPathKey(path, key)] = type
}

function getDynamicFieldType(path: string[], key: string): FieldType | undefined {
  return dynamicTypeMap.value[getFieldPathKey(path, key)]
}

function clearDynamicFieldTypeByPrefix(path: string[]) {
  for (const pathKey of Object.keys(dynamicTypeMap.value)) {
    const targetPath = parsePath(pathKey)
    if (isPathPrefix(path, targetPath)) {
      delete dynamicTypeMap.value[pathKey]
    }
  }
}

function getFieldTypeByPath(path: string[], key: string): FieldType {
  const dynamicType = getDynamicFieldType(path, key)
  if (dynamicType) {
    return dynamicType
  }

  const configType = getFieldConfigByPath(path, key)?.type
  if (configType) {
    return configType
  }

  const target = getObjectByPath(path)
  const value = target ? target[key] : undefined

  if (value === null || value === undefined) {
    return 'string'
  }
  if (typeof value === 'boolean') {
    return 'boolean'
  }
  if (typeof value === 'number') {
    return 'number'
  }
  if (Array.isArray(value)) {
    if (value.length > 0 && value.every(item => typeof item === 'string')) {
      return 'tags'
    }
    return 'array'
  }
  if (isPlainObject(value)) {
    return 'object'
  }
  return 'string'
}

function isFieldDisabledByPath(path: string[], key: string): boolean {
  const fullPathKey = getFieldPath(path, key).join('.')
  return props.disabledFields.includes(fullPathKey) || props.disabledFields.includes(key)
}

function isFieldReadonlyByPath(path: string[], key: string): boolean {
  const fullPathKey = getFieldPath(path, key).join('.')
  return isFieldDisabledByPath(path, key) || props.readonlyFields.includes(fullPathKey) || props.readonlyFields.includes(key)
}

function getFieldOrderByPath(path: string[]): string[] {
  const target = getObjectByPath(path)
  if (!target) {
    return []
  }

  const pathKey = serializePath(path)
  const keys = Object.keys(target)
  const currentOrder = fieldOrderMap.value[pathKey]

  if (!currentOrder) {
    fieldOrderMap.value[pathKey] = [...keys]
    return fieldOrderMap.value[pathKey]
  }

  const normalizedOrder = currentOrder.filter(key => Object.prototype.hasOwnProperty.call(target, key))
  keys.forEach(key => {
    if (!normalizedOrder.includes(key)) {
      normalizedOrder.push(key)
    }
  })

  const isSameLength = normalizedOrder.length === currentOrder.length
  const isSameOrder = isSameLength && normalizedOrder.every((key, index) => key === currentOrder[index])
  if (!isSameOrder) {
    fieldOrderMap.value[pathKey] = normalizedOrder
    return normalizedOrder
  }

  return currentOrder
}

function setFieldOrderByPath(path: string[], order: string[]) {
  fieldOrderMap.value[serializePath(path)] = [...order]
}

function formatPathSegment(segment: string): string {
  if (/^\d+$/.test(segment)) {
    return `[${segment}]`
  }
  return segment
}

function formatPathLabel(path: string[]): string {
  if (path.length === 0) {
    return 'root'
  }
  return ['root', ...path.map(formatPathSegment)].join(' / ')
}

function getObjectSummaryByPath(path: string[], key: string): string {
  const target = getObjectByPath(path)
  const value = target ? target[key] : undefined
  if (isPlainObject(value)) {
    return `对象（${Object.keys(value).length} 个字段）`
  }
  return '对象'
}

function parseArrayTextValue(value: string): unknown[] {
  const trimmed = value.trim()
  if (!trimmed) {
    return []
  }

  const parsed = JSON.parse(trimmed)
  if (!Array.isArray(parsed)) {
    throw new Error('NOT_ARRAY')
  }

  return parsed
}

function getArrayFieldTextByPath(path: string[], key: string): string {
  const fieldPath = getFieldPath(path, key)
  const pathKey = serializePath(fieldPath)

  if (Object.prototype.hasOwnProperty.call(arrayTextBuffer.value, pathKey)) {
    return arrayTextBuffer.value[pathKey]
  }

  const target = getObjectByPath(path)
  const value = target ? target[key] : undefined
  if (Array.isArray(value)) {
    return JSON.stringify(value, null, 2)
  }
  if (typeof value === 'string') {
    return value
  }
  return '[]'
}

function onArrayTextChangeByPath(path: string[], key: string, value: string) {
  arrayTextBuffer.value[serializePath(getFieldPath(path, key))] = value
}

function commitArrayBuffer(path: string[]): boolean {
  if (path.length === 0) {
    return true
  }

  const pathKey = serializePath(path)
  if (!Object.prototype.hasOwnProperty.call(arrayTextBuffer.value, pathKey)) {
    return true
  }

  const parentPath = path.slice(0, -1)
  const fieldKey = path[path.length - 1]
  const parent = getValueByPath(editData.value, parentPath)

  if (!isPlainObject(parent)) {
    delete arrayTextBuffer.value[pathKey]
    return true
  }

  try {
    const parsed = parseArrayTextValue(arrayTextBuffer.value[pathKey])
    parent[fieldKey] = parsed
    delete arrayTextBuffer.value[pathKey]
    return true
  } catch {
    errorMessage.value = `${getFieldLabelByPath(parentPath, fieldKey)}: 无效的数组格式`
    return false
  }
}

function validateArrayByPath(path: string[], key: string) {
  if (commitArrayBuffer(getFieldPath(path, key))) {
    errorMessage.value = ''
  }
}

function syncAllArrayBuffers(): boolean {
  const keys = Object.keys(arrayTextBuffer.value)
  for (const key of keys) {
    const path = parsePath(key)
    if (!commitArrayBuffer(path)) {
      return false
    }
  }
  return true
}

function clearArrayBufferByPrefix(path: string[]) {
  for (const pathKey of Object.keys(arrayTextBuffer.value)) {
    const targetPath = parsePath(pathKey)
    if (isPathPrefix(path, targetPath)) {
      delete arrayTextBuffer.value[pathKey]
    }
  }
}

function getOrderedObjectKeys(path: string[], target: JsonObject): string[] {
  const defaultKeys = Object.keys(target)
  const customOrder = fieldOrderMap.value[serializePath(path)]
  if (!customOrder) {
    return defaultKeys
  }

  const ordered = customOrder.filter(key => Object.prototype.hasOwnProperty.call(target, key))
  defaultKeys.forEach(key => {
    if (!ordered.includes(key)) {
      ordered.push(key)
    }
  })
  return ordered
}

function collectObjectPathKeys(value: unknown, path: string[] = []): string[] {
  if (!isPlainObject(value)) {
    return []
  }

  const keys: string[] = []
  const orderedKeys = getOrderedObjectKeys(path, value)

  orderedKeys.forEach(key => {
    const childPath = [...path, key]
    const childValue = value[key]
    if (isPlainObject(childValue)) {
      keys.push(serializePath(childPath))
      keys.push(...collectObjectPathKeys(childValue, childPath))
    }
  })

  return keys
}

function isPathExpanded(path: string[]): boolean {
  if (path.length === 0) {
    return true
  }
  return expandedPathKeys.value.includes(serializePath(path))
}

function setPathExpanded(path: string[], expanded: boolean) {
  const pathKey = serializePath(path)
  const next = expandedPathKeys.value.filter(item => item !== pathKey)
  if (expanded) {
    next.push(pathKey)
  }
  expandedPathKeys.value = next
}

function togglePathExpanded(path: string[]) {
  setPathExpanded(path, !isPathExpanded(path))
}

function clearExpandedPathKeysByPrefix(path: string[]) {
  expandedPathKeys.value = expandedPathKeys.value.filter(pathKey => {
    const targetPath = parsePath(pathKey)
    return !isPathPrefix(path, targetPath)
  })
}

function expandAllObjectFields() {
  expandedPathKeys.value = collectObjectPathKeys(editData.value)
}

function collapseAllObjectFields() {
  expandedPathKeys.value = []
}

function buildOrderedValue(value: unknown, path: string[] = []): unknown {
  if (Array.isArray(value)) {
    return value.map((item, index) => buildOrderedValue(item, [...path, String(index)]))
  }

  if (!isPlainObject(value)) {
    return value
  }

  const orderedKeys = getFieldOrderByPath(path)
  const result: JsonObject = {}

  orderedKeys.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      result[key] = buildOrderedValue(value[key], [...path, key])
    }
  })

  return result
}

function resetEditorState(nextValue: JsonObject) {
  editData.value = nextValue
  fieldOrderMap.value = {}
  dynamicTypeMap.value = {}
  arrayTextBuffer.value = {}
  hoveredFieldPathKey.value = ''
  draggingFieldPathKey.value = ''
  addFieldTargetPath.value = []
  getFieldOrderByPath([])
  expandedPathKeys.value = collectObjectPathKeys(nextValue)
}

function showModal() {
  modalVisible.value = true
  errorMessage.value = ''
  useRawEdit.value = false
  showAddFieldDialog.value = false

  const normalized = normalizeInputValue(props.value)
  resetEditorState(normalized)
  rawJsonText.value = JSON.stringify(normalized, null, 2)
}

function handleCancel() {
  modalVisible.value = false
  showAddFieldDialog.value = false
  errorMessage.value = ''
}

function handleOk() {
  errorMessage.value = ''

  if (useRawEdit.value) {
    try {
      const parsed: unknown = JSON.parse(rawJsonText.value)
      if (!isPlainObject(parsed)) {
        errorMessage.value = 'JSON 根节点必须是对象'
        return
      }
      emit('update:value', parsed)
      emit('change', parsed)
      modalVisible.value = false
    } catch {
      errorMessage.value = 'JSON 格式错误'
    }
    return
  }

  if (!syncAllArrayBuffers()) {
    return
  }

  const result = buildOrderedValue(editData.value)
  if (!isPlainObject(result)) {
    errorMessage.value = 'JSON 根节点必须是对象'
    return
  }

  emit('update:value', result)
  emit('change', result)
  modalVisible.value = false
}

function toggleEditMode() {
  if (!useRawEdit.value) {
    if (!syncAllArrayBuffers()) {
      return
    }
    rawJsonText.value = JSON.stringify(editData.value, null, 2)
    useRawEdit.value = true
    return
  }

  try {
    const parsed: unknown = JSON.parse(rawJsonText.value)
    if (!isPlainObject(parsed)) {
      errorMessage.value = 'JSON 根节点必须是对象'
      return
    }

    resetEditorState(parsed)
    errorMessage.value = ''
    useRawEdit.value = false
  } catch {
    errorMessage.value = 'JSON 格式错误'
  }
}

function openAddFieldDialog(path: string[]) {
  const target = getObjectByPath(path)
  if (!target) {
    message.warning('目标对象不存在')
    return
  }

  addFieldTargetPath.value = [...path]
  newField.value = { name: '', type: 'string' }
  showAddFieldDialog.value = true
}

function handleAddField() {
  const fieldName = newField.value.name.trim()
  if (!fieldName) {
    message.warning('请输入字段名')
    return
  }

  const targetPath = [...addFieldTargetPath.value]
  const targetObject = getObjectByPath(targetPath)
  if (!targetObject) {
    message.warning('目标对象不存在')
    return
  }

  if (Object.prototype.hasOwnProperty.call(targetObject, fieldName)) {
    message.warning('字段已存在')
    return
  }

  let defaultValue: unknown = ''
  switch (newField.value.type) {
    case 'boolean':
      defaultValue = false
      break
    case 'number':
      defaultValue = 0
      break
    case 'tags':
      defaultValue = []
      break
    case 'array':
      defaultValue = []
      break
    case 'object':
      defaultValue = {}
      break
    default:
      defaultValue = ''
  }

  targetObject[fieldName] = defaultValue
  setDynamicFieldType(targetPath, fieldName, newField.value.type)
  setFieldOrderByPath(targetPath, [...getFieldOrderByPath(targetPath), fieldName])

  if (newField.value.type === 'array') {
    arrayTextBuffer.value[getFieldPathKey(targetPath, fieldName)] = '[]'
  }

  if (newField.value.type === 'object') {
    setPathExpanded(getFieldPath(targetPath, fieldName), true)
  }

  newField.value = { name: '', type: 'string' }
  showAddFieldDialog.value = false
  message.success('添加成功')
}

function onRemoveField(payload: RemoveFieldPayload) {
  const target = getObjectByPath(payload.path)
  if (!target) {
    return
  }

  delete target[payload.key]
  setFieldOrderByPath(payload.path, getFieldOrderByPath(payload.path).filter(key => key !== payload.key))

  const removedPath = [...payload.path, payload.key]
  clearArrayBufferByPrefix(removedPath)
  clearDynamicFieldTypeByPrefix(removedPath)
  clearExpandedPathKeysByPrefix(removedPath)

  const removedPathKey = serializePath(removedPath)
  if (hoveredFieldPathKey.value === removedPathKey) {
    hoveredFieldPathKey.value = ''
  }
  if (draggingFieldPathKey.value === removedPathKey) {
    draggingFieldPathKey.value = ''
  }
}

function onHoverChange(pathKey: string) {
  hoveredFieldPathKey.value = pathKey
}

function onDragStart(payload: DragStartPayload) {
  if (payload.oldIndex === undefined) {
    draggingFieldPathKey.value = ''
    return
  }

  const currentOrder = getFieldOrderByPath(payload.path)
  const fieldKey = currentOrder[payload.oldIndex]
  draggingFieldPathKey.value = fieldKey ? getFieldPathKey(payload.path, fieldKey) : ''
}

function onDragEnd() {
  draggingFieldPathKey.value = ''
}

const treeEditorApi: JsonTreeEditorApi = {
  getObjectByPath,
  getFieldOrderByPath,
  setFieldOrderByPath,
  getFieldPath,
  getFieldPathKey,
  getFieldLabelByPath,
  hasLabelMapByPath,
  getFieldTypeByPath,
  getFieldConfigByPath,
  isLongTextFieldByPath,
  isFieldDisabledByPath,
  isFieldReadonlyByPath,
  getObjectSummaryByPath,
  getArrayFieldTextByPath,
  onArrayTextChangeByPath,
  validateArrayByPath,
  isPathExpanded,
  togglePathExpanded
}

watch(
  () => props.value,
  (newVal) => {
    if (modalVisible.value) {
      return
    }

    const normalized = normalizeInputValue(newVal)
    editData.value = normalized
    fieldOrderMap.value = {}
    dynamicTypeMap.value = {}
    arrayTextBuffer.value = {}
    getFieldOrderByPath([])
    expandedPathKeys.value = collectObjectPathKeys(normalized)
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.json-input-wrapper {
  width: 100%;
}

.json-input-modal {
  :deep(.ant-modal-body) {
    max-height: 70vh;
    overflow: hidden;
    padding: 16px 20px;
    background: var(--color-bg-layout);
  }
}

.json-error-alert {
  margin-bottom: 12px;
}

.tree-edit-container {
  min-height: 420px;

  .editor-panel {
    display: flex;
    flex-direction: column;
    min-height: 420px;
    background: var(--color-bg-container);
    border: 1px solid var(--color-border-secondary);
    border-radius: 8px;
    overflow: hidden;
  }

  .editor-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-bottom: 1px solid var(--color-border-secondary);
  }

  .panel-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .editor-content {
    flex: 1;
    overflow: auto;
    max-height: 420px;
  }
}

.raw-editor {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
}
</style>
