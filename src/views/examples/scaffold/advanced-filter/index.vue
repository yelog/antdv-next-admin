<template>
  <div class="page-container">
    <div class="card">
      <h2>{{ $t('examples.scaffold.advancedFilter.title') }}</h2>
      <p class="text-secondary mb-lg">{{ $t('examples.scaffold.advancedFilter.description') }}</p>

      <a-alert
        class="mb-lg"
        type="info"
        show-icon
        :message="$t('examples.scaffold.advancedFilter.tips')"
      />

      <div class="toolbar">
        <a-space wrap>
          <a-radio-group v-model:value="relation" button-style="solid">
            <a-radio-button value="AND">AND</a-radio-button>
            <a-radio-button value="OR">OR</a-radio-button>
          </a-radio-group>
          <a-button type="dashed" @click="addCondition">
            <PlusOutlined />
            {{ $t('examples.scaffold.advancedFilter.addCondition') }}
          </a-button>
          <a-button @click="resetConditions">{{ $t('common.reset') }}</a-button>
          <a-button type="primary" :disabled="conditions.length === 0" @click="openSaveModal">
            {{ $t('examples.scaffold.advancedFilter.saveScheme') }}
          </a-button>
        </a-space>
        <div class="text-secondary">
          {{ $t('examples.scaffold.advancedFilter.matchedCount', { count: filteredRows.length }) }}
        </div>
      </div>

      <div class="condition-list">
        <div v-if="conditions.length === 0" class="condition-empty">
          <a-empty :description="$t('examples.scaffold.advancedFilter.emptyConditions')" />
        </div>

        <div
          v-for="(condition, index) in conditions"
          :key="condition.id"
          class="condition-row"
        >
          <div class="condition-index">{{ index + 1 }}</div>

          <a-select
            class="field-select"
            :value="condition.field"
            :options="fieldOptions"
            @change="(field) => onFieldChange(condition, field as FieldKey)"
          />

          <a-select
            class="operator-select"
            :value="condition.operator"
            :options="getOperatorOptions(condition.field)"
            @change="(operator) => onOperatorChange(condition, operator as Operator)"
          />

          <div class="value-editor">
            <template v-if="isSelectField(condition.field)">
              <a-select
                v-if="condition.operator === 'in'"
                v-model:value="condition.value"
                mode="multiple"
                :placeholder="getValuePlaceholder(condition)"
                :options="getSelectOptions(condition.field)"
              />
              <a-select
                v-else
                v-model:value="condition.value"
                :placeholder="getValuePlaceholder(condition)"
                :options="getSelectOptions(condition.field)"
              />
            </template>

            <template v-else-if="isNumberField(condition.field)">
              <a-input-number
                v-model:value="condition.value"
                class="value-number"
                :placeholder="getValuePlaceholder(condition)"
              />
              <a-input-number
                v-if="condition.operator === 'between'"
                v-model:value="condition.value2"
                class="value-number"
                :placeholder="$t('examples.scaffold.advancedFilter.secondValue')"
              />
            </template>

            <template v-else>
              <a-input
                v-model:value="condition.value"
                :placeholder="getValuePlaceholder(condition)"
              />
              <a-input
                v-if="condition.operator === 'between'"
                v-model:value="condition.value2"
                :placeholder="$t('examples.scaffold.advancedFilter.secondValue')"
              />
            </template>
          </div>

          <a-button
            type="text"
            danger
            class="remove-btn"
            @click="removeCondition(condition.id)"
          >
            <DeleteOutlined />
          </a-button>
        </div>
      </div>

      <div class="scheme-bar">
        <a-space wrap>
          <span class="text-secondary">{{ $t('examples.scaffold.advancedFilter.savedSchemes') }}</span>
          <a-tag v-if="savedSchemes.length === 0">
            {{ $t('examples.scaffold.advancedFilter.noSchemes') }}
          </a-tag>
          <a-tag
            v-for="scheme in savedSchemes"
            :key="scheme.id"
            :color="activeSchemeId === scheme.id ? 'processing' : undefined"
            closable
            class="scheme-tag"
            @click="applyScheme(scheme.id)"
            @close="removeScheme(scheme.id)"
          >
            {{ scheme.name }}
          </a-tag>
        </a-space>
      </div>

      <a-divider />

      <a-table
        row-key="id"
        size="small"
        :columns="columns"
        :data-source="previewRows"
        :pagination="false"
      />
    </div>

    <a-modal
      v-model:open="saveModalOpen"
      :title="$t('examples.scaffold.advancedFilter.saveScheme')"
      :ok-text="$t('common.confirm')"
      :cancel-text="$t('common.cancel')"
      @ok="saveCurrentScheme"
    >
      <a-input
        v-model:value="schemeName"
        :maxlength="30"
        :placeholder="$t('examples.scaffold.advancedFilter.schemeNamePlaceholder')"
        @press-enter="saveCurrentScheme"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { DeleteOutlined, PlusOutlined } from '@antdv-next/icons'
