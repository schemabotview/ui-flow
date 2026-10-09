// Compose several scenes into ONE panel: the harness shows a capability as a single board, not a
// scroll of near-identical fixtures. A scene maps one-to-one onto a container (`cols`, `flow`,
// `align`, `stretch`, `framed`, `edgePorts` and `edges` are all container fields too), so wrapping a
// scene changes nothing about how its own contents are laid out — it only adds a labelled box.
//
// Node ids are global in react-flow, so every sub-scene's ids are prefixed `<scene.id>:`. That is
// also what keeps a check able to find a node again: `prose-hierarchy:plan`, not `plan`.
//
// A scene that is already a row of boxes (`nodes`, `edges`) is spliced in BARE — its boxes become the
// panel's own — instead of being boxed a second time. Only legal for an edgeless scene, which has no
// top-level flow to lose.
import type { Scene, SceneEdge, SceneNode } from '../../src'

const prefixEdge = (e: SceneEdge, p: string): SceneEdge => ({ ...e, source: `${p}:${e.source}`, target: `${p}:${e.target}` })
const prefixNode = (n: SceneNode, p: string): SceneNode => ({
  ...n,
  id: `${p}:${n.id}`,
  ...(n.children ? { children: n.children.map((c) => prefixNode(c, p)) } : {}),
  ...(n.edges ? { edges: n.edges.map((e) => prefixEdge(e, p)) } : {}),
})

export interface Part {
  scene: Scene
  /** Splice the scene's own boxes in rather than wrapping them in another. */
  bare?: boolean
  /** The wrapper's subtitle (ignored when bare). */
  sub?: string
}

const wrap = ({ scene: s, sub }: Part): SceneNode => ({
  id: s.id,
  label: s.title ?? s.id,
  ...(sub ? { sub } : {}),
  pattern: 'group',
  children: s.nodes.map((n) => prefixNode(n, s.id)),
  edges: s.edges.map((e) => prefixEdge(e, s.id)),
  cols: s.cols,
  flow: s.flow,
  align: s.align,
  stretch: s.stretch,
  framed: s.framed,
  edgePorts: s.edgePorts,
})

export function panel(id: string, title: string, parts: (Scene | Part)[], cols?: number): Scene {
  const nodes = parts.flatMap((raw): SceneNode[] => {
    const part: Part = 'scene' in raw ? raw : { scene: raw }
    const s = part.scene
    if (!part.bare) return [wrap(part)]
    if (s.edges.length || s.flow || s.framed !== undefined || s.edgePorts) throw new Error(`panel ${id}: "${s.id}" is not a plain row of boxes, so it cannot be spliced in bare`)
    return s.nodes.map((n) => prefixNode(n, s.id))
  })
  // Ids are global in react-flow: two nodes with one id render as one, silently. Catch it here.
  const seen = new Set<string>()
  const visit = (list: SceneNode[]) => {
    for (const n of list) {
      if (seen.has(n.id)) throw new Error(`panel ${id}: duplicate node id "${n.id}" (ids are global within a scene)`)
      seen.add(n.id)
      if (n.children) visit(n.children)
    }
  }
  visit(nodes)
  return { id, title, nodes, edges: [], cols }
}
