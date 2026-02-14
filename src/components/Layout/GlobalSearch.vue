<template>
  <Teleport to="body">
    <Transition name="search-modal">
      <div v-if="visible" class="global-search-overlay" @click="close">
        <div class="global-search-content" @click.stop>
          <div class="search-input-wrapper">
            <SearchOutlined class="search-icon" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="search-input"
              :placeholder="$t('layout.searchPlaceholder')"
              @keydown="handleKeydown"
            />
            <span class="search-tag">ESC</span>
          </div>

          <div v-if="searchResults.length > 0 || searchQuery" class="search-body">
            <div v-if="searchResults.length > 0" class="search-results">
              <div
                v-for="(result, index) in searchResults"
                :key="result.path"
                class="search-item"
                :class="{ active: index === activeIndex }"
                @click="handleResultClick(result)"
                @mouseenter="activeIndex = index"
              >
                <div class="item-icon">
                  <component :is="getIconComponent(result.icon)" v-if="result.icon" />
                  <FileOutlined v-else />
                </div>
                <div class="item-info">
                  <span class="item-title" v-html="highlightText(result.title, searchQuery)"></span>
                  <span class="item-path" v-html="highlightText(formatPath(result.path), searchQuery)"></span>
                </div>
                <EnterOutlined class="item-enter" />
              </div>
            </div>
            <div v-else class="search-empty">
              <div class="empty-icon">
                <SearchOutlined />
              </div>
              <p>{{ $t('layout.noSearchResults') }}</p>
            </div>
          </div>

          <div class="search-footer">
            <div class="footer-item">
              <span class="key-badge">
                <ArrowUpOutlined />
              </span>
              <span class="key-badge">
                <ArrowDownOutlined />
              </span>
              <span class="footer-text">{{ $t('common.navigate') || 'Navigate' }}</span>
            </div>
            <div class="footer-item">
              <span class="key-badge">
                <EnterOutlined />
              </span>
              <span class="footer-text">{{ $t('common.select') || 'Select' }}</span>
            </div>
            <div class="footer-item">
              <span class="key-badge">ESC</span>
              <span class="footer-text">{{ $t('common.close') || 'Close' }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  SearchOutlined,
  FileOutlined,
  EnterOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@antdv-next/icons'
import { basicRoutes } from '@/router/routes'
import { routesToMenuTree } from '@/router/utils'
import { usePermissionStore } from '@/stores/permission'
import type { MenuItem } from '@/types/router'
import { resolveLocaleText } from '@/utils/i18n'
import { resolveIcon } from '@/utils/icon'
import { match as pinyinMatch } from 'pinyin-pro'

interface SearchItem {
  path: string
  title: string
  icon?: string
  rawTitle: string
}

const router = useRouter()
const permissionStore = usePermissionStore()
const visible = ref(false)
const searchQuery = ref('')
const searchResults = ref<SearchItem[]>([])
const activeIndex = ref(0)
const searchInputRef = ref<HTMLInputElement | null>(null)

const fallbackMenus = computed<MenuItem[]>(() => {
  const basicChildren = basicRoutes.flatMap(route => route.children || [])
  return routesToMenuTree(basicChildren)
})

const menuSource = computed<MenuItem[]>(() => {
  if (permissionStore.menuTree.length > 0) {
    return permissionStore.menuTree
  }
  return fallbackMenus.value
})

const searchSource = computed<SearchItem[]>(() => {
  const items: SearchItem[] = []

  const traverse = (menus: MenuItem[], parentLabels: string[] = []) => {
    menus.forEach(menu => {
      const currentLabel = resolveLocaleText(menu.label, menu.path)
      const currentLabels = [...parentLabels, currentLabel]

      if (menu.children && menu.children.length > 0) {
        // Only recurse into children, skip non-leaf nodes
        traverse(menu.children, currentLabels)
      } else if (menu.path) {
        // Leaf node: show full parent path
        items.push({
          path: menu.path,
          title: currentLabels.join(' > '),
          icon: menu.icon,
          rawTitle: menu.label
        })
      }
    })
  }

  traverse(menuSource.value)

  // Deduplicate
  const uniqueByPath = new Map<string, SearchItem>()
  items.forEach(item => {
    if (!uniqueByPath.has(item.path)) {
      uniqueByPath.set(item.path, item)
    }
  })
  return Array.from(uniqueByPath.values())
})

const getIconComponent = (icon?: string) => resolveIcon(icon)

const formatPath = (path: string) => {
  return path.split('/').filter(Boolean).join(' > ')
}

const highlightText = (text: string, query: string): string => {
  if (!query) return text

  // 1. Try direct text match
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  if (regex.test(text)) {
    return text.replace(regex, '<span class="highlight">$1</span>')
  }

  // 2. Try pinyin match (full pinyin / first letter / mixed)
  const matched = pinyinMatch(text, query)
  if (matched && matched.length > 0) {
    const indexSet = new Set(matched)
    return Array.from(text).map((char, i) =>
      indexSet.has(i) ? `<span class="highlight">${char}</span>` : char
    ).join('')
  }

  return text
}

const handleSearch = () => {
  if (!searchQuery.value) {
    searchResults.value = []
    return
  }

  const query = searchQuery.value.toLowerCase()
  searchResults.value = searchSource.value.filter(
    item =>
      item.title.toLowerCase().includes(query) ||
      item.path.toLowerCase().includes(query) ||
      pinyinMatch(item.title, query) !== null
  ).slice(0, 20)
  activeIndex.value = 0
}

const handleResultClick = (result: SearchItem) => {
  router.push(result.path)
  close()
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    e.preventDefault()
    close()
    return
  }

  if (searchResults.value.length === 0) return

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value = activeIndex.value > 0 ? activeIndex.value - 1 : searchResults.value.length - 1
      scrollActiveIntoView()
      break
    case 'ArrowDown':
      e.preventDefault()
      activeIndex.value = activeIndex.value < searchResults.value.length - 1 ? activeIndex.value + 1 : 0
      scrollActiveIntoView()
      break
    case 'Enter':
      e.preventDefault()
      handleResultClick(searchResults.value[activeIndex.value])
      break
  }
}

