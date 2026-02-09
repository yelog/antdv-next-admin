import type { Component } from 'vue'
import {
  AppstoreOutlined,
  DashboardOutlined,
  FormOutlined,
  SafetyOutlined,
  SettingOutlined,
  TableOutlined,
  TeamOutlined,
  UserOutlined
} from '@antdv-next/icons'

const iconMap: Record<string, Component> = {
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  AppstoreOutlined,
  TableOutlined,
  FormOutlined
}

export function resolveIcon(name?: string): Component | undefined {
  if (!name) {
    return undefined
  }
  return iconMap[name]
}