import { message } from 'antdv-next'
import { $t } from '@/locales'

type Relation = 'AND' | 'OR'
type FieldKey = 'username' | 'status' | 'role' | 'score' | 'createdAt'
type FieldType = 'string' | 'select' | 'number' | 'date'
type Operator =
  | 'contains'
  | 'equals'
  | 'notEquals'
  | 'in'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'before'
  | 'after'

interface Condition {
  id: string
  field: FieldKey
  operator: Operator
  value: string | number | string[] | null
  value2?: string | number | null
}

interface SavedScheme {
  id: string
  name: string
  relation: Relation
  conditions: Condition[]
}

interface DemoRow {
  id: string
  username: string
  status: 'active' | 'inactive' | 'pending'
  role: 'admin' | 'operator' | 'auditor'
  score: number
  createdAt: string
}

interface FieldConfig {
  type: FieldType
  options?: Array<{ label: string; value: string }>
}

const FIELD_CONFIG: Record<FieldKey, FieldConfig> = {
  username: { type: 'string' },
  status: {
    type: 'select',
    options: [
      { label: $t('examples.scaffold.advancedFilter.statusActive'), value: 'active' },
      { label: $t('examples.scaffold.advancedFilter.statusInactive'), value: 'inactive' },
      { label: $t('examples.scaffold.advancedFilter.statusPending'), value: 'pending' }
    ]
  },
  role: {
    type: 'select',
    options: [
      { label: $t('examples.scaffold.advancedFilter.adminRole'), value: 'admin' },
      { label: $t('examples.scaffold.advancedFilter.operatorRole'), value: 'operator' },
      { label: $t('examples.scaffold.advancedFilter.auditorRole'), value: 'auditor' }
    ]
  },
  score: { type: 'number' },
  createdAt: { type: 'date' }
}

const OPERATOR_MAP: Record<FieldType, Operator[]> = {
  string: ['contains', 'equals', 'notEquals'],
  select: ['equals', 'notEquals', 'in'],
  number: ['equals', 'gt', 'gte', 'lt', 'lte', 'between'],
  date: ['equals', 'before', 'after', 'between']
}

const relation = ref<Relation>('AND')
const conditions = ref<Condition[]>([createCondition('username')])
const savedSchemes = ref<SavedScheme[]>([])
const activeSchemeId = ref('')

const saveModalOpen = ref(false)
const schemeName = ref('')

const allRows = ref<DemoRow[]>(createRows())

const fieldOptions = computed(() => [
  { label: $t('user.username'), value: 'username' },
  { label: $t('common.status'), value: 'status' },
  { label: $t('menu.role'), value: 'role' },
  { label: $t('examples.scaffold.advancedFilter.score'), value: 'score' },
  { label: $t('common.createTime'), value: 'createdAt' }
])

