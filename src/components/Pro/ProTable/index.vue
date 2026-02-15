<template>
  <div
    ref="proTableRef"
    class="pro-table"
    :style="tableRootStyle"
  >
    <!-- Search Form -->
    <div v-if="showSearchForm" ref="searchRef" class="pro-table-search">
      <a-form
        :model="searchForm"
        :label-col="{ span: searchLabelWidth }"
        class="search-form"
      >
        <a-row :gutter="16">
          <a-col
            v-for="col in visibleSearchColumns"
            :key="col.dataIndex"
            :xs="24"
            :sm="12"
            :lg="8"
          >
            <a-form-item :label="col.title" :name="col.dataIndex">
              <a-input
                v-if="resolveSearchType(col) === 'input'"
                v-model:value="searchForm[col.dataIndex]"
                :placeholder="buildEnterPlaceholder(col.title)"
                v-bind="col.searchProps"
              />

              <a-select
                v-else-if="resolveSearchType(col) === 'select'"
                v-model:value="searchForm[col.dataIndex]"
                :placeholder="buildSelectPlaceholder(col.title)"
                :options="resolveSearchOptions(col)"
                v-bind="col.searchProps"
              />

              <a-input-number
                v-else-if="resolveSearchType(col) === 'number'"
                v-model:value="searchForm[col.dataIndex]"
                :placeholder="buildEnterPlaceholder(col.title)"
                style="width: 100%"
                v-bind="col.searchProps"
              />

              <a-date-picker
                v-else-if="resolveSearchType(col) === 'datePicker'"
                v-model:value="searchForm[col.dataIndex]"
                :placeholder="buildSelectPlaceholder(col.title)"
                style="width: 100%"
                v-bind="col.searchProps"
              />

              <a-range-picker
                v-else-if="resolveSearchType(col) === 'dateRange'"
                v-model:value="searchForm[col.dataIndex]"
                style="width: 100%"
                v-bind="col.searchProps"
              />
            </a-form-item>
          </a-col>

          <a-col :xs="24" :sm="12" :lg="8" class="search-actions">
            <a-form-item :wrapper-col="{ span: 24 }" class="search-actions-item">
              <a-space wrap :size="[8, 8]" class="search-actions-space">
                <a-button type="primary" @click="handleSearch">
                  <SearchOutlined /> {{ $t('common.search') }}
                </a-button>
                <a-button @click="handleReset">
                  <ReloadOutlined /> {{ $t('common.reset') }}
                </a-button>
                <a-button
                  v-if="showSearchCollapseToggle"
                  type="link"
                  @click="searchCollapsed = !searchCollapsed"
                >
                  {{ searchCollapsed ? $t('common.expand') : $t('common.collapse') }}
                  <DownOutlined :class="{ 'rotate-180': !searchCollapsed }" />
                </a-button>
              </a-space>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- Table -->
    <div
      ref="tableSectionRef"
      class="pro-table-main"
      :class="{
        'main-scroll-mode': !effectiveFixedHeader && !isAutoHeight,
        'main-fill-mode': effectiveFixedHeader || isAutoHeight,
        'no-vertical-scrollbar': isFillMode && !shouldUseVerticalScroll
      }"
    >
      <a-table
        :components="tableComponents"
        :columns="tableColumns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="paginationConfig"
        :size="tableSize"
        :row-key="rowKey"
        :bordered="effectiveBordered"
        :sticky="effectiveFixedHeader"
        :scroll="tableScroll"
        v-bind="$attrs"
        @change="handleTableChange"
      >
        <template v-if="toolbar" #title>
          <div ref="toolbarRef" class="pro-table-toolbar">
            <div class="toolbar-left">
              <span v-if="toolbar.title" class="toolbar-title">{{ toolbar.title }}</span>
              <span v-if="toolbar.subTitle" class="toolbar-subtitle">{{ toolbar.subTitle }}</span>
            </div>
            <div class="toolbar-right">
              <slot name="toolbar-actions"></slot>
              <a-space :size="4">
                <a-tooltip v-if="showRefreshAction" :title="$t('common.refresh')">
                  <a-button type="text" class="toolbar-icon-btn" @click="handleRefresh">
                    <ReloadOutlined />
                  </a-button>
                </a-tooltip>

                <a-dropdown
                  v-if="showDensityAction"
                  placement="bottomRight"
                  :menu="densityMenuProps"
                  :trigger="['click']"
                >
                  <a-tooltip :title="$t('proTable.density')">
                    <a-button type="text" class="toolbar-icon-btn">
                      <ColumnHeightOutlined />
                    </a-button>
                  </a-tooltip>
                </a-dropdown>

                <a-popover
                  v-if="showColumnSettingAction"
                  trigger="click"
                  placement="bottomRight"
                >
                  <template #content>
                    <div class="column-setting-dropdown" @click.stop>
                      <div class="setting-actions">
                        <a-button size="small" type="link" @click.stop="handleToggleAllColumns">
                          {{ $t('proTable.checkAll') }}
                        </a-button>
                        <a-button size="small" type="link" class="reset-btn" @click.stop="handleResetColumns">
                          {{ $t('common.reset') }}
                        </a-button>
                      </div>

                      <div class="setting-list">
                        <div class="setting-item index-column-item">
                          <div class="setting-item-left">
                            <span class="drag-handle" style="opacity: 0; pointer-events: none;">::</span>
                            <a-checkbox
                              :checked="showIndexColumn"
                              @change="toggleIndexColumn"
                            >
                              {{ $t('proTable.indexColumn') }}
                            </a-checkbox>
                          </div>
                        </div>
                        <div
                          v-for="state in columnStates"
                          :key="state.key"
                          class="setting-item"
                          :class="{ dragging: draggingColumnKey === state.key }"
                          draggable="true"
                          @dragstart="handleDragStart(state.key)"
                          @dragend="handleDragEnd"
                          @dragover.prevent
                          @drop.prevent="handleDrop(state.key)"
                        >
                          <div class="setting-item-left">
                            <span class="drag-handle">::</span>
                            <a-checkbox
                              :checked="state.checked"
                              @change="handleColumnCheckedChange(state.key, $event)"
                            >
                              {{ state.title }}
                            </a-checkbox>
                          </div>
                          <div class="setting-item-right">
                            <a-tooltip :title="$t('proTable.fixLeft')">
                              <a-button
                                type="text"
                                size="small"
                                class="fixed-btn"
                                :class="{ active: state.fixed === 'left' }"
                                @click.stop="toggleColumnFixed(state.key, 'left')"
                              >
                                <VerticalLeftOutlined />
                              </a-button>
                            </a-tooltip>
                            <a-tooltip :title="$t('proTable.fixRight')">
                              <a-button
                                type="text"
                                size="small"
                                class="fixed-btn"
                                :class="{ active: state.fixed === 'right' }"
                                @click.stop="toggleColumnFixed(state.key, 'right')"
                              >
                                <VerticalRightOutlined />
                              </a-button>
                            </a-tooltip>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <a-button type="text" class="toolbar-icon-btn">
                    <SettingOutlined />
                  </a-button>
                </a-popover>
              </a-space>
            </div>
          </div>
        </template>

        <template v-if="$slots.filterIcon || hasBuiltInHeaderFilter" #filterIcon="slotProps">
          <template v-if="shouldRenderBuiltInFilterIcon(slotProps.column)">
            <SearchOutlined
              v-if="getBuiltInFilterIconType(slotProps.column) === 'search'"
              :style="{ color: slotProps.filtered ? '#1677ff' : undefined }"
            />
            <FilterFilled
              v-else
              :style="{ color: slotProps.filtered ? '#1677ff' : undefined }"
            />
          </template>
          <slot v-else-if="$slots.filterIcon" name="filterIcon" v-bind="slotProps" />
        </template>

        <template v-if="$slots.filterDropdown || hasBuiltInKeywordHeaderFilter" #filterDropdown="slotProps">
          <template v-if="isBuiltInKeywordFilterColumn(slotProps.column)">
            <div class="pro-table-keyword-filter-panel" @keydown.stop>
              <div class="pro-table-keyword-filter-field">
                <a-input
                  class="pro-table-keyword-filter-input"
                  allow-clear
                  :placeholder="getBuiltInKeywordFilterPlaceholder(slotProps.column)"
                  :value="getBuiltInKeywordFilterValue(slotProps.selectedKeys)"
                  @update:value="handleBuiltInKeywordInput($event, slotProps.setSelectedKeys)"
                  @keydown.enter="handleBuiltInKeywordSearch(slotProps.confirm)"
                />
              </div>
              <div class="pro-table-keyword-filter-actions">
                <a-button
                  type="primary"
                  class="pro-table-keyword-filter-btn"
                  @click="handleBuiltInKeywordSearch(slotProps.confirm)"
                >
                  {{ $t('common.search') }}
                </a-button>
                <a-button
                  class="pro-table-keyword-filter-btn"
                  @click="handleBuiltInKeywordReset(slotProps.setSelectedKeys, slotProps.clearFilters, slotProps.confirm)"
                >
                  {{ $t('common.reset') }}
                </a-button>
              </div>
            </div>
          </template>
          <slot v-else-if="$slots.filterDropdown" name="filterDropdown" v-bind="slotProps" />
        </template>

        <template #bodyCell="{ column, record, text, index }">
          <template v-if="column.dataIndex === '__index'">
            {{ getRowIndex(index) }}
          </template>

          <template v-else-if="column.dataIndex === 'action'">
            <a-space class="row-action-group" :size="4">
              <template v-for="(action, idx) in column.actions" :key="idx">
                <a-button
                  v-if="!action.hidden?.(record)"
                  :type="action.type || 'link'"
                  :danger="action.danger"
                  :disabled="action.disabled?.(record)"
                  size="small"
                  class="table-action-btn"
                  @click="handleAction(action, record)"
                >
                  <component :is="action.icon" v-if="action.icon" />
                  {{ action.label }}
                </a-button>
              </template>
            </a-space>
          </template>

          <template v-else-if="$slots.bodyCell">
            <slot name="bodyCell" :column="column" :record="record" :text="text" :index="index" />
          </template>

          <template v-else-if="column.valueType">
            <ValueTypeRender
              :value="text"
              :type="column.valueType"
              :enum="resolveValueEnum(column)"
              :record="record"
            />
          </template>
        </template>
      </a-table>
    </div>

    <!-- Built-in CRUD Modal -->
    <ProModal
      v-if="formItems && formItems.length > 0"
      v-model:open="crudModalOpen"
      :title="crudModalTitle"
      :width="formModalWidth"
      @ok="handleCrudSubmit"
    >
      <ProForm
        ref="crudFormRef"
        :form-items="formItems"
        :initial-values="crudFormInitialValues"
        :layout="formLayout"
        :grid="formGrid"
      />
    </ProModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, h, defineComponent } from 'vue'
