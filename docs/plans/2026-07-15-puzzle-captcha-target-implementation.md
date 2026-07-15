# Puzzle Captcha Target Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Render a clearly visible and stable puzzle target without leaking Canvas state or breaking responsive interaction.

**Architecture:** Extract shared puzzle geometry and rendering into a tested canvas helper. Keep component lifecycle and interaction in `PuzzleCaptcha.vue`, while synchronizing canvas dimensions and rejecting stale image callbacks.

**Tech Stack:** Vue 3, TypeScript, Canvas 2D, Vitest, agent-browser

---

### Task 1: Add rendering contract tests

**Files:**

- Create: `tests/unit/puzzle-canvas.spec.ts`
- Create: `src/components/Captcha/src/puzzleCanvas.ts`

**Step 1: Write tests with a recording Canvas context**

Cover these contracts:

- Target rendering calls `save`, traces the path, fills, strokes, and restores.
- Target rendering uses `source-over` and never uses `destination-over`.
- Piece rendering clips before drawing the source image and draws its outline afterward.
- Target placement stays clear of the initial left-side piece when the canvas has enough room.

**Step 2: Run the focused test**

Run: `npx vitest run tests/unit/puzzle-canvas.spec.ts`

Expected before implementation: FAIL because the rendering module does not exist.

### Task 2: Implement isolated Canvas renderers

**Files:**

- Create: `src/components/Captcha/src/puzzleCanvas.ts`

**Step 1: Add shared geometry constants and path tracing**

Keep the existing puzzle shape and crop dimensions.

**Step 2: Add piece and target renderers**

Use `save` and `restore`. Render the target with a dark translucent fill and a high-contrast stroke using normal composition.

**Step 3: Run the focused test**

Run: `npx vitest run tests/unit/puzzle-canvas.spec.ts`

Expected: PASS.

### Task 3: Integrate renderers and harden initialization

**Files:**

- Modify: `src/components/Captcha/src/PuzzleCaptcha.vue`

**Step 1: Replace `drawPuzzleShape`**

Import the tested geometry constants and renderers.

**Step 2: Synchronize backing-store dimensions**

Set canvas `width` and `height` before acquiring contexts and drawing.

**Step 3: Reject stale image callbacks**

Increment an initialization generation on each reset/resize and ignore older `onload`/`onerror` callbacks.

**Step 4: Constrain target placement**

Use the shared target range helper so the target crop is separated from the initial piece while remaining inside the canvas.

### Task 4: Browser regression

**Files:**

- Verify: `src/components/Captcha/src/PuzzleCaptcha.vue`

**Step 1: Compare target and piece pixels**

Expected: target-center luminance is materially lower than the matching piece pixel and the main context returns to `source-over`.

**Step 2: Verify responsive and reset behavior**

Check desktop and 500px viewports, then reset repeatedly. Expected: every generated target remains visible.

**Step 3: Verify dragging**

Drag to the target and away from it. Expected: success and failure behavior remains correct.

### Task 5: Quality gates

Run:

```bash
npm run type-check
npm run test:unit:run
npm run lint
npm run build:check
npx oxfmt --check src/components/Captcha/src/PuzzleCaptcha.vue src/components/Captcha/src/puzzleCanvas.ts tests/unit/puzzle-canvas.spec.ts docs/plans/2026-07-15-puzzle-captcha-target-design.md docs/plans/2026-07-15-puzzle-captcha-target-implementation.md
git diff --check
```

Expected: all commands pass; existing unrelated build-size and ECharts warnings may remain.
