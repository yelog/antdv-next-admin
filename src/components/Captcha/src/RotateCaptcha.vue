<template>
  <div class="rotate-captcha" :style="{ width: typeof width === 'number' ? width + 'px' : width }">
    <div class="rotate-img-wrapper">
      <img
        :src="src"
        class="rotate-img"
        :style="{ transform: `rotate(${currentAngle}deg)` }"
        alt="captcha"
        draggable="false"
      />
      <div v-if="isSuccess" class="success-mask">
        <span class="success-icon">✔</span>
      </div>
    </div>
    <div class="rotate-slider" ref="sliderRef">
      <div class="slider-track"></div>
      <div
        class="slider-handle"
        :style="{ left: `${sliderPercent}%` }"
        @mousedown="handleMouseDown"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  width?: number | string
  height?: number | string
  src?: string
  tolerance?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  src: 'https://picsum.photos/300/300',
  tolerance: 10
})

const emit = defineEmits(['success', 'fail'])

const currentAngle = ref(0)
const sliderPercent = ref(0)
const isMoving = ref(false)
const isSuccess = ref(false)
const initialAngle = ref(0)
const sliderRef = ref<HTMLElement | null>(null)

const init = () => {
  initialAngle.value = Math.random() * 300 + 30
  currentAngle.value = initialAngle.value
  sliderPercent.value = 0
  isSuccess.value = false
}

// Init
init()

const handleMouseDown = (e: MouseEvent) => {
  if (isSuccess.value) return
  isMoving.value = true
  const startX = e.clientX
  const startPercent = sliderPercent.value

  const handleMouseMove = (e: MouseEvent) => {
    if (!isMoving.value) return
    const container = sliderRef.value
    if (!container) return

    const width = container.clientWidth
    const deltaX = e.clientX - startX
    const deltaPercent = (deltaX / width) * 100

    let newPercent = startPercent + deltaPercent
    newPercent = Math.max(0, Math.min(100, newPercent))

    sliderPercent.value = newPercent
    // Map 0-100% to 0-360deg to offset initial angle
    const rotateDelta = (newPercent / 100) * 360
    currentAngle.value = initialAngle.value - rotateDelta
  }

  const handleMouseUp = () => {
    isMoving.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)

    // Check if angle is close to 0 (360 multiples)
    let normalizedAngle = currentAngle.value % 360
    if (normalizedAngle > 180) normalizedAngle -= 360
    if (normalizedAngle < -180) normalizedAngle += 360

    if (Math.abs(normalizedAngle) <= props.tolerance) {
      isSuccess.value = true
      emit('success')
    } else {
      emit('fail')
    }
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const reset = () => {
  init()
}

defineExpose({ reset })
</script>

<style scoped>
.rotate-captcha {
  display: flex;
  flex-direction: column;
  gap: 16px;
  user-select: none;
}
.rotate-img-wrapper {
  position: relative;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  background-color: var(--color-bg-layout);
}
.rotate-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
.success-mask {
  position: absolute;
  inset: 0;
  background-color: rgba(82, 196, 26, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.success-icon {
  font-size: 48px;
  color: var(--color-success);
  text-shadow: 0 0 4px #fff;
}
.rotate-slider {
  position: relative;
  height: 40px;
  background-color: var(--color-bg-container);
  border: 1px solid var(--color-border);
  border-radius: 20px;
}
.slider-track {
  position: absolute;
  top: 50%;
  left: 10px;
  right: 10px;
  height: 4px;
  background-color: var(--color-bg-layout);
  border-radius: 2px;
  transform: translateY(-50%);
}
.slider-handle {
  position: absolute;
  top: 1px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--color-bg-container);
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: grab;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.slider-handle::after {
  content: '';
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--color-text-tertiary);
}
.slider-handle:active {
  cursor: grabbing;
  border-color: var(--color-primary);
}
.slider-handle:active::after {
  background-color: var(--color-primary);
}
</style>