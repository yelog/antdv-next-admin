<template>
  <div
    class="puzzle-captcha"
    ref="containerRef"
    :style="{ width: typeof width === 'number' ? width + 'px' : width }"
  >
    <div class="puzzle-img-wrapper" :style="{ height: currentHeight + 'px' }">
      <canvas
        ref="mainCanvasRef"
        :width="currentWidth"
        :height="currentHeight"
        class="puzzle-main"
      ></canvas>
      <canvas
        ref="moveCanvasRef"
        class="puzzle-move"
        :style="{ left: `${sliderLeft}px`, height: `${currentHeight}px` }"
      ></canvas>
      <div v-if="loading" class="loading-mask">Loading...</div>
      <div v-if="isSuccess" class="success-mask">
        <span class="success-icon">✔</span>
      </div>
    </div>
    <div class="puzzle-slider" ref="sliderContainerRef">
      <div class="slider-track"></div>
      <div
        class="slider-handle"
        :style="{ left: `${sliderLeft}px` }"
        @pointerdown="handlePointerDown"
      >
        <span>→</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
const DEFAULT_PUZZLE_SRC =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160" viewBox="0 0 320 160">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#dbeafe"/>
      <stop offset="0.55" stop-color="#bfdbfe"/>
      <stop offset="1" stop-color="#93c5fd"/>
    </linearGradient>
  </defs>
  <rect width="320" height="160" fill="url(#bg)"/>
  <circle cx="68" cy="46" r="38" fill="#ffffff" opacity="0.28"/>
  <circle cx="256" cy="112" r="54" fill="#2563eb" opacity="0.18"/>
  <path d="M0 122 C58 88 102 148 156 112 S248 88 320 126 L320 160 L0 160 Z" fill="#1d4ed8" opacity="0.18"/>
  <path d="M0 136 C62 102 104 154 164 124 S250 102 320 134" stroke="#ffffff" stroke-width="2" opacity="0.55" fill="none"/>
