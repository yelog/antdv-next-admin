import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
  // State
  const collapsed = ref(false)
  const sidebarWidth = ref(240)
  const collapsedWidth = ref(80)
  const isMobile = ref(false)

  // Actions
  const toggleSidebar = () => {
    collapsed.value = !collapsed.value
    localStorage.setItem('sidebar-collapsed', collapsed.value.toString())
  }

  const setSidebarCollapsed = (value: boolean) => {
    collapsed.value = value
    localStorage.setItem('sidebar-collapsed', value.toString())
  }

  const setIsMobile = (value: boolean) => {
    isMobile.value = value
    // Auto collapse sidebar on mobile
    if (value) {
      collapsed.value = true
    }
  }

  const getCurrentSidebarWidth = () => {
    return collapsed.value ? collapsedWidth.value : sidebarWidth.value
  }

  // Initialize from localStorage
  const initLayout = () => {
    const savedCollapsed = localStorage.getItem('sidebar-collapsed')
    if (savedCollapsed !== null) {
      collapsed.value = savedCollapsed === 'true'
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
    // Actions
    toggleSidebar,
    setSidebarCollapsed,
    setIsMobile,
    getCurrentSidebarWidth,
    initLayout
  }
})
