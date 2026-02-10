import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ThemeMode } from '@/types/layout'

const THEME_TRANSITION_CLASS = 'theme-transition'
const THEME_TRANSITION_DURATION_MS = 320

export const useThemeStore = defineStore('theme', () => {
  // State
  const mode = ref<ThemeMode>('system')
  const systemPrefersDark = ref(false)
  let transitionTimer: number | null = null

  // Getters
  const isDark = computed(() => {
    if (mode.value === 'system') {
      return systemPrefersDark.value
    }
    return mode.value === 'dark'
  })

  // Actions
  const startThemeTransition = () => {
    const root = document.documentElement
    root.classList.add(THEME_TRANSITION_CLASS)

    // Force reflow to ensure transition class is applied before theme variables change.
    void root.offsetWidth

    if (transitionTimer !== null) {
      window.clearTimeout(transitionTimer)
    }

    transitionTimer = window.setTimeout(() => {
      root.classList.remove(THEME_TRANSITION_CLASS)
      transitionTimer = null
    }, THEME_TRANSITION_DURATION_MS + 40)
  }

  const updateTheme = (withTransition = false) => {
    const root = document.documentElement
    if (withTransition) {
      startThemeTransition()
    }

    root.classList.toggle('dark', isDark.value)
    localStorage.setItem('theme-mode', mode.value)
  }

  const setTheme = (newMode: ThemeMode) => {
    if (mode.value === newMode) {
      return
    }

    mode.value = newMode
    updateTheme(true)
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
        updateTheme(true)
      }
    })

    // Apply initial theme
    updateTheme(false)
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
