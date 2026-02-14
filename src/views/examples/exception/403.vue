<template>
  <div class="page-container">
    <div class="card exception-card">
      <a-result
        status="403"
        :title="$t('exampleException.403title')"
        :sub-title="$t('exampleException.403description')"
      >
        <template #extra>
          <a-button type="primary" @click="router.push('/')">
            {{ $t('error.backHome') }}
          </a-button>
        </template>
      </a-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped lang="scss">
.exception-card {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 500px;
}
</style>
