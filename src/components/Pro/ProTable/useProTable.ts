import type { ComputedRef, Ref } from 'vue'
import type { ProTableDensity, ProTableHeight } from '@/settings'
import type {
  HeaderFilterMode,
  ProTableColumn,
  ProTableHeaderFilter,
  ProTableHeaderFilterConfig,
  ProTablePagination,
  ProTableRequest,
  ProTableSearch,
  ProTableToolbar,
  SearchType,
} from '@/types/pro'
import { message } from 'antdv-next'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { $t } from '@/locales'

/**
 * Column state for column settings
 */
export interface ColumnState {
  key: string
  title: string
  checked: boolean
  fixed?: 'left' | 'right'
  defaultChecked: boolean
  defaultFixed?: 'left' | 'right'
  column: ProTableColumn
}

/**
 * Table size type
 */
export type TableSize = 'large' | 'middle' | 'small'

/**
 * Options for useProTable
 */
export interface UseProTableOptions {
  columns: Ref<ProTableColumn[]>
  request: ProTableRequest
  toolbar?: Ref<ProTableToolbar | undefined>
  search?: Ref<ProTableSearch | false | undefined>
  headerFilter?: ProTableHeaderFilterConfig
  pagination?: Ref<ProTablePagination | false | undefined>
  size?: Ref<ProTableDensity | undefined>
  height?: Ref<ProTableHeight | undefined>
  resizable?: Ref<boolean | undefined>
  columnResizable?: Ref<boolean | undefined>
  ellipsis?: Ref<boolean | undefined>
  bordered?: Ref<boolean | undefined>
  fixedHeader?: Ref<boolean | undefined>
}

/**
 * Return type for useProTable
 */
export interface UseProTableReturn {
  // Refs for DOM elements
  proTableRef: Ref<HTMLElement | undefined>
  toolbarRef: Ref<HTMLElement | undefined>
  searchRef: Ref<HTMLElement | undefined>
  tableSectionRef: Ref<HTMLElement | undefined>

  // State
  dataSource: Ref<any[]>
  loading: Ref<boolean>
  searchForm: Ref<Record<string, any>>
  searchCollapsed: Ref<boolean>
  currentPage: Ref<number>
  pageSize: Ref<number>
  total: Ref<number>
  tableSize: Ref<TableSize>
  tableScrollY: Ref<number | undefined>
  shouldUseVerticalScroll: Ref<boolean>
  tableViewportWidth: Ref<number>
  viewportWidth: Ref<number>
  tableFilters: Ref<Record<string, any[] | null>>
  tableSorter: Ref<any>
  showIndexColumn: Ref<boolean>
  columnStates: Ref<ColumnState[]>
  draggingColumnKey: Ref<string>
  isResizingColumn: Ref<boolean>
  resizingColumnKey: Ref<string | null>

  // Computed
  effectiveResizable: ComputedRef<boolean>
  effectiveColumnResizable: ComputedRef<boolean>
  effectiveEllipsis: ComputedRef<boolean>
  effectiveBordered: ComputedRef<boolean>
  effectiveFixedHeader: ComputedRef<boolean>
  effectiveHeight: ComputedRef<ProTableHeight>
  isAutoHeight: ComputedRef<boolean>
  isFillMode: ComputedRef<boolean>
  tableRootStyle: ComputedRef<Record<string, string> | undefined>
  showSearchForm: ComputedRef<boolean>
  searchLabelWidth: ComputedRef<number>
  searchColumnsPerRow: ComputedRef<number>
  collapsedSearchRows: ComputedRef<number>
  collapsedSearchFieldLimit: ComputedRef<number>
  showSearchCollapseToggle: ComputedRef<boolean>
  visibleSearchColumns: ComputedRef<ProTableColumn[]>
  paginationEnabled: ComputedRef<boolean>
  paginationConfig: ComputedRef<any>
  displayColumns: ComputedRef<ProTableColumn[]>
  hasFixedColumns: ComputedRef<boolean>
  tableColumns: ComputedRef<any[]>
  tableScroll: ComputedRef<any>
  densityMenuProps: ComputedRef<any>
  tableComponents: ComputedRef<any>
  showRefreshAction: ComputedRef<boolean>
  showColumnSettingAction: ComputedRef<boolean>
  showDensityAction: ComputedRef<boolean>
  hasBuiltInHeaderFilter: ComputedRef<boolean>
  hasBuiltInKeywordHeaderFilter: ComputedRef<boolean>
  headerFilterEntries: ComputedRef<Map<string, { key: string, column: ProTableColumn, headerFilter: ProTableHeaderFilter }>>

