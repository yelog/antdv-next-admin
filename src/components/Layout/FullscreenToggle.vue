<template>
  <a-tooltip :title="isFullscreen ? $t('layout.exitFullscreen') : $t('layout.fullscreen')">
    <a-button type="text" class="header-action" @click="toggle">
      <FullscreenExitOutlined v-if="isFullscreen" />
      <FullscreenOutlined v-else />
    </a-button>
  </a-tooltip>
</template>

<script setup lang="ts">
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue'
import { useFullscreen } from '@/composables/useFullscreen'

const { isFullscreen, toggle } = useFullscreen()
</script>
