// The layout algorithm — the core of the render-engine. Given a declarative Scene, it assigns each
// node a fixed position + size via longest-path layering. The flow runs TOP → BOTTOM: each layer
// (distance from a source node) is a ROW going down, nodes within a layer spread across, centred.
//
// It is size-aware and RECURSIVE: a node with `children` is a container — its children are laid out
// inside it and the box is sized to fit them (+ a header for the label). Positions come out relative
// to the immediate parent (as react-flow expects for parent/child nodes); top-level nodes are
// absolute. A subtree with no edges STACKS vertically (a labelled list of peers), so containers and
// peer boards don't need fake edges. PURE + DETERMINISTIC: same scene in → same coordinates out.

import type { Scene, SceneNode, SceneEdge } from './types'
import { codeCardSize } from './codeMetrics'
import { memoryCardSize } from './memoryMetrics'

export const NODE_W = 210
export const NODE_H = 96
export const TILE_W = 128 // compact icon-over-label node (hugs the content)
export const TILE_H = 96
const GAP_X = 44 // horizontal gap between nodes in a layer
const GAP_Y = 90 // vertical gap between FLOW layers (room for the arrows)
const STACK_GAP_Y = 28 // vertical gap in an edgeless STACK (a labelled list — tighter, no arrows)
const TILE_GAP_X = 20 // tighter gaps for a grid/stack of tiles — they pack neatly
const TILE_GAP_Y = 16
const PAD = 14 // container inner padding around its children
const HEADER = 52 // MINIMUM container header height (holds the corner-anchored label + its sub line)

// Estimate the header height a container needs so its (wrapping) label + sub never overlap the
// children below — mirrors ContainerNode's header: icon (22) + gap (10) at left:12, label at 16px /
// 1.2 line-height, optional sub at 12px. Narrow boxes wrap the text over more lines and so need a
// taller header; wide/short-label boxes compute ≤ HEADER and stay at the fixed minimum (so existing
// scenes are unchanged). Text width is generous by design — better a hair too tall than an overlap.
function headerHeight(label: string, sub: string | undefined, boxW: number): number {
  const textW = Math.max(40, boxW - 12 - 22 - 10 - 12) // box minus left inset, icon, gap, right margin
  const lines = (text: string, charW: number) => Math.max(1, Math.ceil((text.length * charW) / textW))
  const labelH = lines(label, 8.3) * 19.2 // 16px @ 1.2
  const subH = sub ? lines(sub, 6.2) * 15 + 1 : 0 // 12px + marginTop
  return Math.max(HEADER, Math.ceil(10 + labelH + subH + 10)) // top inset + text + bottom breathing
}

export interface Placed {
  id: string
  x: number // top-left; relative to parent if `parentId` is set, else absolute
  y: number
  w: number
  h: number
  parentId?: string
  node: SceneNode
}

// Longest-path depth, or (when there are no edges) row = ⌊i / cols⌋ so peers stack top-to-bottom
// (cols = 1) or wrap into a grid (cols > 1).
function depthOf(nodes: SceneNode[], edges: SceneEdge[], cols: number): Map<string, number> {
  const depth = new Map<string, number>(nodes.map((n) => [n.id, 0]))
  if (edges.length === 0) {
    const c = Math.max(1, cols)
    nodes.forEach((n, i) => depth.set(n.id, Math.floor(i / c))) // stack (c=1) or grid (c>1)
    return depth
  }
  const ids = new Set(nodes.map((n) => n.id))
  const adj = new Map<string, string[]>(nodes.map((n) => [n.id, []]))
  const indeg = new Map<string, number>(nodes.map((n) => [n.id, 0]))
  for (const e of edges) {
    if (!ids.has(e.source) || !ids.has(e.target)) continue
    adj.get(e.source)!.push(e.target)
    indeg.set(e.target, indeg.get(e.target)! + 1)
  }
  // Kahn topological order (cycle-safe: leftover nodes appended in author order).
  const indeg2 = new Map(indeg)
  const queue = nodes.map((n) => n.id).filter((id) => indeg2.get(id) === 0)
  const order: string[] = []
  while (queue.length) {
    const u = queue.shift()!
    order.push(u)
    for (const v of adj.get(u)!) {
      indeg2.set(v, indeg2.get(v)! - 1)
      if (indeg2.get(v) === 0) queue.push(v)
    }
  }
  for (const n of nodes) if (!order.includes(n.id)) order.push(n.id)
  for (const u of order) for (const v of adj.get(u)!) depth.set(v, Math.max(depth.get(v)!, depth.get(u)! + 1))
  return depth
}

