import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Fullscreen composable
 */
export function useFullscreen() {
  const isFullscreen = ref(false)

  /**
   * Enter fullscreen
   */
  const enter = async (): Promise<void> => {
    try {
      const element = document.documentElement

      if (element.requestFullscreen) {
        await element.requestFullscreen()
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen()
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen()
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen()
      }

      isFullscreen.value = true
    } catch (error) {
      console.error('Failed to enter fullscreen:', error)
    }
  }

  /**
   * Exit fullscreen
   */
  const exit = async (): Promise<void> => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen()
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen()
      }

      isFullscreen.value = false
    } catch (error) {
      console.error('Failed to exit fullscreen:', error)
    }
  }

  /**
   * Toggle fullscreen
   */
  const toggle = async (): Promise<void> => {
    if (isFullscreen.value) {
      await exit()
    } else {
      await enter()
    }
  }

  /**
   * Handle fullscreen change event
   */
  const handleFullscreenChange = () => {
    isFullscreen.value = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    )
  }

  onMounted(() => {
    // Listen to fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    // Check initial state
    handleFullscreenChange()
  })

  onUnmounted(() => {
    // Remove event listeners
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
  })

  return {
    isFullscreen,
    enter,
    exit,
    toggle
  }
}
