import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import type { MenuItem } from '@/types/router'

export const usePermissionStore = defineStore('permission', () => {
  // State
  const routes = ref<RouteRecordRaw[]>([])
  const menuTree = ref<MenuItem[]>([])
  const isRoutesGenerated = ref(false)

  // Actions
  const generateRoutes = async (roles: string[], permissions: string[]): Promise<RouteRecordRaw[]> => {
    // This will be implemented with actual route filtering logic
    // For now, return empty array
    isRoutesGenerated.value = true
    return []
  }

  const getAccessibleMenus = (permissions: string[]): MenuItem[] => {
    // Filter menu tree based on permissions
    const filterMenu = (menus: MenuItem[]): MenuItem[] => {
      return menus
        .filter(menu => {
          if (!menu.requiredPermissions || menu.requiredPermissions.length === 0) {
            return true
          }
          return menu.requiredPermissions.some(perm => permissions.includes(perm))
        })
        .map(menu => {
          if (menu.children) {
            return {
              ...menu,
              children: filterMenu(menu.children)
            }
          }
          return menu
        })
    }

    return filterMenu(menuTree.value)
  }

  const setRoutes = (newRoutes: RouteRecordRaw[]) => {
    routes.value = newRoutes
  }

  const setMenuTree = (newMenuTree: MenuItem[]) => {
    menuTree.value = newMenuTree
  }

  const resetPermission = () => {
    routes.value = []
    menuTree.value = []
    isRoutesGenerated.value = false
  }

  return {
    // State
    routes,
    menuTree,
    isRoutesGenerated,
    // Actions
    generateRoutes,
    getAccessibleMenus,
    setRoutes,
    setMenuTree,
    resetPermission
  }
})
