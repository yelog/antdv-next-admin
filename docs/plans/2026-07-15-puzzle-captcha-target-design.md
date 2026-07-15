# Puzzle Captcha Target Design

## Problem

The puzzle piece is visible, but the target position is not. `drawPuzzleShape` currently combines path creation, clipping, filling, and stroking. It changes `globalCompositeOperation` to `destination-over` before filling the target. Because the opaque background has already been drawn, the target fill is placed behind it and cannot be seen. The remaining translucent white stroke has insufficient contrast on the default light background.

Browser inspection confirmed that the main canvas remains in `destination-over` mode after initialization. A pixel sampled from the target center differs from the original puzzle-piece pixel by only one luminance point, so no meaningful target treatment is being rendered.

## Architecture

Move puzzle geometry and canvas rendering into a small `puzzleCanvas.ts` module:

- `tracePuzzlePath` owns the shared puzzle outline.
- `drawPuzzlePiece` clips the source image and then draws the piece outline.
- `drawPuzzleTarget` renders a dark translucent silhouette plus a high-contrast outline.
- `getPuzzleTargetXRange` keeps the target away from the piece's initial left-side position when the canvas is wide enough.

Every renderer uses `save` and `restore`, and explicitly uses normal `source-over` composition. `PuzzleCaptcha.vue` remains responsible for responsive dimensions, image loading, extraction, slider state, and verification.

## Lifecycle Hardening

Resize both canvas backing stores synchronously before acquiring contexts and drawing. Track an initialization generation so stale asynchronous image loads cannot overwrite a newer resize or reset. Store both target coordinates as component state for consistent rendering and verification.

## Verification

- Unit tests verify clipping, fill/stroke ordering, state isolation, and the absence of `destination-over`.
- Position tests verify that the target crop does not overlap the initial piece when space is available.
- Browser pixel checks verify the target center is visibly darker than the matching puzzle-piece pixel.
- The target remains visible after reset and at desktop/mobile widths.
- Dragging to the target still succeeds; dragging elsewhere still fails and resets.
- Type checking, unit tests, linting, formatting, production build, and `git diff --check` pass.
