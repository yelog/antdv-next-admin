import type { App } from 'vue'
import { vPermission } from './permission'

/**
 * Register all directives
 */
export function setupDirectives(app: App) {
  app.directive('permission', vPermission)
}

export { vPermission }
