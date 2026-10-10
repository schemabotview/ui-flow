import type { PlotAxis, PlotSpec, SceneNode } from './types'

export const PLOT_TICK_FONT = 13
export const PLOT_AXIS_FONT = 15
export const PLOT_LABEL_FONT = 14
export const PLOT_TITLE_FONT = 19
export const PLOT_TITLE_H = 34
export const PLOT_SUB_H = 18
export const PLOT_PAD = 26
export const PLOT_TICK_CHAR_W = 7.82
export const PLOT_BORDER = 2.5

export const PLOT_AREA_W = 760
export const PLOT_AREA_H = 460
export const PLOT_AREA_W_MIN = 420
export const PLOT_AREA_W_MAX = 940
export const PLOT_AREA_H_MAX = 620

export function niceStep(span: number): number {
  const raw = Math.abs(span) / 9
  if (!(raw > 0) || !Number.isFinite(raw)) return 1
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const n = raw / mag
  return (n >= 5 ? 5 : n >= 2 ? 2 : 1) * mag
}

export const PLOT_MAX_TICKS = 200

export function axisStep(a: PlotAxis): number {
  const span = Math.abs(a.max - a.min)
  const s = a.step
  if (s !== undefined && Number.isFinite(s) && s > 0 && span / s <= PLOT_MAX_TICKS) return s
  return niceStep(span)
}

export function axisTicks(a: PlotAxis): number[] {
  const step = axisStep(a)
  const out: number[] = []
  const start = Math.ceil(a.min / step) * step
  for (let i = 0; i <= PLOT_MAX_TICKS && start + i * step <= a.max + step * 1e-9; i++) out.push(round(start + i * step, step))
  return out
}

function decimals(step: number): number {
  const s = String(Math.abs(step))
  if (s.includes('e-')) return Number(s.split('e-')[1])
  return s.includes('.') ? s.split('.')[1].length : 0
}

function round(v: number, step: number): number {
  return Number(v.toFixed(decimals(step) + 1))
}

export function formatTick(v: number, step: number): string {
  const s = v.toFixed(decimals(step))
  return Number(s) === 0 ? (0).toFixed(decimals(step)) : s
}

export function plotAxesMode(spec: PlotSpec): 'origin' | 'corner' {
  if (spec.axes) return spec.axes
  return spec.x.min < 0 && spec.x.max > 0 && spec.y.min < 0 && spec.y.max > 0 ? 'origin' : 'corner'
}

function yGutter(spec: PlotSpec): number {
  const step = axisStep(spec.y)
  const longest = Math.max(1, ...axisTicks(spec.y).map((t) => formatTick(t, step).length))
  return Math.ceil(longest * PLOT_TICK_CHAR_W) + 14
}

export function plotAreaSize(spec: PlotSpec): { w: number; h: number } {
  if (!spec.equal) return { w: PLOT_AREA_W, h: PLOT_AREA_H }
  const r = (spec.x.max - spec.x.min) / (spec.y.max - spec.y.min)
  let w = PLOT_AREA_H * r
  let h = PLOT_AREA_H
  if (w > PLOT_AREA_W_MAX) { w = PLOT_AREA_W_MAX; h = w / r }
  if (w < PLOT_AREA_W_MIN) { w = PLOT_AREA_W_MIN; h = Math.min(PLOT_AREA_H_MAX, w / r) }
  return { w: Math.round(w), h: Math.round(h) }
}

export function plotInset(node: Pick<SceneNode, 'label' | 'sub' | 'plot'>): { l: number; r: number; t: number; b: number } {
  const spec = node.plot!
  const corner = plotAxesMode(spec) === 'corner'
  const caption = node.label ? PLOT_TITLE_H + (node.sub ? PLOT_SUB_H : 0) : 0
  return {
    l: corner ? yGutter(spec) + (spec.y.label ? PLOT_AXIS_FONT + 12 : 0) : PLOT_PAD,
    r: PLOT_PAD,
    t: caption + PLOT_PAD,
    b: corner ? PLOT_TICK_FONT + 20 + (spec.x.label ? PLOT_AXIS_FONT + 10 : 0) : PLOT_PAD,
  }
}

export function plotContentSize(node: Pick<SceneNode, 'label' | 'sub' | 'plot'>): { w: number; h: number } {
  const area = plotAreaSize(node.plot!)
  const i = plotInset(node)
  return { w: Math.round(area.w + i.l + i.r), h: Math.round(area.h + i.t + i.b) }
}

export function plotCardSize(node: Pick<SceneNode, 'label' | 'sub' | 'plot'>): { w: number; h: number } {
  const c = plotContentSize(node)
  return { w: c.w + PLOT_BORDER * 2, h: c.h + PLOT_BORDER * 2 }
}