import type { PropType } from 'vue'
import {
  ReloadOutlined,
  SettingOutlined,
  SearchOutlined,
  FilterFilled,
  DownOutlined,
  ColumnHeightOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined
} from '@antdv-next/icons'
import { message, Modal } from 'antdv-next'
import ValueTypeRender from './ValueTypeRender.vue'
import ProModal from '../ProModal/index.vue'
import ProForm from '../ProForm/index.vue'
import { appDefaultSettings } from '@/settings'
import { $t } from '@/locales'
import type {
  ProTableColumn,
  ProTableToolbar,
  ProTableSearch,
  ProTablePagination,
  ProTableRequest,
  ProTableAction,
  ProTableHeaderFilter,
  HeaderFilterMode,
  ProTableHeaderFilterConfig,
  SearchType,
  ProFormItem,
  ProFormLayout,
  ProFormGrid
} from '@/types/pro'
import type { ProTableDensity, ProTableHeight } from '@/settings'

interface Props {
  columns: ProTableColumn[]
  request: ProTableRequest
  toolbar?: ProTableToolbar
  search?: ProTableSearch | false
  headerFilter?: ProTableHeaderFilterConfig
  pagination?: ProTablePagination | false
  rowKey?: string | ((record: any) => string)
  size?: ProTableDensity
  height?: ProTableHeight
  resizable?: boolean
  columnResizable?: boolean
  ellipsis?: boolean
  bordered?: boolean
  fixedHeader?: boolean
  // Built-in CRUD modal
  formItems?: ProFormItem[]
  formGrid?: ProFormGrid
  formLayout?: ProFormLayout
  formModalWidth?: number | string
  formCreateTitle?: string
  formEditTitle?: string
}

interface ColumnState {
  key: string
  title: string
  checked: boolean
  fixed?: 'left' | 'right'
  defaultChecked: boolean
  defaultFixed?: 'left' | 'right'
  column: ProTableColumn
}

interface ResizeInfo {
  size: {
    width: number
  }
}

interface ResizableTitleProps {
  width?: number
  resizable?: boolean
  onResizeStart?: (event: MouseEvent, width: number) => void
  onResizeEnd?: (event: MouseEvent) => void
  onResize?: (event: MouseEvent, info: ResizeInfo) => void
}

type TableSize = 'large' | 'middle' | 'small'

const MIN_COLUMN_WIDTH = 40

const ResizableTitle = defineComponent({
  name: 'ResizableTitle',
  inheritAttrs: false,
  props: {
    width: Number,
    resizable: Boolean,
    onResizeStart: Function as PropType<ResizableTitleProps['onResizeStart']>,
    onResizeEnd: Function as PropType<ResizableTitleProps['onResizeEnd']>,
    onResize: Function as PropType<ResizableTitleProps['onResize']>
  },
  setup(props, { slots, attrs }) {
    const dragging = ref(false)
    let startX = 0
    let startWidth = 0

    const onMouseMove = (event: MouseEvent) => {
      if (!dragging.value || !props.onResize) {
        return
      }
      const nextWidth = Math.max(startWidth + event.clientX - startX, MIN_COLUMN_WIDTH)
      props.onResize(event, { size: { width: nextWidth } })
    }

    const onMouseUp = (event: MouseEvent) => {
      if (dragging.value) {
        props.onResizeEnd?.(event)
      }
      dragging.value = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    const onMouseDown = (event: MouseEvent) => {
      if (!props.onResize || !props.resizable) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      startWidth = props.width
        || (event.currentTarget as HTMLElement)?.parentElement?.getBoundingClientRect().width
        || 0
      props.onResizeStart?.(event, startWidth)
      dragging.value = true
      startX = event.clientX
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    })

    return () => {
      const width = props.width
      if (!props.resizable || !props.onResize) {
        return h('th', attrs, slots.default?.())
      }

      const style = width == null
        ? attrs.style
        : { ...(attrs.style as Record<string, any>), width: `${width}px` }

      return h(
        'th',
        {
          ...attrs,
          class: ['pro-table-resizable-title', attrs.class],
          style
        },
        [
          slots.default?.(),
          h('span', {
            class: 'pro-table-resizable-handle',
            onMousedown: onMouseDown
          })
        ]
      )
    }
  }
})