// Lay out a set of sibling nodes (+ their subtrees). Returns placements RELATIVE to this group's
// (0,0) top-left, plus the group's overall size. Container children come back with `parentId` set.
function layoutSubtree(
  nodes: SceneNode[],
  edges: SceneEdge[],
  cols = 1,
  dir: 'TB' | 'LR' | 'BT' | 'RL' = 'TB',
): { placed: Placed[]; w: number; h: number } {
  // Size each node — recurse into containers first so we know their box size.
  const sized = new Map<string, { w: number; h: number; kids?: Placed[]; header?: number }>()
  for (const n of nodes) {
    if (n.children?.length) {
      const inner = layoutSubtree(n.children, n.edges ?? [], n.cols ?? 1, n.flow ?? 'TB') // flow if edges
      const boxW = inner.w + 2 * PAD
      const header = headerHeight(n.label, n.sub, boxW) // grows to fit a wrapping label + sub
      sized.set(n.id, { w: boxW, h: inner.h + header + PAD, kids: inner.placed, header })
    } else if (n.kind === 'code') {
      sized.set(n.id, codeCardSize(n)) // an IDE card: sized to its content (longest line × line count)
    } else if (n.kind === 'memory') {
      sized.set(n.id, memoryCardSize(n)) // a layout figure: sized to its slots (widest cell × slot count)
    } else if (n.variant === 'tile') {
      sized.set(n.id, { w: TILE_W, h: TILE_H })
    } else {
      sized.set(n.id, { w: NODE_W, h: NODE_H })
    }
  }

  // Remap each edge endpoint to the SIBLING at this level that contains it (itself, or an ancestor of
  // a nested endpoint), dropping endpoints outside all siblings. So an edge pointing deep inside a
  // container — a load balancer fanning to apps nested in AZ ⊃ Region ⊃ AWS boxes — still positions
  // that container within this level's flow. (Drawn edges keep their real deep endpoints; only layout
  // uses these remapped ones.)
  const ownerOf = new Map<string, string>()
  for (const n of nodes) {
    const stack: SceneNode[] = [n]
    while (stack.length) {
      const m = stack.pop()!
      ownerOf.set(m.id, n.id)
      if (m.children?.length) stack.push(...m.children)
    }
  }
  const localEdges: SceneEdge[] = []
  for (const e of edges) {
    const s = ownerOf.get(e.source)
    const t = ownerOf.get(e.target)
    if (s && t && s !== t) localEdges.push({ source: s, target: t })
  }

  // A grid/stack made entirely of tiles packs with tight gaps; flows and card lists breathe more.
  // Two gaps: ALONG the flow (between layers — needs arrow room when there are edges) and ACROSS it
  // (between siblings in a layer — packs tight for tiles). For TB the along-gap is vertical, for LR
  // horizontal; the placement below maps them onto x/y per `dir`.
  const isFlow = localEdges.length > 0
  const allTiles = nodes.length > 0 && nodes.every((n) => n.variant === 'tile' && !n.children?.length)
  const gapCross = allTiles ? TILE_GAP_X : GAP_X
  const gapAlong = isFlow ? GAP_Y : allTiles ? TILE_GAP_Y : STACK_GAP_Y
  const depth = depthOf(nodes, localEdges, cols)
  const layers = new Map<number, SceneNode[]>()
  for (const n of nodes) {
    const d = depth.get(n.id)!
    ;(layers.get(d) ?? layers.set(d, []).get(d)!).push(n)
  }
  const sortedD = [...layers.keys()].sort((a, b) => a - b)

  const placed: Placed[] = []
  // Attach a container's direct children (parent-relative, offset past the header/padding); deeper
  // descendants already carry their own parentId + relative position, so they pass through unchanged.
  const attachKids = (parent: SceneNode, kids?: Placed[]) => {
    if (!kids) return
    const header = sized.get(parent.id)?.header ?? HEADER // this container's own (possibly grown) header
    for (const c of kids) {
      if (c.parentId === undefined) placed.push({ ...c, x: PAD + c.x, y: header + c.y, parentId: parent.id })
      else placed.push(c)
    }
  }

  // Each layer's extent ALONG the flow (thickness) and ACROSS it (span). Horizontal flows (LR/RL) run
  // along x; vertical flows (TB/BT) along y. Reversed flows (BT/RL) place layer 0 at the far end and
  // count back, so the arrows point the other way (up / left) — same layout, mirrored on the axis.
  const horizontal = dir === 'LR' || dir === 'RL'
  const reverse = dir === 'BT' || dir === 'RL'
  const along = (n: SceneNode) => (horizontal ? sized.get(n.id)!.w : sized.get(n.id)!.h)
  const across = (n: SceneNode) => (horizontal ? sized.get(n.id)!.h : sized.get(n.id)!.w)
  const layerAlong = new Map<number, number>()
  const layerAcross = new Map<number, number>()
  for (const d of sortedD) {
    const arr = layers.get(d)!
    layerAlong.set(d, Math.max(...arr.map(along)))
    layerAcross.set(d, arr.reduce((s, n) => s + across(n), 0) + gapCross * (arr.length - 1))
  }
  const maxAcross = Math.max(0, ...layerAcross.values())

  // Total extent along the flow — precomputed so a reversed flow can mirror positions against it.
  const totalAlong = sortedD.reduce((sum, d) => sum + layerAlong.get(d)!, 0) + gapAlong * Math.max(0, sortedD.length - 1)

  let cursorAlong = 0
  for (const d of sortedD) {
    const arr = layers.get(d)!
    let cursorAcross = (maxAcross - layerAcross.get(d)!) / 2 // centre a narrow layer against the widest
    for (const n of arr) {
      const s = sized.get(n.id)!
      // Map (along, across) back onto (x, y): the across-cursor picks the spot in the layer; the
      // along-cursor picks the layer; each node is centred within its layer's thickness. A reversed
      // flow mirrors the along position (layer 0 lands at the far end → arrows point back).
      const alongSize = horizontal ? s.w : s.h
      let alongPos = cursorAlong + (layerAlong.get(d)! - alongSize) / 2
      if (reverse) alongPos = totalAlong - alongPos - alongSize
      const x = horizontal ? alongPos : cursorAcross
      const y = horizontal ? cursorAcross : alongPos
      placed.push({ id: n.id, x, y, w: s.w, h: s.h, node: n })
      attachKids(n, s.kids)
      cursorAcross += across(n) + gapCross
    }
    cursorAlong += layerAlong.get(d)! + gapAlong
  }
  return horizontal ? { placed, w: totalAlong, h: maxAcross } : { placed, w: maxAcross, h: totalAlong }
}

export function computeLayout(scene: Scene): Placed[] {
  return layoutSubtree(scene.nodes, scene.edges, scene.cols ?? 1, scene.flow ?? 'TB').placed
}

// An edge to draw, tagged with the flow direction of the container it belongs to (scene-level edges
// are 'TB'). SceneView uses `dir` to pick the handle pair so the arrow routes TB or LR.
export interface PlacedEdge extends SceneEdge {
  dir: 'TB' | 'LR' | 'BT' | 'RL'
}

// All edges to draw: the scene's own edges plus every container's child edges (any depth). Node ids
// are global in react-flow, so a container edge renders exactly like a top-level one.
export function collectEdges(scene: Scene): PlacedEdge[] {
  const out: PlacedEdge[] = scene.edges.map((e) => ({ ...e, dir: e.dir ?? scene.flow ?? 'TB' }))
  const walk = (nodes: SceneNode[]) => {
    for (const n of nodes) {
      if (n.edges?.length) {
        const dir = n.flow ?? 'TB'
        for (const e of n.edges) out.push({ ...e, dir: e.dir ?? dir })
      }
      if (n.children?.length) walk(n.children)
    }
  }
  walk(scene.nodes)
  return out
}
