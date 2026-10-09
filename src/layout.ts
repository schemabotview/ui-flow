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
import { kindOf } from './kinds'
import { headerHeight, headerMinWidth, HEADER_MIN } from './headerMetrics'
import { proseSize } from './proseMetrics'
import { chipSize } from './chipMetrics'
import { tileSize } from './tileMetrics'

const GAP_X = 24 // horizontal gap between nodes in a layer
const GAP_Y = 72 // vertical gap between FLOW layers (room for the arrows)
const STACK_GAP_Y = 28 // vertical gap in an edgeless STACK (a labelled list — tighter, no arrows)
const TILE_GAP_X = 20 // tighter gaps for a grid/stack of tiles — they pack neatly
const TILE_GAP_Y = 16
const PAD = 14 // container inner padding around its children
// A container that declares a BACK edge reserves this much extra on the side the edge runs round (the
// right in a TB/BT flow, the bottom in LR/RL), so the loop stays INSIDE its box instead of crossing the
// border. It must hold FlowEdge's detour (40px) plus the label pill; the 14px PAD alone does not.
const BACK_LANE = 56

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
  // A BACK EDGE is drawn but does not RANK. Relaxing every edge against this order would let a
  // feedback arrow — an executor's status returning to the driver, an ack, a heartbeat — push its own
  // target forward past the node it points back at: in a four-stage Spark topology the one edge
  // `workers → driver` moved the driver from layer 1 to layer 3 and sat it beside the cluster
  // manager. The flow is what the LAYOUT is, and a channel running against it is an annotation on
  // that flow, not a stage of it. So an edge whose target already precedes its source in the
  // topological order is skipped here — and only here. SceneView still draws it, with its own
  // handles and (usually) `dashed`, which is how a reader tells the two apart.
  const pos = new Map(order.map((id, i) => [id, i]))
  for (const u of order) {
    for (const v of adj.get(u)!) {
      if (pos.get(v)! <= pos.get(u)!) continue
      depth.set(v, Math.max(depth.get(v)!, depth.get(u)! + 1))
    }
  }
  return depth
}

interface Sized {
  w: number
  h: number
  kids?: Placed[]
  header?: number
  inset?: number
}
type Dir = 'TB' | 'LR' | 'BT' | 'RL'

// Size each node — recurse into containers first so we know their box size.
function sizeNodes(nodes: SceneNode[]): Map<string, Sized> {
  const sized = new Map<string, Sized>()
  for (const n of nodes) {
    const kind = kindOf(n) // a CONTENT node (code/memory/table/plot) sizes itself from its content
    if (n.children?.length) {
      const inner = layoutSubtree(n.children, n.edges ?? [], n.cols ?? 1, n.flow ?? 'TB', n.align ?? 'center', n.stretch ?? false, n.layout ?? 'layered') // flow if edges
      // A container is sized by what it CONTAINS — and by its own header, which is content too: a
      // box narrower than its title's longest word breaks that word mid-syllable. See headerMinWidth.
      const lane = n.edges?.some((e) => e.back) ? BACK_LANE : 0 // see BACK_LANE
      const laneX = n.flow === 'LR' || n.flow === 'RL' ? 0 : lane // the lane lies across the flow's axis…
      const laneY = lane - laneX // …on the right of a vertical flow, under a horizontal one
      const boxW = Math.max(inner.w + 2 * PAD + laneX, headerMinWidth(n))
      const header = headerHeight(n, boxW) // grows to fit a wrapping label + sub
      // When the HEADER set the width, the children no longer fill the box — centre them in it, or
      // they sit hard against the left edge with all the slack pooled on the right.
      const inset = PAD + (boxW - 2 * PAD - laneX - inner.w) / 2
      sized.set(n.id, { w: boxW, h: inner.h + header + PAD + laneY, kids: inner.placed, header, inset })
    } else if (kind) {
      sized.set(n.id, kind.size(n))
    } else if (n.variant === 'chip') {
      sized.set(n.id, chipSize(n))
    } else if (n.variant === 'tile') {
      sized.set(n.id, tileSize(n))
    } else {
      sized.set(n.id, proseSize(n))
    }
  }
  return sized
}

function localEdgesOf(nodes: SceneNode[], edges: SceneEdge[]): SceneEdge[] {
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
    if (e.back) continue // a BACK edge is drawn but never ranks — see SceneEdge.back
    if (s && t && s !== t) localEdges.push({ source: s, target: t })
  }

  return localEdges
}