const props = withDefaults(defineProps<Props>(), {
  rowKey: 'id',
  size: appDefaultSettings.proTable.size,
  height: appDefaultSettings.proTable.height,
  resizable: appDefaultSettings.proTable.resizable,
  columnResizable: appDefaultSettings.proTable.columnResizable,
  ellipsis: appDefaultSettings.proTable.ellipsis,
  bordered: appDefaultSettings.proTable.bordered,
  fixedHeader: appDefaultSettings.proTable.fixedHeader,
  pagination: () => ({
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (value: number) => $t('proTable.total', { total: value })
  }),
  formModalWidth: 640
})

const emit = defineEmits(['refresh', 'form-submit'])

const normalizeDensity = (size: ProTableDensity | undefined): TableSize => {
  if (size === 'large' || size === 'middle' || size === 'small') {
    return size
  }
  return 'small'
}

const cloneColumnState = (state: ColumnState): ColumnState => ({
  ...state,
  column: { ...state.column }
})

const resolveColumnKey = (column: ProTableColumn, index: number) => {
  return String(column.key ?? column.dataIndex ?? `col_${index}`)
}

// Refs
const proTableRef = ref<HTMLElement>()
const toolbarRef = ref<HTMLElement>()
const searchRef = ref<HTMLElement>()
const tableSectionRef = ref<HTMLElement>()

// State
const dataSource = ref<any[]>([])
const loading = ref(false)
const searchForm = ref<Record<string, any>>({})
const searchCollapsed = ref(props.search !== false ? (props.search?.defaultCollapsed ?? true) : true)
const currentPage = ref(props.pagination !== false ? (props.pagination?.current || 1) : 1)
const pageSize = ref(props.pagination !== false ? (props.pagination?.pageSize || 10) : 10)
const total = ref(0)
const tableSize = ref<TableSize>(normalizeDensity(props.size))
const tableScrollY = ref<number>()
const shouldUseVerticalScroll = ref(false)
const tableViewportWidth = ref(0)
const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)
const tableFilters = ref<Record<string, any[] | null>>({})
const tableSorter = ref<any>(null)

const showIndexColumn = ref(true)
const defaultShowIndexColumn = ref(true)
const columnStates = ref<ColumnState[]>([])
const defaultColumnStates = ref<ColumnState[]>([])
const draggingColumnKey = ref('')
const isResizingColumn = ref(false)
const resizingColumnKey = ref<string | null>(null)
const widthsPreparedForCurrentDrag = ref(false)
const tableComponents = computed(() => {
  if (!effectiveColumnResizable.value) {
    return undefined
  }

  return {
    header: {
      cell: ResizableTitle
    }
  }
})

const normalizeHeaderFilterMode = (mode: HeaderFilterMode | undefined): HeaderFilterMode => {
  return mode ?? props.headerFilter?.defaultMode ?? 'server'
}

const isClientHeaderFilterMode = (mode: HeaderFilterMode) => {
  return mode === 'client' || mode === 'hybrid'
}

const isServerHeaderFilterMode = (mode: HeaderFilterMode) => {
  return mode === 'server' || mode === 'hybrid'
}

const normalizeSelectedFilterValues = (value: unknown): any[] => {
  if (Array.isArray(value)) {
    return value.filter(item => item !== undefined && item !== null && item !== '')
  }
  if (value === undefined || value === null || value === '') {
    return []
  }
  return [value]
}

const normalizeTableFilters = (filters: Record<string, any> | undefined) => {
  const normalized: Record<string, any[] | null> = {}
  if (!filters || typeof filters !== 'object') {
    return normalized
  }

  Object.keys(filters).forEach((key) => {
    const values = normalizeSelectedFilterValues(filters[key])
    normalized[key] = values.length > 0 ? values : null
  })

  return normalized
}

const splitKeywordTerms = (keyword: string) => {
  return keyword
    .trim()
    .split(/\s+/)
    .map(item => item.trim())
    .filter(Boolean)
}

const getColumnCellValue = (record: any, column: ProTableColumn) => {
  return record?.[String(column.dataIndex)]
}

// Computed
const toolbarActions = computed(() => props.toolbar?.actions || [])

const showRefreshAction = computed(() => {
  if (!props.toolbar) return true
  return !toolbarActions.value.includes('!refresh')
})

const showColumnSettingAction = computed(() => {
  if (!props.toolbar) return true
  return !toolbarActions.value.includes('!columnSetting')
})

const showDensityAction = computed(() => {
  if (!props.toolbar) return true
  return !toolbarActions.value.includes('!density')
})

const headerFilterEntries = computed(() => {
  const map = new Map<string, { key: string; column: ProTableColumn; headerFilter: ProTableHeaderFilter }>()

  columnStates.value.forEach((state, index) => {
    const column = state.column
    if (!column.headerFilter) {
      return
    }

    const key = resolveColumnKey(column, index)
    const entry = {
      key,
      column,
      headerFilter: column.headerFilter
    }

    map.set(key, entry)
    map.set(String(column.dataIndex), entry)

    if (column.key) {
      map.set(String(column.key), entry)
    }
  })

  return map
})

const hasBuiltInHeaderFilter = computed(() => {
  return headerFilterEntries.value.size > 0
})

const hasBuiltInKeywordHeaderFilter = computed(() => {
  return Array.from(headerFilterEntries.value.values())
    .some(entry => entry.headerFilter.type === 'keyword')
})

const effectiveResizable = computed(() => {
  return props.resizable ?? appDefaultSettings.proTable.resizable
})

const effectiveColumnResizable = computed(() => {
  return props.columnResizable ?? appDefaultSettings.proTable.columnResizable
})

const effectiveEllipsis = computed(() => {
  return props.ellipsis ?? appDefaultSettings.proTable.ellipsis
})

const effectiveBordered = computed(() => {
  return props.bordered ?? appDefaultSettings.proTable.bordered
})

const effectiveFixedHeader = computed(() => {
  return props.fixedHeader ?? appDefaultSettings.proTable.fixedHeader
})

const effectiveHeight = computed(() => {
  return props.height ?? appDefaultSettings.proTable.height
})

const isAutoHeight = computed(() => {
  return String(effectiveHeight.value) === 'auto'
})

const isFillMode = computed(() => {
  return isAutoHeight.value || effectiveFixedHeader.value
})

const tableRootStyle = computed<Record<string, string> | undefined>(() => {
  if (isAutoHeight.value) {
    return { height: '100%' }
  }

  const height = typeof effectiveHeight.value === 'number'
    ? `${effectiveHeight.value}px`
    : String(effectiveHeight.value)

  return { height }
})

const searchColumns = computed(() => {
  return props.columns.filter(col => col.search)
})

const showSearchForm = computed(() => {
  return props.search !== false && searchColumns.value.length > 0
})

const searchLabelWidth = computed(() => {
  if (props.search === false) return 6
  return props.search?.labelWidth || 6
})

const searchColumnsPerRow = computed(() => {
  if (viewportWidth.value >= 992) {
    return 3
  }
  if (viewportWidth.value >= 576) {
    return 2
  }
  return 1
})

