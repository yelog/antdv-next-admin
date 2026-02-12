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
                v-if="col.searchType === 'input'"
                v-model:value="searchForm[col.dataIndex]"
                :placeholder="buildEnterPlaceholder(col.title)"
                v-bind="col.searchProps"
              />

              <a-select
                v-else-if="col.searchType === 'select'"
                v-model:value="searchForm[col.dataIndex]"
                :placeholder="buildSelectPlaceholder(col.title)"
                :options="col.searchOptions"
                v-bind="col.searchProps"
              />

              <a-date-picker
                v-else-if="col.searchType === 'datePicker'"
                v-model:value="searchForm[col.dataIndex]"
                :placeholder="buildSelectPlaceholder(col.title)"
                style="width: 100%"
                v-bind="col.searchProps"
              />

              <a-range-picker
                v-else-if="col.searchType === 'dateRange'"
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
                  v-if="searchColumns.length > 3"
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
              :enum="column.valueEnum"
              :record="record"
            />
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, h, defineComponent } from 'vue'
import type { PropType } from 'vue'
import {
  ReloadOutlined,
  SettingOutlined,
  SearchOutlined,
  DownOutlined,
  ColumnHeightOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined
} from '@antdv-next/icons'
import { message, Modal } from 'antdv-next'
import ValueTypeRender from './ValueTypeRender.vue'
import { appDefaultSettings } from '@/settings'
import { $t } from '@/locales'
import type {
  ProTableColumn,
  ProTableToolbar,
  ProTableSearch,
  ProTablePagination,
  ProTableRequest,
  ProTableAction
} from '@/types/pro'
import type { ProTableDensity, ProTableHeight } from '@/settings'

interface Props {
  columns: ProTableColumn[]
  request: ProTableRequest
  toolbar?: ProTableToolbar
  search?: ProTableSearch | false
  pagination?: ProTablePagination | false
  rowKey?: string | ((record: any) => string)
  size?: ProTableDensity
  height?: ProTableHeight
  resizable?: boolean
  columnResizable?: boolean
  ellipsis?: boolean
  bordered?: boolean
  fixedHeader?: boolean
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
  })
})

const emit = defineEmits(['refresh'])

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

// Computed
const toolbarActions = computed(() => props.toolbar?.actions || [])

const showRefreshAction = computed(() => {
  if (!props.toolbar) return false
  return toolbarActions.value.length === 0 || toolbarActions.value.includes('refresh')
})

const showColumnSettingAction = computed(() => {
  if (!props.toolbar) return false
  return toolbarActions.value.length === 0 || toolbarActions.value.includes('columnSetting')
})

const showDensityAction = computed(() => {
  if (!props.toolbar) return false
  return (
    toolbarActions.value.length === 0 ||
    toolbarActions.value.includes('density') ||
    (showRefreshAction.value && showColumnSettingAction.value)
  )
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

const visibleSearchColumns = computed(() => {
  if (searchCollapsed.value && searchColumns.value.length > 3) {
    return searchColumns.value.slice(0, 3)
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

    const originalOnHeaderCell = (column as Record<string, any>).onHeaderCell

    return {
      ...column,
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

const loadData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      ...searchForm.value
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
  currentPage.value = 1
  loadData()
}

const handleRefresh = () => {
  loadData()
  emit('refresh')
}

const handleTableChange = (pagination: any) => {
  if (paginationEnabled.value) {
    const nextCurrent = Number(pagination?.current || 1)
    const nextPageSize = Number(pagination?.pageSize || pageSize.value || 10)
    currentPage.value = nextCurrent
    pageSize.value = nextPageSize
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

// Expose methods
defineExpose({
  refresh: loadData,
  reload: () => {
    currentPage.value = 1
    loadData()
  }
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
      align-items: flex-end;
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
