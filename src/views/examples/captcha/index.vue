<template>
  <div class="page-container">
    <div class="card mb-md">
      <h2 class="text-xl font-bold mb-sm">验证码组件示例</h2>
      <p class="text-secondary">封装了常见的几种前端验证码交互组件，支持自定义样式和回调。</p>
    </div>

    <a-row :gutter="[16, 16]">
      <a-col :span="24" :md="12" :lg="8">
        <a-card title="滑块验证 (Slider)" hoverable>
          <SliderCaptcha @success="onSuccess" @fail="onFail" />
        </a-card>
      </a-col>
      <a-col :span="24" :md="12" :lg="8">
        <a-card title="旋转验证 (Rotate)" hoverable>
          <RotateCaptcha @success="onSuccess" @fail="onFail" />
        </a-card>
      </a-col>
      <a-col :span="24" :md="12" :lg="8">
        <a-card title="拼图验证 (Puzzle)" hoverable>
          <PuzzleCaptcha @success="onSuccess" @fail="onFail" />
        </a-card>
      </a-col>
      <a-col :span="24" :md="12" :lg="8">
        <a-card title="点选验证 (Point)" hoverable>
          <PointCaptcha @success="onSuccess" @fail="onFail" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { message } from 'antdv-next'
import { SliderCaptcha, RotateCaptcha, PuzzleCaptcha, PointCaptcha } from '@/components/Captcha'

const onSuccess = () => {
  message.success('验证通过！')
}

const onFail = () => {
  message.error('验证失败，请重试')
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