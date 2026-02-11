<template>
  <div class="page-container">
    <div class="card">
      <h2>{{ $t('exampleModal.title') }}</h2>
      <p class="mb-lg">{{ $t('exampleModal.description') }}</p>

      <a-space wrap :size="12" class="mb-lg">
        <a-button type="primary" @click="openDefaultModal">
          {{ $t('exampleModal.openDefault') }}
        </a-button>
        <a-button @click="openWideModal">
          {{ $t('exampleModal.openWide') }}
        </a-button>
      </a-space>

      <div class="config-grid">
        <div class="config-item">
          <span>{{ $t('exampleModal.width') }}</span>
          <a-input-number
            v-model:value="modalWidth"
            :min="420"
            :max="1200"
            :step="20"
            style="width: 140px"
          />
        </div>

        <div class="config-item">
          <span>{{ $t('exampleModal.draggable') }}</span>
          <a-switch v-model:checked="draggable" />
        </div>

        <div class="config-item">
          <span>{{ $t('exampleModal.resizable') }}</span>
          <a-switch v-model:checked="resizable" />
        </div>

        <div class="config-item">
          <span>{{ $t('exampleModal.fullscreenable') }}</span>
          <a-switch v-model:checked="fullscreenable" />
        </div>

        <div class="config-item">
          <span>{{ $t('exampleModal.dataCount') }}</span>
          <a-input-number
            v-model:value="dataCount"
            :min="1"
            :max="300"
            :step="10"
            style="width: 140px"
          />
        </div>
      </div>
    </div>

    <ProModal
      v-model:open="modalOpen"
      :title="$t('exampleModal.modalTitle')"
      :width="modalWidth"
      :mask-closable="false"
      :draggable="draggable"
      :resizable="resizable"
      :fullscreenable="fullscreenable"
      @ok="handleConfirm"
      @cancel="handleCancel"
    >
      <a-alert
        type="info"
        show-icon
        :message="$t('exampleModal.hint')"
        style="margin-bottom: 16px"
      />

      <div class="modal-content">
        <h3>{{ $t('exampleModal.contentTitle') }}</h3>
        <p>{{ $t('exampleModal.contentDescription') }}</p>

        <a-form layout="vertical">
          <a-form-item :label="$t('exampleModal.formKeyword')">
            <a-input :placeholder="$t('exampleModal.formKeywordPlaceholder')" />
          </a-form-item>
          <a-form-item :label="$t('exampleModal.formRemark')">
            <a-textarea :rows="3" :placeholder="$t('exampleModal.formRemarkPlaceholder')" />
          </a-form-item>
        </a-form>

        <div class="scroll-list">
          <div
            v-for="row in mockRows"
            :key="row"
            class="scroll-row"
          >
            {{ $t('exampleModal.rowText', { index: row }) }}
          </div>
        </div>
      </div>

      <template #footer>
        <a-space>
          <a-button @click="handleCancel">{{ $t('common.cancel') }}</a-button>
          <a-button type="primary" @click="handleConfirm">{{ $t('common.confirm') }}</a-button>
        </a-space>
      </template>
    </ProModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'antdv-next'
import { $t } from '@/locales'
import ProModal from '@/components/Pro/ProModal/index.vue'

const modalOpen = ref(false)
const modalWidth = ref(760)
const draggable = ref(true)
const resizable = ref(true)
const fullscreenable = ref(true)
const dataCount = ref(24)

const mockRows = computed(() => {
  return Array.from({ length: dataCount.value }, (_, index) => index + 1)
})

const openDefaultModal = () => {
  modalWidth.value = 760
  modalOpen.value = true
}

const openWideModal = () => {
  modalWidth.value = 980
  modalOpen.value = true
}

const handleCancel = () => {
  modalOpen.value = false
}

const handleConfirm = () => {
  message.success($t('exampleModal.confirmSuccess'))
  modalOpen.value = false
}
</script>

<style scoped lang="scss">
.mb-lg {
  margin-bottom: var(--spacing-lg);
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.config-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 10px;
  background: var(--color-bg-container);
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scroll-list {
  border: 1px solid var(--color-border-secondary);
  border-radius: 8px;
  overflow: hidden;
}

.scroll-row {
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border-secondary);

  &:last-child {
    border-bottom: none;
  }
}
</style>