const collapsedSearchRows = computed(() => {
  if (props.search === false) return 1
  const rows = Number(props.search?.collapsedRows ?? 1)
  if (!Number.isFinite(rows)) return 1
  return Math.max(1, Math.floor(rows))
})

const shouldReserveSearchActionSlot = computed(() => {
  return collapsedSearchRows.value === 1 || collapsedSearchRows.value > 2
})

const collapsedSearchFieldLimit = computed(() => {
  const totalSlots = collapsedSearchRows.value * searchColumnsPerRow.value
  if (shouldReserveSearchActionSlot.value) {
    return Math.max(1, totalSlots - 1)
  }
  return Math.max(1, totalSlots)
})

const showSearchCollapseToggle = computed(() => {
  return searchColumns.value.length > collapsedSearchFieldLimit.value
})

const visibleSearchColumns = computed(() => {
  if (searchCollapsed.value && showSearchCollapseToggle.value) {
    return searchColumns.value.slice(0, collapsedSearchFieldLimit.value)
  }
  return searchColumns.value
})

const paginationEnabled = computed(() => {
  return props.pagination !== false
})

const paginationConfig = computed(() => {
  if (!paginationEnabled.value) {
    return false
  }

  const pagination = props.pagination || {}

  return {
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (value: number) => $t('proTable.total', { total: value }),
    ...pagination,
    current: currentPage.value,
    pageSize: pageSize.value,
    total: total.value
  }
})

const displayColumns = computed<ProTableColumn[]>(() => {
  const columns = columnStates.value
    .filter(state => state.checked)
    .map(state => ({
      ...state.column,
      key: state.column.key || state.key,
      fixed: state.fixed,
      ellipsis: state.column.ellipsis ?? effectiveEllipsis.value,
      resizable: state.column.resizable ?? effectiveResizable.value
    }))

  if (!showIndexColumn.value) {
    return columns
  }

  return [
    {
      title: '#',
      dataIndex: '__index',
      key: '__index',
      width: 64,
      align: 'center',
      fixed: 'left',
      ellipsis: false,
      resizable: false
    },
    ...columns
  ]
})

const hasFixedColumns = computed(() => {
  return displayColumns.value.some(col => Boolean(col.fixed))
})

