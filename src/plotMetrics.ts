// Shared geometry for the PLOT node, so layout.ts (which SIZES the node) and PlotNode.tsx (which
// PAINTS it) agree exactly — the same contract codeMetrics/tableMetrics hold, and for the same
// reason: a plot is drawn at a FIXED base font and SceneView's fitView scales the whole scene, so
// every plot across the deck renders its ticks and labels at one type size.
//
// Why a plot node exists at all: some ideas ARE a curve. "Gradient descent walks downhill on the
// cost surface", "the sigmoid squashes any real number into (0,1)", "this boundary separates the
// two classes" — none of them survives being redrawn as a box-and-arrow diagram, because the shape
// of the function is the content. A card can say what a thing is called; only an axis can show it.
//
// The author writes DATA coordinates; the engine owns every PIXEL. That is the same invariant the
// rest of the engine holds — nobody hand-places a card — just expressed in the one place where
// numbers are legitimately the content rather than the layout.

import type { PlotAxis, PlotSpec, SceneNode } from './types'

export const PLOT_TICK_FONT = 13 // px — IBM Plex Mono, the tick labels
export const PLOT_AXIS_FONT = 15 // px — the axis names ('x', 'y', 'size (ft²)')
export const PLOT_LABEL_FONT = 14 // px — a series' direct label
export const PLOT_TITLE_FONT = 19 // px — the node's `label`, drawn as the figure's caption
export const PLOT_TITLE_H = 34 // the caption block's height when `label` is set
export const PLOT_SUB_H = 18 // extra height when `sub` is set too
export const PLOT_PAD = 26 // breathing room between the data area and the card edge
export const PLOT_TICK_CHAR_W = 7.82 // px advance of one glyph at PLOT_TICK_FONT (measured, IBM Plex Mono)
export const PLOT_BORDER = 2.5 // the card's own border, counted on both axes (box-sizing: border-box)

// The data area's natural size. A plot is not sized to its content the way a code card is — its
// content is continuous, so there is no "longest line" to measure. It gets ONE deck-wide box
// instead, which is what makes every plot in a course render its type at the same size.
export const PLOT_AREA_W = 760
export const PLOT_AREA_H = 460
// ...unless the plot is `equal`-scaled, where the axes' own spans set the aspect and these clamp it.
export const PLOT_AREA_W_MIN = 420
export const PLOT_AREA_W_MAX = 940
export const PLOT_AREA_H_MAX = 620

// COLOURS MOVED TO themes.ts at 0.8.0. The ramp, the grid, the axes, the ticks and the ink are all
// theme-owned now — a plot painted on an AWS canvas has to use that canvas's gutters, or the figure
// reads as pasted in from another deck. What stays here is GEOMETRY, which is theme-independent:
// a tick is in the same place whatever colour it is.
//
// The ramp's ORDER is still fixed and still a constraint on every theme — see the note in themes.ts.
// It is network · service · user · storage so green and orange are never adjacent, that being the
// pair that collapses under protanopia; and `warn` red is never in it, because in this engine red
// means "the catch".

/** A "nice" tick interval (1/2/5 × 10ⁿ) for a span, when the author has not named one. */
export function niceStep(span: number): number {
  const raw = Math.abs(span) / 9
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const n = raw / mag
  return (n >= 5 ? 5 : n >= 2 ? 2 : 1) * mag
}

export const axisStep = (a: PlotAxis): number => a.step ?? niceStep(a.max - a.min)

/**
 * The tick VALUES an axis paints, stepping outward from a multiple of the step so ticks land on
 * round numbers regardless of where the range starts.
 */
export function axisTicks(a: PlotAxis): number[] {
  const step = axisStep(a)
  const out: number[] = []
  const start = Math.ceil(a.min / step) * step
  // Accumulate by multiplication rather than repeated addition: 0.1 + 0.1 + 0.1 drifts, and a tick
  // labelled "0.30000000000000004" is a defect the author cannot fix from the scene file.
  for (let i = 0; start + i * step <= a.max + step * 1e-9; i++) out.push(round(start + i * step, step))
  return out
}

/**
 * Decimal places the step itself needs. Derived from how the number is WRITTEN, not from its
 * log — `-log10(0.25)` is 0.6, which rounds a 0.25-stepped axis to one decimal and labels its
 * ticks 0.0 · 0.3 · 0.5 · 0.8 · 1.0. Reading the mantissa gets 2 and labels them correctly.
 */
function decimals(step: number): number {
  const s = String(Math.abs(step))
  if (s.includes('e-')) return Number(s.split('e-')[1])
  return s.includes('.') ? s.split('.')[1].length : 0
}

