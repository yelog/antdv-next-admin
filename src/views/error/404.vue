<template>
  <AdminLayout v-if="useAdminLayout">
    <div class="page-container">
      <div class="card flex min-h-[500px] flex-1 items-center justify-center">
        <NotFoundContent />
      </div>
    </div>
  </AdminLayout>
  <main v-else class="flex min-h-screen items-center justify-center bg-[var(--color-bg-layout)]">
    <NotFoundContent />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import NotFoundContent from '@/components/Exception/NotFoundContent.vue';
import AdminLayout from '@/components/Layout/AdminLayout.vue';
import { shouldUseAdminNotFoundLayout } from '@/router/routeRecovery';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const useAdminLayout = computed(() => shouldUseAdminNotFoundLayout(Boolean(authStore.token)));
</script>
