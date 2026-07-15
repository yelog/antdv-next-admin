const PI = Math.PI;

export const PUZZLE_LENGTH = 42;
export const PUZZLE_RADIUS = 9;
export const PUZZLE_CROP_PADDING = PUZZLE_RADIUS * 2;
export const PUZZLE_CROP_SIZE = PUZZLE_LENGTH + PUZZLE_RADIUS * 4;
export const PUZZLE_TARGET_FILL = 'rgba(15, 23, 42, 0.38)';
export const PUZZLE_TARGET_STROKE = 'rgba(255, 255, 255, 0.95)';

const PUZZLE_PIECE_STROKE = 'rgba(255, 255, 255, 0.9)';
const PUZZLE_TARGET_EDGE_GAP = 12;

export function getPuzzleTargetXRange(width: number) {
  const rightExtent = PUZZLE_CROP_SIZE - PUZZLE_CROP_PADDING;
  const maxWithoutGap = Math.max(PUZZLE_CROP_PADDING, width - rightExtent);
  const preferredMin = Math.max(
    PUZZLE_CROP_SIZE + PUZZLE_CROP_PADDING + 1,
    Math.floor(width * 0.45),
  );
  const maxWithGap = Math.max(PUZZLE_CROP_PADDING, maxWithoutGap - PUZZLE_TARGET_EDGE_GAP);
  const max = maxWithGap >= preferredMin ? maxWithGap : maxWithoutGap;

  return {
    min: Math.min(preferredMin, max),
    max,
  };
}

export function tracePuzzlePath(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const l = PUZZLE_LENGTH;
  const r = PUZZLE_RADIUS;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + l / 2, y);
  ctx.arc(x + l / 2, y - r + 2, r, 0.72 * PI, 2.26 * PI);
  ctx.lineTo(x + l, y);
  ctx.arc(x + l + r - 2, y + l / 2, r, 1.21 * PI, 2.78 * PI);
  ctx.lineTo(x + l, y + l);
  ctx.lineTo(x, y + l);
  ctx.arc(x + r - 2, y + l / 2, r + 0.4, 2.76 * PI, 1.24 * PI, true);
  ctx.closePath();
}

export function drawPuzzlePiece(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  tracePuzzlePath(ctx, x, y);
  ctx.clip();
  ctx.drawImage(image, 0, 0, width, height);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  tracePuzzlePath(ctx, x, y);
  ctx.lineWidth = 2;
  ctx.strokeStyle = PUZZLE_PIECE_STROKE;
  ctx.stroke();
  ctx.restore();
}

export function drawPuzzleTarget(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  tracePuzzlePath(ctx, x, y);
  ctx.fillStyle = PUZZLE_TARGET_FILL;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = PUZZLE_TARGET_STROKE;
  ctx.stroke();
  ctx.restore();
}
