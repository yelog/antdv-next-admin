<template>
  <div class="pro-step-form">
    <a-steps :current="currentStep" size="small" class="pro-step-form-steps">
      <a-step
        v-for="(step, index) in steps"
        :key="index"
        :title="step.title"
        :description="step.description"
      >
        <template v-if="step.icon" #icon>
          <component :is="step.icon" />
        </template>
      </a-step>
    </a-steps>

    <div class="pro-step-form-content">
      <template v-for="(step, index) in steps" :key="index">
        <div v-show="currentStep === index">
          <slot :name="`step-${index}`" :step="step" :index="index" />
        </div>
      </template>
    </div>

    <div class="pro-step-form-actions">
      <a-space wrap>
        <a-button :disabled="currentStep === 0" @click="handlePrev">
          {{ prevText || $t('proStepForm.prev') }}
        </a-button>
        <a-button
          v-if="currentStep < steps.length - 1"
          type="primary"
          :loading="loading"
          @click="handleNext"
        >
          {{ nextText || $t('proStepForm.next') }}
        </a-button>
        <a-button
          v-else
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ submitText || $t('common.submit') }}
        </a-button>
        <slot name="extra-actions" :current-step="currentStep" />
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ProStepFormStep } from '@/types/pro'

const { t: $t } = useI18n()

const props = withDefaults(defineProps<{
  steps: ProStepFormStep[]
  modelValue?: number
  loading?: boolean
  prevText?: string
  nextText?: string
  submitText?: string
}>(), {
  modelValue: 0,
  loading: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', step: number): void
  (e: 'next', currentStep: number): void
  (e: 'prev', currentStep: number): void
  (e: 'submit'): void
}>()

const currentStep = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  currentStep.value = val
})

watch(currentStep, (val) => {
  emit('update:modelValue', val)
})

const handlePrev = () => {
  if (currentStep.value > 0) {
    currentStep.value -= 1
    emit('prev', currentStep.value)
  }
}

const handleNext = () => {
  emit('next', currentStep.value)
}

const handleSubmit = () => {
  emit('submit')
}

defineExpose({
  prev: handlePrev,
  goTo: (step: number) => {
    if (step >= 0 && step < props.steps.length) {
      currentStep.value = step
    }
  }
})
</script>

<style scoped lang="scss">
.pro-step-form {
  .pro-step-form-steps {
    margin-bottom: var(--spacing-lg, 24px);
  }

  .pro-step-form-content {
    min-height: 200px;
  }

  .pro-step-form-actions {
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid var(--color-border-secondary);
  }
}
</style>