  // Methods
  refresh: () => void
  reload: () => void
  handleSearch: () => void
  handleReset: () => void
  handleRefresh: () => void
  handleTableChange: (pagination: any, filters: Record<string, any>, sorter: any, extra: any) => void
  handleAction: (action: any, record: any) => Promise<void>
  getRowIndex: (index: number) => number
  toggleColumnChecked: (key: string, checked: boolean) => void
  handleColumnCheckedChange: (key: string, event: any) => void
  toggleColumnFixed: (key: string, position: 'left' | 'right') => void
  handleToggleAllColumns: () => void
  toggleIndexColumn: () => void
  handleResetColumns: () => void
  handleDragStart: (key: string) => void
  handleDragEnd: () => void
  handleDrop: (targetKey: string) => void
  resolveSearchType: (col: ProTableColumn) => SearchType
  resolveSearchOptions: (col: ProTableColumn) => any
  resolveValueEnum: (col: ProTableColumn) => any
  buildEnterPlaceholder: (label: unknown) => string
  buildSelectPlaceholder: (label: unknown) => string
  scheduleMeasureTable: () => void
  initializeColumnStates: () => void
}

const MIN_COLUMN_WIDTH = 40

/**
 * Composable for ProTable logic
 */
export function useProTable(options: UseProTableOptions): UseProTableReturn {
  const {
    columns,
    request,
    toolbar,
    search,
    headerFilter,
    pagination,
    size,
    height,
    resizable,
    columnResizable,
    ellipsis,
    bordered,
    fixedHeader,
  } = options

  // Refs for DOM elements
  const proTableRef = ref<HTMLElement>()
  const toolbarRef = ref<HTMLElement>()
  const searchRef = ref<HTMLElement>()
  const tableSectionRef = ref<HTMLElement>()

  // State
  const dataSource = ref<any[]>([])
  const loading = ref(false)
  const searchForm = ref<Record<string, any>>({})
  const searchCollapsed = ref(search.value !== false ? (search.value?.defaultCollapsed ?? true) : true)
  const currentPage = ref(pagination.value !== false ? (pagination.value?.current || 1) : 1)
  const pageSize = ref(pagination.value !== false ? (pagination.value?.pageSize || 10) : 10)
  const total = ref(0)
  const tableSize = ref<TableSize>(normalizeDensity(size.value))
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

  // Helper functions
  function normalizeDensity(size: ProTableDensity | undefined): TableSize {
    if (size === 'large' || size === 'middle' || size === 'small') {
      return size
    }
    return 'small'
  }

  function cloneColumnState(state: ColumnState): ColumnState {
    return {
      ...state,
      column: { ...state.column },
    }
  }

  function resolveColumnKey(column: ProTableColumn, index: number): string {
    return String(column.key ?? column.dataIndex ?? `col_${index}`)
  }

  // Computed properties
  const effectiveResizable = computed(() => resizable.value ?? true)
  const effectiveColumnResizable = computed(() => columnResizable.value ?? true)
  const effectiveEllipsis = computed(() => ellipsis.value ?? true)
  const effectiveBordered = computed(() => bordered.value ?? false)
  const effectiveFixedHeader = computed(() => fixedHeader.value ?? true)
  const effectiveHeight = computed(() => height.value ?? 'auto')
  const isAutoHeight = computed(() => String(effectiveHeight.value) === 'auto')
  const isFillMode = computed(() => isAutoHeight.value || effectiveFixedHeader.value)

  const tableRootStyle = computed<Record<string, string> | undefined>(() => {
    if (isAutoHeight.value) {
      return { height: '100%' }
    }
    const h = typeof effectiveHeight.value === 'number'
      ? `${effectiveHeight.value}px`
      : String(effectiveHeight.value)
    return { height: h }
  })

  const searchColumns = computed(() => columns.value.filter(col => col.search))
  const showSearchForm = computed(() => search.value !== false && searchColumns.value.length > 0)
  const searchLabelWidth = computed(() => {
    if (search.value === false)
      return 6
    return search.value?.labelWidth || 6
  })

  const searchColumnsPerRow = computed(() => {
    if (viewportWidth.value >= 992)
      return 3
    if (viewportWidth.value >= 576)
      return 2
    return 1
  })

  const collapsedSearchRows = computed(() => {
    if (search.value === false)
      return 1
    const rows = Number(search.value?.collapsedRows ?? 1)
    if (!Number.isFinite(rows))
      return 1
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

  const paginationEnabled = computed(() => pagination.value !== false)

  const paginationConfig = computed(() => {
    if (!paginationEnabled.value)
      return false
    return {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (value: number) => $t('proTable.total', { total: value }),
      ...(pagination.value || {}),
      current: currentPage.value,
      pageSize: pageSize.value,
      total: total.value,
    }
  })

  const displayColumns = computed<ProTableColumn[]>(() => {
    const cols = columnStates.value
      .filter(state => state.checked)
      .map(state => ({
        ...state.column,
        key: state.column.key || state.key,
        fixed: state.fixed,
        ellipsis: state.column.ellipsis ?? effectiveEllipsis.value,
        resizable: state.column.resizable ?? effectiveResizable.value,
      }))

    if (!showIndexColumn.value)
      return cols

    return [
      {
        title: '#',
        dataIndex: '__index',
        key: '__index',
        width: 64,
        align: 'center',
        fixed: 'left',
        ellipsis: false,
        resizable: false,
      },
      ...cols,
    ]
  })

  const hasFixedColumns = computed(() => {
    return displayColumns.value.some(col => Boolean(col.fixed))
  })

  // Header filter
  const headerFilterEntries = computed(() => {
    const map = new Map<string, { key: string, column: ProTableColumn, headerFilter: ProTableHeaderFilter }>()
    columnStates.value.forEach((state, index) => {
      const column = state.column
      if (!column.headerFilter)
        return
      const key = resolveColumnKey(column, index)
      const entry = { key, column, headerFilter: column.headerFilter }
      map.set(key, entry)
      map.set(String(column.dataIndex), entry)
      if (column.key)
        map.set(String(column.key), entry)
    })
    return map
  })

  const hasBuiltInHeaderFilter = computed(() => headerFilterEntries.value.size > 0)
  const hasBuiltInKeywordHeaderFilter = computed(() => {
    return Array.from(headerFilterEntries.value.values())
      .some(entry => entry.headerFilter.type === 'keyword')
  })

  // Toolbar actions
  const toolbarActions = computed(() => toolbar?.value?.actions || [])
  const showRefreshAction = computed(() => !toolbar.value || !toolbarActions.value.includes('!refresh'))
  const showColumnSettingAction = computed(() => !toolbar.value || !toolbarActions.value.includes('!columnSetting'))
  const showDensityAction = computed(() => !toolbar.value || !toolbarActions.value.includes('!density'))

  // Table columns with header filter
  const tableColumns = computed(() => {
    return displayColumns.value.map((column, index) => {
      const key = resolveColumnKey(column, index)
      const canResize = Boolean(effectiveColumnResizable.value && (column.resizable ?? effectiveResizable.value))

      return {
        ...column,
        onHeaderCell: (headerColumn: any) => {
          const mergedCell: Record<string, any> = {
            'data-pro-table-col-key': key,
          }
          if (canResize) {
            mergedCell.resizable = true
          }
          return mergedCell
        },
      }
    })
  })

  // Table scroll
  const tableScroll = computed(() => {
    const scroll: Record<string, any> = {}
    if (hasFixedColumns.value) {
      scroll.x = 'max-content'
    }
    if (isFillMode.value && shouldUseVerticalScroll.value && tableScrollY.value) {
      scroll.y = tableScrollY.value
    }
    return Object.keys(scroll).length > 0 ? scroll : undefined
  })

  // Density menu
  const densityMenuProps = computed(() => ({
    items: [
      { key: 'large', label: $t('proTable.densityLarge') },
      { key: 'middle', label: $t('proTable.densityMiddle') },
      { key: 'small', label: $t('proTable.densitySmall') },
    ],
    selectedKeys: [tableSize.value],
    onClick: ({ key }: { key: string | number }) => {
      tableSize.value = normalizeDensity(String(key) as ProTableDensity)
      scheduleMeasureTable()
    },
  }))

  // Table components for resizable columns
  const tableComponents = computed(() => {
    if (!effectiveColumnResizable.value)
      return undefined
    return {
      header: {
        cell: null, // Will be set by the component
      },
    }
  })

  // Methods
  const scheduleMeasureTable = () => {
    nextTick(() => {
      measureTableScroll()
    })
  }

  const measureTableScroll = () => {
    if (!isFillMode.value) {
      tableScrollY.value = undefined
      shouldUseVerticalScroll.value = false
      return
    }

    const section = tableSectionRef.value
    if (!section)
      return

    const sectionHeight = section.clientHeight
    if (!sectionHeight)
      return

    const tableWrapperEl = section.querySelector('.ant-table-wrapper') as HTMLElement | null
    tableViewportWidth.value = Math.floor(tableWrapperEl?.clientWidth || section.clientWidth || 0)

    const paginationEl = section.querySelector('.ant-pagination') as HTMLElement | null
    const paginationHeight = paginationEl ? getOuterHeight(paginationEl) : (paginationEnabled.value ? 56 : 0)

    const titleEl = section.querySelector('.ant-table-title') as HTMLElement | null
    const titleHeight = titleEl ? getOuterHeight(titleEl) : (toolbar?.value ? 32 : 0)

    const headerEl = section.querySelector('.ant-table-header') as HTMLElement | null
    const theadEl = section.querySelector('.ant-table-thead') as HTMLElement | null
    const headerHeight = headerEl
      ? headerEl.getBoundingClientRect().height
      : (theadEl?.getBoundingClientRect().height || getHeaderFallbackHeight())

    const nextY = Math.max(120, Math.floor(sectionHeight - paginationHeight - titleHeight - headerHeight - 2))

    const bodyTableEl = section.querySelector('.ant-table-body table, .ant-table-content table') as HTMLElement | null
    const bodyContentHeight = bodyTableEl ? bodyTableEl.getBoundingClientRect().height : 0
    shouldUseVerticalScroll.value = bodyContentHeight > nextY + 1

    if (!tableScrollY.value || Math.abs(nextY - tableScrollY.value) > 1) {
      tableScrollY.value = nextY
    }
  }

  const getOuterHeight = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    const style = window.getComputedStyle(el)
    return rect.height + Number.parseFloat(style.marginTop || '0') + Number.parseFloat(style.marginBottom || '0')
  }

  const getHeaderFallbackHeight = () => {
    if (tableSize.value === 'large')
      return 54
    if (tableSize.value === 'small')
      return 40
    return 48
  }

  const initializeColumnStates = () => {
    const states = columns.value.map((column, index) => {
      const key = resolveColumnKey(column, index)
      const checked = !column.hideInTable
      return {
        key,
        title: String(column.title ?? column.dataIndex ?? key),
        checked,
        fixed: column.fixed,
        defaultChecked: checked,
        defaultFixed: column.fixed,
        column: { ...column, key: column.key || key },
      } as ColumnState
    })

    columnStates.value = states
    defaultColumnStates.value = states.map(cloneColumnState)
    showIndexColumn.value = defaultShowIndexColumn.value
  }

  const loadData = async () => {
    loading.value = true
    try {
      const params: Record<string, any> = {
        ...searchForm.value,
        ...buildHeaderFilterRequestParams(),
        ...buildSorterRequestParams(),
      }

      if (paginationEnabled.value) {
        params.current = currentPage.value
        params.pageSize = pageSize.value
      }

      const result = await request(params)

      if (result.success) {
        dataSource.value = result.data
        total.value = result.total || result.data.length
        scheduleMeasureTable()
      }
    }
    catch (error: any) {
      message.error(error.message || $t('proTable.loadDataFailed'))
    }
    finally {
      loading.value = false
    }
  }

  const buildHeaderFilterRequestParams = () => {
    const payloadMode = headerFilter?.requestPayload ?? 'flat'
    const nestedKey = headerFilter?.nestedKey || 'filters'
    const flatParams: Record<string, any> = {}
    const nestedParams: Record<string, any> = {}

    Object.keys(tableFilters.value).forEach((tableFilterKey) => {
      const selectedValues = normalizeSelectedFilterValues(tableFilters.value[tableFilterKey])
      if (selectedValues.length === 0)
        return

      const entry = headerFilterEntries.value.get(tableFilterKey)
      if (!entry)
        return

      const mode = normalizeHeaderFilterMode(entry.headerFilter.mode)
      if (!isServerHeaderFilterMode(mode))
        return

      const paramKey = entry.headerFilter.paramKey || String(entry.column.dataIndex)
      const requestValue: any = selectedValues[0]

      if (payloadMode === 'nested') {
        nestedParams[paramKey] = requestValue
      }
      else {
        flatParams[paramKey] = requestValue
      }
    })

    if (payloadMode === 'nested') {
      if (Object.keys(nestedParams).length === 0)
        return {}
      return { [nestedKey]: nestedParams }
    }
    return flatParams
  }

  const buildSorterRequestParams = () => {
    const sorter = tableSorter.value
    if (!sorter)
      return {}

    if (sorter?.field && sorter?.order) {
      return { sorter: { field: sorter.field, order: sorter.order } }
    }
    return {}
  }

  const normalizeHeaderFilterMode = (mode: HeaderFilterMode | undefined): HeaderFilterMode => {
    return mode ?? headerFilter?.defaultMode ?? 'server'
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

  const refresh = () => loadData()
  const reload = () => {
    currentPage.value = 1
    loadData()
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
  }

  const handleTableChange = (paginationData: any, filters: Record<string, any>, sorter: any) => {
    if (paginationEnabled.value) {
      currentPage.value = Number(paginationData?.current || 1)
      pageSize.value = Number(paginationData?.pageSize || pageSize.value || 10)
    }
    tableFilters.value = filters
    tableSorter.value = sorter
    loadData()
  }

  const handleAction = async (action: any, record: any) => {
    await action.onClick?.(record)
    refresh()
  }

  const getRowIndex = (index: number) => {
    if (!paginationEnabled.value)
      return index + 1
    return (currentPage.value - 1) * pageSize.value + index + 1
  }

  const toggleColumnChecked = (key: string, checked: boolean) => {
    const item = columnStates.value.find(state => state.key === key)
    if (!item)
      return
    item.checked = checked
    scheduleMeasureTable()
  }

  const handleColumnCheckedChange = (key: string, event: any) => {
    toggleColumnChecked(key, Boolean(event?.target?.checked))
  }

  const toggleColumnFixed = (key: string, position: 'left' | 'right') => {
    const item = columnStates.value.find(state => state.key === key)
    if (!item)
      return
    item.fixed = item.fixed === position ? undefined : position
    scheduleMeasureTable()
  }

  const handleToggleAllColumns = () => {
    const allChecked = columnStates.value.length > 0 && columnStates.value.every(item => item.checked)
    columnStates.value.forEach((item) => {
      item.checked = !allChecked
    })
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
    if (!sourceKey || sourceKey === targetKey)
      return

    const sourceIndex = columnStates.value.findIndex(item => item.key === sourceKey)
    const targetIndex = columnStates.value.findIndex(item => item.key === targetKey)
    if (sourceIndex === -1 || targetIndex === -1)
      return

    const list = [...columnStates.value]
    const [dragItem] = list.splice(sourceIndex, 1)
    list.splice(targetIndex, 0, dragItem)
    columnStates.value = list
    draggingColumnKey.value = ''
    scheduleMeasureTable()
  }

  const resolveSearchType = (col: ProTableColumn): SearchType => {
    if (col.searchType)
      return col.searchType
    if (col.options || col.searchOptions || col.valueEnum) {
      const vt = col.valueType
      if (vt === 'tag' || vt === 'badge')
        return 'select'
    }
    const vt = col.valueType
    if (vt === 'tag' || vt === 'badge')
      return 'select'
    if (vt === 'date' || vt === 'dateTime' || vt === 'time')
      return 'datePicker'
    if (vt === 'dateRange')
      return 'dateRange'
    if (vt === 'money' || vt === 'percent' || vt === 'progress')
      return 'number'
    return 'input'
  }

  const resolveSearchOptions = (col: ProTableColumn) => {
    if (col.searchOptions)
      return col.searchOptions
    if (col.options)
      return col.options.map(o => ({ label: o.label, value: o.value }))
    if (col.valueEnum) {
      return Object.entries(col.valueEnum).map(([value, config]) => ({
        label: config.text,
        value,
      }))
    }
    return undefined
  }

  const resolveValueEnum = (col: ProTableColumn) => {
    if (col.valueEnum)
      return col.valueEnum
    if (col.options) {
      const enumMap: Record<string, { text: string, status?: string, color?: string }> = {}
      col.options.forEach((o) => {
        enumMap[String(o.value)] = { text: o.label, status: o.status, color: o.color }
      })
      return enumMap
    }
    return undefined
  }

  const buildEnterPlaceholder = (label: unknown) => {
    return $t('proForm.enterPlaceholder', { label: String(label ?? '') })
  }

  const buildSelectPlaceholder = (label: unknown) => {
    return $t('proForm.selectPlaceholder', { label: String(label ?? '') })
  }

  // Lifecycle
  const rafId = 0
  let resizeObserver: ResizeObserver | null = null

  const handleWindowResize = () => {
    viewportWidth.value = window.innerWidth
  }

  onMounted(() => {
    handleWindowResize()
    window.addEventListener('resize', handleWindowResize)
    initializeColumnStates()
    loadData()

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        scheduleMeasureTable()
      })
      if (proTableRef.value)
        resizeObserver.observe(proTableRef.value)
      if (toolbarRef.value)
        resizeObserver.observe(toolbarRef.value)
      if (searchRef.value)
        resizeObserver.observe(searchRef.value)
      if (tableSectionRef.value)
        resizeObserver.observe(tableSectionRef.value)
    }

    scheduleMeasureTable()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleWindowResize)
    if (rafId)
      cancelAnimationFrame(rafId)
    resizeObserver?.disconnect()
    resizeObserver = null
  })

  // Watchers
  watch(columns, () => {
    initializeColumnStates()
    scheduleMeasureTable()
  }, { deep: true })

  watch(pagination, (value) => {
    if (value === false)
      return
    if (value?.current != null)
      currentPage.value = Number(value.current)
    if (value?.pageSize != null)
      pageSize.value = Number(value.pageSize)
  }, { deep: true })

  watch(size, (value) => {
    tableSize.value = normalizeDensity(value)
    scheduleMeasureTable()
  })

  watch(height, () => {
    scheduleMeasureTable()
  })

  watch(search, (value) => {
    if (value !== false) {
      searchCollapsed.value = value?.defaultCollapsed ?? true
    }
    scheduleMeasureTable()
  }, { deep: true })

  return {
    // Refs
    proTableRef,
    toolbarRef,
    searchRef,
    tableSectionRef,

    // State
    dataSource,
    loading,
    searchForm,
    searchCollapsed,
    currentPage,
    pageSize,
    total,
    tableSize,
    tableScrollY,
    shouldUseVerticalScroll,
    tableViewportWidth,
    viewportWidth,
    tableFilters,
    tableSorter,
    showIndexColumn,
    columnStates,
    draggingColumnKey,
    isResizingColumn,
    resizingColumnKey,

    // Computed
    effectiveResizable,
    effectiveColumnResizable,
    effectiveEllipsis,
    effectiveBordered,
    effectiveFixedHeader,
    effectiveHeight,
    isAutoHeight,
    isFillMode,
    tableRootStyle,
    showSearchForm,
    searchLabelWidth,
    searchColumnsPerRow,
    collapsedSearchRows,
    collapsedSearchFieldLimit,
    showSearchCollapseToggle,
    visibleSearchColumns,
    paginationEnabled,
    paginationConfig,
    displayColumns,
    hasFixedColumns,
    tableColumns,
    tableScroll,
    densityMenuProps,
    tableComponents,
    showRefreshAction,
    showColumnSettingAction,
    showDensityAction,
    hasBuiltInHeaderFilter,
    hasBuiltInKeywordHeaderFilter,
    headerFilterEntries,

    // Methods
    refresh,
    reload,
    handleSearch,
    handleReset,
    handleRefresh,
    handleTableChange,
    handleAction,
    getRowIndex,
    toggleColumnChecked,
    handleColumnCheckedChange,
    toggleColumnFixed,
    handleToggleAllColumns,
    toggleIndexColumn,
    handleResetColumns,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    resolveSearchType,
    resolveSearchOptions,
    resolveValueEnum,
    buildEnterPlaceholder,
    buildSelectPlaceholder,
    scheduleMeasureTable,
    initializeColumnStates,
  }
}
