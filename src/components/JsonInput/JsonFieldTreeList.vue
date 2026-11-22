<template>
  <div class="field-tree-level">
    <draggable
      v-model="fieldOrder"
      :item-key="getFieldItemKey"
      handle=".drag-handle"
      class="field-list"
      @start="handleDragStart"
      @end="handleDragEnd"
    >
      <template #item="{ element: key }">
        <div
          v-if="currentObject && currentObject[key] !== undefined"
          class="field-node"
        >
          <div
            class="field-row"
            :class="{
              'is-dragging': draggingPathKey === getFieldPathKey(key),
              'is-hovered': hoveredPathKey === getFieldPathKey(key),
              'is-new-field': isNewField(key),
            }"
            :style="{ paddingLeft: `${12 + depth * 20}px` }"
            @mouseenter="handleHover(getFieldPathKey(key))"
            @mouseleave="handleHover('')"
          >
            <div class="drag-handle" v-if="allowSort">
              <HolderOutlined />
            </div>

            <a-button
              v-if="isObjectField(key)"
              type="text"
              size="small"
              class="expand-toggle"
              @click="toggleFieldExpand(key)"
            >
              <CaretDownOutlined v-if="isFieldExpanded(key)" />
              <CaretRightOutlined v-else />
            </a-button>
            <div v-else class="expand-placeholder" />

            <div class="field-label-section">
              <a-input
                v-if="allowEditKey && !api.isFieldReadonlyByPath(path, key)"
                :value="key"
                size="medium"
                class="field-key-input"
                :class="{ 'is-new': isNewField(key) }"
                placeholder="字段名"
                @update:value="(val: string) => handleKeyChange(key, val)"
              />
              <template v-else>
                <div class="field-label">
                  {{ api.getFieldLabelByPath(path, key) }}
                </div>
                <div
                  v-if="api.hasLabelMapByPath(path, key)"
                  class="field-key-hint"
                >
                  {{ key }}
                </div>
              </template>
            </div>

            <div class="field-input-section">
              <template v-if="api.getFieldTypeByPath(path, key) === 'object'">
                <div class="object-field-wrapper">
                  <span class="object-summary">{{
                    api.getObjectSummaryByPath(path, key)
                  }}</span>
                  <a-button
                    type="link"
                    size="small"
                    @click="toggleFieldExpand(key)"
                  >
                    {{ isFieldExpanded(key) ? "收起" : "展开" }}
                  </a-button>
                </div>
              </template>

              <template
                v-else-if="api.getFieldTypeByPath(path, key) === 'tags'"
              >
                <a-select
                  v-model:value="currentObject[key]"
                  mode="tags"
                  size="medium"
                  style="width: 100%"
                  placeholder="输入标签按回车确认"
                  :max-tag-count="2"
                  :disabled="api.isFieldReadonlyByPath(path, key)"
                />
              </template>

              <template
                v-else-if="api.getFieldTypeByPath(path, key) === 'boolean'"
              >
                <div class="boolean-field-wrapper">
                  <a-switch
                    v-model:checked="currentObject[key]"
                    size="small"
                    :disabled="api.isFieldReadonlyByPath(path, key)"
                  />
                  <span class="switch-label">
                    {{
                      currentObject[key]
                        ? api.getFieldConfigByPath(path, key)?.activeLabel ||
                          "已启用"
                        : api.getFieldConfigByPath(path, key)?.inactiveLabel ||
                          "已禁用"
                    }}
                  </span>
                </div>
              </template>

              <template
                v-else-if="api.getFieldTypeByPath(path, key) === 'number'"
              >
                <a-input-number
                  v-model:value="currentObject[key]"
                  :controls="false"
                  style="width: 100%"
                  :placeholder="api.getFieldLabelByPath(path, key)"
                  :min="api.getFieldConfigByPath(path, key)?.min"
                  :max="api.getFieldConfigByPath(path, key)?.max"
                  :disabled="api.isFieldDisabledByPath(path, key)"
                  :readonly="api.isFieldReadonlyByPath(path, key)"
                />
              </template>

              <template
                v-else-if="api.getFieldTypeByPath(path, key) === 'array'"
              >
                <a-textarea
                  :value="api.getArrayFieldTextByPath(path, key)"
                  size="medium"
                  placeholder="JSON: [1, 2, 3]"
                  :auto-size="{ minRows: 1, maxRows: 3 }"
                  :disabled="api.isFieldDisabledByPath(path, key)"
                  :readonly="api.isFieldReadonlyByPath(path, key)"
                  @update:value="api.onArrayTextChangeByPath(path, key, $event)"
                  @blur="api.validateArrayByPath(path, key)"
                />
              </template>

              <template v-else-if="api.isLongTextFieldByPath(path, key)">
                <a-textarea
                  v-model:value="currentObject[key]"
                  size="medium"
                  :placeholder="api.getFieldLabelByPath(path, key)"
                  :auto-size="{ minRows: 2, maxRows: 4 }"
                  show-count
                  :maxlength="
                    api.getFieldConfigByPath(path, key)?.maxLength || 500
                  "
                  :disabled="api.isFieldDisabledByPath(path, key)"
                  :readonly="api.isFieldReadonlyByPath(path, key)"
                />
              </template>

              <template v-else>
                <a-input
                  v-model:value="currentObject[key]"
                  size="medium"
                  :placeholder="api.getFieldLabelByPath(path, key)"
                  :allow-clear="!api.isFieldReadonlyByPath(path, key)"
                  :disabled="api.isFieldDisabledByPath(path, key)"
                  :readonly="api.isFieldReadonlyByPath(path, key)"
                />
              </template>
            </div>

            <div
              class="field-actions"
              :class="{
                'is-visible':
                  hoveredPathKey === getFieldPathKey(key) || isNewField(key),
              }"
            >
              <a-select
                v-if="allowEditType && !api.isFieldReadonlyByPath(path, key)"
                :value="api.getFieldTypeByPath(path, key)"
                size="medium"
                class="type-selector"
                :options="fieldTypeOptions"
                @change="(val: FieldType) => handleTypeChange(key, val)"
              />
              <a-button
                v-if="allowDelete && !api.isFieldReadonlyByPath(path, key)"
                type="text"
                size="small"
                danger
                @click="removeField(key)"
              >
                <DeleteOutlined />
              </a-button>
            </div>
          </div>

          <JsonFieldTreeList
            v-if="isObjectField(key) && isFieldExpanded(key)"
            :path="getFieldPath(key)"
            :depth="depth + 1"
            :allow-add="allowAdd"
            :allow-delete="allowDelete"
            :allow-sort="allowSort"
            :allow-edit-key="allowEditKey"
            :allow-edit-type="allowEditType"
            :hovered-path-key="hoveredPathKey"
            :dragging-path-key="draggingPathKey"
            :api="api"
            :new-field-keys="newFieldKeys"
            @hover-change="emit('hover-change', $event)"
            @request-add-field="emit('request-add-field', $event)"
            @remove-field="emit('remove-field', $event)"
            @drag-start="emit('drag-start', $event)"
            @drag-end="emit('drag-end')"
            @update-field-key="emit('update-field-key', $event)"
            @update-field-type="emit('update-field-type', $event)"
          />
        </div>
      </template>
    </draggable>

    <div
      v-if="allowAdd && currentObject"
      class="add-field-section"
      :style="{ paddingLeft: `${12 + depth * 20}px` }"
    >
      <a-button
        type="dashed"
        size="small"
        class="add-field-btn"
        @click="requestAddField"
      >
        <PlusOutlined />
        新增字段
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  HolderOutlined,
  DeleteOutlined,
  PlusOutlined,
  CaretDownOutlined,
  CaretRightOutlined,
} from "@antdv-next/icons";
import { computed, type PropType } from "vue";
import draggable from "vuedraggable";

