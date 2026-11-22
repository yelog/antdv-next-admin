<template>
  <div
    class="slider-captcha"
    :style="{
      width: typeof width === 'number' ? width + 'px' : width,
      '--slider-height': typeof height === 'number' ? height + 'px' : height,
    }"
  >
    <div ref="track" class="slider-bg" :class="{ success: isSuccess, dragging: drag }">
      <div class="slider-text" role="status" aria-atomic="true">{{ statusText }}</div>
      <div
        class="slider-track"
        aria-hidden="true"
        :style="{ width: isSuccess ? '100%' : `${sliderLeft}px` }"
      ></div>
      <div
        class="slider-handle"
        aria-hidden="true"
        :style="{ left: isSuccess ? undefined : `${sliderLeft}px` }"
        @pointerdown="startDrag"
        @pointermove="moveDrag"
        @pointerup="finishDrag"
        @pointercancel="cancelDrag"
        @lostpointercapture="cancelDrag"
      >
        {{ isSuccess ? '✓' : '→' }}
      </div>
    </div>
    <button
      ref="verifyButton"
      type="button"
      class="slider-alternative"
      :aria-disabled="isSuccess"
      @click="completeVerification"
    >
      {{ $t('login.verifyWithoutDragging') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, useTemplateRef } from 'vue';

import { $t } from '@/locales';

interface Props {
  width?: number | string;
  height?: number | string;
  text?: string;
  successText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: 44,
});

const emit = defineEmits<{
  success: [];
  fail: [];
}>();

interface Drag {
  handle: HTMLElement;
  pointerId: number;
  startX: number;
  distance: number;
}

const track = useTemplateRef<HTMLDivElement>('track');
const verifyButton = useTemplateRef<HTMLButtonElement>('verifyButton');
const drag = shallowRef<Drag>();
const sliderLeft = ref(0);
const result = ref<'idle' | 'success' | 'fail'>('idle');
const isSuccess = computed(() => result.value === 'success');
const statusText = computed(() => {
  if (isSuccess.value) return props.successText ?? $t('login.verifySuccess');
  if (result.value === 'fail') return $t('login.verifyRetry');
  return props.text ?? $t('login.slideToVerify');
});

function startDrag(event: PointerEvent): void {
  const handle = event.currentTarget;
  const container = track.value;
  if (
    isSuccess.value ||
    drag.value ||
    event.button !== 0 ||
    !event.isPrimary ||
    !(handle instanceof HTMLElement) ||
    !container
  ) {
    return;
  }

  const distance = container.clientWidth - handle.offsetWidth;
  if (distance <= 0) return;

  handle.setPointerCapture(event.pointerId);
  drag.value = { handle, pointerId: event.pointerId, startX: event.clientX, distance };
  result.value = 'idle';
}

function moveDrag(event: PointerEvent): void {
  const activeDrag = drag.value;
  if (activeDrag?.pointerId !== event.pointerId) return;

  sliderLeft.value = Math.max(0, Math.min(activeDrag.distance, event.clientX - activeDrag.startX));
}

function finishDrag(event: PointerEvent): void {
  const activeDrag = drag.value;
  if (activeDrag?.pointerId !== event.pointerId) return;

  if (event.clientX - activeDrag.startX >= activeDrag.distance) {
    completeVerification();
  } else {
    cancelDrag(event);
  }
}

function cancelDrag(event: PointerEvent): void {
  if (drag.value?.pointerId !== event.pointerId) return;

  stopDrag();
  result.value = 'fail';
  emit('fail');
}

function stopDrag(): void {
  const activeDrag = drag.value;
  drag.value = undefined;
  sliderLeft.value = 0;
  if (activeDrag?.handle.hasPointerCapture(activeDrag.pointerId)) {
    activeDrag.handle.releasePointerCapture(activeDrag.pointerId);
  }
}

function completeVerification(): void {
  if (isSuccess.value) return;

  stopDrag();
  result.value = 'success';
  emit('success');
}

function reset(): void {
  stopDrag();
  result.value = 'idle';
}

function focus(): void {
  verifyButton.value?.focus();
}

defineExpose({ reset, focus });
</script>

<style scoped>
.slider-captcha {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.slider-bg {
  position: relative;
  flex: 1 1 164px;
  min-width: 0;
  height: var(--slider-height);
  background-color: var(--color-bg-container);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);
  overflow: hidden;
  user-select: none;
}

.slider-bg.success {
  background: color-mix(in srgb, var(--color-success) 12%, var(--color-bg-container));
}

.slider-text {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  height: 100%;
  padding-inline: calc(var(--slider-height) + 6px) 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.2;
  text-align: center;
  pointer-events: none;
}

.slider-bg.success .slider-text {
  padding-inline: 8px calc(var(--slider-height) + 6px);
}

.slider-bg.dragging .slider-text {
  opacity: 0;
}

.slider-track {
  position: absolute;
  inset: 0 auto 0 0;
  height: 100%;
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  pointer-events: none;
}

.slider-bg.success .slider-track {
  background: transparent;
}

.slider-handle {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  display: grid;
  place-items: center;
  width: var(--slider-height);
  height: 100%;
  border-inline-end: 1px solid var(--color-border);
  color: var(--color-text-primary);
  background: var(--color-bg-container);
  cursor: grab;
  touch-action: none;
}

.slider-bg.dragging .slider-handle {
  cursor: grabbing;
}

.slider-bg.success .slider-handle {
  right: 0;
  left: auto;
  border: 0;
  background: transparent;
  cursor: default;
  touch-action: auto;
}

.slider-alternative {
  min-height: var(--slider-height);
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);
  color: var(--color-text-primary);
  background: var(--color-bg-container);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}

.slider-alternative:hover:not([aria-disabled='true']) {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 8%, var(--color-bg-container));
}

.slider-alternative:focus-visible {
  outline: 2px solid var(--color-text-primary);
  outline-offset: 2px;
}

.slider-alternative[aria-disabled='true'] {
  color: var(--color-text-secondary);
  cursor: default;
}
</style>
