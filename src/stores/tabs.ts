import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Tab } from '@/types/layout'
import type { RouteLocationNormalized } from 'vue-router'

export const useTabsStore = defineStore('tabs', () => {
  // State
  const tabs = ref<Tab[]>([])
  const activeTabPath = ref<string>('')

  // Getters
  const cachedTabs = computed(() => {
    return tabs.value
      .filter(tab => tab.name)
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

    // Skip if hidden
    if (meta?.hidden) return

    // Check if tab already exists
    const existingTab = tabs.value.find(tab => tab.path === path)
    if (existingTab) {
      existingTab.name = routeName
      existingTab.title = routeTitle
      existingTab.fullPath = fullPath
      existingTab.query = query as Record<string, any>
      existingTab.params = params as Record<string, any>
      activeTabPath.value = path
      return
    }

    // Create new tab
    const newTab: Tab = {
      id: fullPath,
      name: routeName,
      title: routeTitle,
      path,
      fullPath,
      query: query as Record<string, any>,
      params: params as Record<string, any>,
      closable: !meta?.affix,
      affix: meta?.affix
    }

    tabs.value.push(newTab)
    activeTabPath.value = path
  }

  const closeTab = (path: string) => {
    const index = tabs.value.findIndex(tab => tab.path === path)
    if (index === -1) return

    const tab = tabs.value[index]
    // Cannot close affix tabs
    if (tab.affix) return

    tabs.value.splice(index, 1)

    // If closing active tab, activate adjacent tab
    if (activeTabPath.value === path) {
      const nextTab = tabs.value[index] || tabs.value[index - 1]
      if (nextTab) {
        activeTabPath.value = nextTab.path
      }
    }
  }

  const closeOtherTabs = (path: string) => {
    tabs.value = tabs.value.filter(tab => tab.path === path || tab.affix)
    activeTabPath.value = path
  }

  const closeAllTabs = () => {
    // Keep only affix tabs
    tabs.value = tabs.value.filter(tab => tab.affix)
    if (tabs.value.length > 0) {
      activeTabPath.value = tabs.value[0].path
    }
  }

  const closeLeftTabs = (path: string) => {
    const index = tabs.value.findIndex(tab => tab.path === path)
    if (index === -1) return

    tabs.value = tabs.value.filter((tab, i) => i >= index || tab.affix)
  }

  const closeRightTabs = (path: string) => {
    const index = tabs.value.findIndex(tab => tab.path === path)
    if (index === -1) return

    tabs.value = tabs.value.filter((tab, i) => i <= index || tab.affix)
  }

  const setActiveTab = (path: string) => {
    activeTabPath.value = path
  }

  const refreshTab = (path: string) => {
    const tab = tabs.value.find(t => t.path === path)
    if (tab) {
      // Remove from cache temporarily
      const index = tabs.value.indexOf(tab)
      tabs.value.splice(index, 1)
      // Add it back
      setTimeout(() => {
        tabs.value.splice(index, 0, tab)
      }, 0)
    }
  }

  // Initialize affix tabs
  const initAffixTabs = (routes: any[]) => {
    const affixTabs: Tab[] = []

    const findAffixRoutes = (routes: any[], basePath = '') => {
      routes.forEach(route => {
        if (route.meta?.affix && route.path) {
          const routeName = String(route.name || route.path)
          const routeTitle = route.meta?.title ? String(route.meta.title) : routeName
          affixTabs.push({
            id: basePath + route.path,
            name: routeName,
            title: routeTitle,
            path: basePath + route.path,
            fullPath: basePath + route.path,
            closable: false,
            affix: true
          })
        }

        if (route.children) {
          findAffixRoutes(route.children, basePath + route.path)
        }
      })
    }

    findAffixRoutes(routes)
    tabs.value = affixTabs
  }

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
    setActiveTab,
    refreshTab,
    initAffixTabs
  }
})
