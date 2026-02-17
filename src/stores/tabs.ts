import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Tab } from '@/types/layout'
import type { RouteLocationNormalized } from 'vue-router'
import router from '@/router'
import { useSettingsStore } from './settings'

const TABS_STORAGE_KEY = 'app-tabs-state'

export const useTabsStore = defineStore('tabs', () => {
  // State
  const tabs = ref<Tab[]>([])
  const activeTabPath = ref<string>('')
  const refreshingRoutes = ref<string[]>([])
  const isRestored = ref(false)

  const isFixedTab = (tab: Tab) => Boolean(tab.affix || tab.pinned)
  const updateTabClosable = (tab: Tab) => {
    tab.closable = !isFixedTab(tab)
  }

  const ensureActiveTab = (fallbackPath?: string) => {
    const activeExists = tabs.value.some(tab => tab.path === activeTabPath.value)
    if (activeExists) return

    if (fallbackPath) {
      const fallbackTab = tabs.value.find(tab => tab.path === fallbackPath)
      if (fallbackTab) {
        activeTabPath.value = fallbackTab.path
        return
      }
    }

    activeTabPath.value = tabs.value[0]?.path || ''
  }

  const resolveRoutePath = (path: string, basePath = ''): string => {
    if (!path) {
      return basePath || '/'
    }

    if (path.startsWith('/')) {
      return path
    }

    const normalizedBase = basePath === '/' ? '' : basePath.replace(/\/$/, '')
    const resolved = `${normalizedBase}/${path}`.replace(/\/+/g, '/')
    return resolved.startsWith('/') ? resolved : `/${resolved}`
  }

  // Getters
  const cachedTabs = computed(() => {
    return tabs.value
      .filter(tab => tab.name && !refreshingRoutes.value.includes(tab.name))
      .map(tab => tab.name)
  })

  const activeTab = computed(() => {
    return tabs.value.find(tab => tab.path === activeTabPath.value)
  })

  // Actions
  const addTab = (route: RouteLocationNormalized) => {
    const { path, fullPath, name, meta, query, params } = route
    const routeName = String(name || path)
    const routeTitle = meta?.title ? String(meta.title) : routeName
    const routeIcon = meta?.icon ? String(meta.icon) : undefined
    const isAffix = Boolean(meta?.affix)

    // Skip if hidden
    if (meta?.hidden) return

    // Check if tab already exists
    const existingTab = tabs.value.find(tab => tab.path === path)
    if (existingTab) {
      existingTab.name = routeName
      existingTab.title = routeTitle
      existingTab.icon = routeIcon
      existingTab.fullPath = fullPath
      existingTab.query = query as Record<string, any>
      existingTab.params = params as Record<string, any>
      existingTab.affix = isAffix
      if (isAffix) {
        existingTab.pinned = false
      }
      updateTabClosable(existingTab)
      activeTabPath.value = path
      return
    }

    // Create new tab
    const newTab: Tab = {
      id: fullPath,
      name: routeName,
      title: routeTitle,
      icon: routeIcon,
      path,
      fullPath,
      query: query as Record<string, any>,
      params: params as Record<string, any>,
      closable: !isAffix,
      pinned: false,
      affix: isAffix
    }

    tabs.value.push(newTab)
    activeTabPath.value = path
  }

  const closeTab = (path: string) => {
    const index = tabs.value.findIndex(tab => tab.path === path)
    if (index === -1) return

    const tab = tabs.value[index]
    // Cannot close fixed tabs
    if (isFixedTab(tab)) return

    tabs.value.splice(index, 1)

    // If closing active tab, activate adjacent tab
    if (activeTabPath.value === path) {
      const nextTab = tabs.value[index] || tabs.value[index - 1]
      activeTabPath.value = nextTab?.path || ''
    }

    ensureActiveTab()
  }

  const closeOtherTabs = (path: string) => {
    tabs.value = tabs.value.filter(tab => tab.path === path || isFixedTab(tab))
    activeTabPath.value = path
    ensureActiveTab(path)
  }

  const closeAllTabs = () => {
    tabs.value = tabs.value.filter(tab => isFixedTab(tab))
    ensureActiveTab()
  }

  const closeLeftTabs = (path: string) => {
    const index = tabs.value.findIndex(tab => tab.path === path)
    if (index === -1) return

    tabs.value = tabs.value.filter((tab, i) => i >= index || isFixedTab(tab))
    ensureActiveTab(path)
  }

  const closeRightTabs = (path: string) => {
    const index = tabs.value.findIndex(tab => tab.path === path)
    if (index === -1) return

    tabs.value = tabs.value.filter((tab, i) => i <= index || isFixedTab(tab))
    ensureActiveTab(path)
  }

  const togglePinTab = (path: string) => {
    const tab = tabs.value.find(item => item.path === path)
    if (!tab || tab.affix) return

    tab.pinned = !tab.pinned
    updateTabClosable(tab)
  }

  const setActiveTab = (path: string) => {
    activeTabPath.value = path
  }

  const refreshTab = async (path: string) => {
    const tab = tabs.value.find(t => t.path === path)
    if (tab && tab.name) {
      // 1. Remove from cache to force component destruction
      refreshingRoutes.value.push(tab.name)

      // 2. Navigate to redirect page
      // This will unmount the current component and mount the Redirect component
      await router.replace('/redirect' + path)

      // 3. Restore cache state
      // The Redirect component will immediately navigate back to the original path.
      // We use a small delay to ensure the unmount/remount cycle completes.
      setTimeout(() => {
        const index = refreshingRoutes.value.indexOf(tab.name)
        if (index > -1) {
          refreshingRoutes.value.splice(index, 1)
        }
      }, 300)
    }
  }

  // Initialize affix tabs
  const initAffixTabs = (routes: any[]) => {
    const affixTabs: Tab[] = []

    const findAffixRoutes = (routes: any[], basePath = '') => {
      routes.forEach(route => {
        const routePath = route.path ? String(route.path) : ''
        const fullPath = resolveRoutePath(routePath, basePath)

        if (route.meta?.affix && routePath) {
          const routeName = String(route.name || routePath)
          const routeTitle = route.meta?.title ? String(route.meta.title) : routeName
          affixTabs.push({
            id: fullPath,
            name: routeName,
            title: routeTitle,
            icon: route.meta?.icon ? String(route.meta.icon) : undefined,
            path: fullPath,
            fullPath,
            closable: false,
            pinned: false,
            affix: true
          })
        }

        if (route.children) {
          findAffixRoutes(route.children, fullPath)
        }
      })
    }

    findAffixRoutes(routes)
    tabs.value = affixTabs
    if (affixTabs.length > 0) {
      activeTabPath.value = affixTabs[0].path
    }
  }

  // Save tabs state to localStorage
  const saveTabsState = () => {
    const settingsStore = useSettingsStore()
    if (!settingsStore.rememberTabState) return

    const state = {
      tabs: tabs.value,
      activeTabPath: activeTabPath.value
    }
    localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(state))
  }

  // Restore tabs state from localStorage
  const restoreTabsState = (routes: any[]) => {
    const settingsStore = useSettingsStore()
    if (!settingsStore.rememberTabState || isRestored.value) return

    const savedState = localStorage.getItem(TABS_STORAGE_KEY)
    if (!savedState) return

    try {
      const state = JSON.parse(savedState)
      if (state.tabs && Array.isArray(state.tabs) && state.tabs.length > 0) {
        // Filter out tabs that no longer exist in routes
        const validPaths = new Set<string>()
        const collectPaths = (routeList: any[], basePath = '') => {
          routeList.forEach(route => {
            const routePath = route.path ? String(route.path) : ''
            const fullPath = resolveRoutePath(routePath, basePath)
            validPaths.add(fullPath)
            if (route.children) {
              collectPaths(route.children, fullPath)
            }
          })
        }
        collectPaths(routes)

        // Restore tabs that still exist
        const restoredTabs = state.tabs.filter((tab: Tab) => validPaths.has(tab.path))
        if (restoredTabs.length > 0) {
          tabs.value = restoredTabs
          // Restore active tab if it exists
          if (state.activeTabPath && validPaths.has(state.activeTabPath)) {
            activeTabPath.value = state.activeTabPath
          } else {
            activeTabPath.value = restoredTabs[0].path
          }
          isRestored.value = true
        }
      }
    } catch {
      // Invalid saved state, ignore
    }
  }

  // Clear saved tabs state
  const clearTabsState = () => {
    localStorage.removeItem(TABS_STORAGE_KEY)
  }

  // Watch for changes and auto-save
  watch(
    () => ({ tabs: tabs.value, activeTabPath: activeTabPath.value }),
    () => {
      saveTabsState()
    },
    { deep: true }
  )

  return {
    // State
    tabs,
    activeTabPath,
    // Getters
    cachedTabs,
    activeTab,
    // Actions
    addTab,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
    closeLeftTabs,
    closeRightTabs,
    togglePinTab,
    setActiveTab,
    refreshTab,
    initAffixTabs,
    restoreTabsState,
    clearTabsState
  }
})
