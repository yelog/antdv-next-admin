<template>
  <div class="puzzle-captcha" ref="containerRef" :style="{ width: typeof width === 'number' ? width + 'px' : width }">
    <div class="puzzle-img-wrapper" :style="{ height: currentHeight + 'px' }">
      <canvas ref="mainCanvasRef" :width="currentWidth" :height="currentHeight" class="puzzle-main"></canvas>
      <canvas ref="moveCanvasRef" class="puzzle-move" :style="{ left: `${sliderLeft}px`, height: `${currentHeight}px` }"></canvas>
      <div v-if="loading" class="loading-mask">Loading...</div>
      <div v-if="isSuccess" class="success-mask">
        <span class="success-icon">✔</span>
      </div>
    </div>
    <div class="puzzle-slider" ref="sliderContainerRef">
      <div class="slider-track"></div>
      <div class="slider-handle" :style="{ left: `${sliderLeft}px` }" @mousedown="handleMouseDown">
        <span>→</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

interface Props {
  width?: number | string
  height?: number | string
  src?: string
  tolerance?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: 160,
  src: 'https://picsum.photos/320/160',
  tolerance: 5
})

const emit = defineEmits(['success', 'fail'])

const containerRef = ref<HTMLElement | null>(null)
const mainCanvasRef = ref<HTMLCanvasElement | null>(null)
const moveCanvasRef = ref<HTMLCanvasElement | null>(null)
const sliderContainerRef = ref<HTMLElement | null>(null)
const isMoving = ref(false)
const isSuccess = ref(false)
const loading = ref(false)
const sliderLeft = ref(0)
const targetX = ref(0)
const currentWidth = ref(320)
const currentHeight = ref(160)
let resizeObserver: ResizeObserver | null = null

// Puzzle shape params
const l = 42
const r = 9
const PI = Math.PI

const drawPuzzleShape = (ctx: CanvasRenderingContext2D, x: number, y: number, operation: 'fill' | 'clip') => {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + l / 2, y)
  ctx.arc(x + l / 2, y - r + 2, r, 0.72 * PI, 2.26 * PI)
  ctx.lineTo(x + l, y)
  ctx.arc(x + l + r - 2, y + l / 2, r, 1.21 * PI, 2.78 * PI)
  ctx.lineTo(x + l, y + l)
  ctx.lineTo(x, y + l)
  ctx.arc(x + r - 2, y + l / 2, r + 0.4, 2.76 * PI, 1.24 * PI, true)
  ctx.lineTo(x, y)
  ctx.lineWidth = 2
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.stroke()
  ctx.globalCompositeOperation = 'destination-over'
  if (operation === 'fill') {
    ctx.fill()
  } else {
    ctx.clip()
  }
}

const init = () => {
  if (!mainCanvasRef.value || !moveCanvasRef.value) return
  const mainCtx = mainCanvasRef.value.getContext('2d')
  const moveCtx = moveCanvasRef.value.getContext('2d')
  if (!mainCtx || !moveCtx) return

  loading.value = true
  isSuccess.value = false
  sliderLeft.value = 0

  // Calculate dimensions based on container width while maintaining aspect ratio
  // Default aspect ratio 2:1 (320:160)
  const ratio = 160 / 320
  if (containerRef.value) {
    const w = containerRef.value.clientWidth
    if (w > 0) {
      currentWidth.value = w
      // If props.height is a number, use it. If string/auto, calculate from ratio
      if (typeof props.height === 'number') {
        currentHeight.value = props.height
      } else {
        currentHeight.value = Math.floor(w * ratio)
      }
    }
  }

  mainCtx.clearRect(0, 0, currentWidth.value, currentHeight.value)
  moveCtx.clearRect(0, 0, currentWidth.value, currentHeight.value)
  moveCanvasRef.value.width = currentWidth.value
  moveCanvasRef.value.height = currentHeight.value // Ensure height is set

  // Ensure targetX is within bounds
  // l + r * 4 is roughly the puzzle piece width
  const pieceWidth = l + r * 4
  const safeWidth = currentWidth.value - pieceWidth
  // If container is too small, fallback logic needed, but for now assume min width > pieceWidth
  targetX.value = Math.floor(Math.random() * (Math.max(0, safeWidth - l) - l) + l)

  const safeHeight = currentHeight.value - l
  const targetY = Math.floor(Math.random() * (Math.max(0, safeHeight - l) - l) + l)

  const img = new Image()
  img.crossOrigin = 'Anonymous'
  img.src = props.src + '?t=' + new Date().getTime()
  img.onload = () => {
    // Draw puzzle piece
    drawPuzzleShape(moveCtx, targetX.value, targetY, 'clip')
    moveCtx.drawImage(img, 0, 0, currentWidth.value, currentHeight.value)

    // Extract puzzle piece
    const puzzleData = moveCtx.getImageData(targetX.value - r * 2, targetY - r * 2, pieceWidth, pieceWidth)
    moveCanvasRef.value!.width = pieceWidth
    moveCanvasRef.value!.height = currentHeight.value
    moveCtx.putImageData(puzzleData, 0, targetY - r * 2)

    // Draw main background with hole
    mainCtx.drawImage(img, 0, 0, currentWidth.value, currentHeight.value)
    drawPuzzleShape(mainCtx, targetX.value, targetY, 'fill')

    loading.value = false
  }
}

onMounted(() => {
  init()

  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      // Debounce or just re-init
      // Simple re-init for now
      requestAnimationFrame(() => init())
    })
    resizeObserver.observe(containerRef.value)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

const handleMouseDown = (e: MouseEvent) => {
  if (isSuccess.value || loading.value) return
  isMoving.value = true
  const startX = e.clientX
  const startLeft = sliderLeft.value

  const handleMouseMove = (e: MouseEvent) => {
    if (!isMoving.value) return
    const deltaX = e.clientX - startX
    let newLeft = startLeft + deltaX
    // Limit range
    const maxLeft = currentWidth.value - 40 // slider handle width
    newLeft = Math.max(0, Math.min(maxLeft, newLeft))
    sliderLeft.value = newLeft
  }

  const handleMouseUp = () => {
    isMoving.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)

    // Validation logic
    const realTarget = targetX.value - r * 2
    if (Math.abs(sliderLeft.value - realTarget) <= props.tolerance) {
      isSuccess.value = true
      emit('success')
    } else {
      emit('fail')
      // Reset animation
      const animate = () => {
        if (sliderLeft.value > 0) {
          sliderLeft.value = Math.max(0, sliderLeft.value - 10)
          requestAnimationFrame(animate)
        }
      }
      animate()
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
.puzzle-captcha {
  position: relative;
  user-select: none;
}
.puzzle-img-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  background-color: var(--color-bg-layout);
}
.puzzle-main {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.puzzle-move {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
}
.success-mask {
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}
.success-icon {
  font-size: 32px;
  color: var(--color-success);
}
.puzzle-slider {
  position: relative;
  height: 40px;
  margin-top: 12px;
  background-color: var(--color-bg-container);
  border: 1px solid var(--color-border);
  border-radius: 2px;
}
.slider-track {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: var(--color-bg-layout);
  transform: translateY(-50%);
}
.slider-handle {
  position: absolute;
  top: -1px;
  width: 40px;
  height: 40px;
  background-color: var(--color-bg-container);
  border: 1px solid var(--color-border);
  box-shadow: 0 0 4px rgba(0,0,0,0.1);
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
}
.slider-handle:active {
  cursor: grabbing;
  background-color: var(--color-primary);
  color: #fff;
}
</style>