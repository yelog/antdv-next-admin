import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useWatermarkStore = defineStore('watermark', () => {
  // State
  const enabled = ref(false)
  const content = ref('Antdv Next Admin')
  const gap = ref<[number, number]>([100, 100])
  const rotate = ref(-22)
  const fontSize = ref(16)
  const opacity = ref(0.15)

  // Computed
  const watermarkProps = computed(() => {
    if (!enabled.value) {
      return { content: '' }
    }
    return {
      content: content.value,
      gap: gap.value,
      rotate: rotate.value,
      font: {
        fontSize: fontSize.value
      },
      style: {
        opacity: opacity.value
      }
    }
  })

  // Actions
  const setEnabled = (val: boolean) => {
    enabled.value = val
    localStorage.setItem('app-watermark-enabled', val.toString())
  }

  const setContent = (val: string) => {
    content.value = val
    localStorage.setItem('app-watermark-content', val)
  }

  const setGap = (val: [number, number]) => {
    gap.value = val
    localStorage.setItem('app-watermark-gap', JSON.stringify(val))
  }

  const setRotate = (val: number) => {
    rotate.value = val
    localStorage.setItem('app-watermark-rotate', val.toString())
  }

  const setFontSize = (val: number) => {
    fontSize.value = val
    localStorage.setItem('app-watermark-fontSize', val.toString())
  }

  const setOpacity = (val: number) => {
    opacity.value = val
    localStorage.setItem('app-watermark-opacity', val.toString())
  }

  const initWatermark = () => {
    const savedEnabled = localStorage.getItem('app-watermark-enabled')
    const savedContent = localStorage.getItem('app-watermark-content')
    const savedGap = localStorage.getItem('app-watermark-gap')
    const savedRotate = localStorage.getItem('app-watermark-rotate')
    const savedFontSize = localStorage.getItem('app-watermark-fontSize')
    const savedOpacity = localStorage.getItem('app-watermark-opacity')

    if (savedEnabled) setEnabled(savedEnabled === 'true')
    if (savedContent) setContent(savedContent)
    if (savedGap) {
      try {
        const parsed = JSON.parse(savedGap)
        if (Array.isArray(parsed) && parsed.length === 2) setGap(parsed as [number, number])
      } catch { /* ignore */ }
    }
    if (savedRotate) setRotate(Number(savedRotate))
    if (savedFontSize) setFontSize(Number(savedFontSize))
    if (savedOpacity) setOpacity(Number(savedOpacity))
  }

  return {
    // State
    enabled,
    content,
    gap,
    rotate,
    fontSize,
    opacity,
    // Computed
    watermarkProps,
    // Actions
    setEnabled,
    setContent,
    setGap,
    setRotate,
    setFontSize,
    setOpacity,
    initWatermark
  }
})
