<script setup lang="ts">
import type { MenuItem as MenuItemType } from '@/types/router'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { resolveLocaleText } from '@/utils/i18n'
import { resolveIcon } from '@/utils/icon'

interface Props {
  item: MenuItemType
  collapsed?: boolean
}

const props = defineProps<Props>()
const router = useRouter()
const iconComponent = computed(() => resolveIcon(props.item.icon))
const displayLabel = computed(() => {
  return resolveLocaleText(props.item.label, props.item.id)
})

function handleClick() {
  if (props.item.path) {
    router.push(props.item.path)
  }
}
</script>

<template>
  <template v-if="!item.hidden">
    <!-- Menu Item with Children (SubMenu) -->
    <a-sub-menu v-if="item.children && item.children.length > 0" :key="item.id">
      <template #icon>
        <component :is="iconComponent" v-if="iconComponent" />
      </template>
      <template #title>
        <span>{{ displayLabel }}</span>
        <a-badge v-if="item.badge" :count="item.badge" :offset="[10, 0]" />
      </template>
      <MenuItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :collapsed="collapsed"
      />
    </a-sub-menu>

    <!-- Single Menu Item -->
    <a-menu-item v-else :key="item.path || item.id" @click="handleClick">
      <template #icon>
        <component :is="iconComponent" v-if="iconComponent" />
      </template>
      <span>{{ displayLabel }}</span>
      <a-badge v-if="item.badge" :count="item.badge" :offset="[10, 0]" />
    </a-menu-item>
  </template>
</template>
