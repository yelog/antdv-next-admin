<script setup lang="ts">
// DemoLayout - 纯净布局，无导航、无权限检查
// 用于 iframe 嵌入展示组件
</script>

<template>
  <div class="demo-layout">
    <router-view />
  </div>
</template>

<style>
.demo-layout {
  min-height: 100vh;
  padding: 24px;
  background: var(--color-bg-container);
}
</style>
