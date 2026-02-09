<template>
  <a-breadcrumb class="breadcrumb">
    <a-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
      <router-link v-if="item.path && index < breadcrumbs.length - 1" :to="item.path">
        {{ item.label }}
      </router-link>
      <span v-else>{{ item.label }}</span>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.map(item => ({
    label: item.meta.title as string,
    path: item.path
  }))
})
</script>

<style scoped lang="scss">
.breadcrumb {
  :deep(.ant-breadcrumb-link) {
    color: var(--color-text-secondary);

    &:hover {
      color: var(--color-primary);
    }
  }
}
</style>
