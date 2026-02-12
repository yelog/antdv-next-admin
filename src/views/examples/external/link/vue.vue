<template>
  <a-result status="info" :title="$t('external.link.openedTitle')" :sub-title="$t('external.link.openedSubTitle')">
    <template #extra>
      <a-button type="primary" @click="open">
        {{ $t('external.link.openVue') }}
      </a-button>
    </template>
  </a-result>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const url = 'https://vuejs.org'
const open = () => window.open(url, '_blank', 'noopener,noreferrer')

onMounted(() => {
  open()
})
</script>