const parseColumnWidth = (width: unknown): number | null => {
  if (typeof width === 'number' && Number.isFinite(width)) {
    return width
  }

  if (typeof width !== 'string') {
    return null
  }

  const value = width.trim()
  if (!value) {
    return null
  }

  if (/^\d+(\.\d+)?$/.test(value)) {
    return Number.parseFloat(value)
  }

  if (value.endsWith('px')) {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

const collectVisibleHeaderWidths = () => {
  const section = tableSectionRef.value
  const widthMap = new Map<string, number>()
  if (!section) {
    return widthMap
  }

  const headerCells = section.querySelectorAll(
    '.ant-table-header thead th[data-pro-table-col-key]'
  ) as NodeListOf<HTMLElement>

  headerCells.forEach((cell) => {
    const key = cell.getAttribute('data-pro-table-col-key')
    if (!key) {
      return
    }

    const width = Math.max(MIN_COLUMN_WIDTH, Math.floor(cell.getBoundingClientRect().width))
    if (!Number.isFinite(width) || width <= 0) {
      return
    }

    const prev = widthMap.get(key)
    if (prev == null || width > prev) {
      widthMap.set(key, width)
    }
  })

  return widthMap
}

const ensureColumnWidthsBeforeResize = (activeKey: string, activeWidth: number) => {
  const measuredWidths = collectVisibleHeaderWidths()
  const activeMeasuredWidth = parseColumnWidth(activeWidth)
  let changed = false

  const nextStates = columnStates.value.map((state) => {
    const currentWidth = parseColumnWidth(state.column.width)
    if (currentWidth != null) {
      return state
    }

    const measuredWidth = state.key === activeKey
      ? (activeMeasuredWidth ?? measuredWidths.get(state.key))
      : measuredWidths.get(state.key)

    if (measuredWidth == null) {
      return state
    }

    changed = true
    return {
      ...state,
      column: {
        ...state.column,
        width: Math.max(MIN_COLUMN_WIDTH, Math.floor(measuredWidth))
      }
    }
  })

  if (changed) {
    columnStates.value = nextStates
    scheduleMeasureTable()
  }
}

const handleColumnWidthResizeStart = (key: string) => {
  return (_event: MouseEvent, width: number) => {
    isResizingColumn.value = true
    resizingColumnKey.value = key
    widthsPreparedForCurrentDrag.value = false
    if (!Number.isFinite(width) || width <= 0) {
      return
    }
    // 在拖拽开始时就准备好所有列的宽度，避免在鼠标移动时进行 DOM 查询
    ensureColumnWidthsBeforeResize(key, width)
    widthsPreparedForCurrentDrag.value = true
  }
}

const handleColumnWidthResizeEnd = (key: string) => {
  return (_event: MouseEvent) => {
    if (resizingColumnKey.value && resizingColumnKey.value !== key) {
      return
    }
    isResizingColumn.value = false
    resizingColumnKey.value = null
    widthsPreparedForCurrentDrag.value = false
    scheduleMeasureTable()
  }
}

const handleColumnWidthResize = (key: string) => {
  return (_event: MouseEvent, { size }: ResizeInfo) => {
    if (!isResizingColumn.value) {
      isResizingColumn.value = true
      resizingColumnKey.value = key
      widthsPreparedForCurrentDrag.value = false
    }

    const item = columnStates.value.find(state => state.key === key)
    if (!item) return

    item.column = {
      ...item.column,
      width: Math.max(MIN_COLUMN_WIDTH, Math.floor(size.width))
    }
  }
}

const columnTotalWidth = computed(() => {
  return displayColumns.value.reduce((sum, column) => {
    const width = parseColumnWidth((column as ProTableColumn).width)
    return width == null ? sum : sum + width
  }, 0)
})

const canMeasureColumnWidth = computed(() => {
  if (displayColumns.value.length === 0) {
    return false
  }
  return displayColumns.value.every(column => parseColumnWidth((column as ProTableColumn).width) != null)
})

const shouldUseHorizontalScroll = computed(() => {
  if (!hasFixedColumns.value) {
    return false
  }

  if (!canMeasureColumnWidth.value || tableViewportWidth.value <= 0) {
    return true
  }

  return columnTotalWidth.value > tableViewportWidth.value + 1
})

const applyKeywordClientFilter = (
  value: any,
  record: any,
  column: ProTableColumn,
  headerFilter: ProTableHeaderFilter
) => {
  if (typeof headerFilter.clientFilter === 'function') {
    return headerFilter.clientFilter(value, record, column)
  }

  const keyword = String(value ?? '').trim()
  if (!keyword) {
    return true
  }

  const rawText = String(getColumnCellValue(record, column) ?? '')
  const caseSensitive = Boolean(headerFilter.caseSensitive)
  const normalizedText = caseSensitive ? rawText : rawText.toLowerCase()
  const terms = splitKeywordTerms(keyword).map(item => (caseSensitive ? item : item.toLowerCase()))

  if (terms.length === 0) {
    return true
  }

  const matchAll = headerFilter.matchAllKeywords !== false
  if (matchAll) {
    return terms.every(term => normalizedText.includes(term))
  }

  return terms.some(term => normalizedText.includes(term))
}

const applySelectClientFilter = (
  value: any,
  record: any,
  column: ProTableColumn,
  headerFilter: ProTableHeaderFilter
) => {
  if (typeof headerFilter.clientFilter === 'function') {
    return headerFilter.clientFilter(value, record, column)
  }

  const cellValue = getColumnCellValue(record, column)
  if (Array.isArray(cellValue)) {
    return cellValue.map(item => String(item)).includes(String(value))
  }

  return String(cellValue ?? '') === String(value ?? '')
}

const tableColumns = computed(() => {
  const sourceColumns = shouldUseHorizontalScroll.value
    ? displayColumns.value
    : displayColumns.value.map(column => ({
      ...column,
      fixed: undefined
    }))

  return sourceColumns.map((column, index) => {
    const key = resolveColumnKey(column, index)
    const width = parseColumnWidth(column.width)
    const canResize = Boolean(
      effectiveColumnResizable.value &&
      (column.resizable ?? effectiveResizable.value)
    )
    const headerFilter = column.headerFilter
    const headerFilterMode = normalizeHeaderFilterMode(headerFilter?.mode)
    const selectedValues = normalizeSelectedFilterValues(
      tableFilters.value[key]
      ?? tableFilters.value[String(column.dataIndex)]
      ?? (column.key ? tableFilters.value[String(column.key)] : undefined)
    )
    const currentFilterIconType = headerFilter?.icon ?? (headerFilter?.type === 'keyword' ? 'search' : 'filter')

    const enhancedColumn: Record<string, any> = {
      ...column
    }

    if (headerFilter) {
      enhancedColumn.__proHeaderFilter = headerFilter
      enhancedColumn.__proHeaderFilterKey = key
      enhancedColumn.filteredValue = selectedValues.length > 0 ? selectedValues : null
      enhancedColumn.filterIcon = enhancedColumn.filterIcon ?? ((filtered: boolean) => {
        const IconComp = currentFilterIconType === 'search' ? SearchOutlined : FilterFilled
        return h(IconComp, { style: { color: filtered ? '#1677ff' : undefined } })
      })

      if (headerFilter.type === 'keyword') {
        enhancedColumn.filterDropdown = enhancedColumn.filterDropdown ?? (() => null)
        if (!enhancedColumn.customFilterDropdown) {
          enhancedColumn.customFilterDropdown = true
        }
        if (isClientHeaderFilterMode(headerFilterMode) && typeof enhancedColumn.onFilter !== 'function') {
          enhancedColumn.onFilter = (value: any, record: any) =>
            applyKeywordClientFilter(value, record, column, headerFilter)
        }
      }

      if (headerFilter.type === 'select') {
        if (!Array.isArray(enhancedColumn.filters) || enhancedColumn.filters.length === 0) {
          enhancedColumn.filters = (headerFilter.options ?? []).map(item => ({
            text: item.label,
            value: item.value
          }))
        }
        if (enhancedColumn.filterMultiple === undefined) {
          enhancedColumn.filterMultiple = Boolean(headerFilter.multiple)
        }
        if (isClientHeaderFilterMode(headerFilterMode) && typeof enhancedColumn.onFilter !== 'function') {
          enhancedColumn.onFilter = (value: any, record: any) =>
            applySelectClientFilter(value, record, column, headerFilter)
        }
      }
    }

    const originalOnHeaderCell = (enhancedColumn as Record<string, any>).onHeaderCell

    return {
      ...enhancedColumn,
      onHeaderCell: (headerColumn: any) => {
        const originalCell = typeof originalOnHeaderCell === 'function'
          ? (originalOnHeaderCell(headerColumn) ?? {})
          : {}
        const mergedCell: Record<string, any> = {
          ...originalCell,
          'data-pro-table-col-key': key
        }

        if (width != null) {
          mergedCell.width = width
        }

        if (canResize) {
          mergedCell.resizable = true
          mergedCell.onResizeStart = handleColumnWidthResizeStart(key)
          mergedCell.onResize = handleColumnWidthResize(key)
          mergedCell.onResizeEnd = handleColumnWidthResizeEnd(key)
        }

        return mergedCell
      }
    }
  })
})

const tableScroll = computed(() => {
  const scroll: Record<string, any> = {}

  if (hasFixedColumns.value && shouldUseHorizontalScroll.value) {
    if (canMeasureColumnWidth.value && tableViewportWidth.value > 0) {
      scroll.x = Math.max(columnTotalWidth.value, tableViewportWidth.value)
    } else {
      scroll.x = 'max-content'
    }
  }

  if (isFillMode.value && shouldUseVerticalScroll.value && tableScrollY.value) {
    scroll.y = tableScrollY.value
  }

  return Object.keys(scroll).length > 0 ? scroll : undefined
})

const densityMenuProps = computed(() => ({
  items: [
    {
      key: 'large',
      label: $t('proTable.densityLarge')
    },
    {
      key: 'middle',
      label: $t('proTable.densityMiddle')
    },
    {
      key: 'small',
      label: $t('proTable.densitySmall')
    }
  ],
  selectedKeys: [tableSize.value],
  onClick: ({ key }: { key: string | number }) => {
    tableSize.value = normalizeDensity(String(key) as ProTableDensity)
    scheduleMeasureTable()
  }
}))

// Methods
const initializeColumnStates = () => {
  const previousFilters = { ...tableFilters.value }
  const states = props.columns.map((column, index) => {
    const key = resolveColumnKey(column, index)
    const checked = !column.hideInTable
    return {
      key,
      title: String(column.title ?? column.dataIndex ?? key),
      checked,
      fixed: column.fixed,
      defaultChecked: checked,
      defaultFixed: column.fixed,
      column: {
        ...column,
        key: column.key || key
      }
    } as ColumnState
  })

  columnStates.value = states
  defaultColumnStates.value = states.map(cloneColumnState)
  showIndexColumn.value = defaultShowIndexColumn.value

  const nextFilters: Record<string, any[] | null> = {}
  states.forEach((state) => {
    const key = state.key
    const previous = normalizeSelectedFilterValues(previousFilters[key])
    if (previous.length > 0) {
      nextFilters[key] = previous
      return
    }

    const initial = normalizeSelectedFilterValues(state.column.filteredValue)
    if (initial.length > 0) {
      nextFilters[key] = initial
      return
    }

    if (state.column.key) {
      const keyByColumnKey = normalizeSelectedFilterValues(previousFilters[String(state.column.key)])
      if (keyByColumnKey.length > 0) {
        nextFilters[key] = keyByColumnKey
        return
      }
    }

    const keyByDataIndex = normalizeSelectedFilterValues(previousFilters[String(state.column.dataIndex)])
    if (keyByDataIndex.length > 0) {
      nextFilters[key] = keyByDataIndex
    }
  })

  tableFilters.value = nextFilters
}

const getRowIndex = (index: number) => {
  if (!paginationEnabled.value) {
    return index + 1
  }
  return (currentPage.value - 1) * pageSize.value + index + 1
}

const toggleColumnChecked = (key: string, checked: boolean) => {
  const item = columnStates.value.find(state => state.key === key)
  if (!item) return

  item.checked = checked
  scheduleMeasureTable()
}

const handleColumnCheckedChange = (key: string, event: any) => {
  toggleColumnChecked(key, Boolean(event?.target?.checked))
}

const toggleColumnFixed = (key: string, position: 'left' | 'right') => {
  const item = columnStates.value.find(state => state.key === key)
  if (!item) return

  item.fixed = item.fixed === position ? undefined : position
  scheduleMeasureTable()
}

const handleToggleAllColumns = () => {
  const allChecked = columnStates.value.length > 0 && columnStates.value.every(item => item.checked)
  if (allChecked) {
    columnStates.value.forEach(item => {
      item.checked = !item.checked
    })
  } else {
    columnStates.value.forEach(item => {
      item.checked = true
    })
  }
  scheduleMeasureTable()
}

const toggleIndexColumn = () => {
  showIndexColumn.value = !showIndexColumn.value
  scheduleMeasureTable()
}

const handleResetColumns = () => {
  columnStates.value = defaultColumnStates.value.map(cloneColumnState)
  showIndexColumn.value = defaultShowIndexColumn.value
  scheduleMeasureTable()
}

const handleDragStart = (key: string) => {
  draggingColumnKey.value = key
}

const handleDragEnd = () => {
  draggingColumnKey.value = ''
}

const handleDrop = (targetKey: string) => {
  const sourceKey = draggingColumnKey.value
  if (!sourceKey || sourceKey === targetKey) return

  const sourceIndex = columnStates.value.findIndex(item => item.key === sourceKey)
  const targetIndex = columnStates.value.findIndex(item => item.key === targetKey)
  if (sourceIndex === -1 || targetIndex === -1) return

  const list = [...columnStates.value]
  const [dragItem] = list.splice(sourceIndex, 1)
  list.splice(targetIndex, 0, dragItem)
  columnStates.value = list
  draggingColumnKey.value = ''
  scheduleMeasureTable()
}

const normalizeFieldLabel = (label: unknown) => {
  return String(label ?? '')
}

const buildEnterPlaceholder = (label: unknown) => {
  return $t('proForm.enterPlaceholder', { label: normalizeFieldLabel(label) })
}

const buildSelectPlaceholder = (label: unknown) => {
  return $t('proForm.selectPlaceholder', { label: normalizeFieldLabel(label) })
}

const resolveSearchType = (col: ProTableColumn): SearchType => {
  if (col.searchType) return col.searchType
  if (col.options || col.searchOptions || col.valueEnum) {
    const vt = col.valueType
    if (vt === 'tag' || vt === 'badge') return 'select'
  }
  const vt = col.valueType
  if (vt === 'tag' || vt === 'badge') return 'select'
  if (vt === 'date' || vt === 'dateTime' || vt === 'time') return 'datePicker'
  if (vt === 'dateRange') return 'dateRange'
  if (vt === 'money' || vt === 'percent' || vt === 'progress') return 'number'
  return 'input'
}

const resolveSearchOptions = (col: ProTableColumn) => {
  if (col.searchOptions) return col.searchOptions
  if (col.options) return col.options.map(o => ({ label: o.label, value: o.value }))
  if (col.valueEnum) {
    return Object.entries(col.valueEnum).map(([value, config]) => ({
      label: config.text,
      value
    }))
  }
  return undefined
}

const resolveValueEnum = (col: ProTableColumn) => {
  if (col.valueEnum) return col.valueEnum
  if (col.options) {
    const enumMap: Record<string, { text: string; status?: string; color?: string }> = {}
    col.options.forEach(o => {
      enumMap[String(o.value)] = { text: o.label, status: o.status, color: o.color }
    })
    return enumMap
  }
  return undefined
}

const getHeaderFilterEntry = (column: any) => {
  if (!column) {
    return undefined
  }

  const directHeaderFilter = column.__proHeaderFilter as ProTableHeaderFilter | undefined
  const directKey = column.__proHeaderFilterKey as string | undefined
  if (directHeaderFilter) {
    return {
      key: String(directKey || column.key || column.dataIndex || ''),
      headerFilter: directHeaderFilter
    }
  }

  const keys = [
    column.key,
    column.dataIndex
  ].filter(Boolean).map(item => String(item))

  for (const key of keys) {
    const entry = headerFilterEntries.value.get(key)
    if (entry) {
      return {
        key: entry.key,
        headerFilter: entry.headerFilter
      }
    }
  }

  return undefined
}

const shouldRenderBuiltInFilterIcon = (column: any) => {
  return Boolean(getHeaderFilterEntry(column))
}

const getBuiltInFilterIconType = (column: any) => {
  const entry = getHeaderFilterEntry(column)
  if (!entry) {
    return 'filter'
  }
  return entry.headerFilter.icon ?? (entry.headerFilter.type === 'keyword' ? 'search' : 'filter')
}

const isBuiltInKeywordFilterColumn = (column: any) => {
  const entry = getHeaderFilterEntry(column)
  return entry?.headerFilter.type === 'keyword'
}

const getBuiltInKeywordFilterPlaceholder = (column: any) => {
  const entry = getHeaderFilterEntry(column)
  if (entry?.headerFilter.placeholder) {
    return entry.headerFilter.placeholder
  }
  return buildEnterPlaceholder(column?.title)
}

const getBuiltInKeywordFilterValue = (selectedKeys: unknown) => {
  const values = normalizeSelectedFilterValues(selectedKeys)
  return String(values[0] ?? '')
}

const handleBuiltInKeywordInput = (
  value: string,
  setSelectedKeys?: (values: string[]) => void
) => {
  if (!setSelectedKeys) return
  setSelectedKeys(value ? [String(value)] : [])
}

const handleBuiltInKeywordSearch = (confirm?: (param?: any) => void) => {
  confirm?.()
}

const handleBuiltInKeywordReset = (
  setSelectedKeys?: (values: string[]) => void,
  clearFilters?: () => void,
  confirm?: (param?: any) => void
) => {
  clearFilters?.()
  setSelectedKeys?.([])
  confirm?.()
}

const buildHeaderFilterRequestParams = () => {
  const payloadMode = props.headerFilter?.requestPayload ?? 'flat'
  const nestedKey = props.headerFilter?.nestedKey || 'filters'
  const flatParams: Record<string, any> = {}
  const nestedParams: Record<string, any> = {}

  Object.keys(tableFilters.value).forEach((tableFilterKey) => {
    const selectedValues = normalizeSelectedFilterValues(tableFilters.value[tableFilterKey])
    if (selectedValues.length === 0) {
      return
    }

    const entry = headerFilterEntries.value.get(tableFilterKey)
    if (!entry) {
      return
    }

    const mode = normalizeHeaderFilterMode(entry.headerFilter.mode)
    if (!isServerHeaderFilterMode(mode)) {
      return
    }

    const paramKey = entry.headerFilter.paramKey || String(entry.column.dataIndex)
    const isMultiple = Boolean(entry.headerFilter.multiple)
    let requestValue: any

    if (entry.headerFilter.type === 'keyword') {
      requestValue = String(selectedValues[0] ?? '')
    } else {
      requestValue = isMultiple ? selectedValues : selectedValues[0]
    }

    if (typeof entry.headerFilter.transformRequestValue === 'function') {
      requestValue = entry.headerFilter.transformRequestValue(requestValue, selectedValues)
    }

    if (
      requestValue === undefined
      || requestValue === null
      || requestValue === ''
      || (Array.isArray(requestValue) && requestValue.length === 0)
    ) {
      return
    }

    if (payloadMode === 'nested') {
      nestedParams[paramKey] = requestValue
      return
    }

    flatParams[paramKey] = requestValue
  })

  if (payloadMode === 'nested') {
    if (Object.keys(nestedParams).length === 0) {
      return {}
    }
    return {
      [nestedKey]: nestedParams
    }
  }

  return flatParams
}

const buildSorterRequestParams = () => {
  const sorter = tableSorter.value
  if (!sorter) {
    return {}
  }

  if (Array.isArray(sorter)) {
    const activeSorters = sorter.filter(item => item?.field && item?.order)
    if (activeSorters.length === 0) {
      return {}
    }
    return {
      sorter: activeSorters.map(item => ({
        field: item.field,
        order: item.order
      }))
    }
  }

  if (sorter?.field && sorter?.order) {
    return {
      sorter: {
        field: sorter.field,
        order: sorter.order
      }
    }
  }

  return {}
}

const loadData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      ...searchForm.value,
      ...buildHeaderFilterRequestParams(),
      ...buildSorterRequestParams()
    }

    if (paginationEnabled.value) {
      params.current = currentPage.value
      params.pageSize = pageSize.value
    }

    const result = await props.request(params)

    if (result.success) {
      dataSource.value = result.data
      total.value = result.total || result.data.length
      scheduleMeasureTable()
    }
  } catch (error: any) {
    message.error(error.message || $t('proTable.loadDataFailed'))
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handleReset = () => {
  searchForm.value = {}
  tableFilters.value = {}
  tableSorter.value = null
  currentPage.value = 1
  loadData()
}

const handleRefresh = () => {
  loadData()
  emit('refresh')
}

const handleTableChange = (pagination: any, filters: Record<string, any>, sorter: any, extra: any) => {
  if (paginationEnabled.value) {
    const nextCurrent = Number(pagination?.current || 1)
    const nextPageSize = Number(pagination?.pageSize || pageSize.value || 10)
    currentPage.value = nextCurrent
    pageSize.value = nextPageSize
  }

  tableFilters.value = normalizeTableFilters(filters)
  tableSorter.value = sorter

  if (extra?.action === 'filter' && (props.headerFilter?.resetPageOnFilterChange ?? true)) {
    currentPage.value = 1
  }

  loadData()
}

const handleAction = async (action: ProTableAction, record: any) => {
  if (action.confirm) {
    Modal.confirm({
      title: $t('common.confirm'),
      content: action.confirm,
      onOk: async () => {
        await action.onClick?.(record)
        loadData()
      }
    })
    return
  }

  await action.onClick?.(record)
  loadData()
}

const getOuterHeight = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect()
  const style = window.getComputedStyle(el)
  return (
    rect.height +
    Number.parseFloat(style.marginTop || '0') +
    Number.parseFloat(style.marginBottom || '0')
  )
}

