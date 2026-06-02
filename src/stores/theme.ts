import type { ThemeMode } from '@/types/layout';

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const THEME_TRANSITION_CLASS = 'theme-transition';
const THEME_VIEW_TRANSITION_CLASS = 'theme-view-transition';
const THEME_TRANSITION_DURATION_MS = 520;

interface ThemeTransitionOrigin {
  x: number;
  y: number;
}

interface ThemeUpdateOptions {
  withTransition?: boolean;
  origin?: ThemeTransitionOrigin;
  direction?: 'to-dark' | 'to-light';
}

interface ViewTransitionLike {
  ready: Promise<void>;
  finished: Promise<void>;
}

type StartViewTransition = (callback: () => void) => ViewTransitionLike;

export const useThemeStore = defineStore('theme', () => {
  // State
  const mode = ref<ThemeMode>('system');
  const systemPrefersDark = ref(false);
  let transitionTimer: number | null = null;

  // Getters
  const isDark = computed(() => {
    return resolveIsDark(mode.value);
  });

  // Actions
  function resolveIsDark(themeMode: ThemeMode) {
    if (themeMode === 'system') {
      return systemPrefersDark.value;
    }
    return themeMode === 'dark';
  }

  const startThemeTransition = () => {
    const root = document.documentElement;
    root.classList.add(THEME_TRANSITION_CLASS);

    // Force reflow to ensure transition class is applied before theme variables change.
    void root.offsetWidth;

    if (transitionTimer !== null) {
      window.clearTimeout(transitionTimer);
    }

    transitionTimer = window.setTimeout(() => {
      root.classList.remove(THEME_TRANSITION_CLASS);
      transitionTimer = null;
    }, THEME_TRANSITION_DURATION_MS + 40);
  };

  const getStartViewTransition = (): StartViewTransition | null => {
    const documentWithTransition = document as Document & {
      startViewTransition?: StartViewTransition;
    };
    if (typeof documentWithTransition.startViewTransition !== 'function') {
      return null;
    }
    return documentWithTransition.startViewTransition.bind(documentWithTransition);
  };

  const supportsCircularRevealTransition = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    return !!getStartViewTransition();
  };

  const runCircularRevealTransition = (
    origin: ThemeTransitionOrigin,
    direction: ThemeUpdateOptions['direction'],
    applyTheme: () => void,
  ): boolean => {
    const startViewTransition = getStartViewTransition();
    if (!startViewTransition) {
      return false;
    }

    const root = document.documentElement;
    const originX = direction === 'to-dark' ? 0 : origin.x;
    const originY = direction === 'to-dark' ? window.innerHeight : origin.y;
    const x = Math.max(0, Math.min(originX, window.innerWidth));
    const y = Math.max(0, Math.min(originY, window.innerHeight));
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    root.classList.add(THEME_VIEW_TRANSITION_CLASS);
    root.style.setProperty('--theme-transition-x', `${x}px`);
    root.style.setProperty('--theme-transition-y', `${y}px`);
    root.style.setProperty('--theme-transition-radius', `${endRadius}px`);

    const cleanup = () => {
      root.classList.remove(THEME_VIEW_TRANSITION_CLASS);
      root.style.removeProperty('--theme-transition-x');
      root.style.removeProperty('--theme-transition-y');
      root.style.removeProperty('--theme-transition-radius');
    };

    try {
      const transition = startViewTransition(() => {
        applyTheme();
      });
      transition.finished.finally(cleanup);
    } catch {
      cleanup();
      applyTheme();
      return false;
    }

    return true;
  };

  const applyTheme = (themeMode = mode.value) => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolveIsDark(themeMode));
    localStorage.setItem('theme-mode', themeMode);
  };

  const updateTheme = (
    options: ThemeUpdateOptions = {},
    applyThemeCallback = applyTheme,
  ) => {
    const { withTransition = false, origin, direction } = options;
    if (!withTransition) {
      applyThemeCallback();
      return;
    }

    if (origin && supportsCircularRevealTransition()) {
      const success = runCircularRevealTransition(
        origin,
        direction,
        applyThemeCallback,
      );
      if (success) {
        return;
      }
    }

    startThemeTransition();
    applyThemeCallback();
  };

  const setTheme = (newMode: ThemeMode, options: ThemeUpdateOptions = {}) => {
    if (mode.value === newMode) {
      return;
    }

    const wasDark = isDark.value;
    const willBeDark = resolveIsDark(newMode);
    const applyNewTheme = () => {
      mode.value = newMode;
      applyTheme(newMode);
    };

    updateTheme(
      {
        withTransition: true,
        ...options,
        direction: !wasDark && willBeDark ? 'to-dark' : 'to-light',
      },
      applyNewTheme,
    );
  };

  const toggleTheme = (options: ThemeUpdateOptions = {}) => {
    const modes: ThemeMode[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(mode.value);
    const nextIndex = (currentIndex + 1) % modes.length;
    setTheme(modes[nextIndex], options);
  };

  const initTheme = () => {
    // Get saved theme mode
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
      mode.value = savedMode;
    }

    // Listen to system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemPrefersDark.value = mediaQuery.matches;

    mediaQuery.addEventListener('change', (e) => {
      if (mode.value === 'system') {
        const wasDark = systemPrefersDark.value;
        const willBeDark = e.matches;
        updateTheme(
          {
            withTransition: true,
            direction: !wasDark && willBeDark ? 'to-dark' : 'to-light',
          },
          () => {
            systemPrefersDark.value = e.matches;
            applyTheme();
          },
        );
        return;
      }

      systemPrefersDark.value = e.matches;
    });

    // Apply initial theme
    updateTheme({ withTransition: false });
  };

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
    initTheme,
  };
});