const scrollActiveIntoView = () => {
  nextTick(() => {
    const activeEl = document.querySelector('.search-item.active')
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' })
    }
  })
}

const open = () => {
  visible.value = true
  searchQuery.value = ''
  searchResults.value = []
  activeIndex.value = 0
  nextTick(() => {
    searchInputRef.value?.focus()
  })
  window.addEventListener('keydown', handleGlobalKeydown)
}

const close = () => {
  visible.value = false
  window.removeEventListener('keydown', handleGlobalKeydown)
}

const handleGlobalKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    close()
  }
}

watch(searchQuery, () => {
  handleSearch()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})

defineExpose({ open, close })
</script>

<style scoped lang="scss">
.global-search-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 14vh;
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
}

.global-search-content {
  width: 100%;
  max-width: 600px;
  background-color: var(--color-bg-container);
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-border-secondary);
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  padding: 16px 16px 16px 20px;
  border-bottom: 1px solid var(--color-border-secondary);

  .search-icon {
    font-size: 20px;
    color: var(--color-text-tertiary);
    margin-right: 12px;
  }

  .search-input {
    flex: 1;
    font-size: 18px;
    border: none;
    outline: none;
    background: transparent;
    color: var(--color-text-primary);
    line-height: 1.5;

    &::placeholder {
      color: var(--color-text-quaternary);
    }
  }

  .search-tag {
    padding: 2px 6px;
    border-radius: 4px;
    background-color: var(--color-bg-layout);
    border: 1px solid var(--color-border-secondary);
    color: var(--color-text-tertiary);
    font-size: 12px;
    font-family: var(--font-family-code);
  }
}

.search-body {
  padding: 12px 0;
  max-height: 420px;
  overflow-y: auto;
}

.search-group-title {
  padding: 8px 16px;
  font-size: 12px;
  color: var(--color-text-tertiary);
  font-weight: 600;
}

.search-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin: 0 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.1s ease;
  position: relative;

  &.active {
    background-color: var(--color-primary);
    color: #fff;

    .item-icon {
      color: #fff;
    }

    .item-path {
      color: rgba(255, 255, 255, 0.8);
    }

    .item-enter {
      opacity: 1;
      color: #fff;
    }
  }

  .item-icon {
    font-size: 18px;
    color: var(--color-text-secondary);
    margin-right: 12px;
    display: flex;
    align-items: center;
  }

  .item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .item-title {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;

    :deep(.highlight) {
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }

  .item-path {
    font-size: 12px;
    color: var(--color-text-tertiary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    :deep(.highlight) {
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }

  .item-enter {
    font-size: 14px;
    color: var(--color-text-tertiary);
    opacity: 0;
    transition: opacity 0.2s;
  }
}

.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: var(--color-text-tertiary);

  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }
}

.search-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border-top: 1px solid var(--color-border-secondary);
  background-color: var(--color-bg-layout);
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);

  .key-badge {
    padding: 2px 4px;
    min-width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-bg-container);
    border: 1px solid var(--color-border-secondary);
    border-radius: 3px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    font-family: var(--font-family-code);
    font-size: 11px;
  }
}

// Transitions
.search-modal-enter-active,
.search-modal-leave-active {
  transition: opacity 0.2s ease;

  .global-search-content {
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
}

.search-modal-enter-from,
.search-modal-leave-to {
  opacity: 0;

  .global-search-content {
    transform: scale(0.95) translateY(10px);
  }
}
</style>