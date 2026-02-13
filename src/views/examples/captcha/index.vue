<template>
  <div class="page-container">
    <div class="card mb-md">
      <h2 class="text-xl font-bold mb-sm">{{ t('exampleCaptcha.title') }}</h2>
      <p class="text-secondary">{{ t('exampleCaptcha.description') }}</p>
    </div>

    <a-row :gutter="[16, 16]">
      <a-col :span="24" :md="12" :lg="8">
        <a-card :title="t('exampleCaptcha.slider')" hoverable>
          <SliderCaptcha @success="onSuccess" @fail="onFail" />
        </a-card>
      </a-col>
      <a-col :span="24" :md="12" :lg="8">
        <a-card :title="t('exampleCaptcha.rotate')" hoverable>
          <RotateCaptcha @success="onSuccess" @fail="onFail" />
        </a-card>
      </a-col>
      <a-col :span="24" :md="12" :lg="8">
        <a-card :title="t('exampleCaptcha.puzzle')" hoverable>
          <PuzzleCaptcha @success="onSuccess" @fail="onFail" />
        </a-card>
      </a-col>
      <a-col :span="24" :md="12" :lg="8">
        <a-card :title="t('exampleCaptcha.point')" hoverable>
          <PointCaptcha @success="onSuccess" @fail="onFail" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { message } from 'antdv-next'
import { useI18n } from 'vue-i18n'
import { SliderCaptcha, RotateCaptcha, PuzzleCaptcha, PointCaptcha } from '@/components/Captcha'

const { t } = useI18n()

const onSuccess = () => {
  message.success(t('exampleCaptcha.success'))
}

const onFail = () => {
  message.error(t('exampleCaptcha.fail'))
}
</script>

<style scoped>
.mb-md {
  margin-bottom: 16px;
}
.mb-sm {
  margin-bottom: 8px;
}
.text-xl {
  font-size: 20px;
}
.font-bold {
  font-weight: 700;
}
.text-secondary {
  color: var(--color-text-secondary);
}
</style>
