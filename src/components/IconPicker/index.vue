<template>
  <a-popover
    v-model:open="open"
    trigger="click"
    placement="bottomLeft"
    :overlay-style="{ width: '360px', paddingTop: '4px' }"
    overlay-class-name="icon-picker-overlay"
    @open-change="onOpenChange"
  >
    <template #default>
      <a-input-search
        v-model:value="inputValue"
        class="ip-input-trigger"
        :placeholder="placeholder"
        autocomplete="off"
        spellcheck="false"
        :name="inputName"
        allow-clear
        @change="onInputChange"
      >
        <template #enterButton>
          <a-button class="ip-addon" @mousedown.prevent.stop="togglePopover">
            <IconView :icon="inputValue || 'ion:apps-outline'" :size="18" />
          </a-button>
        </template>
      </a-input-search>
    </template>

    <template #content>
      <a-form-item-rest>
        <div class="ip-wrap">
        <div class="ip-row1">
          <a-input
            ref="searchRef"
            v-model:value="keyword"
            allow-clear
            :placeholder="searchPlaceholder"
            class="ip-search"
          >
            <template #prefix>
              <IconView icon="ant-design:search-outlined" color="#999" />
            </template>
          </a-input>
        </div>

        <div class="ip-row2">
          <a-segmented
            v-model:value="category"
            :options="categoryOptions"
            size="small"
            block
            class="ip-seg"
            @change="onCategoryChange"
          />
        </div>

        <div class="ip-grid-container">
          <div v-if="pageItems.length === 0" class="ip-empty">
            <a-empty description="No icons" />
          </div>

          <div v-else class="ip-grid">
            <a-tooltip
              v-for="name in pageItems"
              :key="name"
              :mouse-enter-delay="0.5"
              placement="top"
            >
              <template #title>
                <div class="ip-tooltip-content">
                  <span class="ip-tooltip-name">{{ name }}</span>
                  <a-tag class="ip-tooltip-tag" :color="getIconMeta(name).color">
                    {{ getIconMeta(name).label }}
                  </a-tag>
                </div>
              </template>

              <button
                type="button"
                class="ip-item"
                :class="{ selected: effectiveValue === name }"
                :style="{ '--hover-color': getIconMeta(name).color }"
                @click="apply(name)"
              >
                <IconView :icon="name" :size="20" />
                <div class="ip-item-bar" />
              </button>
            </a-tooltip>
          </div>
        </div>

        <div class="ip-footer">
          <span class="ip-total">{{ filteredTotal }}</span>
          <a-pagination
            v-model:current="page"
            :page-size="props.pageSize"
            :total="filteredTotal"
            size="small"
            show-less-items
            :show-size-changer="false"
            class="ip-pagination"
          />
        </div>
        </div>
      </a-form-item-rest>
    </template>
  </a-popover>
</template>

<script setup lang="ts">
import { computed, h, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import * as AntdvIcons from '@antdv-next/icons'
import ri from '@iconify-json/ri/icons.json'
import mdi from '@iconify-json/mdi/icons.json'
import ion from '@iconify-json/ion/icons.json'
import IconView from '@/components/Icon/index.vue'
import { $t } from '@/locales'

type Category = 'all' | 'ri' | 'mdi' | 'ion' | 'antdv-next' | 'svg' | 'online'

interface Props {
  modelValue?: string
  value?: string
  placeholder?: string
  pageSize?: number
  svgIcons?: string[]
  svgPrefix?: string
  onlineLimit?: number
}

interface IconsJson {
  icons?: Record<string, unknown>
  aliases?: Record<string, unknown>
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  pageSize: 36,
  svgPrefix: 'icon-',
  onlineLimit: 120
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'update:value', v: string): void
  (e: 'change', v: string): void
}>()

const boundValue = computed(() => props.value ?? props.modelValue ?? '')

const open = ref(false)
const editableValue = ref(boundValue.value)
const inputSnapshot = ref(editableValue.value)

watch(
  boundValue,
  (value) => {
    if (!open.value) {
      editableValue.value = value ?? ''
    }
  },
  { immediate: true }
)

const inputValue = computed<string>({
  get: () => editableValue.value,
  set: (value) => {
    editableValue.value = value
  }
})

const inputName = `iconpicker_${Math.random().toString(36).slice(2)}`
const placeholder = computed(() => props.placeholder || $t('iconPicker.selectIcon'))
const searchPlaceholder = computed(() => $t('iconPicker.searchPlaceholder'))

const category = ref<Category>('all')
const keyword = ref('')
const page = ref(1)
const searchRef = ref<{ focus?: () => void } | null>(null)

