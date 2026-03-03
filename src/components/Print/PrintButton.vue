<script setup lang="ts">
import type { PrintOptions } from '@/composables/usePrint'
import { PrinterOutlined } from '@antdv-next/icons'
import { computed } from 'vue'
import { usePrint } from '@/composables/usePrint'

interface Props {
  /** Element selector or HTMLElement to print */
  target?: string | HTMLElement
  /** Print button text */
  text?: string
  /** Button type */
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text'
  /** Whether button is disabled */
  disabled?: boolean
  /** Print options */
  options?: PrintOptions
}

const props = withDefaults(defineProps<Props>(), {
  text: 'Print',
  type: 'default',
  disabled: false,
  options: () => ({}),
})

const emit = defineEmits<{
  success: []
  error: [error: Error]
}>()

const { isPrinting, printElement, printPage } = usePrint()

async function handleClick() {
  try {
    if (props.target) {
      await printElement(props.target, props.options)
    }
    else {
      printPage()
    }
    emit('success')
  }
  catch (error) {
    emit('error', error as Error)
  }
}

const buttonType = computed(() => props.type)
</script>

<template>
  <a-button
    :type="buttonType"
    :disabled="disabled"
    :loading="isPrinting"
    @click="handleClick"
  >
    <template #icon>
      <PrinterOutlined />
    </template>
    {{ isPrinting ? 'Printing...' : text }}
  </a-button>
</template>

<style scoped>
/* Print-specific styles */
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
