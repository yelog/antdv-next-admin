import { describe, expect, it } from 'vitest';

import {
  drawPuzzlePiece,
  drawPuzzleTarget,
  getPuzzleTargetXRange,
  PUZZLE_CROP_PADDING,
  PUZZLE_CROP_SIZE,
  PUZZLE_TARGET_FILL,
  PUZZLE_TARGET_STROKE,
} from '@/components/Captcha/src/puzzleCanvas';

function createRecordingContext() {
  const calls: string[] = [];
  let compositeOperation = 'source-over';

  const context = {
    save: () => calls.push('save'),
    restore: () => calls.push('restore'),
    beginPath: () => calls.push('beginPath'),
    closePath: () => calls.push('closePath'),
    moveTo: () => calls.push('moveTo'),
    lineTo: () => calls.push('lineTo'),
    arc: () => calls.push('arc'),
    clip: () => calls.push('clip'),
    fill: () => calls.push('fill'),
    stroke: () => calls.push('stroke'),
    drawImage: () => calls.push('drawImage'),
    set globalCompositeOperation(value: string) {
      compositeOperation = value;
      calls.push(`composite:${value}`);
    },
    get globalCompositeOperation() {
      return compositeOperation;
    },
    set fillStyle(value: string) {
      calls.push(`fillStyle:${value}`);
    },
    set strokeStyle(value: string) {
      calls.push(`strokeStyle:${value}`);
    },
    set lineWidth(value: number) {
      calls.push(`lineWidth:${value}`);
    },
  } as unknown as CanvasRenderingContext2D;

  return { calls, context };
}

describe('puzzle canvas rendering', () => {
  it('renders a visible target with isolated source-over composition', () => {
    const { calls, context } = createRecordingContext();

    drawPuzzleTarget(context, 120, 48);

    expect(calls[0]).toBe('save');
    expect(calls.at(-1)).toBe('restore');
    expect(calls).toContain('composite:source-over');
    expect(calls).not.toContain('composite:destination-over');
    expect(calls).toContain(`fillStyle:${PUZZLE_TARGET_FILL}`);
    expect(calls).toContain(`strokeStyle:${PUZZLE_TARGET_STROKE}`);
    expect(calls.indexOf('fill')).toBeLessThan(calls.indexOf('stroke'));
  });

  it('clips the source image before drawing and outlines the extracted piece', () => {
    const { calls, context } = createRecordingContext();

    drawPuzzlePiece(context, {} as CanvasImageSource, 120, 48, 320, 160);

    const clipIndex = calls.indexOf('clip');
    const drawImageIndex = calls.indexOf('drawImage');
    const firstRestoreIndex = calls.indexOf('restore');
    const strokeIndex = calls.indexOf('stroke');

    expect(clipIndex).toBeGreaterThan(-1);
    expect(drawImageIndex).toBeGreaterThan(clipIndex);
    expect(firstRestoreIndex).toBeGreaterThan(drawImageIndex);
    expect(strokeIndex).toBeGreaterThan(firstRestoreIndex);
    expect(calls).not.toContain('composite:destination-over');
  });

  it('keeps the target away from the initial piece when space is available', () => {
    const width = 272;
    const range = getPuzzleTargetXRange(width);

    expect(range.min).toBeGreaterThanOrEqual(Math.floor(width * 0.45));
    expect(range.min - PUZZLE_CROP_PADDING).toBeGreaterThan(PUZZLE_CROP_SIZE);
    expect(range.max + (PUZZLE_CROP_SIZE - PUZZLE_CROP_PADDING)).toBeLessThanOrEqual(width);
  });
});
