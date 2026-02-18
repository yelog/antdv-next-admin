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

      <div v-if="!useRawEdit" class="tree-edit-container">
        <div class="tree-panel">
          <div class="tree-toolbar">
            <span class="panel-title">结构树</span>
            <a-space size="small">
              <a-button type="link" size="small" @click="expandAllNodes">展开</a-button>
              <a-button type="link" size="small" @click="collapseToRoot">收起</a-button>
            </a-space>
          </div>
          <a-tree
            block-node
            show-line
            :tree-data="treeData"
            :selected-keys="selectedTreeKeys"
            :expanded-keys="expandedTreeKeys"
            class="json-tree"
            @select="onTreeSelect"
            @expand="onTreeExpand"
          />
        </div>

        <div class="editor-panel">
          <div class="editor-toolbar">
            <a-breadcrumb>
              <a-breadcrumb-item>
                <a href="#" @click.prevent="setActivePath([])">root</a>
              </a-breadcrumb-item>
              <a-breadcrumb-item v-for="(segment, index) in activePath" :key="`${segment}-${index}`">
                <a href="#" @click.prevent="setActivePath(activePath.slice(0, index + 1))">
                  {{ formatPathSegment(segment) }}
                </a>
              </a-breadcrumb-item>
            </a-breadcrumb>
            <a-tag color="blue">{{ currentFieldOrder.length }} 个字段</a-tag>
          </div>

          <draggable
            v-model="currentFieldOrder"
            :item-key="getFieldItemKey"
            handle=".drag-handle"
            class="field-list"
            @start="onDragStart"
            @end="onDragEnd"
          >
            <template #item="{ element: key }">
              <div
                v-if="currentObject[key] !== undefined"
                class="field-row"
                :class="{ 'is-dragging': draggingFieldKey === key, 'is-hovered': hoveredField === key }"
                @mouseenter="hoveredField = key"
                @mouseleave="hoveredField = null"
              >
                <div class="drag-handle" v-if="allowSort">
                  <HolderOutlined />
                </div>

                <div class="field-label-section">
                  <div class="field-label">{{ getFieldLabel(key) }}</div>
                  <div v-if="hasLabelMap(key)" class="field-key">{{ key }}</div>
                </div>

                <div class="field-input-section">
                  <template v-if="getFieldType(key) === 'object'">
                    <div class="object-field-wrapper">
                      <span class="object-summary">{{ getObjectSummary(key) }}</span>
                      <a-button type="link" size="small" @click="enterObjectField(key)">进入</a-button>
                    </div>
                  </template>

                  <template v-else-if="getFieldType(key) === 'tags'">
                    <a-select
                      v-model:value="currentObject[key]"
                      mode="tags"
                      size="middle"
                      style="width: 100%"
                      placeholder="输入标签按回车确认"
                      :max-tag-count="2"
                      :disabled="isFieldReadonly(key)"
                    />
                  </template>

                  <template v-else-if="getFieldType(key) === 'boolean'">
                    <div class="boolean-field-wrapper">
                      <a-switch
                        v-model:checked="currentObject[key]"
                        size="small"
                        :disabled="isFieldReadonly(key)"
                      />
                      <span class="switch-label">
                        {{ currentObject[key] ? (getFieldConfig(key)?.activeLabel || '已启用') : (getFieldConfig(key)?.inactiveLabel || '已禁用') }}
                      </span>
                    </div>
                  </template>

                  <template v-else-if="getFieldType(key) === 'number'">
                    <a-input-number
                      v-model:value="currentObject[key]"
                      :controls="false"
                      style="width: 100%"
                      :placeholder="getFieldLabel(key)"
                      :min="getFieldConfig(key)?.min"
                      :max="getFieldConfig(key)?.max"
                      :disabled="isFieldDisabled(key)"
                      :readonly="isFieldReadonly(key)"
                    />
                  </template>

                  <template v-else-if="getFieldType(key) === 'array'">
                    <a-textarea
                      :value="getArrayFieldText(key)"
                      size="middle"
                      placeholder="JSON: [1, 2, 3]"
                      :auto-size="{ minRows: 1, maxRows: 3 }"
                      :disabled="isFieldDisabled(key)"
                      :readonly="isFieldReadonly(key)"
                      @update:value="onArrayTextChange(key, $event)"
                      @blur="validateArray(key)"
                    />
                  </template>

                  <template v-else-if="isLongTextField(key)">
                    <a-textarea
                      v-model:value="currentObject[key]"
                      size="middle"
                      :placeholder="getFieldLabel(key)"
                      :auto-size="{ minRows: 2, maxRows: 4 }"
                      show-count
                      :maxlength="getFieldConfig(key)?.maxLength || 500"
                      :disabled="isFieldDisabled(key)"
                      :readonly="isFieldReadonly(key)"
                    />
                  </template>

                  <template v-else>
                    <a-input
                      v-model:value="currentObject[key]"
                      size="middle"
                      :placeholder="getFieldLabel(key)"
                      :allow-clear="!isFieldReadonly(key)"
                      :disabled="isFieldDisabled(key)"
                      :readonly="isFieldReadonly(key)"
                    />
                  </template>
                </div>

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

          <div v-if="allowAdd" class="add-field-section">
            <a-button
              v-if="!showAddFieldDialog"
              type="dashed"
              size="small"
              class="add-field-btn"
              @click="showAddFieldDialog = true"
            >
              <PlusOutlined />
              新增字段
            </a-button>
          </div>
        </div>
      </div>

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
            {{ useRawEdit ? '树形编辑' : '原始编辑' }}
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

