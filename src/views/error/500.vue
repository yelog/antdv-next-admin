<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">500</div>
      <h1 class="error-title">{{ $t('error.500') }}</h1>
      <p class="error-description">{{ $t('error.serverError') }}</p>
      <a-button type="primary" size="large" @click="goHome">
        {{ $t('error.backHome') }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped lang="scss">
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--color-bg-layout);

  .error-content {
    text-align: center;

    .error-code {
      font-size: 120px;
      font-weight: var(--font-weight-bold);
      color: var(--color-warning);
      line-height: 1;
      margin-bottom: var(--spacing-lg);
    }

    .error-title {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-semibold);
      margin-bottom: var(--spacing-md);
      color: var(--color-text-primary);
    }

    .error-description {
      font-size: var(--font-size-lg);
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-xl);
    }
  }
}
</style>