const iconifyNames = (prefix: string, json: IconsJson) => {
  const names = [
    ...Object.keys(json.icons || {}),
    ...Object.keys(json.aliases || {})
  ]
  return names.map((name) => `${prefix}:${name}`)
}

const normalizeSvgName = (name: string) => {
  const value = name.trim()
  if (!value) {
    return ''
  }
  return value.startsWith('svg:') ? value : `svg:${value}`
}

const localSvgModules = import.meta.glob('../../assets/icons/**/*.svg')

const extractSvgSymbolName = (path: string) => {
  const matched = path.match(/\/icons\/(.*)\.svg$/)
  if (!matched || !matched[1]) {
    return ''
  }
  const normalized = matched[1].replace(/\//g, '-')
  const prefix = props.svgPrefix || ''
  return normalized.startsWith(prefix) ? normalized : `${prefix}${normalized}`
}

const dedupe = (items: string[]) => Array.from(new Set(items))

const riAll = computed(() => iconifyNames('ri', ri as IconsJson))
const mdiAll = computed(() => iconifyNames('mdi', mdi as IconsJson))
const ionAll = computed(() => iconifyNames('ion', ion as IconsJson))

const antdvAll = computed(() =>
  Object.keys(AntdvIcons)
    .filter((name) => /(Outlined|Filled|TwoTone)$/.test(name))
    .map((name) => `antdv-next:${name}`)
)

const svgAll = computed(() => {
  const fromLocal = Object.keys(localSvgModules)
    .map(extractSvgSymbolName)
    .filter(Boolean)
    .map(normalizeSvgName)

  const fromProps = (props.svgIcons || [])
    .map(normalizeSvgName)
    .filter(Boolean)

  return dedupe([...fromProps, ...fromLocal])
})

const allOfflineIcons = computed(() => {
  return dedupe([
    ...riAll.value,
    ...mdiAll.value,
    ...ionAll.value,
    ...antdvAll.value,
    ...svgAll.value
  ])
})

const iconMetaConfig: Record<string, { label: string; color: string }> = {
  ri: { label: 'Remix', color: '#3b82f6' },
  mdi: { label: 'MDI', color: '#10b981' },
  ion: { label: 'Ion', color: '#8b5cf6' },
  'antdv-next': { label: 'Antdv', color: '#ef4444' },
  svg: { label: 'SVG', color: '#f59e0b' },
  online: { label: 'Online', color: '#64748b' },
  unknown: { label: 'Unknown', color: '#9ca3af' }
}

const getIconMeta = (iconName: string) => {
  const value = iconName.trim()
  if (value.startsWith('ri:')) return iconMetaConfig.ri
  if (value.startsWith('mdi:')) return iconMetaConfig.mdi
  if (value.startsWith('ion:')) return iconMetaConfig.ion
  if (value.startsWith('svg:')) return iconMetaConfig.svg
  if (value.startsWith('antdv-next:') || value.startsWith('antd:')) return iconMetaConfig['antdv-next']
  if (value.includes(':')) return iconMetaConfig.online
  return iconMetaConfig.unknown
}

const onlineIcons = ref<string[]>([])
const onlineLoading = ref(false)
const onlineError = ref('')
const onlineCache = new Map<string, string[]>()
const onlineAbortController = ref<AbortController | null>(null)
let onlineTimer: ReturnType<typeof setTimeout> | null = null

const shouldSearchOnline = computed(() => {
  const query = keyword.value.trim()
  if (query.length < 2) {
    return false
  }
  return category.value === 'all'
})

const resetOnlineState = () => {
  if (onlineAbortController.value) {
    onlineAbortController.value.abort()
    onlineAbortController.value = null
  }
  onlineLoading.value = false
  onlineError.value = ''
  onlineIcons.value = []
}

const fetchOnlineIcons = async (query: string) => {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    onlineIcons.value = []
    return
  }

  if (onlineCache.has(normalized)) {
    onlineIcons.value = onlineCache.get(normalized) || []
    onlineError.value = ''
    onlineLoading.value = false
    return
  }

  if (onlineAbortController.value) {
    onlineAbortController.value.abort()
  }

  const controller = new AbortController()
  onlineAbortController.value = controller
  onlineLoading.value = true
  onlineError.value = ''

  try {
    const url = `https://api.iconify.design/search?query=${encodeURIComponent(normalized)}&limit=${props.onlineLimit}`
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = (await response.json()) as { icons?: string[] }
    const icons = Array.isArray(data.icons)
      ? data.icons.filter((item): item is string => typeof item === 'string' && Boolean(item))
      : []

    onlineCache.set(normalized, icons)
    if (controller.signal.aborted) {
      return
    }
    onlineIcons.value = icons
  } catch (error: any) {
    if (controller.signal.aborted) {
      return
    }
    onlineError.value = error?.message ? $t('iconPicker.onlineSearchFailedDetail', { message: error.message }) : $t('iconPicker.onlineSearchFailed')
    onlineIcons.value = []
  } finally {
    if (onlineAbortController.value === controller) {
      onlineAbortController.value = null
    }
    if (!controller.signal.aborted) {
      onlineLoading.value = false
    }
  }
}

