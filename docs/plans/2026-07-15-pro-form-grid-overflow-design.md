# ProForm Grid Overflow Design

## Problem

`ProForm` renders its fields inside Antdv `Row` with a horizontal gutter. Antdv implements that gutter with negative horizontal margins. When the form is placed in `ProModal`, whose body is scrollable, those margins increase the body's scrollable width and produce a small horizontal scrollbar.

The reproduced modal body measured `592px` for `clientWidth` and `600px` for `scrollWidth`, matching half of the configured `16px` gutter.

## Ownership

The overflow is an implementation detail of `ProForm`, so `ProForm` must contain it. `ProModal` remains a generic shell and must not hide genuine horizontal overflow from tables, editors, or other wide content. `ProFormModal` continues to own form-session composition only.

## Design

Wrap only the grid row in a `pro-form-grid-viewport` element. The wrapper has a constrained inline size and clips horizontal grid overflow without changing the gutter, column widths, responsive behavior, form values, validation, or footer layout.

Use `overflow-x: hidden` as a compatibility fallback followed by `overflow-x: clip`. Keep the non-inline footer outside the wrapper so future footer content is not clipped.

## Verification

- ProTable create and edit modals have equal body `clientWidth` and `scrollWidth`.
- The result remains correct after narrowing and widening the resizable modal.
- Vertical scrolling, validation messages, Select popups, and focus states remain usable.
- Create/edit form-session isolation remains unchanged.
- Type checking, unit tests, linting, formatting, production build, and `git diff --check` pass.