type FieldType = 'string' | 'number' | 'boolean' | 'tags' | 'array' | 'object'

interface JsonObject {
  [key: string]: unknown
}

interface LabelMap {
  [key: string]: string
}

interface FieldConfig {
  type?: FieldType
  component?: 'input' | 'textarea'
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

interface TreeNode {
  key: string
  title: string
  selectable?: boolean
  children?: TreeNode[]
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
const activePath = ref<string[]>([])
const expandedTreeKeys = ref<string[]>([])
const errorMessage = ref('')
const useRawEdit = ref(false)
const rawJsonText = ref('')
const hoveredField = ref<string | null>(null)
const draggingFieldKey = ref<string | null>(null)
const showAddFieldDialog = ref(false)
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

const selectedTreeKeys = computed(() => [serializePath(activePath.value)])

const currentObject = computed<JsonObject>(() => {
  const value = getValueByPath(editData.value, activePath.value)
  if (isPlainObject(value)) {
    return value
  }
  return editData.value
})

const currentFieldOrder = computed<string[]>({
  get: () => getFieldOrderByPath(activePath.value),
  set: (order) => setFieldOrderByPath(activePath.value, order)
})

const treeData = computed<TreeNode[]>(() => [buildTreeNode(editData.value, [])])

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

function getFieldConfig(key: string): FieldConfig | undefined {
  return getFieldConfigByPath(activePath.value, key)
}

function getFieldLabelByPath(path: string[], key: string): string {
  const config = getFieldConfigByPath(path, key)
  const fullPathKey = getFieldPath(path, key).join('.')
  return config?.label || props.labelMap[fullPathKey] || props.labelMap[key] || key
}

function getFieldLabel(key: string): string {
  return getFieldLabelByPath(activePath.value, key)
}

function hasLabelMap(key: string): boolean {
  const config = getFieldConfigByPath(activePath.value, key)
  const fullPathKey = getFieldPath(activePath.value, key).join('.')
  return Boolean(config?.label || props.labelMap[fullPathKey] || props.labelMap[key])
}

function isLongTextField(key: string): boolean {
  return getFieldConfigByPath(activePath.value, key)?.component === 'textarea'
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

function getFieldType(key: string): FieldType {
  return getFieldTypeByPath(activePath.value, key)
}

function isFieldDisabledByPath(path: string[], key: string): boolean {
  const fullPathKey = getFieldPath(path, key).join('.')
  return props.disabledFields.includes(fullPathKey) || props.disabledFields.includes(key)
}

function isFieldDisabled(key: string): boolean {
  return isFieldDisabledByPath(activePath.value, key)
}

function isFieldReadonly(key: string): boolean {
  const fullPathKey = getFieldPath(activePath.value, key).join('.')
  return isFieldDisabled(key) || props.readonlyFields.includes(fullPathKey) || props.readonlyFields.includes(key)
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

function getFieldItemKey(key: string): string {
  return key
}

function formatPathSegment(segment: string): string {
  if (/^\d+$/.test(segment)) {
    return `[${segment}]`
  }
  return segment
}

function truncateText(text: string, maxLength = 20): string {
  if (text.length <= maxLength) {
    return text
  }
  return `${text.slice(0, maxLength)}...`
}

function getTreeNodeTitle(path: string[], value: unknown): string {
  const nodeName = path.length === 0 ? 'root' : formatPathSegment(path[path.length - 1])

  if (isPlainObject(value)) {
    return `${nodeName} {${Object.keys(value).length}}`
  }

  if (Array.isArray(value)) {
    return `${nodeName} [${value.length}]`
  }

  if (typeof value === 'string') {
    return `${nodeName}: "${truncateText(value)}"`
  }

  return `${nodeName}: ${String(value)}`
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

function buildTreeChildren(value: unknown, path: string[]): TreeNode[] {
  if (isPlainObject(value)) {
    const orderedKeys = getOrderedObjectKeys(path, value)
    return orderedKeys
      .filter(key => Object.prototype.hasOwnProperty.call(value, key))
      .map(key => buildTreeNode(value[key], [...path, key]))
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => buildTreeNode(item, [...path, String(index)]))
  }

  return []
}

function buildTreeNode(value: unknown, path: string[]): TreeNode {
  const children = buildTreeChildren(value, path)

  const node: TreeNode = {
    key: serializePath(path),
    title: getTreeNodeTitle(path, value),
    selectable: isPlainObject(value)
  }

  if (children.length > 0) {
    node.children = children
  }

  return node
}

function collectExpandablePathKeys(value: unknown, path: string[] = []): string[] {
  if (!isPlainObject(value) && !Array.isArray(value)) {
    return []
  }

  const keys: string[] = [serializePath(path)]

  if (isPlainObject(value)) {
    Object.keys(value).forEach(key => {
      keys.push(...collectExpandablePathKeys(value[key], [...path, key]))
    })
  } else {
    value.forEach((item, index) => {
      keys.push(...collectExpandablePathKeys(item, [...path, String(index)]))
    })
  }

  return keys
}

function expandAllNodes() {
  expandedTreeKeys.value = collectExpandablePathKeys(editData.value)
}

function collapseToRoot() {
  expandedTreeKeys.value = [serializePath([])]
}

function ensurePathExpanded(path: string[]) {
  const keys = [...expandedTreeKeys.value]

  for (let i = 0; i <= path.length; i += 1) {
    const nodePath = path.slice(0, i)
    const nodeKey = serializePath(nodePath)
    if (!keys.includes(nodeKey)) {
      keys.push(nodeKey)
    }
  }

  expandedTreeKeys.value = keys
}

function setActivePath(path: string[]) {
  const target = getObjectByPath(path)
  if (!target) {
    activePath.value = []
  } else {
    activePath.value = [...path]
  }

  hoveredField.value = null
  draggingFieldKey.value = null
  getFieldOrderByPath(activePath.value)
}

function onTreeSelect(selectedKeys: Array<string | number>) {
  if (selectedKeys.length === 0) {
    return
  }

  const selectedKey = selectedKeys[0]
  if (typeof selectedKey !== 'string') {
    return
  }

  const selectedPath = parsePath(selectedKey)
  const selectedValue = getValueByPath(editData.value, selectedPath)

  if (isPlainObject(selectedValue)) {
    setActivePath(selectedPath)
    return
  }

  const parentPath = selectedPath.slice(0, -1)
  const parentValue = getValueByPath(editData.value, parentPath)
  if (isPlainObject(parentValue)) {
    setActivePath(parentPath)
  }
}

function onTreeExpand(expandedKeys: Array<string | number>) {
  expandedTreeKeys.value = expandedKeys.filter((key): key is string => typeof key === 'string')
}

function enterObjectField(key: string) {
  const targetPath = [...activePath.value, key]
  const target = getValueByPath(editData.value, targetPath)

  if (!isPlainObject(target)) {
    return
  }

  ensurePathExpanded(targetPath)
  setActivePath(targetPath)
}

function getObjectSummary(key: string): string {
  const value = currentObject.value[key]
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

function getArrayFieldPath(key: string): string[] {
  return [...activePath.value, key]
}

function getArrayFieldText(key: string): string {
  const path = getArrayFieldPath(key)
  const pathKey = serializePath(path)

  if (Object.prototype.hasOwnProperty.call(arrayTextBuffer.value, pathKey)) {
    return arrayTextBuffer.value[pathKey]
  }

  const value = currentObject.value[key]
  if (Array.isArray(value)) {
    return JSON.stringify(value, null, 2)
  }
  if (typeof value === 'string') {
    return value
  }
  return '[]'
}

function onArrayTextChange(key: string, value: string) {
  const path = getArrayFieldPath(key)
  arrayTextBuffer.value[serializePath(path)] = value
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
  activePath.value = []
  hoveredField.value = null
  draggingFieldKey.value = null
  getFieldOrderByPath([])
  expandedTreeKeys.value = [serializePath([])]
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

function handleAddField() {
  const fieldName = newField.value.name.trim()
  if (!fieldName) {
    message.warning('请输入字段名')
    return
  }

  if (Object.prototype.hasOwnProperty.call(currentObject.value, fieldName)) {
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

  currentObject.value[fieldName] = defaultValue
  setDynamicFieldType(activePath.value, fieldName, newField.value.type)
  currentFieldOrder.value = [...currentFieldOrder.value, fieldName]

  if (newField.value.type === 'array') {
    arrayTextBuffer.value[getFieldPathKey(activePath.value, fieldName)] = '[]'
  }

  newField.value = { name: '', type: 'string' }
  showAddFieldDialog.value = false
  message.success('添加成功')
}

function removeField(key: string) {
  delete currentObject.value[key]
  currentFieldOrder.value = currentFieldOrder.value.filter(fieldKey => fieldKey !== key)

  const removedPath = [...activePath.value, key]
  clearArrayBufferByPrefix(removedPath)
  clearDynamicFieldTypeByPrefix(removedPath)
}

function onDragStart(event: { oldIndex?: number }) {
  if (event.oldIndex === undefined) {
    draggingFieldKey.value = null
    return
  }
  draggingFieldKey.value = currentFieldOrder.value[event.oldIndex] ?? null
}

function onDragEnd() {
  draggingFieldKey.value = null
}

function validateArray(key: string) {
  if (commitArrayBuffer(getArrayFieldPath(key))) {
    errorMessage.value = ''
  }
}

watch(
  () => props.value,
  (newVal) => {
    if (modalVisible.value) {
      return
    }

    editData.value = normalizeInputValue(newVal)
    fieldOrderMap.value = {}
    dynamicTypeMap.value = {}
    arrayTextBuffer.value = {}
    getFieldOrderByPath([])
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
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 12px;
  min-height: 420px;

  .tree-panel,
  .editor-panel {
    background: var(--color-bg-container);
    border: 1px solid var(--color-border-secondary);
    border-radius: 8px;
  }

  .tree-panel {
    display: flex;
    flex-direction: column;
    min-height: 420px;
  }

  .tree-toolbar,
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

  .json-tree {
    flex: 1;
    overflow: auto;
    padding: 8px;

    :deep(.ant-tree-node-content-wrapper) {
      min-height: 28px;
      display: flex;
      align-items: center;
    }
  }

  .editor-panel {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .field-list {
    display: flex;
    flex-direction: column;
    overflow: auto;
    padding: 6px 0;
    max-height: 360px;
  }

  .field-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
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

    &:last-child {
      border-bottom: none;
    }
  }

  .drag-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    cursor: grab;
    color: var(--color-text-quaternary);
    flex-shrink: 0;
    margin-top: 4px;

    &:active {
      cursor: grabbing;
    }
  }

  .field-label-section {
    width: 140px;
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
      word-break: break-all;
    }
  }

  .field-input-section {
    flex: 1;
    min-width: 0;

    :deep(.ant-input),
    :deep(.ant-select),
    :deep(.ant-input-affix-wrapper),
    :deep(.ant-input-number) {
      width: 100%;
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

    .object-field-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 32px;
      background: var(--color-bg-layout);
      border: 1px dashed var(--color-border-secondary);
      border-radius: 6px;
      padding: 0 10px;
      gap: 8px;
    }

    .object-summary {
      font-size: 12px;
      color: var(--color-text-secondary);
    }
  }

  .field-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
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
  }

  .add-field-section {
    padding: 10px 12px 12px;
    border-top: 1px solid var(--color-border-secondary);

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

@media (max-width: 768px) {
  .tree-edit-container {
    grid-template-columns: 1fr;

    .tree-panel {
      min-height: 220px;
    }

    .field-row {
      flex-wrap: wrap;

      .field-label-section {
        width: 100%;
        padding-top: 0;
        margin-bottom: 6px;
      }

      .field-actions {
        width: 100%;
        justify-content: flex-end;
        opacity: 1;
      }
    }
  }
}
</style>
