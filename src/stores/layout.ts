import { defineStore } from 'pinia';
import { computed, onScopeDispose, ref } from 'vue';

import { isDemoBuild } from '@/constants/environment';

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed';
const AI_COLLAB_ENABLED_KEY = 'layout-ai-collab-enabled';
const AI_ENTRY_VISIBLE_KEY = 'layout-ai-entry-visible';
const AI_PANEL_WIDTH_KEY = 'layout-ai-panel-width';
const AI_PANEL_MIN_WIDTH = 320;
const AI_PANEL_MAX_WIDTH = 560;

function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}

export const useLayoutStore = defineStore('layout', () => {
  // State
  const collapsed = ref(false);
  const sidebarWidth = ref(240);
  const collapsedWidth = ref(80);
  const isMobile = ref(isMobileViewport());
  const pageFullscreen = ref(false);
  const aiEntryVisible = ref(isDemoBuild);
  const aiCollabEnabled = ref(false);
  const aiPanelWidth = ref(420);
  const canUseAiCollab = computed(() => isDemoBuild && !isMobile.value && !pageFullscreen.value);

  // Actions
  const toggleSidebar = () => {
    collapsed.value = !collapsed.value;
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed.value.toString());
  };

  const setSidebarCollapsed = (value: boolean) => {
    collapsed.value = value;
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, value.toString());
  };

  const setIsMobile = (value: boolean) => {
    isMobile.value = value;
    // Auto collapse sidebar on mobile
    if (value) {
      collapsed.value = true;
      if (aiCollabEnabled.value) setAiCollabEnabled(false);
    }
  };

  const togglePageFullscreen = () => {
    setPageFullscreen(!pageFullscreen.value);
  };

  const setPageFullscreen = (value: boolean) => {
    pageFullscreen.value = value;
    if (value && aiCollabEnabled.value) setAiCollabEnabled(false);
  };

  const toggleAiCollab = () => {
    setAiCollabEnabled(!aiCollabEnabled.value);
  };

  const setAiCollabEnabled = (value: boolean) => {
    if (!isDemoBuild || (value && (!canUseAiCollab.value || !aiEntryVisible.value))) return;

    aiCollabEnabled.value = value;
    localStorage.setItem(AI_COLLAB_ENABLED_KEY, value.toString());
  };

  const setAiEntryVisible = (value: boolean) => {
    if (!isDemoBuild) return;

    aiEntryVisible.value = value;
    localStorage.setItem(AI_ENTRY_VISIBLE_KEY, value.toString());
    if (!value) {
      setAiCollabEnabled(false);
    }
  };

  const setAiPanelWidth = (value: number) => {
    if (!isDemoBuild || !Number.isFinite(value)) return;

    const nextWidth = Math.max(AI_PANEL_MIN_WIDTH, Math.min(AI_PANEL_MAX_WIDTH, Math.round(value)));
    aiPanelWidth.value = nextWidth;
    localStorage.setItem(AI_PANEL_WIDTH_KEY, String(nextWidth));
  };

  const getCurrentSidebarWidth = () => {
    return collapsed.value ? collapsedWidth.value : sidebarWidth.value;
  };

  const checkMobile = () => setIsMobile(isMobileViewport());
  onScopeDispose(() => {
    if (typeof window !== 'undefined') window.removeEventListener('resize', checkMobile);
  });

  // Initialize from localStorage
  const initLayout = () => {
    const savedCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (savedCollapsed !== null) {
      collapsed.value = savedCollapsed === 'true';
    }

    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (!isDemoBuild) return;

    aiEntryVisible.value = localStorage.getItem(AI_ENTRY_VISIBLE_KEY) !== 'false';
    aiCollabEnabled.value =
      canUseAiCollab.value &&
      aiEntryVisible.value &&
      localStorage.getItem(AI_COLLAB_ENABLED_KEY) === 'true';

    const savedAiPanelWidth = localStorage.getItem(AI_PANEL_WIDTH_KEY);
    if (savedAiPanelWidth !== null) {
      setAiPanelWidth(Number(savedAiPanelWidth));
    }
  };

  return {
    // State
    collapsed,
    sidebarWidth,
    collapsedWidth,
    isMobile,
    pageFullscreen,
    aiEntryVisible,
    aiCollabEnabled,
    aiPanelWidth,
    canUseAiCollab,
    // Actions
    toggleSidebar,
    setSidebarCollapsed,
    setIsMobile,
    togglePageFullscreen,
    setPageFullscreen,
    toggleAiCollab,
    setAiCollabEnabled,
    setAiEntryVisible,
    setAiPanelWidth,
    getCurrentSidebarWidth,
    initLayout,
  };
});