const getHeaderFallbackHeight = () => {
  if (tableSize.value === 'large') return 54
  if (tableSize.value === 'small') return 40
  return 48
}

const getPaginationFallbackHeight = () => {
  if (!paginationEnabled.value) return 0
  return 56
}

const getTitleFallbackHeight = () => {
  if (!props.toolbar) return 0
  return 32
}

const measureTableScroll = () => {
  if (!isFillMode.value) {
    tableScrollY.value = undefined
    shouldUseVerticalScroll.value = false
    return
  }

  const section = tableSectionRef.value
  if (!section) return

  const sectionHeight = section.clientHeight
  if (!sectionHeight) return

  const tableWrapperEl = section.querySelector('.ant-table-wrapper') as HTMLElement | null
  tableViewportWidth.value = Math.floor(tableWrapperEl?.clientWidth || section.clientWidth || 0)

  const paginationEl = section.querySelector('.ant-pagination') as HTMLElement | null
  const paginationHeight = paginationEl ? getOuterHeight(paginationEl) : getPaginationFallbackHeight()

  const titleEl = section.querySelector('.ant-table-title') as HTMLElement | null
  const titleHeight = titleEl ? getOuterHeight(titleEl) : getTitleFallbackHeight()

  const headerEl = section.querySelector('.ant-table-header') as HTMLElement | null
  const theadEl = section.querySelector('.ant-table-thead') as HTMLElement | null
  const headerHeight = headerEl
    ? headerEl.getBoundingClientRect().height
    : (theadEl?.getBoundingClientRect().height || getHeaderFallbackHeight())

  const nextY = Math.max(
    120,
    Math.floor(sectionHeight - paginationHeight - titleHeight - headerHeight - 2)
  )

  const bodyTableEl = section.querySelector('.ant-table-body table, .ant-table-content table') as HTMLElement | null
  const bodyContentHeight = bodyTableEl ? bodyTableEl.getBoundingClientRect().height : 0
  shouldUseVerticalScroll.value = bodyContentHeight > nextY + 1

  if (!tableScrollY.value || Math.abs(nextY - tableScrollY.value) > 1) {
    tableScrollY.value = nextY
  }
}

