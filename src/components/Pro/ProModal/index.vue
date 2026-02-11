<template>
  <a-modal
    v-bind="mergedModalBindings"
    :open="isOpen"
    :styles="mergedSemanticStyles"
    :wrap-class-name="mergedWrapClassName"
    :style="mergedModalStyle"
    :title="null"
    @update:open="handleUpdateOpen"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <template #title>
      <div
        class="pro-modal-titlebar"
        :class="{ draggable: draggable && !isFullscreen }"
        @mousedown="handleTitleMouseDown"
      >
        <div
          v-if="fullscreenable || showCloseButton"
          class="pro-modal-title-actions"
          @mousedown.stop
        >
          <a-tooltip
            v-if="fullscreenable"
            :title="isFullscreen ? $t('layout.exitFullscreen') : $t('layout.fullscreen')"
          >
            <button
              type="button"
              class="pro-modal-action-btn"
              @click.stop="toggleFullscreen"
            >
              <component :is="isFullscreen ? FullscreenExitOutlined : FullscreenOutlined" />
            </button>
          </a-tooltip>

          <a-tooltip v-if="showCloseButton" :title="$t('common.close')">
            <button
              type="button"
              class="pro-modal-action-btn"
              :disabled="isCloseButtonDisabled"
              @click.stop="handleCloseClick"
            >
              <CloseOutlined />
            </button>
          </a-tooltip>
        </div>

        <div class="pro-modal-title-content">
          <component :is="titleRenderComponent" />
        </div>
      </div>
    </template>

    <template v-if="$slots.okText" #okText>
      <slot name="okText" />
    </template>

    <template v-if="$slots.cancelText" #cancelText>
      <slot name="cancelText" />
    </template>

    <template v-if="$slots.closeIcon" #closeIcon>
      <slot name="closeIcon" />
    </template>

    <template v-if="$slots.modalRender" #modalRender="modalRenderScope">
      <slot name="modalRender" v-bind="modalRenderScope" />
    </template>

    <template v-if="$slots.footer" #footer="footerScope">
      <slot name="footer" v-bind="footerScope" />
    </template>

    <slot />
  </a-modal>
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  isVNode,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  useAttrs,
  useSlots,
  watch
} from 'vue'
import type { CSSProperties, VNodeChild } from 'vue'
import type { ModalProps } from 'antdv-next'
import { CloseOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@antdv-next/icons'
import { $t } from '@/locales'

interface ProModalProps extends ModalProps {
  draggable?: boolean
  resizable?: boolean
  fullscreenable?: boolean
  minWidth?: number
  minHeight?: number
}

type ModalRect = {
  left: number
  top: number
  width: number
  height: number
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

type DragState = {
  startX: number
  startY: number
  startRect: ModalRect
}

type ResizeState = {
  direction: ResizeDirection
  startX: number
  startY: number
  startRect: ModalRect
}

const EDGE_SIZE = 8
const DEFAULT_WIDTH = 520
const DEFAULT_HEIGHT = 320

const props = withDefaults(defineProps<ProModalProps>(), {
  draggable: true,
  resizable: true,
  fullscreenable: true,
  minWidth: 360,
  minHeight: 260
})

const emit = defineEmits<{
  (e: 'ok', event: MouseEvent): void
  (e: 'cancel', event: MouseEvent): void
  (e: 'update:open', open: boolean): void
}>()

const attrs = useAttrs()
const slots = useSlots()

const instanceWrapClassName = `pro-modal-wrap-${Math.random().toString(36).slice(2, 10)}`

const viewport = reactive({
  width: typeof window !== 'undefined' ? window.innerWidth : 0,
  height: typeof window !== 'undefined' ? window.innerHeight : 0
})

const rect = reactive<ModalRect>({
  left: 0,
  top: 0,
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT
})

const rectReady = ref(false)
const isFullscreen = ref(false)
const restoreRect = ref<ModalRect | null>(null)
const dragState = ref<DragState | null>(null)
const resizeState = ref<ResizeState | null>(null)

let boundModalElement: HTMLElement | null = null
let isDocumentListening = false
let bodyUserSelectCache = ''

const isOpen = computed(() => Boolean(props.open))
const showCloseButton = computed(() => props.closable !== false)
const isCloseButtonDisabled = computed(() => {
  return typeof props.closable === 'object' && Boolean(props.closable.disabled)
})

const resolvedGetContainer = computed<ModalProps['getContainer']>(() => {
  if (props.getContainer !== undefined) {
    return props.getContainer
  }

  return () => {
    if (typeof document === 'undefined') {
      return false
    }
    return document.body
  }
})

const titleRenderComponent = defineComponent({
  name: 'ProModalTitleRender',
  setup() {
    return () => {
      const slotNodes = slots.title?.()
      if (slotNodes && slotNodes.length > 0) {
        return slotNodes
      }

      const title = props.title
      if (isVNode(title)) {
        return title
      }

      if (typeof title === 'function') {
        return (title as () => VNodeChild)()
      }

      if (title === null || title === undefined || title === false) {
        return null
      }

      return h('span', String(title))
    }
  }
})

const modalPassThroughProps = computed<ModalProps>(() => {
  const next = { ...props } as Record<string, unknown>
  delete next.draggable
  delete next.resizable
  delete next.fullscreenable
  delete next.minWidth
  delete next.minHeight
  delete next.open
  delete next.wrapClassName
  delete next.title
  delete next.width
  delete next.styles
  delete next.closable
  delete next.getContainer
  return next as ModalProps
})

const mergedWrapClassName = computed(() => {
  return [props.wrapClassName, 'pro-modal-wrap', instanceWrapClassName]
    .filter(Boolean)
    .join(' ')
})

const forwardedAttrs = computed(() => {
  const next = { ...attrs } as Record<string, unknown>
  delete next.style
  delete next.wrapClassName
  delete next['wrap-class-name']
  return next
})

const managedModalStyle = computed<CSSProperties>(() => {
  if (!isOpen.value || !rectReady.value) {
    return {}
  }

  return {
    position: 'fixed',
    margin: '0',
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    maxWidth: `${viewport.width}px`,
    paddingBottom: '0'
  }
})

const mergedModalStyle = computed(() => {
  return [attrs.style as any, managedModalStyle.value]
})

const mergedModalBindings = computed(() => {
  return {
    ...modalPassThroughProps.value,
    ...forwardedAttrs.value,
    closable: false,
    getContainer: resolvedGetContainer.value
  }
})

const mergedSemanticStyles = computed<ModalProps['styles']>(() => {
  const inputStyles = props.styles || {}
  return {
    ...inputStyles,
    container: {
      ...inputStyles.container,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0
    },
    body: {
      ...inputStyles.body,
      flex: 1,
      minHeight: 0,
      overflow: 'auto'
    }
  }
})

const updateViewport = () => {
  viewport.width = window.innerWidth
  viewport.height = window.innerHeight
}

const getModalElement = () => {
  return document.querySelector(`.${instanceWrapClassName} .ant-modal`) as HTMLElement | null
}

const cloneRect = (target: ModalRect): ModalRect => ({
  left: target.left,
  top: target.top,
  width: target.width,
  height: target.height
})

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}

const getEffectiveMinWidth = () => {
  return Math.max(220, Math.min(props.minWidth, viewport.width))
}

const getEffectiveMinHeight = () => {
  return Math.max(180, Math.min(props.minHeight, viewport.height))
}

const clampRect = (target: ModalRect): ModalRect => {
  const minWidth = getEffectiveMinWidth()
  const minHeight = getEffectiveMinHeight()

  const width = clamp(target.width, minWidth, viewport.width)
  const height = clamp(target.height, minHeight, viewport.height)
  const left = clamp(target.left, 0, Math.max(0, viewport.width - width))
  const top = clamp(target.top, 0, Math.max(0, viewport.height - height))

  return {
    left,
    top,
    width,
    height
  }
}

const parsePreferredWidth = (width: ModalProps['width'], fallback: number) => {
  if (typeof width === 'number' && Number.isFinite(width)) {
    return width
  }

  if (typeof width === 'string') {
    const trimmed = width.trim()

    if (trimmed.endsWith('%')) {
      const ratio = Number.parseFloat(trimmed.slice(0, -1))
      if (Number.isFinite(ratio)) {
        return viewport.width * ratio / 100
      }
    }

    const parsed = Number.parseFloat(trimmed)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return fallback
}

const syncRectFromDom = (resetPosition = false) => {
  const element = getModalElement()
  if (!element) {
    return false
  }

  if (boundModalElement !== element) {
    unbindModalResizeEvents()
    bindModalResizeEvents(element)
  }

  const domRect = element.getBoundingClientRect()
  const preferredWidth = parsePreferredWidth(props.width, domRect.width || DEFAULT_WIDTH)

  const nextRect: ModalRect = {
    left: rect.left,
    top: rect.top,
    width: preferredWidth,
    height: domRect.height || rect.height || DEFAULT_HEIGHT
  }

  if (resetPosition || !rectReady.value) {
    nextRect.left = Math.max((viewport.width - nextRect.width) / 2, 0)
    nextRect.top = Math.max((viewport.height - nextRect.height) / 2, 0)
  }

  Object.assign(rect, clampRect(nextRect))
  rectReady.value = true
  return true
}

const ensureRectReady = async (resetPosition = false) => {
  await nextTick()

  let retryCount = 0
  const trySync = () => {
    const synced = syncRectFromDom(resetPosition)
    if (!synced && retryCount < 10) {
      retryCount += 1
      requestAnimationFrame(trySync)
    }
  }

  trySync()
}

const getResizeDirection = (event: MouseEvent): ResizeDirection | null => {
  if (!boundModalElement) {
    return null
  }

  const modalRect = boundModalElement.getBoundingClientRect()
  const relativeX = event.clientX - modalRect.left
  const relativeY = event.clientY - modalRect.top

  const nearLeft = relativeX >= 0 && relativeX <= EDGE_SIZE
  const nearRight = relativeX <= modalRect.width && relativeX >= modalRect.width - EDGE_SIZE
  const nearTop = relativeY >= 0 && relativeY <= EDGE_SIZE
  const nearBottom = relativeY <= modalRect.height && relativeY >= modalRect.height - EDGE_SIZE

  if (!nearLeft && !nearRight && !nearTop && !nearBottom) {
    return null
  }

  const vertical = nearTop ? 'n' : (nearBottom ? 's' : '')
  const horizontal = nearLeft ? 'w' : (nearRight ? 'e' : '')

  const direction = `${vertical}${horizontal}` as ResizeDirection
  return direction || null
}

const directionCursorMap: Record<ResizeDirection, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize'
}

const updateModalCursor = (direction: ResizeDirection | null) => {
  if (!boundModalElement) {
    return
  }

  if (!direction || isFullscreen.value || !props.resizable) {
    boundModalElement.style.cursor = ''
    return
  }

  boundModalElement.style.cursor = directionCursorMap[direction]
}

const startDocumentListen = () => {
  if (isDocumentListening) {
    return
  }

  isDocumentListening = true
  bodyUserSelectCache = document.body.style.userSelect
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', handleDocumentMouseMove)
  document.addEventListener('mouseup', handleDocumentMouseUp)
}

const stopDocumentListen = () => {
  if (!isDocumentListening) {
    return
  }

  isDocumentListening = false
  document.body.style.userSelect = bodyUserSelectCache
  document.removeEventListener('mousemove', handleDocumentMouseMove)
  document.removeEventListener('mouseup', handleDocumentMouseUp)
}

const applyResize = (state: ResizeState, deltaX: number, deltaY: number) => {
  const minWidth = getEffectiveMinWidth()
  const minHeight = getEffectiveMinHeight()

  let { left, top, width, height } = state.startRect

  if (state.direction.includes('e')) {
    width = clamp(state.startRect.width + deltaX, minWidth, viewport.width - state.startRect.left)
  }

  if (state.direction.includes('s')) {
    height = clamp(state.startRect.height + deltaY, minHeight, viewport.height - state.startRect.top)
  }

  if (state.direction.includes('w')) {
    const maxLeft = state.startRect.left + state.startRect.width - minWidth
    left = clamp(state.startRect.left + deltaX, 0, maxLeft)
    width = state.startRect.width + (state.startRect.left - left)
  }

  if (state.direction.includes('n')) {
    const maxTop = state.startRect.top + state.startRect.height - minHeight
    top = clamp(state.startRect.top + deltaY, 0, maxTop)
    height = state.startRect.height + (state.startRect.top - top)
  }

  Object.assign(rect, clampRect({ left, top, width, height }))
}

const handleDocumentMouseMove = (event: MouseEvent) => {
  if (dragState.value) {
    const deltaX = event.clientX - dragState.value.startX
    const deltaY = event.clientY - dragState.value.startY

    Object.assign(rect, clampRect({
      left: dragState.value.startRect.left + deltaX,
      top: dragState.value.startRect.top + deltaY,
      width: dragState.value.startRect.width,
      height: dragState.value.startRect.height
    }))

    return
  }

  if (resizeState.value) {
    const deltaX = event.clientX - resizeState.value.startX
    const deltaY = event.clientY - resizeState.value.startY
    applyResize(resizeState.value, deltaX, deltaY)
  }
}

const handleDocumentMouseUp = () => {
  dragState.value = null
  resizeState.value = null
  stopDocumentListen()
  updateModalCursor(null)
}

const handleModalMouseMove = (event: MouseEvent) => {
  if (!props.resizable || isFullscreen.value || dragState.value || resizeState.value) {
    updateModalCursor(null)
    return
  }

  const direction = getResizeDirection(event)
  updateModalCursor(direction)
}

const handleModalMouseLeave = () => {
  if (!resizeState.value) {
    updateModalCursor(null)
  }
}

const handleModalMouseDown = (event: MouseEvent) => {
  if (!props.resizable || isFullscreen.value || event.button !== 0) {
    return
  }

  const direction = getResizeDirection(event)
  if (!direction) {
    return
  }

  event.preventDefault()
  event.stopPropagation()

  resizeState.value = {
    direction,
    startX: event.clientX,
    startY: event.clientY,
    startRect: cloneRect(rect)
  }

  startDocumentListen()
}

const bindModalResizeEvents = (element: HTMLElement) => {
  boundModalElement = element
  element.addEventListener('mousemove', handleModalMouseMove)
  element.addEventListener('mouseleave', handleModalMouseLeave)
  element.addEventListener('mousedown', handleModalMouseDown)
}

const unbindModalResizeEvents = () => {
  if (!boundModalElement) {
    return
  }

  boundModalElement.removeEventListener('mousemove', handleModalMouseMove)
  boundModalElement.removeEventListener('mouseleave', handleModalMouseLeave)
  boundModalElement.removeEventListener('mousedown', handleModalMouseDown)
  boundModalElement.style.cursor = ''
  boundModalElement = null
}

const handleTitleMouseDown = (event: MouseEvent) => {
  if (!props.draggable || isFullscreen.value || event.button !== 0) {
    return
  }

  const target = event.target as HTMLElement | null
  if (target?.closest('.pro-modal-title-actions')) {
    return
  }

  event.preventDefault()
  event.stopPropagation()

  dragState.value = {
    startX: event.clientX,
    startY: event.clientY,
    startRect: cloneRect(rect)
  }

  startDocumentListen()
}

const toggleFullscreen = () => {
  if (!rectReady.value) {
    return
  }

  if (!isFullscreen.value) {
    restoreRect.value = cloneRect(rect)
    Object.assign(rect, {
      left: 0,
      top: 0,
      width: viewport.width,
      height: viewport.height
    })
    isFullscreen.value = true
    return
  }

  const targetRect = restoreRect.value || cloneRect(rect)
  Object.assign(rect, clampRect(targetRect))
  isFullscreen.value = false
}

const handleWindowResize = () => {
  updateViewport()

  if (!isOpen.value || !rectReady.value) {
    return
  }

  if (isFullscreen.value) {
    Object.assign(rect, {
      left: 0,
      top: 0,
      width: viewport.width,
      height: viewport.height
    })
    return
  }

  Object.assign(rect, clampRect(cloneRect(rect)))
}

const handleOk = (event: MouseEvent) => {
  emit('ok', event)
}

const handleCancel = (event: MouseEvent) => {
  emit('cancel', event)
}

const handleCloseClick = (event: MouseEvent) => {
  if (!showCloseButton.value || isCloseButtonDisabled.value) {
    return
  }

  if (typeof props.closable === 'object') {
    props.closable.onClose?.()
  }

  emit('cancel', event)
  emit('update:open', false)
}

const handleUpdateOpen = (open: boolean) => {
  emit('update:open', open)
}

watch(
  isOpen,
  (open) => {
    if (open) {
      isFullscreen.value = false
      restoreRect.value = null
      ensureRectReady(true)
      return
    }

    dragState.value = null
    resizeState.value = null
    rectReady.value = false
    stopDocumentListen()
    unbindModalResizeEvents()
  },
  { immediate: true }
)

watch(
  () => props.width,
  () => {
    if (!isOpen.value || !rectReady.value || isFullscreen.value) {
      return
    }

    const nextWidth = parsePreferredWidth(props.width, rect.width)
    Object.assign(rect, clampRect({ ...cloneRect(rect), width: nextWidth }))
  }
)

onMounted(() => {
  updateViewport()
  window.addEventListener('resize', handleWindowResize)
})

onBeforeUnmount(() => {
  stopDocumentListen()
  unbindModalResizeEvents()
  window.removeEventListener('resize', handleWindowResize)
})
</script>

<style scoped lang="scss">
.pro-modal-titlebar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  width: 100%;
  user-select: none;

  &.draggable {
    cursor: move;
  }
}

.pro-modal-title-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pro-modal-title-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.pro-modal-action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-secondary);

  &:hover {
    background: rgba(0, 0, 0, 0.06);
    color: var(--color-text-primary);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

:deep(.pro-modal-wrap .ant-modal) {
  max-width: none;
}

:deep(.pro-modal-wrap .ant-modal-content) {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
}

:deep(.pro-modal-wrap .ant-modal-header) {
  flex-shrink: 0;
}

:deep(.pro-modal-wrap .ant-modal-body) {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

:deep(.pro-modal-wrap .ant-modal-footer) {
  flex-shrink: 0;
}
</style>
