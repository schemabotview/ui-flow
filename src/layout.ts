import type { Scene, SceneNode, SceneEdge } from './types'
import { kindOf } from './kinds'
import { headerHeight, headerMinWidth } from './headerMetrics'
import { proseSize } from './proseMetrics'
import { chipSize } from './chipMetrics'
import { tileSize } from './tileMetrics'

const GAP_X = 24
const GAP_Y = 72
const STACK_GAP_Y = 28
const TILE_GAP_X = 20
const TILE_GAP_Y = 16
const PAD = 14

type Flow = 'TB' | 'LR' | 'BT' | 'RL'
type Group = Pick<Scene, 'cols' | 'flow' | 'align' | 'stretch'> & { edges?: SceneEdge[] }

export interface Placed {
  id: string
  x: number
  y: number
  w: number
  h: number
  parentId?: string
  node: SceneNode
}

interface Sized {
  w: number
  h: number
  kids?: Placed[]
  header?: number
  inset?: number
}

function depthOf(nodes: SceneNode[], edges: SceneEdge[], cols: number): Map<string, number> {
  if (!edges.length) return new Map(nodes.map((n, i) => [n.id, Math.floor(i / Math.max(1, cols))]))
  const depth = new Map(nodes.map((n) => [n.id, 0]))
  const adj = new Map<string, string[]>(nodes.map((n) => [n.id, []]))
  const indeg = new Map(nodes.map((n) => [n.id, 0]))
  for (const e of edges) {
    if (!adj.has(e.source) || !adj.has(e.target)) continue
    adj.get(e.source)!.push(e.target)
    indeg.set(e.target, indeg.get(e.target)! + 1)
  }
  const order = nodes.map((n) => n.id).filter((id) => indeg.get(id) === 0)
  for (let i = 0; i < order.length; i++)
    for (const v of adj.get(order[i])!) {
      indeg.set(v, indeg.get(v)! - 1)
      if (indeg.get(v) === 0) order.push(v)
    }
  const seen = new Set(order)
  for (const n of nodes) if (!seen.has(n.id)) order.push(n.id)
  const pos = new Map(order.map((id, i) => [id, i]))
  for (const u of order)
    for (const v of adj.get(u)!) if (pos.get(v)! > pos.get(u)!) depth.set(v, Math.max(depth.get(v)!, depth.get(u)! + 1))
  return depth
}

function sizeOf(n: SceneNode): Sized {
  if (n.children?.length) {
    const inner = layoutSubtree(n.children, n)
    const w = Math.max(inner.w + 2 * PAD, headerMinWidth(n))
    const header = headerHeight(n, w)
    return { w, h: inner.h + header + PAD, kids: inner.placed, header, inset: PAD + (w - 2 * PAD - inner.w) / 2 }
  }
  const kind = kindOf(n)
  return kind ? kind.size(n) : n.variant === 'chip' ? chipSize(n) : n.variant === 'tile' ? tileSize(n) : proseSize(n)
}

function layoutSubtree(nodes: SceneNode[], g: Group): { placed: Placed[]; w: number; h: number } {
  const { cols = 1, flow = 'TB', align = 'center', stretch = false } = g
  const sized = new Map(nodes.map((n) => [n.id, sizeOf(n)]))

  const ownerOf = new Map<string, string>()
  const own = (m: SceneNode, root: string): void => (ownerOf.set(m.id, root), m.children?.forEach((c) => own(c, root)))
  nodes.forEach((n) => own(n, n.id))
  const localEdges: SceneEdge[] = []
  for (const e of g.edges ?? []) {
    const s = ownerOf.get(e.source)
    const t = ownerOf.get(e.target)
    if (s && t && s !== t) localEdges.push({ source: s, target: t })
  }

  const allTiles = nodes.length > 0 && nodes.every((n) => n.variant === 'tile' && !n.children?.length)
  const gapCross = allTiles ? TILE_GAP_X : GAP_X
  const gapAlong = localEdges.length ? GAP_Y : allTiles ? TILE_GAP_Y : STACK_GAP_Y
  const depth = depthOf(nodes, localEdges, cols)
  const layers = new Map<number, SceneNode[]>()
  for (const n of nodes) {
    const d = depth.get(n.id)!
    ;(layers.get(d) ?? layers.set(d, []).get(d)!).push(n)
  }
  const rows = [...layers.keys()].sort((a, b) => a - b).map((d) => layers.get(d)!)

  const horizontal = flow === 'LR' || flow === 'RL'
  const reverse = flow === 'BT' || flow === 'RL'
  const box = (n: SceneNode) => sized.get(n.id)!
  const along = (s: Sized) => (horizontal ? s.w : s.h)
  const across = (s: Sized) => (horizontal ? s.h : s.w)
  const rowAlong = rows.map((r) => Math.max(...r.map((n) => along(box(n)))))
  const rowAcross = rows.map((r) => r.reduce((s, n) => s + across(box(n)), 0) + gapCross * (r.length - 1))
  const maxAcross = Math.max(0, ...rowAcross)
  const totalAlong = rowAlong.reduce((sum, a) => sum + a, 0) + gapAlong * Math.max(0, rows.length - 1)

  if (stretch && align === 'start')
    rows.forEach((r, i) => {
      const boxes = r.filter((n) => n.children?.length)
      const surplus = maxAcross - rowAcross[i]
      if (!boxes.length || surplus <= 0) return
      for (const n of boxes) horizontal ? (box(n).h += surplus / boxes.length) : (box(n).w += surplus / boxes.length)
    })

  const placed: Placed[] = []
  let cursorAlong = 0
  rows.forEach((r, i) => {
    let cursorAcross = align === 'start' ? 0 : (maxAcross - rowAcross[i]) / 2
    for (const n of r) {
      const s = box(n)
      let a = cursorAlong + (rowAlong[i] - along(s)) / 2
      if (reverse) a = totalAlong - a - along(s)
      placed.push({ id: n.id, x: horizontal ? a : cursorAcross, y: horizontal ? cursorAcross : a, w: s.w, h: s.h, node: n })
      for (const c of s.kids ?? []) placed.push(c.parentId === undefined ? { ...c, x: s.inset! + c.x, y: s.header! + c.y, parentId: n.id } : c)
      cursorAcross += across(s) + gapCross
    }
    cursorAlong += rowAlong[i] + gapAlong
  })
  return horizontal ? { placed, w: totalAlong, h: maxAcross } : { placed, w: maxAcross, h: totalAlong }
}

export const computeLayout = (scene: Scene): Placed[] => layoutSubtree(scene.nodes, scene).placed

export interface PlacedEdge extends SceneEdge {
  dir: Flow
}

export function collectEdges(scene: Scene): PlacedEdge[] {
  const out: PlacedEdge[] = scene.edges.map((e) => ({ ...e, dir: e.dir ?? scene.flow ?? 'TB' }))
  const walk = (nodes: SceneNode[]): void =>
    nodes.forEach((n) => {
      n.edges?.forEach((e) => out.push({ ...e, dir: e.dir ?? n.flow ?? 'TB' }))
      if (n.children?.length) walk(n.children)
    })
  walk(scene.nodes)
  return out
}