let rafId = 0
let resizeObserver: ResizeObserver | null = null
const handleWindowResize = () => {
  viewportWidth.value = window.innerWidth
}

const scheduleMeasureTable = () => {
  if (rafId) {
    cancelAnimationFrame(rafId)
  }
  rafId = requestAnimationFrame(() => {
    rafId = 0
    nextTick(() => {
      measureTableScroll()
    })
  })
}

// Lifecycle
onMounted(() => {
  handleWindowResize()
  window.addEventListener('resize', handleWindowResize)

  initializeColumnStates()
  measureTableScroll()
  loadData()

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      scheduleMeasureTable()
    })

    if (proTableRef.value) resizeObserver.observe(proTableRef.value)
    if (toolbarRef.value) resizeObserver.observe(toolbarRef.value)
    if (searchRef.value) resizeObserver.observe(searchRef.value)
    if (tableSectionRef.value) resizeObserver.observe(tableSectionRef.value)
  }

  scheduleMeasureTable()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleWindowResize)

  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
  resizeObserver?.disconnect()
  resizeObserver = null
})

watch(
  () => props.columns,
  () => {
    initializeColumnStates()
    scheduleMeasureTable()
  },
  { deep: true }
)

watch(
  () => props.pagination,
  (value) => {
    if (value === false) {
      return
    }

    if (value?.current != null) {
      currentPage.value = Number(value.current)
    }
    if (value?.pageSize != null) {
      pageSize.value = Number(value.pageSize)
    }
  },
  { deep: true }
)

watch(
  () => props.size,
  (value) => {
    tableSize.value = normalizeDensity(value)
    scheduleMeasureTable()
  }
)

watch(
  () => props.height,
  () => {
    scheduleMeasureTable()
  }
)

watch(
  () => props.search,
  (value) => {
    if (value !== false) {
      searchCollapsed.value = value?.defaultCollapsed ?? true
      nextTick(() => {
        if (resizeObserver && searchRef.value) {
          resizeObserver.observe(searchRef.value)
        }
      })
    }
    scheduleMeasureTable()
  },
  { deep: true }
)

watch(
  [searchCollapsed, dataSource, total, currentPage, pageSize, displayColumns],
  () => {
    if (isResizingColumn.value) {
      return
    }
    scheduleMeasureTable()
  },
  { deep: true }
)

// Built-in CRUD modal state
const crudModalOpen = ref(false)
const crudFormRef = ref()
const crudFormInitialValues = ref<Record<string, any>>({})
const editingRecord = ref<any>(null)

const crudModalTitle = computed(() => {
  if (editingRecord.value) {
    return props.formEditTitle || $t('common.edit')
  }
  return props.formCreateTitle || $t('common.add')
})

const openCreateModal = (initialValues?: Record<string, any>) => {
  editingRecord.value = null
  crudFormInitialValues.value = initialValues || {}
  crudModalOpen.value = true
}

