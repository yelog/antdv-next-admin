<template>
  <div class="iframe-page">
    <a-card :bordered="false" class="iframe-card">
      <template #title>
        <span class="page-title">Antdv Next 官网（内嵌）</span>
      </template>
      <iframe
        class="iframe"
        src="https://www.antdv-next.com"
        title="Antdv Next"
        frameborder="0"
        referrerpolicy="no-referrer"
      />
    </a-card>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.iframe-page {
  height: 100%;
}

.iframe-card {
  height: calc(100vh - 50px - 38px - 24px);
}

.page-title {
  font-weight: var(--font-weight-semibold);
}

.iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
}
</style>