/** Round a tick to the step's own precision, so a 0.1-stepped axis does not accumulate drift. */
function round(v: number, step: number): number {
  return Number(v.toFixed(decimals(step) + 1))
}

/** How a tick is written — at the step's own precision. -0 is never shown. */
export function formatTick(v: number, step: number): string {
  const s = v.toFixed(decimals(step))
  return Number(s) === 0 ? (0).toFixed(decimals(step)) : s
}

/**
 * Does this plot draw its axes through the ORIGIN (a Cartesian plane, the way a maths figure is
 * drawn) or along the box's left/bottom EDGES (the way a data chart is)? Derived from the ranges —
 * a plot whose window contains the origin on both axes is a plane — and overridable per scene,
 * because a regression on non-negative data still sometimes wants the origin drawn.
 */
export function plotAxesMode(spec: PlotSpec): 'origin' | 'corner' {
  if (spec.axes) return spec.axes
  return spec.x.min < 0 && spec.x.max > 0 && spec.y.min < 0 && spec.y.max > 0 ? 'origin' : 'corner'
}

/** Width the y tick labels need — the longest label, in pixels. */
function yGutter(spec: PlotSpec): number {
  const step = axisStep(spec.y)
  const longest = Math.max(1, ...axisTicks(spec.y).map((t) => formatTick(t, step).length))
  return Math.ceil(longest * PLOT_TICK_CHAR_W) + 14
}

/** The data area's pixel size — one deck-wide box, unless `equal` makes the axes set the aspect. */
export function plotAreaSize(spec: PlotSpec): { w: number; h: number } {
  if (!spec.equal) return { w: PLOT_AREA_W, h: PLOT_AREA_H }
  // Equal scaling: one data unit is the same number of pixels on both axes, so a right angle looks
  // like one and a circular cluster looks circular. Needed wherever DISTANCE is the content —
  // a decision boundary, k-means, the rise-over-run triangle on a slope.
  const r = (spec.x.max - spec.x.min) / (spec.y.max - spec.y.min)
  let w = PLOT_AREA_H * r
  let h = PLOT_AREA_H
  if (w > PLOT_AREA_W_MAX) { w = PLOT_AREA_W_MAX; h = w / r }
  if (w < PLOT_AREA_W_MIN) { w = PLOT_AREA_W_MIN; h = Math.min(PLOT_AREA_H_MAX, w / r) }
  return { w: Math.round(w), h: Math.round(h) }
}

/**
 * The data area's offsets inside the card's CONTENT box (i.e. inside the border, which PlotNode
 * draws and `plotCardSize` adds on separately). Everything the painter draws is expressed in this
 * space, and the SVG's viewBox is exactly this box — so the 1px the border varies between the
 * focused and unfocused states rescales the figure imperceptibly instead of clipping it.
 */
export function plotInset(node: Pick<SceneNode, 'label' | 'sub' | 'plot'>): { l: number; r: number; t: number; b: number } {
  const spec = node.plot!
  const corner = plotAxesMode(spec) === 'corner'
  const caption = node.label ? PLOT_TITLE_H + (node.sub ? PLOT_SUB_H : 0) : 0
  return {
    // In corner mode the tick labels sit OUTSIDE the data area and need their own gutter, and an
    // axis NAME needs room past them — drawn inside the area (as a maths plane does it) it lands on
    // top of the data, which is how x₁/x₂ came to sit on their own corner ticks. On a plane the
    // names ride the axis ends instead, where there is nothing to collide with.
    l: corner ? yGutter(spec) + (spec.y.label ? PLOT_AXIS_FONT + 12 : 0) : PLOT_PAD,
    r: PLOT_PAD,
    t: caption + PLOT_PAD,
    b: corner ? PLOT_TICK_FONT + 20 + (spec.x.label ? PLOT_AXIS_FONT + 10 : 0) : PLOT_PAD,
  }
}

/** The content box the painter draws into — the card minus its border. Also the SVG's viewBox. */
export function plotContentSize(node: Pick<SceneNode, 'label' | 'sub' | 'plot'>): { w: number; h: number } {
  const area = plotAreaSize(node.plot!)
  const i = plotInset(node)
  return { w: Math.round(area.w + i.l + i.r), h: Math.round(area.h + i.t + i.b) }
}

/** Natural pixel size of a plot node — the box the layout reserves for it, border included. */
export function plotCardSize(node: Pick<SceneNode, 'label' | 'sub' | 'plot'>): { w: number; h: number } {
  const c = plotContentSize(node)
  return { w: c.w + PLOT_BORDER * 2, h: c.h + PLOT_BORDER * 2 }
}
