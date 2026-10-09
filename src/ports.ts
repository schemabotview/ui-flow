// Edge PORTS: where along a node's face an edge attaches.
//
// Every node has one handle per face, so by default every edge on a face meets at its midpoint — a
// fan-in lands as one knot, and two edges between the same pair of faces draw on top of each other.
// `edgePorts: 'spread'` (on the scene, or inherited down a container) opts edges into distributing the edges that share a face along it.
//
// This is geometry, not layout: node positions never move, and no handle is added to any node. The
// result is a per-edge OFFSET along the face, which FlowEdge applies to the endpoint react-flow
// hands it. Pure and deterministic, like computeLayout — same scene in, same offsets out.

import type { Placed, PlacedEdge } from './layout'

export type Dir = 'TB' | 'LR' | 'BT' | 'RL'
type Face = 't' | 'b' | 'l' | 'r'

/** Which handle (and so which face) an edge leaves and enters, per flow direction. */
export const HANDLES = {
  TB: { s: 'b-s', t: 't-t' },
  BT: { s: 't-s', t: 'b-t' },
  LR: { s: 'r-s', t: 'l-t' },
  RL: { s: 'l-s', t: 'r-t' },
} as const

const SPACING = 22 // preferred distance between neighbouring ports
const LABELLED_SPACING = 64 // …when an edge on the face carries a label: the pill is wider than 22px,
// and a label rides the path's MIDPOINT, which is only as far from its neighbour's as the ports are
const INSET = 14 // keep a port this far from a face's corner (the node radius)

export interface PortOffsets {
  src: number
  tgt: number
}

/** Absolute centre of every placed node (positions are parent-relative). */
function centres(placed: Placed[]): Map<string, { x: number; y: number }> {
  const byId = new Map(placed.map((p) => [p.id, p]))
  const abs = (p: Placed): { x: number; y: number } => {
    const parent = p.parentId ? abs(byId.get(p.parentId)!) : { x: 0, y: 0 }
    return { x: parent.x + p.x, y: parent.y + p.y }
  }
  return new Map(placed.map((p) => {
    const o = abs(p)
    return [p.id, { x: o.x + p.w / 2, y: o.y + p.h / 2 }]
  }))
}

/**
 * One offset pair per edge, same order as `edges`. 0 means "the face midpoint" (the default), so a
 * lone edge on a face is untouched. Edges sharing a face are ordered by where their OTHER end sits
 * along that face's axis, so the left-hand port goes to the left-hand neighbour and the fan does not
 * cross itself.
 */
export function portOffsets(placed: Placed[], edges: PlacedEdge[]): PortOffsets[] {
  const size = new Map(placed.map((p) => [p.id, p]))
  const at = centres(placed)
  const out: PortOffsets[] = edges.map(() => ({ src: 0, tgt: 0 }))

  // (node, face) → the edge ends attached there.
  const groups = new Map<string, { edge: number; end: 'src' | 'tgt'; key: number; labelled: boolean }[]>()
  edges.forEach((e, i) => {
    if (e.ports !== 'spread') return // only edges that opted in take part; the rest stay at the midpoint
    const h = HANDLES[e.dir] ?? HANDLES.TB
    const ends = [
      { id: e.source, face: h.s[0] as Face, end: 'src' as const, other: e.target },
      { id: e.target, face: h.t[0] as Face, end: 'tgt' as const, other: e.source },
    ]
    for (const { id, face, end, other } of ends) {
      const o = at.get(other)
      if (!size.has(id) || !o) continue
      const key = face === 't' || face === 'b' ? o.x : o.y
      const g = `${id}|${face}`
      ;(groups.get(g) ?? groups.set(g, []).get(g)!).push({ edge: i, end, key, labelled: !!e.label })
    }
  })

  for (const [g, list] of groups) {
    if (list.length < 2) continue
    const [id, face] = g.split('|')
    const p = size.get(id)!
    const len = face === 't' || face === 'b' ? p.w : p.h
    list.sort((a, b) => a.key - b.key || a.edge - b.edge)
    const spacing = list.some((m) => m.labelled) ? LABELLED_SPACING : SPACING
    const span = Math.min((list.length - 1) * spacing, Math.max(0, len - 2 * INSET))
    const step = span / (list.length - 1)
    list.forEach((m, k) => {
      out[m.edge][m.end] = -span / 2 + k * step
    })
  }
  return out
}
