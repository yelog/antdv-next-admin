import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PrimaryColor, SidebarTheme, LayoutMode, PageAnimation } from '@/types/layout'

const PAGE_ANIMATION_VALUES: PageAnimation[] = [
  'fade',
  'slide-left',
  'slide-right',
  'slide-up',
  'slide-down',
  'zoom',
  'zoom-big',
  'none'
]

export const useSettingsStore = defineStore('settings', () => {
  // State
  const primaryColor = ref<PrimaryColor>('blue')
  const sidebarTheme = ref<SidebarTheme>('dark')
  const layoutMode = ref<LayoutMode>('vertical')
  const pageAnimation = ref<PageAnimation>('fade')
  const grayMode = ref(false)

  // Actions
  const setPrimaryColor = (color: PrimaryColor) => {
    primaryColor.value = color
    document.documentElement.setAttribute('data-primary-color', color)
    localStorage.setItem('app-primary-color', color)
  }

  const setSidebarTheme = (theme: SidebarTheme) => {
    sidebarTheme.value = theme
    localStorage.setItem('app-sidebar-theme', theme)
  }

  const setLayoutMode = (mode: LayoutMode) => {
    layoutMode.value = mode
    localStorage.setItem('app-layout-mode', mode)
  }

  const setPageAnimation = (animation: PageAnimation) => {
    pageAnimation.value = animation
    localStorage.setItem('app-page-animation', animation)
  }

  const setGrayMode = (enabled: boolean) => {
    grayMode.value = enabled
    document.documentElement.classList.toggle('gray-mode', enabled)
    localStorage.setItem('app-gray-mode', enabled.toString())
  }

  const resetSettings = () => {
    setPrimaryColor('blue')
    setSidebarTheme('dark')
    setLayoutMode('vertical')
    setPageAnimation('fade')
    setGrayMode(false)
  }

  const initSettings = () => {
    // Restore from localStorage
    const savedPrimaryColor = localStorage.getItem('app-primary-color') as PrimaryColor
    const savedSidebarTheme = localStorage.getItem('app-sidebar-theme') as SidebarTheme
    const savedLayoutMode = localStorage.getItem('app-layout-mode') as LayoutMode
    const savedPageAnimation = localStorage.getItem('app-page-animation') as PageAnimation
    const savedGrayMode = localStorage.getItem('app-gray-mode')

    if (savedPrimaryColor) setPrimaryColor(savedPrimaryColor)
    if (savedSidebarTheme) setSidebarTheme(savedSidebarTheme)
    if (savedLayoutMode) setLayoutMode(savedLayoutMode)
    if (savedPageAnimation && PAGE_ANIMATION_VALUES.includes(savedPageAnimation)) {
      setPageAnimation(savedPageAnimation)
    }
    if (savedGrayMode) setGrayMode(savedGrayMode === 'true')
  }

  return {
    // State
    primaryColor,
    sidebarTheme,
    layoutMode,
    pageAnimation,
    grayMode,
    // Actions
    setPrimaryColor,
    setSidebarTheme,
    setLayoutMode,
    setPageAnimation,
    setGrayMode,
    resetSettings,
    initSettings
  }
})