const scheduleOnlineSearch = () => {
  if (onlineTimer) {
    clearTimeout(onlineTimer)
    onlineTimer = null
  }

  if (!shouldSearchOnline.value) {
    resetOnlineState()
    return
  }

  const query = keyword.value.trim()
  onlineTimer = setTimeout(() => {
    fetchOnlineIcons(query)
  }, 300)
}

watch([keyword, category], () => {
  scheduleOnlineSearch()
})

onBeforeUnmount(() => {
  if (onlineTimer) {
    clearTimeout(onlineTimer)
    onlineTimer = null
  }
  if (onlineAbortController.value) {
    onlineAbortController.value.abort()
    onlineAbortController.value = null
  }
})

const listByCategory = computed<string[]>(() => {
  switch (category.value) {
    case 'ri':
      return riAll.value
    case 'mdi':
      return mdiAll.value
    case 'ion':
      return ionAll.value
    case 'antdv-next':
      return antdvAll.value
    case 'svg':
      return svgAll.value
    default:
      return keyword.value.trim().length >= 2
        ? dedupe([...allOfflineIcons.value, ...onlineIcons.value])
        : allOfflineIcons.value
  }
})

const filtered = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) {
    return listByCategory.value
  }
  if (category.value === 'online') {
    return listByCategory.value
  }
  return listByCategory.value.filter((item) => item.toLowerCase().includes(query))
})

const filteredTotal = computed(() => filtered.value.length)

const pageItems = computed(() => {
  const start = (page.value - 1) * props.pageSize
  return filtered.value.slice(start, start + props.pageSize)
})

const allCount = computed(() => allOfflineIcons.value.length)

const categoryBadgeConfig: Record<string, { name: string; dotColor: string }> = {
  all: { name: 'ALL', dotColor: '#64748b' },
  ri: { name: 'RI', dotColor: '#3b82f6' },
  mdi: { name: 'MDI', dotColor: '#10b981' },
  ion: { name: 'ION', dotColor: '#8b5cf6' },
  'antdv-next': { name: 'Ant', dotColor: '#ef4444' },
  svg: { name: 'SVG', dotColor: '#f59e0b' }
}

const renderCategoryLabel = (key: string, count: number) => {
  const config = categoryBadgeConfig[key]
  return h('div', { class: 'ip-seg-item' }, [
    h('div', { class: 'ip-seg-line1' }, [
      h('span', {
        class: 'ip-seg-dot',
        style: { backgroundColor: config.dotColor }
      }),
      h('span', { class: 'ip-seg-name' }, config.name)
    ]),
    h('div', { class: 'ip-seg-line2' }, String(count))
  ])
}

const categoryOptions = computed(() => [
  { value: 'all', label: renderCategoryLabel('all', allCount.value) },
  { value: 'ri', label: renderCategoryLabel('ri', riAll.value.length) },
  { value: 'mdi', label: renderCategoryLabel('mdi', mdiAll.value.length) },
  { value: 'ion', label: renderCategoryLabel('ion', ionAll.value.length) },
  { value: 'antdv-next', label: renderCategoryLabel('antdv-next', antdvAll.value.length) },
  { value: 'svg', label: renderCategoryLabel('svg', svgAll.value.length) }
])

const effectiveValue = computed(() => boundValue.value)

const emitUpdate = (value: string) => {
  emit('update:value', value)
  emit('update:modelValue', value)
  emit('change', value)
}

const focusSearch = () => {
  nextTick(() => {
    searchRef.value?.focus?.()
  })
}

const detectCategoryByIcon = (iconName: string): Category => {
  if (!iconName) {
    return 'all'
  }
  if (iconName.startsWith('ri:')) return 'ri'
  if (iconName.startsWith('mdi:')) return 'mdi'
  if (iconName.startsWith('ion:')) return 'ion'
  if (iconName.startsWith('svg:')) return 'svg'
  if (iconName.startsWith('antdv-next:') || iconName.startsWith('antd:')) return 'antdv-next'
  return 'all'
}