const openEditModal = (record: any) => {
  editingRecord.value = record
  crudFormInitialValues.value = { ...record }
  crudModalOpen.value = true
}

const handleCrudSubmit = async () => {
  if (!crudFormRef.value) return
  const valid = await crudFormRef.value.validate()
  if (!valid) return
  const values = crudFormRef.value.getFieldsValue()
  emit('form-submit', {
    values,
    record: editingRecord.value,
    isEdit: Boolean(editingRecord.value)
  })
  crudModalOpen.value = false
}

// Expose methods
defineExpose({
  refresh: loadData,
  reload: () => {
    currentPage.value = 1
    loadData()
  },
  openCreateModal,
  openEditModal
})
</script>

<style scoped lang="scss">
.pro-table {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: transparent;

  .pro-table-toolbar {
    height: 32px;
    min-height: 32px;
    padding: 0 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;

    .toolbar-left {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toolbar-title {
      font-size: 13px;
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      white-space: nowrap;
    }

    .toolbar-subtitle {
      font-size: 12px;
      color: var(--color-text-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .toolbar-icon-btn {
      width: 28px;
      height: 28px;
      padding: 0;
      border-radius: 6px;
      color: var(--color-text-secondary);

      &:hover {
        color: var(--color-text-primary);
        background: var(--color-bg-layout);
      }
    }
  }

  .pro-table-search {
    padding: 8px 12px 8px;
    margin-bottom: 15px;
    background: var(--color-bg-container);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-secondary);
    flex-shrink: 0;

    .search-actions {
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      margin-left: auto;
      min-width: 0;
    }

    .search-actions-item {
      width: 100%;
      margin-bottom: 0;

      :deep(.ant-form-item-control) {
        width: 100%;
      }

      :deep(.ant-form-item-control-input-content) {
        display: flex;
        justify-content: flex-end;
      }
    }

    .search-actions-space {
      justify-content: flex-end;
    }

    .rotate-180 {
      transform: rotate(180deg);
      transition: transform var(--duration-base);
    }
  }

  .pro-table-main {
    flex: 1;
    min-height: 0;
    padding: 8px;
    display: flex;
    flex-direction: column;
    background: var(--color-bg-container);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-secondary);
    overflow: hidden;

    &.main-scroll-mode {
      overflow: auto;
    }

    &.main-fill-mode {
      :deep(.ant-table.ant-table-bordered > .ant-table-container) {
        border-bottom: 1px solid var(--color-border-secondary);
      }

      :deep(.ant-table-wrapper),
      :deep(.ant-spin-nested-loading),
      :deep(.ant-spin-container),
      :deep(.ant-table),
      :deep(.ant-table-container) {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
      }

      :deep(.ant-table-content) {
        min-height: 0;
      }

      :deep(.ant-table-body) {
        flex: 1;
        min-height: 0;
        overflow-y: auto !important;
      }

      :deep(.ant-table-pagination.ant-pagination) {
        margin: 8px 0 0;
        flex-shrink: 0;
      }
    }

    &.no-vertical-scrollbar {
      :deep(.ant-table-cell-scrollbar) {
        width: 0 !important;
        min-width: 0 !important;
        max-width: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        box-shadow: none !important;
      }
    }
  }

  :deep(.ant-table-title) {
    padding: 0;
    border-bottom: none;
  }

  :deep(.ant-table-container) {
    border-radius: 10px;
    overflow: hidden;
    min-height: 0;
  }

  :deep(.ant-table-thead > tr > th) {
    /* ProTable header style: use default background */
    color: var(--color-text-primary);
    font-weight: var(--font-weight-bold);
    border-bottom: 1px solid var(--color-border);
  }

  :deep(.pro-table-resizable-title) {
    position: relative;
  }

  :deep(.pro-table-resizable-title.ant-table-cell-fix-start),
  :deep(.pro-table-resizable-title.ant-table-cell-fix-end),
  :deep(.pro-table-resizable-title.ant-table-cell-fix-left),
  :deep(.pro-table-resizable-title.ant-table-cell-fix-right) {
    position: sticky !important;
  }

  :deep(.pro-table-resizable-handle) {
    position: absolute;
    top: 0;
    right: -4px;
    width: 8px;
    height: 100%;
    cursor: col-resize;
    user-select: none;
    touch-action: none;
  }

  :deep(.ant-table-cell-fix-right-first::after) {
    content: none !important;
    display: none !important;
    box-shadow: none !important;
    border: 0 !important;
  }

  :deep(.ant-table-tbody > tr:hover > td) {
    background: var(--color-bg-layout) !important;
  }

  .row-action-group {
    opacity: 1;
    transform: none;
  }

  .table-action-btn {
    border-radius: 8px;
    padding-inline: 8px;

    :deep(.anticon) {
      margin-right: 2px;
    }
  }

}

.column-setting-dropdown {
  width: 320px;
  max-height: 420px;
  background: var(--color-bg-container);
  border: 1px solid var(--color-border-secondary);
  border-radius: 8px;
  box-shadow: var(--shadow-2);
  overflow: hidden;

  .setting-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--color-border-secondary);

    .reset-btn {
      margin-left: auto;
    }
  }

  .setting-list {
    max-height: 360px;
    overflow: auto;
    padding: 6px 0;
  }

  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 4px 8px;
    cursor: move;
    transition: background var(--duration-base) var(--ease-out);

    &:hover {
      background: var(--color-bg-layout);
    }

    &.dragging {
      opacity: 0.55;
    }

    &.index-column-item {
      cursor: default;
      border-bottom: 1px solid var(--color-border-secondary);
      margin-bottom: 4px;
      padding-bottom: 8px;
    }
  }

  .setting-item-left {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    overflow: hidden;
  }

  .drag-handle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    color: var(--color-text-tertiary);
    font-size: 12px;
    letter-spacing: -1px;
    user-select: none;
  }

  .setting-item-right {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
  }

  .fixed-btn {
    width: 24px;
    height: 24px;
    padding: 0;
    color: var(--color-text-tertiary);

    &.active {
      color: var(--color-primary);
      background: var(--color-primary-1);
      border-radius: 4px;
    }
  }
}

// Density dropdown menu selected item style
:deep(.ant-dropdown-menu .ant-menu-item-selected) {
  background: var(--color-primary-1);
  color: var(--color-primary);
}
</style>

<style lang="scss">
.pro-table-keyword-filter-panel {
  width: 320px;
  max-width: calc(100vw - 16px);
  padding: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--color-bg-container);
}

.pro-table-keyword-filter-field {
  width: 100%;
}

.pro-table-keyword-filter-input {
  width: 100%;
}

.pro-table-keyword-filter-input.ant-input,
.pro-table-keyword-filter-input.ant-input-affix-wrapper {
  border-radius: 8px;
}

.pro-table-keyword-filter-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.pro-table-keyword-filter-actions .ant-btn,
.pro-table-keyword-filter-btn {
  width: 100%;
  height: 36px;
  margin: 0 !important;
  border-radius: 8px;
}

.pro-table-keyword-filter-actions .ant-btn + .ant-btn {
  margin-inline-start: 0 !important;
}

@media (max-width: 576px) {
  .pro-table-keyword-filter-panel {
    width: min(320px, calc(100vw - 12px));
    padding: 10px;
    gap: 10px;
  }

  .pro-table-keyword-filter-actions {
    gap: 8px;
  }
}
</style>
