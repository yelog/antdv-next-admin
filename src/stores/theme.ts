import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ThemeMode } from '@/types/layout'

const THEME_TRANSITION_CLASS = 'theme-transition'
const THEME_VIEW_TRANSITION_CLASS = 'theme-view-transition'
const THEME_TRANSITION_DURATION_MS = 520

interface ThemeTransitionOrigin {
  x: number
  y: number
}

interface ThemeUpdateOptions {
  withTransition?: boolean
  origin?: ThemeTransitionOrigin
}

interface ViewTransitionLike {
  ready: Promise<void>
  finished: Promise<void>
}

type StartViewTransition = (callback: () => void) => ViewTransitionLike

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

  const getStartViewTransition = (): StartViewTransition | null => {
    const documentWithTransition = document as Document & {
      startViewTransition?: StartViewTransition
    }
    if (typeof documentWithTransition.startViewTransition !== 'function') {
      return null
    }
    return documentWithTransition.startViewTransition.bind(documentWithTransition)
  }

  const supportsCircularRevealTransition = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false
    }
    return !!getStartViewTransition()
  }

  const runCircularRevealTransition = (origin: ThemeTransitionOrigin, applyTheme: () => void): boolean => {
    const startViewTransition = getStartViewTransition()
    if (!startViewTransition) {
      return false
    }

    const root = document.documentElement
    const x = Math.max(0, Math.min(origin.x, window.innerWidth))
    const y = Math.max(0, Math.min(origin.y, window.innerHeight))
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    root.classList.add(THEME_VIEW_TRANSITION_CLASS)
    root.style.setProperty('--theme-transition-x', `${x}px`)
    root.style.setProperty('--theme-transition-y', `${y}px`)
    root.style.setProperty('--theme-transition-radius', `${endRadius}px`)

    const cleanup = () => {
      root.classList.remove(THEME_VIEW_TRANSITION_CLASS)
      root.style.removeProperty('--theme-transition-x')
      root.style.removeProperty('--theme-transition-y')
      root.style.removeProperty('--theme-transition-radius')
    }

    try {
      const transition = startViewTransition(() => {
        applyTheme()
      })
      transition.finished.finally(cleanup)
    } catch (error) {
      cleanup()
      applyTheme()
      return false
    }

    return true
  }

  const applyTheme = () => {
    const root = document.documentElement
    root.classList.toggle('dark', isDark.value)
    localStorage.setItem('theme-mode', mode.value)
  }

  const updateTheme = (options: ThemeUpdateOptions = {}) => {
    const { withTransition = false, origin } = options
    if (!withTransition) {
      applyTheme()
      return
    }

    if (origin && supportsCircularRevealTransition()) {
      const success = runCircularRevealTransition(origin, applyTheme)
      if (success) {
        return
      }
    }

    startThemeTransition()
    applyTheme()
  }

  const setTheme = (newMode: ThemeMode, options: ThemeUpdateOptions = {}) => {
    if (mode.value === newMode) {
      return
    }

    mode.value = newMode
    updateTheme({ withTransition: true, ...options })
  }

  const toggleTheme = (options: ThemeUpdateOptions = {}) => {
    const modes: ThemeMode[] = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(mode.value)
    const nextIndex = (currentIndex + 1) % modes.length
    setTheme(modes[nextIndex], options)
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
        updateTheme({ withTransition: true })
      }
    })

    // Apply initial theme
    updateTheme({ withTransition: false })
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