// Attach a container's direct children (parent-relative, offset past the header/padding); deeper
// descendants already carry their own parentId + relative position, so they pass through unchanged.
function attachKids(placed: Placed[], sized: Map<string, Sized>, parent: SceneNode, kids?: Placed[]) {
  if (!kids) return
  const s = sized.get(parent.id)
  const header = s?.header ?? HEADER_MIN // this container's own (possibly grown) header
  const inset = s?.inset ?? PAD // PAD, unless the header widened the box and the kids were centred
  for (const c of kids) {
    if (c.parentId === undefined) placed.push({ ...c, x: inset + c.x, y: header + c.y, parentId: parent.id })
    else placed.push(c)
  }
}

// What a placement strategy is handed: the siblings, their already-computed boxes, the edges among
// them (endpoints remapped to this level), and the container's own knobs.
interface Frame {
  nodes: SceneNode[]
  sized: Map<string, Sized>
  localEdges: SceneEdge[]
  cols: number
  dir: Dir
  align: 'center' | 'start'
  stretch: boolean
}
type Strategy = (f: Frame) => { placed: Placed[]; w: number; h: number }

// Longest-path layering: a layer is a row (or column, per `dir`), nodes spread across and aligned.
// An edgeless group degenerates to a stack / grid via depthOf.
const layered: Strategy = ({ nodes, sized, localEdges, cols, dir, align, stretch }) => {
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

  // STRETCH runs every LAYER out to the full cross-extent, so a row of bands ends on one line as well
  // as beginning on one. The surplus is SHARED among the layer's stretchable members, not handed to
  // each of them: a layer of one band takes all of it (the four-band row, where every layer is a
  // single column), but a layer of two takes half each. Giving each member the whole extent is the
  // bug this shape caught — the Spark study's lower row is two bands in one layer, and each grew to
  // the width of the four-band row above, doubling the scene.
  //
  // Containers only: a leaf is sized to its own content, and painting it at a sibling's height would
  // just float its text in dead space — so a mixed layer stretches its boxes and leaves its cards.
  // Resolved BEFORE placement because it changes the size the cursor walks over, and a no-op under
  // 'center', where a bigger box would simply be centred too.
  if (stretch && align === 'start') {
    for (const d of sortedD) {
      const arr = layers.get(d)!
      const boxes = arr.filter((n) => n.children?.length)
      if (!boxes.length) continue
      const surplus = maxAcross - layerAcross.get(d)!
      if (surplus <= 0) continue
      const share = surplus / boxes.length
      for (const n of boxes) {
        const s = sized.get(n.id)!
        if (horizontal) s.h += share
        else s.w += share
      }
    }
  }

  let cursorAlong = 0
  for (const d of sortedD) {
    const arr = layers.get(d)!
    // 'center' sets a narrow layer on the widest one's midline — right for a teaching frame. 'start'
    // rules every layer to the same edge, which is what makes a band diagram read as a grid.
    let cursorAcross = align === 'start' ? 0 : (maxAcross - layerAcross.get(d)!) / 2
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
      attachKids(placed, sized, n, s.kids)
      cursorAcross += (horizontal ? s.h : s.w) + gapCross
    }
    cursorAlong += layerAlong.get(d)! + gapAlong
  }
  return horizontal ? { placed, w: totalAlong, h: maxAcross } : { placed, w: maxAcross, h: totalAlong }
}


