import type { Component } from 'vue'
import * as AntdvIcons from '@antdv-next/icons'

const iconMap = AntdvIcons as unknown as Record<string, Component>

function normalizeIconName(name: string): string {
  const trimmed = name.trim()
  if (trimmed.startsWith('antdv-next:')) {
    return trimmed.slice('antdv-next:'.length)
  }
  if (trimmed.startsWith('antd:')) {
    return trimmed.slice('antd:'.length)
  }
  return trimmed
}

export function resolveIcon(name?: string): Component | undefined {
  if (!name) {
    return undefined
  }

  const iconName = normalizeIconName(name)
  return iconMap[iconName]
}