defineOptions({
  name: "JsonFieldTreeList",
});

export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "tags"
  | "array"
  | "object";

export interface JsonObject {
  [key: string]: unknown;
}

export interface FieldConfig {
  type?: FieldType;
  component?: "input" | "textarea";
  label?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  activeLabel?: string;
  inactiveLabel?: string;
}

export interface JsonTreeEditorApi {
  getObjectByPath: (path: string[]) => JsonObject | null;
  getFieldOrderByPath: (path: string[]) => string[];
  setFieldOrderByPath: (path: string[], order: string[]) => void;
  getFieldPath: (path: string[], key: string) => string[];
  getFieldPathKey: (path: string[], key: string) => string;
  getFieldLabelByPath: (path: string[], key: string) => string;
  hasLabelMapByPath: (path: string[], key: string) => boolean;
  getFieldTypeByPath: (path: string[], key: string) => FieldType;
  getFieldConfigByPath: (
    path: string[],
    key: string,
  ) => FieldConfig | undefined;
  isLongTextFieldByPath: (path: string[], key: string) => boolean;
  isFieldDisabledByPath: (path: string[], key: string) => boolean;
  isFieldReadonlyByPath: (path: string[], key: string) => boolean;
  getObjectSummaryByPath: (path: string[], key: string) => string;
  getArrayFieldTextByPath: (path: string[], key: string) => string;
  onArrayTextChangeByPath: (path: string[], key: string, value: string) => void;
  validateArrayByPath: (path: string[], key: string) => void;
  isPathExpanded: (path: string[]) => boolean;
  togglePathExpanded: (path: string[]) => void;
}

interface RemoveFieldPayload {
  path: string[];
  key: string;
}

interface DragStartPayload {
  path: string[];
  oldIndex?: number;
}

interface UpdateFieldKeyPayload {
  path: string[];
  oldKey: string;
  newKey: string;
}

interface UpdateFieldTypePayload {
  path: string[];
  key: string;
  type: FieldType;
}

