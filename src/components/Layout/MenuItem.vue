<template>
  <template v-if="!item.hidden">
    <!-- Menu Item with Children (SubMenu) -->
    <a-sub-menu v-if="item.children && item.children.length > 0" :key="item.id">
      <template #icon>
        <component :is="item.icon" v-if="item.icon" />
      </template>
      <template #title>
        <span>{{ item.label }}</span>
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
        <component :is="item.icon" v-if="item.icon" />
      </template>
      <span>{{ item.label }}</span>
      <a-badge v-if="item.badge" :count="item.badge" :offset="[10, 0]" />
    </a-menu-item>
  </template>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { MenuItem as MenuItemType } from '@/types/router'

interface Props {
  item: MenuItemType
  collapsed?: boolean
}

const props = defineProps<Props>()
const router = useRouter()

const handleClick = () => {
  if (props.item.path) {
    router.push(props.item.path)
  }
}
</script>
