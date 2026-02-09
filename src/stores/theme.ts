import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ThemeMode } from '@/types/layout'

export const useThemeStore = defineStore('theme', () => {
  // State
  const mode = ref<ThemeMode>('system')
  const systemPrefersDark = ref(false)

  // Getters
  const isDark = computed(() => {
    if (mode.value === 'system') {
      return systemPrefersDark.value
    }
    return mode.value === 'dark'
  })

  // Actions
  const updateTheme = () => {
    const shouldBeDark = isDark.value
    document.documentElement.classList.toggle('dark', shouldBeDark)
    localStorage.setItem('theme-mode', mode.value)
  }

  const setTheme = (newMode: ThemeMode) => {
    mode.value = newMode
    updateTheme()
  }

  const toggleTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(mode.value)
    const nextIndex = (currentIndex + 1) % modes.length
    setTheme(modes[nextIndex])
  }

  const initTheme = () => {
    // Get saved theme mode
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode
    if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
      mode.value = savedMode
    }

    // Listen to system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemPrefersDark.value = mediaQuery.matches

    mediaQuery.addEventListener('change', (e) => {
      systemPrefersDark.value = e.matches
      if (mode.value === 'system') {
        updateTheme()
      }
    })

    // Apply initial theme
    updateTheme()
  }

  return {
    // State
    mode,
    systemPrefersDark,
    // Getters
    isDark,
    // Actions
    setTheme,
    toggleTheme,
    updateTheme,
    initTheme
  }
})
