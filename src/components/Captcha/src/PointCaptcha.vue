<template>
  <div class="point-captcha" ref="containerRef" :style="{ width: typeof width === 'number' ? width + 'px' : width }">
    <div class="point-img-wrapper" :style="{ height: currentHeight + 'px' }">
      <canvas ref="canvasRef" :width="currentWidth" :height="currentHeight" @click="handleClick"></canvas>
      <div v-for="(point, index) in clicks" :key="index" class="point-mark" :style="{ left: point.x + 'px', top: point.y + 'px' }">
        {{ index + 1 }}
      </div>
      <div v-if="isSuccess" class="success-mask">
        <span class="success-icon">✔</span>
      </div>
    </div>
    <div class="point-toolbar">
      <div class="point-tip">{{ $t('captcha.clickInOrder') }}<span class="highlight">{{ checkPoints.join(',') }}</span></div>
      <a-button size="small" @click="reset">{{ $t('captcha.refresh') }}</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  width?: number | string
  height?: number | string
  src?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: 160,
  src: 'https://picsum.photos/320/160'
})

const emit = defineEmits(['success', 'fail'])

const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const clicks = ref<{x: number, y: number}[]>([])
const checkPoints = ref<string[]>([])
const points = ref<{x: number, y: number, text: string}[]>([])
const isSuccess = ref(false)
const currentWidth = ref(320)
const currentHeight = ref(160)
let resizeObserver: ResizeObserver | null = null

const randomNum = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min)
const randomColor = (min: number, max: number) => {
  const r = randomNum(min, max)
  const g = randomNum(min, max)
  const b = randomNum(min, max)
  return `rgb(${r},${g},${b})`
}

const init = () => {
  clicks.value = []
  points.value = []
  checkPoints.value = []
  isSuccess.value = false

  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  // Calculate dimensions based on container width
  const ratio = 160 / 320 // Default aspect ratio
  if (containerRef.value) {
    const w = containerRef.value.clientWidth
    if (w > 0) {
      currentWidth.value = w
      if (typeof props.height === 'number') {
        currentHeight.value = props.height
      } else {
        currentHeight.value = Math.floor(w * ratio)
      }
    }
  }

  const img = new Image()
  img.crossOrigin = 'Anonymous'
  img.src = props.src + '?t=' + new Date().getTime()
  img.onload = () => {
    ctx.drawImage(img, 0, 0, currentWidth.value, currentHeight.value)

    const pool = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    for (let i = 0; i < 4; i++) {
      const text = pool[randomNum(0, pool.length)]
      const fontSize = randomNum(20, 30)
      const deg = randomNum(-30, 30)

      const gridW = currentWidth.value / 4
      const x = randomNum(gridW * i + 10, gridW * (i + 1) - 10)
      const y = randomNum(30, currentHeight.value - 10)

      points.value.push({ x, y, text })

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(deg * Math.PI / 180)
      ctx.fillStyle = randomColor(50, 160)
      ctx.font = `bold ${fontSize}px sans-serif`
      ctx.fillText(text, 0, 0)
      ctx.restore()
    }

    const targets = [...points.value].sort(() => Math.random() - 0.5).slice(0, 3)
    checkPoints.value = targets.map(p => p.text)
  }
}

onMounted(() => {
  init()

  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
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

const handleClick = (e: MouseEvent) => {
  if (isSuccess.value || clicks.value.length >= 3) return

  const rect = (e.target as HTMLElement).getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  clicks.value.push({ x, y })

  if (clicks.value.length === 3) {
    verify()
  }
}

const verify = () => {
  const isCorrect = clicks.value.every((click, index) => {
    const targetChar = checkPoints.value[index]
    const targetPoint = points.value.find(p => p.text === targetChar)
    if (!targetPoint) return false

    const dx = click.x - targetPoint.x
    const dy = click.y - targetPoint.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    return dist < 30
  })

  if (isCorrect) {
    isSuccess.value = true
    emit('success')
  } else {
    emit('fail')
    setTimeout(() => {
      clicks.value = []
    }, 1000)
  }
}

const reset = () => {
  init()
}

defineExpose({ reset })
</script>

<style scoped>
.point-captcha {
  user-select: none;
}
.point-img-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  cursor: pointer;
  background-color: var(--color-bg-layout);
}
.point-mark {
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: var(--color-primary);
  color: #fff;
  border-radius: 50%;
  text-align: center;
  line-height: 20px;
  font-size: 12px;
  transform: translate(-50%, -50%);
  border: 2px solid #fff;
  z-index: 2;
  pointer-events: none;
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
.point-toolbar {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  background-color: var(--color-bg-container);
  border: 1px solid var(--color-border);
  padding: 0 10px;
  border-radius: 4px;
}
.point-tip {
  font-size: 14px;
  color: var(--color-text-primary);
}
.highlight {
  color: var(--color-primary);
  font-weight: bold;
  margin: 0 4px;
}
</style>