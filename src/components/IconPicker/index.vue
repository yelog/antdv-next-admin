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
              <IconView icon="antdv-next:SearchOutlined" :size="14" />
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
          <div v-if="showOnlineState" class="ip-online-state">
            <span v-if="onlineLoading">在线图标加载中...</span>
            <span v-else-if="onlineError">{{ onlineError }}</span>
          </div>

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
    </template>
  </a-popover>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import * as AntdvIcons from '@antdv-next/icons'
import ri from '@iconify-json/ri/icons.json'
import mdi from '@iconify-json/mdi/icons.json'
import ion from '@iconify-json/ion/icons.json'
import IconView from '@/components/Icon/index.vue'

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
  placeholder: '请选择图标',
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
const placeholder = computed(() => props.placeholder)
const searchPlaceholder = '搜索图标（可输入 iconify 关键词）'

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
  return category.value === 'online' || category.value === 'all'
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
    onlineError.value = error?.message ? `在线搜索失败：${error.message}` : '在线搜索失败'
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
    case 'online':
      return onlineIcons.value
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

const categoryOptions = computed(() => [
  { value: 'all', label: `全部 ${allCount.value}` },
  { value: 'ri', label: `RI ${riAll.value.length}` },
  { value: 'mdi', label: `MDI ${mdiAll.value.length}` },
  { value: 'ion', label: `ION ${ionAll.value.length}` },
  { value: 'antdv-next', label: `Antdv ${antdvAll.value.length}` },
  { value: 'svg', label: `SVG ${svgAll.value.length}` },
  { value: 'online', label: `在线 ${onlineIcons.value.length}` }
])

const showOnlineState = computed(() => {
  return category.value === 'online' && (onlineLoading.value || Boolean(onlineError.value))
})

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
  if (iconName.includes(':')) return 'online'
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
.ip-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #333;
}

.ip-seg {
  padding: 3px;
  border-radius: 6px;
  background-color: #f5f5f5;

  :deep(.ant-segmented-item-label) {
    min-height: 30px;
    padding: 2px 6px !important;
    overflow: hidden;
    font-size: 11px !important;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.ip-grid-container {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background-color: #fafafa;
}

.ip-online-state {
  padding: 8px 12px 0;
  color: #666;
  font-size: 12px;
}

.ip-grid {
  display: grid;
  position: relative;
  grid-auto-rows: 40px;
  grid-template-columns: repeat(6, 1fr);
  height: 305px;
  padding: 12px;
  overflow: hidden auto;
  gap: 8px;

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

.ip-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 280px;
}

.ip-item {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #eee;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 2%);
  cursor: pointer;

  &:hover {
    z-index: 10;
    transform: translateY(-2px);
    border-color: var(--hover-color, #1677ff);
    box-shadow: 0 4px 10px rgb(0 0 0 / 8%);

    .ip-item-bar {
      height: 4px;
      opacity: 1;
    }
  }

  &.selected {
    z-index: 5;
    border-color: #1677ff;
    background: #e6f7ff;
    box-shadow: inset 0 0 0 1px #1677ff;
    color: #1677ff;
  }
}

.ip-item-bar {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  transition: all 0.2s;
  opacity: 0.7;
  background-color: var(--hover-color, #ccc);
}

.ip-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ip-total {
  color: #888;
  font-size: 12px;
}

.ip-pagination :deep(.ant-pagination-item),
.ip-pagination :deep(.ant-pagination-prev),
.ip-pagination :deep(.ant-pagination-next) {
  min-width: 24px;
  height: 24px;
  line-height: 22px;
}

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
