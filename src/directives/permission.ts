import type { Directive, DirectiveBinding } from 'vue'
import { useAuthStore } from '@/stores/auth'

/**
 * Permission directive
 * Usage:
 * v-permission="'user.create'"
 * v-permission="['user.create', 'user.edit']"
 * v-permission.all="['user.create', 'user.edit']"
 */
export const vPermission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding)
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding)
  }
}

function checkPermission(el: HTMLElement, binding: DirectiveBinding) {
  const { value, modifiers } = binding
  const authStore = useAuthStore()

  if (!value) {
    throw new Error('Permission value is required. Usage: v-permission="\'user.create\'"')
  }

  const permissions = Array.isArray(value) ? value : [value]
  let hasPermission = false

  if (modifiers.all) {
    // Check if user has all permissions
    hasPermission = permissions.every(perm => authStore.hasPermission(perm))
  } else {
    // Check if user has any permission (OR logic)
    hasPermission = permissions.some(perm => authStore.hasPermission(perm))
  }

  if (!hasPermission) {
    // Remove element if no permission
    el.style.display = 'none'
    // Or completely remove from DOM
    // el.parentNode?.removeChild(el)
  } else {
    el.style.display = ''
  }
}

/**
 * Register permission directive globally
 */
export function setupPermissionDirective(app: any) {
  app.directive('permission', vPermission)
}

export default vPermission
