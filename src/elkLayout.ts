// Loaded only for opt-in ELK scenes. Content measurement remains the engine's responsibility.
import ELK from 'elkjs/lib/elk.bundled.js'
import type { ElkNode, ElkPort, LayoutOptions } from 'elkjs/lib/elk-api'
import type { Scene, SceneNode } from './types'
import { computeLayout, collectEdges, type Placed } from './layout'
import { headerHeight, headerMinWidth } from './headerMetrics'
import { appendAnnotations } from './annotations'
import { textWidth } from './textMetrics'
import { edgeId, type LayoutResult } from './layoutResult'

const directions = { TB: 'DOWN', BT: 'UP', LR: 'RIGHT', RL: 'LEFT' }
const faces = { TB: ['bottom', 'top'], BT: ['top', 'bottom'], LR: ['right', 'left'], RL: ['left', 'right'] } as const
const sides = { top: 'NORTH', bottom: 'SOUTH', left: 'WEST', right: 'EAST' }
const portId = (node: string, port: string) => JSON.stringify([node, port])
const options = (flow: Scene['flow'], order?: Scene['order']): LayoutOptions => ({
  'elk.algorithm': 'layered', 'elk.direction': directions[flow ?? 'TB'],
  'elk.edgeRouting': 'ORTHOGONAL', 'elk.randomSeed': '1',
  'elk.spacing.nodeNode': '24', 'elk.layered.spacing.nodeNodeBetweenLayers': '72',
  'elk.layered.crossingMinimization.forceNodeModelOrder': String(order === 'author'),
})

