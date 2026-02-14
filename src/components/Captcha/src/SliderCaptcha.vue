<template>
  <div
    class="slider-captcha"
    :style="{
      width: typeof width === 'number' ? width + 'px' : width,
      '--slider-height': typeof height === 'number' ? height + 'px' : height
    }"
  >
    <div class="slider-bg" :class="{ success: isSuccess }">
      <div class="slider-text" :style="{ opacity: isMoving ? 0 : 1 }">
        {{ isSuccess ? successText : text }}
      </div>
      <div
        class="slider-track"
        :style="{ width: isSuccess ? '100%' : `${sliderLeft}px` }"
      ></div>
      <div
        class="slider-handle"
        :class="{ success: isSuccess }"
        :style="{ left: isSuccess ? 'auto' : `${sliderLeft}px`, right: isSuccess ? 0 : 'auto' }"
        @mousedown="handleMouseDown"
        @touchstart.prevent="handleTouchStart"
      >
        <span v-if="isSuccess">✔</span>
        <span v-else>→</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  width?: number | string
  height?: number | string
  text?: string
  successText?: string
}

withDefaults(defineProps<Props>(), {
  width: '100%',
  height: 40,
  text: 'Slide to verify',
  successText: 'Success'
})

const emit = defineEmits(['success', 'fail'])

const isMoving = ref(false)
const isSuccess = ref(false)
const sliderLeft = ref(0)
const startX = ref(0)
let containerWidth = 0

const handleMouseDown = (e: MouseEvent) => {
  if (isSuccess.value) return
  isMoving.value = true
  startX.value = e.clientX

  // Get container width
  const container = (e.target as HTMLElement).closest('.slider-bg')
  const handle = (e.target as HTMLElement).closest('.slider-handle')
  if (container && handle) {
    containerWidth = container.clientWidth - handle.clientWidth
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isMoving.value) return
  const offset = e.clientX - startX.value

  if (offset < 0) {
    sliderLeft.value = 0
  } else if (offset > containerWidth) {
    sliderLeft.value = containerWidth
  } else {
    sliderLeft.value = offset
  }
}

const handleMouseUp = () => {
  isMoving.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  finishDrag()
}

const handleTouchStart = (e: TouchEvent) => {
  if (isSuccess.value) return
  isMoving.value = true
  startX.value = e.touches[0].clientX

  const container = (e.target as HTMLElement).closest('.slider-bg')
  const handle = (e.target as HTMLElement).closest('.slider-handle')
  if (container && handle) {
    containerWidth = container.clientWidth - handle.clientWidth
  }

  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd)
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isMoving.value) return
  e.preventDefault()
  const offset = e.touches[0].clientX - startX.value

  if (offset < 0) {
    sliderLeft.value = 0
  } else if (offset > containerWidth) {
    sliderLeft.value = containerWidth
  } else {
    sliderLeft.value = offset
  }
}

const handleTouchEnd = () => {
  isMoving.value = false
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
  finishDrag()
}

const finishDrag = () => {
  if (sliderLeft.value >= containerWidth) {
    isSuccess.value = true
    sliderLeft.value = containerWidth
    emit('success')
  } else {
    // Reset animation
    const animate = () => {
      if (sliderLeft.value > 0) {
        sliderLeft.value = Math.max(0, sliderLeft.value - 10)
        requestAnimationFrame(animate)
      } else {
        emit('fail')
      }
    }
    animate()
  }
}

const reset = () => {
  isSuccess.value = false
  isMoving.value = false
  sliderLeft.value = 0
}

defineExpose({ reset })
</script>

<style scoped>
.slider-captcha {
  --slider-height: 40px;
  user-select: none;
}
.slider-bg {
  position: relative;
  width: 100%;
  height: var(--slider-height);
  background-color: var(--color-bg-container);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  text-align: center;
  line-height: var(--slider-height);
  overflow: hidden;
}
.slider-bg.success {
  background-color: var(--color-success-bg);
  border-color: var(--color-success-border);
  color: var(--color-success);
}
.slider-text {
  position: absolute;
  width: 100%;
  height: 100%;
  color: var(--color-text-secondary);
  font-size: 14px;
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: 1;
}
.slider-track {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: var(--color-info-bg);
  border-right: 1px solid var(--color-info);
}
.slider-handle {
  position: absolute;
  top: 0;
  width: var(--slider-height);
  height: 100%;
  background-color: var(--color-bg-container);
  border: 1px solid var(--color-border);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  z-index: 2;
  transition: background-color 0.3s;
}
.slider-handle:active {
  cursor: grabbing;
  background-color: var(--color-info);
  color: #fff;
}
.slider-handle.success {
  cursor: default;
  background-color: var(--color-success);
  border-color: var(--color-success);
  color: #fff;
}
</style>