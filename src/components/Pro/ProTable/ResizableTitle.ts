import type { PropType } from 'vue'
import { defineComponent, h, onBeforeUnmount, ref } from 'vue'

interface ResizeInfo {
  size: {
    width: number
  }
}

export interface ResizableTitleProps {
  width?: number
  resizable?: boolean
  onResizeStart?: (event: MouseEvent, width: number) => void
  onResizeEnd?: (event: MouseEvent) => void
  onResize?: (event: MouseEvent, info: ResizeInfo) => void
}

export const MIN_COLUMN_WIDTH = 40

/**
 * Resizable table header cell component
 * Allows users to resize column widths by dragging
 */
export const ResizableTitle = defineComponent({
  name: 'ResizableTitle',
  inheritAttrs: false,
  props: {
    width: Number,
    resizable: Boolean,
    onResizeStart: Function as PropType<ResizableTitleProps['onResizeStart']>,
    onResizeEnd: Function as PropType<ResizableTitleProps['onResizeEnd']>,
    onResize: Function as PropType<ResizableTitleProps['onResize']>,
  },
  setup(props, { slots, attrs }) {
    const dragging = ref(false)
    let startX = 0
    let startWidth = 0

    const onMouseMove = (event: MouseEvent) => {
      if (!dragging.value || !props.onResize) {
        return
      }
      const nextWidth = Math.max(startWidth + event.clientX - startX, MIN_COLUMN_WIDTH)
      props.onResize(event, { size: { width: nextWidth } })
    }

    const onMouseUp = (event: MouseEvent) => {
      if (dragging.value) {
        props.onResizeEnd?.(event)
      }
      dragging.value = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    const onMouseDown = (event: MouseEvent) => {
      if (!props.onResize || !props.resizable) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      startWidth = props.width
        || (event.currentTarget as HTMLElement)?.parentElement?.getBoundingClientRect().width
        || 0
      props.onResizeStart?.(event, startWidth)
      dragging.value = true
      startX = event.clientX
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    })

    return () => {
      const width = props.width
      if (!props.resizable || !props.onResize) {
        return h('th', attrs, slots.default?.())
      }

      const style = width == null
        ? attrs.style
        : { ...(attrs.style as Record<string, any>), width: `${width}px` }

      return h(
        'th',
        {
          ...attrs,
          class: ['pro-table-resizable-title', attrs.class],
          style,
        },
        [
          slots.default?.(),
          h('span', {
            class: 'pro-table-resizable-handle',
            onMousedown: onMouseDown,
          }),
        ],
      )
    }
  },
})

export default ResizableTitle