export async function computeElkLayout(scene: Scene): Promise<LayoutResult> {
  const original = computeLayout(scene) // validates and supplies calibrated content dimensions
  if (!scene.nodes.length) return { placed: [], routes: {} }
  const elkById = new Map<string, ElkNode>()
  const measured = new Map(original.map(p => [p.id, p]))
  const makeNode = (node: SceneNode): ElkNode => {
    const size = measured.get(node.id)!
    const container = node.kind === 'container' || !!node.children?.length
    const width = container ? Math.max(size.w, headerMinWidth(node)) : size.w
    const out: ElkNode = {
      id: node.id, width, height: size.h, ports: [],
      layoutOptions: {
        ...options(node.flow, node.order ?? scene.order), 'elk.portConstraints': 'FIXED_SIDE',
        ...(container ? {
          'elk.padding': `[top=${headerHeight(node, width)},left=14,bottom=14,right=14]`,
        } : {}),
      },
    }
    // ELK chooses port offsets; SceneView passes the resulting positions to React Flow handles.
    const addPort = (id: string, side: keyof typeof sides, fraction = 0.5) => {
      const horizontal = side === 'top' || side === 'bottom'
      const port: ElkPort = { id: portId(node.id, id), width: 0, height: 0,
        x: horizontal ? width * fraction : side === 'left' ? 0 : width,
        y: horizontal ? side === 'top' ? 0 : size.h : size.h * fraction,
        layoutOptions: { 'elk.port.side': sides[side] } }
      out.ports!.push(port)
    }
    for (const [prefix, side] of [['t', 'top'], ['b', 'bottom'], ['l', 'left'], ['r', 'right']] as const) {
      addPort(`${prefix}-s`, side); addPort(`${prefix}-t`, side)
    }
    for (const port of node.ports ?? []) {
      const peers = node.ports!.filter(p => p.side === port.side && p.type === port.type)
      addPort(`port:${port.id}`, port.side, (peers.indexOf(port) + 1) / (peers.length + 1))
    }
    if (container && node.children?.length) out.children = node.children.map(makeNode)
    elkById.set(node.id, out)
    return out
  }
  const edges = collectEdges(scene)
  let rootId = `__flow_root__${scene.id}`
  while (measured.has(rootId)) rootId += '_'
  const graph: ElkNode = {
    id: rootId, children: scene.nodes.map(makeNode),
    layoutOptions: { ...options(scene.flow, scene.order), 'elk.hierarchyHandling': 'INCLUDE_CHILDREN', 'elk.padding': '[top=0,left=0,bottom=0,right=0]' },
    edges: edges.flatMap((edge, i) => {
      // Non-ranking edges use the regular renderer; including them here would change ELK ranks.
      if (edge.constraint === false) return []
      const [s, t] = faces[edge.dir]
      const short = { top: 't', bottom: 'b', left: 'l', right: 'r' }
      return [{ id: edgeId(edge.source, edge.target, i),
        sources: [portId(edge.source, edge.sourcePort ? `port:${edge.sourcePort}` : `${short[s]}-s`)],
        targets: [portId(edge.target, edge.targetPort ? `port:${edge.targetPort}` : `${short[t]}-t`)],
        ...(edge.label ? { labels: [{ text: edge.label, width: Math.ceil(textWidth(edge.label, 12.5, 600)) + 18, height: 21 }] } : {}),
      }]
    }),
  }
  // ELK requires an edge to live in the lowest common ancestor of its endpoints.
  const ancestors = (id: string): string[] => {
    const result: string[] = []
    let parent = measured.get(id)?.parentId
    while (parent) { result.push(parent); parent = measured.get(parent)?.parentId }
    return [...result, graph.id]
  }
  const graphEdges = graph.edges ?? []
  graph.edges = []
  for (const edge of graphEdges) {
    const source = JSON.parse(edge.sources[0])[0] as string
    const target = JSON.parse(edge.targets[0])[0] as string
    const targets = new Set(ancestors(target))
    const owner = ancestors(source).find(id => targets.has(id))!
    const parent = owner === graph.id ? graph : elkById.get(owner)!
    ;(parent.edges ??= []).push(edge)
  }
  const usedPorts = new Set(graphEdges.flatMap(edge => [...edge.sources, ...edge.targets]))
  for (const node of elkById.values()) node.ports = node.ports?.filter(port => usedPorts.has(port.id))
  const elk = new ELK()
  const result = await elk.layout(graph)
  const placed: Placed[] = []
  const routes: LayoutResult['routes'] = {}
  const handles: NonNullable<LayoutResult['handles']> = {}
  const walk = (parent: ElkNode, absX: number, absY: number) => {
    for (const node of parent.children ?? []) {
      handles[node.id] = Object.fromEntries((node.ports ?? []).map(port => [JSON.parse(port.id)[1], { x: port.x ?? 0, y: port.y ?? 0 }]))
      const prior = measured.get(node.id)!
      placed.push({ ...prior, x: node.x ?? 0, y: node.y ?? 0, w: node.width ?? prior.w, h: node.height ?? prior.h })
      walk(node, absX + (node.x ?? 0), absY + (node.y ?? 0))
    }
    for (const edge of parent.edges ?? []) {
      const container = edge.container ? absolute.get(edge.container) : undefined
      const offsetX = container?.x ?? absX, offsetY = container?.y ?? absY
      const path = (edge.sections ?? []).map(section => [section.startPoint, ...(section.bendPoints ?? []), section.endPoint]
        .map((p, i) => `${i ? 'L' : 'M'} ${p.x + offsetX} ${p.y + offsetY}`).join(' ')).join(' ')
      if (path) {
        const label = edge.labels?.[0]
        routes[edge.id] = { path, ...(label && label.x !== undefined && label.y !== undefined ? {
          labelX: label.x + offsetX + (label.width ?? 0) / 2,
          labelY: label.y + offsetY + (label.height ?? 0) / 2,
        } : {}) }
      }
    }
  }
  const absolute = new Map<string, { x: number; y: number }>([[result.id, { x: 0, y: 0 }]])
  const mapAbsolute = (parent: ElkNode, x = 0, y = 0) => {
    for (const node of parent.children ?? []) {
      const nx = x + (node.x ?? 0), ny = y + (node.y ?? 0)
      absolute.set(node.id, { x: nx, y: ny }); mapAbsolute(node, nx, ny)
    }
  }
  mapAbsolute(result)
  walk(result, 0, 0)
  return { placed: appendAnnotations(scene, placed), routes, handles }
}