const columns = computed(() => [
  { title: 'ID', dataIndex: 'id', width: 120 },
  { title: $t('user.username'), dataIndex: 'username', width: 180 },
  { title: $t('common.status'), dataIndex: 'status', width: 120 },
  { title: $t('menu.role'), dataIndex: 'role', width: 120 },
  { title: $t('examples.scaffold.advancedFilter.score'), dataIndex: 'score', width: 120 },
  { title: $t('common.createTime'), dataIndex: 'createdAt', width: 180 }
])

const filteredRows = computed(() => {
  const activeConditions = conditions.value.filter(hasValue)
  if (activeConditions.length === 0) {
    return allRows.value
  }

  return allRows.value.filter((row) => {
    if (relation.value === 'AND') {
      return activeConditions.every(condition => evaluateCondition(row, condition))
    }
    return activeConditions.some(condition => evaluateCondition(row, condition))
  })
})

const previewRows = computed(() => filteredRows.value.slice(0, 30))

function createRows() {
  const statusList: DemoRow['status'][] = ['active', 'inactive', 'pending']
  const roleList: DemoRow['role'][] = ['admin', 'operator', 'auditor']

  return Array.from({ length: 180 }, (_, index) => {
    const i = index + 1
    const day = String((i % 28) + 1).padStart(2, '0')
    const month = String((i % 12) + 1).padStart(2, '0')

    return {
      id: `U${String(i).padStart(4, '0')}`,
      username: `user_${String(i).padStart(4, '0')}`,
      status: statusList[i % statusList.length],
      role: roleList[i % roleList.length],
      score: 50 + (i % 50),
      createdAt: `2025-${month}-${day}`
    }
  })
}

function createCondition(field: FieldKey): Condition {
  const type = FIELD_CONFIG[field].type
  const operator = OPERATOR_MAP[type][0]

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    field,
    operator,
    value: type === 'number' ? 0 : ''
  }
}

function isSelectField(field: FieldKey) {
  return FIELD_CONFIG[field].type === 'select'
}

function isNumberField(field: FieldKey) {
  return FIELD_CONFIG[field].type === 'number'
}

function getSelectOptions(field: FieldKey) {
  return FIELD_CONFIG[field].options || []
}

function getOperatorOptions(field: FieldKey) {
  const type = FIELD_CONFIG[field].type
  return OPERATOR_MAP[type].map(operator => ({
    label: getOperatorLabel(operator),
    value: operator
  }))
}

function getOperatorLabel(operator: Operator) {
  const map: Record<Operator, string> = {
    contains: $t('examples.scaffold.advancedFilter.opContains'),
    equals: $t('examples.scaffold.advancedFilter.opEquals'),
    notEquals: $t('examples.scaffold.advancedFilter.opNotEquals'),
    in: $t('examples.scaffold.advancedFilter.opIn'),
    gt: $t('examples.scaffold.advancedFilter.opGt'),
    gte: $t('examples.scaffold.advancedFilter.opGte'),
    lt: $t('examples.scaffold.advancedFilter.opLt'),
    lte: $t('examples.scaffold.advancedFilter.opLte'),
    between: $t('examples.scaffold.advancedFilter.opBetween'),
    before: $t('examples.scaffold.advancedFilter.opBefore'),
    after: $t('examples.scaffold.advancedFilter.opAfter')
  }

  return map[operator]
}

function getValuePlaceholder(condition: Condition) {
  if (condition.field === 'createdAt') {
    return 'YYYY-MM-DD'
  }
  if (isSelectField(condition.field)) {
    return $t('examples.scaffold.advancedFilter.selectValue')
  }
  return $t('examples.scaffold.advancedFilter.inputValue')
}

function onFieldChange(condition: Condition, field: FieldKey) {
  condition.field = field
  const type = FIELD_CONFIG[field].type
  condition.operator = OPERATOR_MAP[type][0]
  condition.value = type === 'number' ? 0 : ''
  condition.value2 = null
}