// A closed loop: the children, in author order, set clockwise round an ellipse starting at the top.
// The radii are the smallest that leave every pair of boxes a flow-sized gap (arrows need room), found
// by growing them in fixed steps — deterministic, and indifferent to how unequal the boxes are. Not
// ranked, so the edges among the children are drawn but do not place anything.
const CYCLE_ASPECT = 1.6 // the loop is wider than it is tall: boxes are, and so are the frames it lands in
const cycle: Strategy = ({ nodes, sized }) => {
  const placed: Placed[] = []
  const n = nodes.length
  if (!n) return { placed, w: 0, h: 0 }
  const box = (i: number) => sized.get(nodes[i].id)!
  const centre = (i: number, ry: number) => {
    const theta = -Math.PI / 2 + (2 * Math.PI * i) / n
    return { x: ry * CYCLE_ASPECT * Math.cos(theta), y: ry * Math.sin(theta) }
  }
  const clear = (ry: number) => {
    const c = nodes.map((_, i) => centre(i, ry))
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = Math.abs(c[i].x - c[j].x) - (box(i).w + box(j).w) / 2
        const dy = Math.abs(c[i].y - c[j].y) - (box(i).h + box(j).h) / 2
        if (dx < GAP_Y && dy < GAP_Y) return false
      }
    }
    return true
  }
  let ry = n === 1 ? 0 : 40
  while (n > 1 && !clear(ry)) ry += 8
  const c = nodes.map((_, i) => centre(i, ry))
  const x0 = Math.min(...c.map((p, i) => p.x - box(i).w / 2))
  const y0 = Math.min(...c.map((p, i) => p.y - box(i).h / 2))
  const x1 = Math.max(...c.map((p, i) => p.x + box(i).w / 2))
  const y1 = Math.max(...c.map((p, i) => p.y + box(i).h / 2))
  nodes.forEach((node, i) => {
    const s = box(i)
    placed.push({ id: node.id, x: c[i].x - s.w / 2 - x0, y: c[i].y - s.h / 2 - y0, w: s.w, h: s.h, node })
    attachKids(placed, sized, node, s.kids)
  })
  return { placed, w: x1 - x0, h: y1 - y0 }
}

// The placement strategies. Sizing and edge remapping are strategy-independent and happen once,
// before dispatch; a strategy only decides where each already-sized box goes.
const STRATEGIES: Record<'layered' | 'cycle', Strategy> = { layered, cycle }

// Lay out a set of sibling nodes (+ their subtrees). Returns placements RELATIVE to this group's
// (0,0) top-left, plus the group's overall size. Container children come back with `parentId` set.
function layoutSubtree(
  nodes: SceneNode[],
  edges: SceneEdge[],
  cols = 1,
  dir: Dir = 'TB',
  align: 'center' | 'start' = 'center',
  stretch = false,
  layout: 'layered' | 'cycle' = 'layered',
): { placed: Placed[]; w: number; h: number } {
  const sized = sizeNodes(nodes)
  const localEdges = localEdgesOf(nodes, edges)
  return STRATEGIES[layout]({ nodes, sized, localEdges, cols, dir, align, stretch })
}

export function computeLayout(scene: Scene): Placed[] {
  return layoutSubtree(scene.nodes, scene.edges, scene.cols ?? 1, scene.flow ?? 'TB', scene.align ?? 'center', scene.stretch ?? false, scene.layout ?? 'layered').placed
}

// An edge to draw, tagged with the flow direction of the container it belongs to (scene-level edges
// are 'TB'). SceneView uses `dir` to pick the handle pair so the arrow routes TB or LR.
export interface PlacedEdge extends Omit<SceneEdge, 'dir'> {
  // 'auto' (the edges of a cycle container): the face is chosen from where the two ends sit — see
  // resolveDirs in ports.ts. By the time SceneView draws an edge it is always one of the four.
  dir: 'TB' | 'LR' | 'BT' | 'RL' | 'auto'
  ports: 'center' | 'spread' // resolved: the nearest container's (or the scene's) `edgePorts`
}

// All edges to draw: the scene's own edges plus every container's child edges (any depth). Node ids
// are global in react-flow, so a container edge renders exactly like a top-level one.
export function collectEdges(scene: Scene): PlacedEdge[] {
  const base = scene.edgePorts ?? 'center'
  const out: PlacedEdge[] = scene.edges.map((e) => ({ ...e, dir: e.dir ?? (scene.layout === 'cycle' ? 'auto' : scene.flow ?? 'TB'), ports: base }))
  // `edgePorts` is inherited down the container tree, the way `framed` is: a container's own value
  // wins for its edges and for everything beneath it.
  const walk = (nodes: SceneNode[], inherited: 'center' | 'spread') => {
    for (const n of nodes) {
      const ports = n.edgePorts ?? inherited
      if (n.edges?.length) {
        const dir = n.layout === 'cycle' ? 'auto' : n.flow ?? 'TB'
        for (const e of n.edges) out.push({ ...e, dir: e.dir ?? dir, ports })
      }
      if (n.children?.length) walk(n.children, ports)
    }
  }
  walk(scene.nodes, base)
  return out
}