const props = defineProps({
  path: {
    type: Array as PropType<string[]>,
    required: true,
  },
  depth: {
    type: Number,
    default: 0,
  },
  allowAdd: {
    type: Boolean,
    default: true,
  },
  allowDelete: {
    type: Boolean,
    default: true,
  },
  allowSort: {
    type: Boolean,
    default: true,
  },
  allowEditKey: {
    type: Boolean,
    default: true,
  },
  allowEditType: {
    type: Boolean,
    default: true,
  },
  hoveredPathKey: {
    type: String,
    default: "",
  },
  draggingPathKey: {
    type: String,
    default: "",
  },
  api: {
    type: Object as PropType<JsonTreeEditorApi>,
    required: true,
  },
  newFieldKeys: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});

const emit = defineEmits<{
  (e: "hover-change", pathKey: string): void;
  (e: "request-add-field", path: string[]): void;
  (e: "remove-field", payload: RemoveFieldPayload): void;
  (e: "drag-start", payload: DragStartPayload): void;
  (e: "drag-end"): void;
  (e: "update-field-key", payload: UpdateFieldKeyPayload): void;
  (e: "update-field-type", payload: UpdateFieldTypePayload): void;
}>();

const fieldTypeOptions: Array<{ label: string; value: FieldType }> = [
  { label: "文本", value: "string" },
  { label: "数字", value: "number" },
  { label: "布尔", value: "boolean" },
  { label: "标签", value: "tags" },
  { label: "数组", value: "array" },
  { label: "对象", value: "object" },
];

const currentObject = computed<JsonObject | null>(() =>
  props.api.getObjectByPath(props.path),
);

const fieldOrder = computed<string[]>({
  get: () => props.api.getFieldOrderByPath(props.path),
  set: (order) => props.api.setFieldOrderByPath(props.path, order),
});

function getFieldItemKey(key: string): string {
  return key;
}

function getFieldPath(key: string): string[] {
  return props.api.getFieldPath(props.path, key);
}

function getFieldPathKey(key: string): string {
  return props.api.getFieldPathKey(props.path, key);
}

function isObjectField(key: string): boolean {
  return props.api.getFieldTypeByPath(props.path, key) === "object";
}

function isFieldExpanded(key: string): boolean {
  return props.api.isPathExpanded(getFieldPath(key));
}

function toggleFieldExpand(key: string) {
  props.api.togglePathExpanded(getFieldPath(key));
}

function isNewField(key: string): boolean {
  return props.newFieldKeys.includes(getFieldPathKey(key));
}

function removeField(key: string) {
  emit("remove-field", {
    path: [...props.path],
    key,
  });
}

function requestAddField() {
  emit("request-add-field", [...props.path]);
}

function handleHover(pathKey: string) {
  emit("hover-change", pathKey);
}

function handleDragStart(event: { oldIndex?: number }) {
  emit("drag-start", {
    path: [...props.path],
    oldIndex: event.oldIndex,
  });
}

function handleDragEnd() {
  emit("drag-end");
}

function handleKeyChange(oldKey: string, newKey: string) {
  const trimmedKey = newKey.trim();
  if (trimmedKey && trimmedKey !== oldKey) {
    emit("update-field-key", {
      path: [...props.path],
      oldKey,
      newKey: trimmedKey,
    });
  }
}

function handleTypeChange(key: string, type: FieldType) {
  emit("update-field-type", {
    path: [...props.path],
    key,
    type,
  });
}
</script>

<style scoped lang="scss">
.field-tree-level {
  display: flex;
  flex-direction: column;
}

.field-list {
  display: flex;
  flex-direction: column;
}

.field-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
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

  &.is-new-field {
    background: var(--color-primary-bg);
    border-left: 3px solid var(--color-primary);
  }
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 32px;
  cursor: grab;
  color: var(--color-text-quaternary);
  flex-shrink: 0;

  &:active {
    cursor: grabbing;
  }
}

.expand-toggle,
.expand-placeholder {
  width: 22px;
  height: 32px;
  min-width: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
}

.expand-placeholder {
  display: flex;
}

.field-label-section {
  width: 140px;
  flex-shrink: 0;

  .field-label {
    font-weight: 500;
    font-size: 13px;
    color: var(--color-text-primary);
    line-height: 32px;
  }

  .field-key-hint {
    font-size: 11px;
    color: var(--color-text-tertiary);
    line-height: 1.3;
    margin-top: 2px;
    word-break: break-all;
  }

  .field-key-input {
    font-size: 13px;
    font-weight: 500;

    &.is-new {
      border-color: var(--color-primary);
      background: var(--color-bg-container);
    }
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
    height: 32px;
  }

  .switch-label {
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  .object-field-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 32px;
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
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
  flex-shrink: 0;

  &.is-visible {
    opacity: 1;
  }

  :deep(.ant-btn) {
    padding: 0 6px;
    height: 32px;
    font-size: 11px;
  }

  .type-selector {
    width: 90px;
  }
}

.add-field-section {
  padding: 10px 12px 12px;
  border-bottom: 1px solid var(--color-border-secondary);

  .add-field-btn {
    border-style: dashed;

    &:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }
  }
}

@media (max-width: 768px) {
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
</style>
