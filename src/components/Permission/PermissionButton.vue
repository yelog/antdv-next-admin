<template>
  <slot v-if="hasPermission" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePermission } from '@/composables/usePermission'

interface Props {
  permission?: string | string[]
  requireAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  requireAll: false
})

const { can, canAll, canAny } = usePermission()

const hasPermission = computed(() => {
  if (!props.permission) {
    return true
  }

  const permissions = Array.isArray(props.permission) ? props.permission : [props.permission]

  if (props.requireAll) {
    return canAll(permissions)
  } else {
    return canAny(permissions)
  }
})
</script>
