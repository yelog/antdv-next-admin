<template>
  <a-modal
    v-model:open="visible"
    :title="$t('layout.searchPlaceholder')"
    :footer="null"
    width="600px"
  >
    <a-input
      v-model:value="searchQuery"
      :placeholder="$t('layout.searchPlaceholder')"
      size="large"
      @input="handleSearch"
    >
      <template #prefix>
        <SearchOutlined />
      </template>
    </a-input>

    <div class="search-results">
      <template v-if="searchResults.length > 0">
        <div
          v-for="result in searchResults"
          :key="result.path"
          class="search-result-item"
          @click="handleResultClick(result)"
        >
          <component :is="getIconComponent(result.icon)" v-if="result.icon" class="result-icon" />
          <span class="result-title">{{ result.title }}</span>
          <span class="result-path">{{ result.path }}</span>
        </div>
      </template>
      <a-empty v-else-if="searchQuery" :description="$t('layout.noSearchResults')" />
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { SearchOutlined } from '@antdv-next/icons'
import { basicRoutes } from '@/router/routes'
import { getAllMenuPaths } from '@/router/utils'
import { usePermissionStore } from '@/stores/permission'
import { resolveLocaleText } from '@/utils/i18n'
import { resolveIcon } from '@/utils/icon'

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

const searchSource = computed<SearchItem[]>(() => {
  const basicChildren = basicRoutes.flatMap(route => route.children || [])
  const dynamicRoutes = permissionStore.routes as any[]
  const menuPaths = getAllMenuPaths([
    ...basicChildren,
    ...dynamicRoutes
  ])

  return menuPaths.map(item => ({
    path: item.path,
    title: resolveLocaleText(item.title, item.path),
    icon: item.icon,
    rawTitle: item.title
  }))
})

const getIconComponent = (icon?: string) => resolveIcon(icon)

const handleSearch = () => {
  if (!searchQuery.value) {
    searchResults.value = []
    return
  }

  const query = searchQuery.value.toLowerCase()
  searchResults.value = searchSource.value.filter(
    item =>
      item.title.toLowerCase().includes(query) ||
      item.rawTitle.toLowerCase().includes(query) ||
      item.path.toLowerCase().includes(query)
  ).slice(0, 10)
}

const handleResultClick = (result: SearchItem) => {
  router.push(result.path)
  visible.value = false
  searchQuery.value = ''
  searchResults.value = []
}

watch(visible, (val) => {
  if (!val) {
    searchQuery.value = ''
    searchResults.value = []
  }
})

const open = () => {
  visible.value = true
}

const close = () => {
  visible.value = false
}

defineExpose({ open, close })
</script>

<style scoped lang="scss">
.search-results {
  margin-top: var(--spacing-md);
  max-height: 400px;
  overflow-y: auto;

  .search-result-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-base);
    cursor: pointer;
    transition: background var(--duration-base) var(--ease-out);

    &:hover {
      background: var(--color-bg-layout);
    }

    .result-icon {
      font-size: 16px;
      color: var(--color-text-secondary);
    }

    .result-title {
      flex: 1;
      font-weight: var(--font-weight-medium);
    }

    .result-path {
      font-size: var(--font-size-xs);
      color: var(--color-text-tertiary);
    }
  }
}
</style>
