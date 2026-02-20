import { defineStore } from 'pinia'
import { ref } from 'vue'

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed'
const AI_COLLAB_ENABLED_KEY = 'layout-ai-collab-enabled'
const AI_PANEL_WIDTH_KEY = 'layout-ai-panel-width'
const AI_PANEL_MIN_WIDTH = 320
const AI_PANEL_MAX_WIDTH = 560

export const useLayoutStore = defineStore('layout', () => {
  // State
  const collapsed = ref(false)
  const sidebarWidth = ref(240)
  const collapsedWidth = ref(80)
  const isMobile = ref(false)
  const pageFullscreen = ref(false)
  const aiCollabEnabled = ref(false)
  const aiPanelWidth = ref(420)

  // Actions
  const toggleSidebar = () => {
    collapsed.value = !collapsed.value
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed.value.toString())
  }

  const setSidebarCollapsed = (value: boolean) => {
    collapsed.value = value
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, value.toString())
  }

  const setIsMobile = (value: boolean) => {
    isMobile.value = value
    // Auto collapse sidebar on mobile
    if (value) {
      collapsed.value = true
    }
  }

  const togglePageFullscreen = () => {
    pageFullscreen.value = !pageFullscreen.value
  }

  const setPageFullscreen = (value: boolean) => {
    pageFullscreen.value = value
  }

  const toggleAiCollab = () => {
    aiCollabEnabled.value = !aiCollabEnabled.value
    localStorage.setItem(AI_COLLAB_ENABLED_KEY, aiCollabEnabled.value.toString())
  }

  const setAiCollabEnabled = (value: boolean) => {
    aiCollabEnabled.value = value
    localStorage.setItem(AI_COLLAB_ENABLED_KEY, value.toString())
  }

  const setAiPanelWidth = (value: number) => {
    const nextWidth = Math.max(AI_PANEL_MIN_WIDTH, Math.min(AI_PANEL_MAX_WIDTH, Math.round(value)))
    aiPanelWidth.value = nextWidth
    localStorage.setItem(AI_PANEL_WIDTH_KEY, String(nextWidth))
  }

  const getCurrentSidebarWidth = () => {
    return collapsed.value ? collapsedWidth.value : sidebarWidth.value
  }

  // Initialize from localStorage
  const initLayout = () => {
    const savedCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    if (savedCollapsed !== null) {
      collapsed.value = savedCollapsed === 'true'
    }

    const savedAiCollabEnabled = localStorage.getItem(AI_COLLAB_ENABLED_KEY)
    if (savedAiCollabEnabled !== null) {
      aiCollabEnabled.value = savedAiCollabEnabled === 'true'
    }

    const savedAiPanelWidth = localStorage.getItem(AI_PANEL_WIDTH_KEY)
    if (savedAiPanelWidth !== null) {
      const parsedWidth = Number(savedAiPanelWidth)
      if (!Number.isNaN(parsedWidth)) {
        setAiPanelWidth(parsedWidth)
      }
    }

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
  }

  return {
    // State
    collapsed,
    sidebarWidth,
    collapsedWidth,
    isMobile,
    pageFullscreen,
    aiCollabEnabled,
    aiPanelWidth,
    // Actions
    toggleSidebar,
    setSidebarCollapsed,
    setIsMobile,
    togglePageFullscreen,
    setPageFullscreen,
    toggleAiCollab,
    setAiCollabEnabled,
    setAiPanelWidth,
    getCurrentSidebarWidth,
    initLayout
  }
})
