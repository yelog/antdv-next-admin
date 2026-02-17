import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { generate } from '@ant-design/colors'
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

const PRIMARY_COLOR_HEX_MAP: Record<PrimaryColor, string> = {
  blue: '#1890ff',
  green: '#52c41a',
  purple: '#722ed1',
  red: '#f5222d',
  orange: '#fa8c16',
  cyan: '#13c2c2'
}

const isPrimaryColor = (color: string): color is PrimaryColor => color in PRIMARY_COLOR_HEX_MAP

export const useSettingsStore = defineStore('settings', () => {
  // State
  const primaryColor = ref<PrimaryColor>('blue')
  const customPrimaryColor = ref<string>('')
  const primaryColorHex = computed(() => customPrimaryColor.value || PRIMARY_COLOR_HEX_MAP[primaryColor.value])
  const sidebarTheme = ref<SidebarTheme>('light')
  const layoutMode = ref<LayoutMode>('vertical')
  const pageAnimation = ref<PageAnimation>('slide-left')
  const grayMode = ref(false)
  const rememberTabState = ref(true)

  // Actions
  const setPrimaryColor = (color: PrimaryColor) => {
    primaryColor.value = color
    customPrimaryColor.value = ''
    const hex = PRIMARY_COLOR_HEX_MAP[color]
    document.documentElement.setAttribute('data-primary-color', color)
    document.documentElement.style.setProperty('--ant-primary-color', hex)
    localStorage.setItem('app-primary-color', color)
    localStorage.removeItem('app-custom-primary-color')
  }

  const setCustomPrimaryColor = (hex: string) => {
    customPrimaryColor.value = hex
    document.documentElement.removeAttribute('data-primary-color')

    // Generate color scales from the custom color
    const colors = generate(hex)

    // Set base color
    document.documentElement.style.setProperty('--color-primary', hex)
    document.documentElement.style.setProperty('--ant-primary-color', hex)

    // Set color scales (1-10)
    colors.forEach((color, index) => {
      document.documentElement.style.setProperty(`--color-primary-${index + 1}`, color)
    })

    localStorage.setItem('app-custom-primary-color', hex)
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

  const setRememberTabState = (enabled: boolean) => {
    rememberTabState.value = enabled
    localStorage.setItem('app-remember-tab-state', enabled.toString())
  }

  const resetSettings = () => {
    setPrimaryColor('blue')
    setSidebarTheme('dark')
    setLayoutMode('vertical')
    setPageAnimation('slide-left')
    setGrayMode(false)
    setRememberTabState(true)
  }

  const initSettings = () => {
    // Restore from localStorage
    const savedPrimaryColor = localStorage.getItem('app-primary-color')
    const savedCustomPrimaryColor = localStorage.getItem('app-custom-primary-color')
    const savedSidebarTheme = localStorage.getItem('app-sidebar-theme') as SidebarTheme
    const savedLayoutMode = localStorage.getItem('app-layout-mode') as LayoutMode
    const savedPageAnimation = localStorage.getItem('app-page-animation') as PageAnimation
    const savedGrayMode = localStorage.getItem('app-gray-mode')
    const savedRememberTabState = localStorage.getItem('app-remember-tab-state')

    if (savedCustomPrimaryColor) {
      setCustomPrimaryColor(savedCustomPrimaryColor)
    } else if (savedPrimaryColor && isPrimaryColor(savedPrimaryColor)) {
      setPrimaryColor(savedPrimaryColor)
    }
    if (savedSidebarTheme) setSidebarTheme(savedSidebarTheme)
    if (savedLayoutMode) setLayoutMode(savedLayoutMode)
    if (savedPageAnimation && PAGE_ANIMATION_VALUES.includes(savedPageAnimation)) {
      setPageAnimation(savedPageAnimation)
    }
    if (savedGrayMode) setGrayMode(savedGrayMode === 'true')
    rememberTabState.value = savedRememberTabState !== 'false'
  }

  return {
    // State
    primaryColor,
    customPrimaryColor,
    primaryColorHex,
    sidebarTheme,
    layoutMode,
    pageAnimation,
    grayMode,
    rememberTabState,
    // Actions
    setPrimaryColor,
    setCustomPrimaryColor,
    setSidebarTheme,
    setLayoutMode,
    setPageAnimation,
    setGrayMode,
    setRememberTabState,
    resetSettings,
    initSettings
  }
})
