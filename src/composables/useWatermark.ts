import { onMounted, onUnmounted } from 'vue'

export interface WatermarkOptions {
  text?: string
  fontSize?: number
  fontFamily?: string
  color?: string
  opacity?: number
  rotate?: number
  width?: number
  height?: number
  zIndex?: number
}

/**
 * Watermark composable
 */
export function useWatermark(options: WatermarkOptions = {}) {
  const {
    text = 'Watermark',
    fontSize = 16,
    fontFamily = 'Arial',
    color = 'rgba(0, 0, 0, 0.15)',
    opacity = 1,
    rotate = -20,
    width = 300,
    height = 200,
    zIndex = 9999
  } = options

  let watermarkDiv: HTMLDivElement | null = null
  let observer: MutationObserver | null = null

  /**
   * Create watermark canvas
   */
  const createWatermarkCanvas = (): string => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    ctx.clearRect(0, 0, width, height)
    ctx.globalAlpha = opacity
    ctx.font = `${fontSize}px ${fontFamily}`
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Rotate canvas
    ctx.translate(width / 2, height / 2)
    ctx.rotate((rotate * Math.PI) / 180)
    ctx.translate(-width / 2, -height / 2)

    // Draw text
    ctx.fillText(text, width / 2, height / 2)

    return canvas.toDataURL()
  }

  /**
   * Create watermark element
   */
  const createWatermark = (): HTMLDivElement => {
    const div = document.createElement('div')
    div.className = 'watermark-container'

    const base64Url = createWatermarkCanvas()

    div.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      background-image: url(${base64Url});
      background-repeat: repeat;
      z-index: ${zIndex};
    `

    return div
  }

  /**
   * Add watermark to document
   */
  const addWatermark = () => {
    // Remove existing watermark
    removeWatermark()

    // Create new watermark
    watermarkDiv = createWatermark()
    document.body.appendChild(watermarkDiv)

    // Prevent watermark from being removed
    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const removed = Array.from(mutation.removedNodes).some(
            node => node === watermarkDiv
          )
          if (removed) {
            addWatermark()
          }
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  /**
   * Remove watermark
   */
  const removeWatermark = () => {
    if (watermarkDiv && watermarkDiv.parentNode) {
      watermarkDiv.parentNode.removeChild(watermarkDiv)
      watermarkDiv = null
    }

    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  /**
   * Update watermark
   */
  const updateWatermark = (newOptions: Partial<WatermarkOptions>) => {
    Object.assign(options, newOptions)
    addWatermark()
  }

  // Auto add/remove watermark
  onMounted(() => {
    addWatermark()
  })

  onUnmounted(() => {
    removeWatermark()
  })

  return {
    addWatermark,
    removeWatermark,
    updateWatermark
  }
}