const togglePopover = () => {
  open.value = !open.value
  if (open.value) {
    focusSearch()
  }
}

const apply = (name: string) => {
  editableValue.value = name
  inputSnapshot.value = name
  emitUpdate(name)
  open.value = false
}

const onInputChange = () => {
  inputSnapshot.value = editableValue.value
  emitUpdate(editableValue.value)
}

const onCategoryChange = () => {
  page.value = 1
  focusSearch()
}

const onOpenChange = (next: boolean) => {
  if (next) {
    inputSnapshot.value = editableValue.value
    category.value = detectCategoryByIcon(boundValue.value.trim())
    page.value = 1
    focusSearch()
  } else {
    editableValue.value = inputSnapshot.value
  }
  open.value = next
}

watch([category, keyword], () => {
  page.value = 1
})
</script>

<style scoped lang="scss">
/* 主容器 */
.ip-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #333;
}

/* 分类栏样式 */
.ip-seg {
  padding: 2px;
  border-radius: 6px;
  background-color: #f5f5f5;

  /* 强制调整内部 Ant Design 样式 */
  :deep(.ant-segmented-item-label) {
    min-height: unset;
    padding: 4px 6px !important;
    overflow: hidden;
    font-size: 11px !important;
    line-height: 1.2;
    text-overflow: ellipsis;
  }

  :deep(.ip-seg-item) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0;
    line-height: 1;
    gap: 2px;
  }

  /* 第一行：点 + 名称 */
  :deep(.ip-seg-line1) {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
  }

  :deep(.ip-seg-dot) {
    flex-shrink: 0;
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }

  /* 第二行：数量 */
  :deep(.ip-seg-line2) {
    margin-top: 0;
    color: #999;
    font-size: 10px;
    white-space: nowrap;
  }
}

/* 网格容器背景 */
.ip-grid-container {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background-color: #fafafa;
}

/* 图标网格防遮挡 */
.ip-grid {
  display: grid;
  position: relative;
  grid-auto-rows: 40px;
  grid-template-columns: repeat(6, 1fr);
  height: 305px;

  /* 关键修改：增加内边距，防止 hover 上浮时被 overflow 切掉 */
  padding: 12px;
  overflow: hidden auto;
  gap: 8px;

  /* 滚动条样式 */
  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: #e0e0e0;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

/* 空状态 */
.ip-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 280px;
  color: #999;
}

/* 图标卡片 */
.ip-item {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;

  /* 关键：防止底部色条超出圆角 */
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #eee;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 2%);
  cursor: pointer;

  /* 悬停效果 */
  &:hover {
    z-index: 10;
    transform: translateY(-2px);
    border-color: var(--hover-color, #1677ff);
    box-shadow: 0 4px 10px rgb(0 0 0 / 8%);

    /* hover 时色条变粗 */
    .ip-item-bar {
      height: 4px;
      opacity: 1;
    }
  }

  /* 选中状态 */
  &.selected {
    z-index: 5;
    border-color: #1677ff;
    background: #e6f7ff;
    box-shadow: inset 0 0 0 1px #1677ff;
    color: #1677ff;
  }
}

/* 底部色彩条 - 修复版 */
.ip-item-bar {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;

  /* 默认显示 2px 的高度，确保颜色可见 */
  height: 2px;
  transition: all 0.2s;

  /* 稍微透明一点，不抢眼，但能看清颜色 */
  opacity: 0.7;
  background-color: var(--hover-color, #ccc);
}

/* 底部栏 */
.ip-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ip-total {
  color: #888;
  font-size: 12px;

  b {
    color: #333;
  }
}

/* 深度选择器修改分页样式，使其更紧凑 */
.ip-pagination :deep(.ant-pagination-item),
.ip-pagination :deep(.ant-pagination-prev),
.ip-pagination :deep(.ant-pagination-next) {
  min-width: 24px;
  height: 24px;
  line-height: 22px;
}

/* Tooltip 内容 */
.ip-tooltip-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.ip-tooltip-name {
  font-size: 12px;
  font-weight: 500;
}

.ip-tooltip-tag {
  height: 18px;
  margin: 0;
  padding: 0 4px;
  font-size: 10px;
  line-height: 16px;
}
</style>

<style lang="scss">
/* 全局样式，确保弹出框内层撑满外层宽度 */
.icon-picker-overlay {
  .ant-popover-inner {
    width: 100%;
  }

  .ant-popover-inner-content {
    padding: 12px;
  }
}
</style>
