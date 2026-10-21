export type Side = 't' | 'b' | 'l' | 'r'
export interface Pt {
  x: number
  y: number
}
export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export const ANCHOR_OUTSET = 4
const CURVATURE = 0.25
const STEP_OFFSET = 20

const DIR: Record<Side, Pt> = { t: { x: 0, y: -1 }, b: { x: 0, y: 1 }, l: { x: -1, y: 0 }, r: { x: 1, y: 0 } }

export function anchor(b: Box, side: Side, out: number): Pt {
  switch (side) {
    case 't':
      return { x: b.x + b.w / 2, y: b.y - out }
    case 'b':
      return { x: b.x + b.w / 2, y: b.y + b.h + out }
    case 'l':
      return { x: b.x - out, y: b.y + b.h / 2 }
    case 'r':
      return { x: b.x + b.w + out, y: b.y + b.h / 2 }
  }
}

const reach = (gap: number) => (gap >= 0 ? 0.5 * gap : CURVATURE * 25 * Math.sqrt(-gap))

function control(p: Pt, side: Side, other: Pt): Pt {
  switch (side) {
    case 'l':
      return { x: p.x - reach(p.x - other.x), y: p.y }
    case 'r':
      return { x: p.x + reach(other.x - p.x), y: p.y }
    case 't':
      return { x: p.x, y: p.y - reach(p.y - other.y) }
    case 'b':
      return { x: p.x, y: p.y + reach(other.y - p.y) }
  }
}

export function curvePath(s: Pt, sSide: Side, t: Pt, tSide: Side): [string, number, number] {
  const sc = control(s, sSide, t)
  const tc = control(t, tSide, s)
  const lx = s.x * 0.125 + sc.x * 0.375 + tc.x * 0.375 + t.x * 0.125
  const ly = s.y * 0.125 + sc.y * 0.375 + tc.y * 0.375 + t.y * 0.125
  return [`M${s.x},${s.y} C${sc.x},${sc.y} ${tc.x},${tc.y} ${t.x},${t.y}`, lx, ly]
}

const same = (a: Pt, b: Pt) => a.x === b.x && a.y === b.y

function bend(a: Pt, b: Pt, c: Pt, radius: number): string {
  const size = Math.min(Math.hypot(a.x - b.x, a.y - b.y) / 2, Math.hypot(b.x - c.x, b.y - c.y) / 2, radius)
  const { x, y } = b
  if ((a.x === x && x === c.x) || (a.y === y && y === c.y)) return `L${x} ${y}`
  if (a.y === y) {
    const dx = a.x < c.x ? -1 : 1
    const dy = a.y < c.y ? 1 : -1
    return `L ${x + size * dx},${y}Q ${x},${y} ${x},${y + size * dy}`
  }
  const dx = a.x < c.x ? 1 : -1
  const dy = a.y < c.y ? -1 : 1
  return `L ${x},${y + size * dy}Q ${x},${y} ${x + size * dx},${y}`
}

export function stepPath(s: Pt, sSide: Side, t: Pt, tSide: Side, radius = 10): [string, number, number] {
  const sd = DIR[sSide]
  const td = DIR[tSide]
  const sg = { x: s.x + sd.x * STEP_OFFSET, y: s.y + sd.y * STEP_OFFSET }
  const tg = { x: t.x + td.x * STEP_OFFSET, y: t.y + td.y * STEP_OFFSET }
  const horizontal = sSide === 'l' || sSide === 'r'
  const heading = horizontal ? (sg.x < tg.x ? 1 : -1) : sg.y < tg.y ? 1 : -1
  const cx = horizontal ? sg.x + (tg.x - sg.x) * 0.5 : (sg.x + tg.x) / 2
  const cy = horizontal ? (sg.y + tg.y) / 2 : sg.y + (tg.y - sg.y) * 0.5
  const across = [{ x: cx, y: sg.y }, { x: cx, y: tg.y }]
  const along = [{ x: sg.x, y: cy }, { x: tg.x, y: cy }]
  const leaves = (horizontal ? sd.x : sd.y) === heading
  const mid = horizontal === leaves ? across : along
  const pts = [s, ...(same(sg, mid[0]) ? [] : [sg]), ...mid, ...(same(tg, mid[1]) ? [] : [tg]), t]
  let d = `M${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length - 1; i++) d += bend(pts[i - 1], pts[i], pts[i + 1], radius)
  d += `L${t.x} ${t.y}`
  return [d, cx, cy]
}