function onOperatorChange(condition: Condition, operator: Operator) {
  condition.operator = operator
  condition.value2 = null

  if (operator === 'in') {
    condition.value = Array.isArray(condition.value) ? condition.value : []
    return
  }

  if (Array.isArray(condition.value)) {
    condition.value = condition.value[0] || ''
  }
}

function hasValue(condition: Condition) {
  if (condition.operator === 'between') {
    return condition.value !== '' && condition.value !== null
      && condition.value2 !== '' && condition.value2 !== null
  }

  if (condition.operator === 'in') {
    return Array.isArray(condition.value) && condition.value.length > 0
  }

  return condition.value !== '' && condition.value !== null
}

function evaluateCondition(row: DemoRow, condition: Condition) {
  const rowValue = row[condition.field]
  const target = condition.value

  switch (condition.operator) {
    case 'contains':
      return String(rowValue).toLowerCase().includes(String(target).toLowerCase())
    case 'equals':
      return String(rowValue) === String(target)
    case 'notEquals':
      return String(rowValue) !== String(target)
    case 'in':
      return Array.isArray(target) && target.includes(String(rowValue))
    case 'gt':
      return Number(rowValue) > Number(target)
    case 'gte':
      return Number(rowValue) >= Number(target)
    case 'lt':
      return Number(rowValue) < Number(target)
    case 'lte':
      return Number(rowValue) <= Number(target)
    case 'between':
      return String(rowValue) >= String(target) && String(rowValue) <= String(condition.value2)
    case 'before':
      return String(rowValue) < String(target)
    case 'after':
      return String(rowValue) > String(target)
    default:
      return true
  }
}

function addCondition() {
  conditions.value.push(createCondition('username'))
}

function removeCondition(id: string) {
  conditions.value = conditions.value.filter(item => item.id !== id)
  if (conditions.value.length === 0) {
    conditions.value = [createCondition('username')]
  }
}

function resetConditions() {
  relation.value = 'AND'
  activeSchemeId.value = ''
  conditions.value = [createCondition('username')]
}

function openSaveModal() {
  schemeName.value = ''
  saveModalOpen.value = true
}

function saveCurrentScheme() {
  const name = schemeName.value.trim()
  if (!name) {
    message.warning($t('examples.scaffold.advancedFilter.schemeNameRequired'))
    return
  }

  const newScheme: SavedScheme = {
    id: `${Date.now()}`,
    name,
    relation: relation.value,
    conditions: JSON.parse(JSON.stringify(conditions.value))
  }

  savedSchemes.value = [newScheme, ...savedSchemes.value]
  activeSchemeId.value = newScheme.id
  saveModalOpen.value = false
  message.success($t('examples.scaffold.advancedFilter.saveSuccess'))
}

function applyScheme(id: string) {
  const scheme = savedSchemes.value.find(item => item.id === id)
  if (!scheme) {
    return
  }

  relation.value = scheme.relation
  conditions.value = JSON.parse(JSON.stringify(scheme.conditions))
  activeSchemeId.value = id
}

function removeScheme(id: string) {
  savedSchemes.value = savedSchemes.value.filter(item => item.id !== id)
  if (activeSchemeId.value === id) {
    activeSchemeId.value = ''
  }
}
</script>

<style scoped lang="scss">
.mb-lg {
  margin-bottom: var(--spacing-lg);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: var(--spacing-md);
}

.condition-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.condition-empty {
  padding: 24px 0;
}

.condition-row {
  display: grid;
  grid-template-columns: 32px 170px 170px 1fr 36px;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  background: var(--color-bg-layout);
}

.condition-index {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.value-editor {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.value-number {
  width: 100%;
}

.remove-btn {
  justify-self: end;
}

.scheme-bar {
  margin-top: 12px;
}

.scheme-tag {
  cursor: pointer;
}

@media (max-width: 992px) {
  .condition-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .condition-index {
    display: none;
  }

  .remove-btn {
    justify-self: start;
    padding-left: 0;
  }
}
</style>
