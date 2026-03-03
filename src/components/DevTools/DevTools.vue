<script setup lang="ts">
import { BugOutlined } from '@antdv-next/icons'
import { ref } from 'vue'
import DebugPanel from './DebugPanel.vue'

const visible = ref(false)

// Only show in development mode
const isDev = import.meta.env.DEV
</script>

<template>
  <template v-if="isDev">
    <!-- Toggle Button -->
    <a-button
      class="debug-toggle"
      type="primary"
      shape="circle"
      size="large"
      @click="visible = true"
    >
      <template #icon>
        <BugOutlined />
      </template>
    </a-button>

    <!-- Debug Panel -->
    <DebugPanel v-model:visible="visible" />
  </template>
</template>

<style scoped>
.debug-toggle {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.debug-toggle:hover {
  transform: scale(1.1);
  transition: transform 0.2s;
}
</style>
