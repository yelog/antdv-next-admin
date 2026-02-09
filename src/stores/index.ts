import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// Export all stores
export { useAuthStore } from './auth'
export { useLayoutStore } from './layout'
export { useThemeStore } from './theme'
export { useTabsStore } from './tabs'
export { usePermissionStore } from './permission'
export { useNotificationStore } from './notification'
export { useSettingsStore } from './settings'