</svg>`);

export { DEFAULT_PUZZLE_SRC };
</script>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

import {
  drawPuzzlePiece,
  drawPuzzleTarget,
  getPuzzleTargetXRange,
  PUZZLE_CROP_PADDING,
  PUZZLE_CROP_SIZE,
  PUZZLE_LENGTH,
} from './puzzleCanvas';

interface Props {
  width?: number | string;
  height?: number | string;
  src?: string;
  tolerance?: number;
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: 160,
  src: DEFAULT_PUZZLE_SRC,
  tolerance: 5,
});

const emit = defineEmits(['success', 'fail']);

const containerRef = ref<HTMLElement | null>(null);
const mainCanvasRef = ref<HTMLCanvasElement | null>(null);
const moveCanvasRef = ref<HTMLCanvasElement | null>(null);
const isMoving = ref(false);
const isSuccess = ref(false);
const loading = ref(false);
const sliderLeft = ref(0);
const targetX = ref(0);
const targetY = ref(0);
const currentWidth = ref(320);
const currentHeight = ref(160);
const currentSrc = ref(props.src);
let resizeObserver: ResizeObserver | null = null;
let drawGeneration = 0;

const randomPosition = (min: number, max: number) => {
  if (max <= min) return min;
  return Math.floor(Math.random() * (max - min) + min);
};

const init = () => {
  const mainCanvas = mainCanvasRef.value;
  const moveCanvas = moveCanvasRef.value;
  if (!mainCanvas || !moveCanvas) return;

  const generation = ++drawGeneration;

  loading.value = true;
  isSuccess.value = false;
  sliderLeft.value = 0;

  let width = currentWidth.value;
  let height = currentHeight.value;
  const ratio = 160 / 320;
  if (containerRef.value) {
    const containerWidth = containerRef.value.clientWidth;
    if (containerWidth > 0) {
      width = containerWidth;
      height = typeof props.height === 'number' ? props.height : Math.floor(containerWidth * ratio);
    }
  }

  currentWidth.value = width;
  currentHeight.value = height;
  mainCanvas.width = width;
  mainCanvas.height = height;
  moveCanvas.width = width;
  moveCanvas.height = height;

  const mainCtx = mainCanvas.getContext('2d');
  const moveCtx = moveCanvas.getContext('2d');
  if (!mainCtx || !moveCtx) {
    loading.value = false;
    return;
  }

  const targetXRange = getPuzzleTargetXRange(width);
  targetX.value = randomPosition(targetXRange.min, targetXRange.max);
  targetY.value = randomPosition(
    PUZZLE_LENGTH,
    Math.max(PUZZLE_LENGTH, height - PUZZLE_LENGTH * 2),
  );

  const img = new Image();
  const imageSrc = currentSrc.value;
  if (!imageSrc.startsWith('data:')) {
    img.crossOrigin = 'anonymous';
  }
  const cacheSeparator = imageSrc.includes('?') ? '&' : '?';
  img.src = imageSrc.startsWith('data:') ? imageSrc : `${imageSrc}${cacheSeparator}t=${Date.now()}`;

  img.onload = () => {
    if (generation !== drawGeneration) return;

    try {
      drawPuzzlePiece(moveCtx, img, targetX.value, targetY.value, width, height);

      const puzzleData = moveCtx.getImageData(
        targetX.value - PUZZLE_CROP_PADDING,
        targetY.value - PUZZLE_CROP_PADDING,
        PUZZLE_CROP_SIZE,
        PUZZLE_CROP_SIZE,
      );
      moveCanvas.width = PUZZLE_CROP_SIZE;
      moveCanvas.height = height;
      const pieceCtx = moveCanvas.getContext('2d');
      pieceCtx?.putImageData(puzzleData, 0, targetY.value - PUZZLE_CROP_PADDING);

      mainCtx.drawImage(img, 0, 0, width, height);
      drawPuzzleTarget(mainCtx, targetX.value, targetY.value);
    } catch {
      if (currentSrc.value !== DEFAULT_PUZZLE_SRC) {
        currentSrc.value = DEFAULT_PUZZLE_SRC;
        init();
        return;
      }
    }

    loading.value = false;
  };
  img.onerror = () => {
    if (generation !== drawGeneration) return;

    if (currentSrc.value !== DEFAULT_PUZZLE_SRC) {
      currentSrc.value = DEFAULT_PUZZLE_SRC;
      init();
      return;
    }
    loading.value = false;
  };
};

onMounted(() => {
  init();

  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => init());
    });
    resizeObserver.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  drawGeneration += 1;
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

watch(
  () => props.src,
  (src) => {
    currentSrc.value = src;
    init();
  },
);

const handlePointerDown = (evt: PointerEvent) => {
  if (isSuccess.value || loading.value) return;
  isMoving.value = true;
  (evt.currentTarget as HTMLElement).setPointerCapture(evt.pointerId);
  const startX = evt.clientX;
  const startLeft = sliderLeft.value;

  const handlePointerMove = (moveEvt: PointerEvent) => {
    if (!isMoving.value) return;
    const deltaX = moveEvt.clientX - startX;
    let newLeft = startLeft + deltaX;
    // Limit range
    const maxLeft = currentWidth.value - 40; // slider handle width
    newLeft = Math.max(0, Math.min(maxLeft, newLeft));
    sliderLeft.value = newLeft;
  };

  const handlePointerUp = () => {
    isMoving.value = false;
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
    document.removeEventListener('pointercancel', handlePointerUp);

    // Validation logic
    const realTarget = targetX.value - PUZZLE_CROP_PADDING;
    if (Math.abs(sliderLeft.value - realTarget) <= props.tolerance) {
      isSuccess.value = true;
      emit('success');
    } else {
      emit('fail');
      // Reset animation
      const animate = () => {
        if (sliderLeft.value > 0) {
          sliderLeft.value = Math.max(0, sliderLeft.value - 10);
          requestAnimationFrame(animate);
        }
      };
      animate();
    }
  };

  document.addEventListener('pointermove', handlePointerMove);
  document.addEventListener('pointerup', handlePointerUp);
  document.addEventListener('pointercancel', handlePointerUp);
};

const reset = () => {
  init();
};

defineExpose({ reset });
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
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
  cursor: grab;
  touch-action: none;
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
