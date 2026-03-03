import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// Export all stores
export { useAuthStore } from './auth'
export { useDemoStateCacheStore } from './demoStateCache'
export { useDictStore } from './dict'
export { useLayoutStore } from './layout'
export { useNotificationStore } from './notification'
export { usePermissionStore } from './permission'
export { useSettingsStore } from './settings'
export { useTabsStore } from './tabs'
export { useThemeStore } from './theme'
export { useWatermarkStore } from './watermark'
