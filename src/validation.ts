import type { Scene, SceneEdge, SceneNode } from './types'

const payloads = ['columns', 'headers', 'values', 'items', 'slots', 'plot', 'evolution', 'filename', 'hug', 'minCols'] as const
const allowed: Record<string, readonly string[]> = {
  decision: [], code: ['filename', 'hug', 'minCols'], memory: ['slots'], list: ['items'],
  plot: ['plot'], evolution: ['evolution'], table: ['columns', 'headers', 'values'], container: [],
}

/** Runtime boundary for JavaScript consumers and scenes loaded from serialized data. */
export function assertValidScene(scene: Scene): void {
  const ids = new Set<string>()
  const byId = new Map<string, SceneNode>()
  const edges: SceneEdge[] = [...scene.edges]
  const fail = (message: string): never => { throw new Error(`Scene "${scene.id}": ${message}`) }
  const visit = (nodes: SceneNode[]) => {
    for (const node of nodes) {
      const nodeId = node.id
      if (typeof node.id !== 'string' || !node.id || ids.has(node.id)) fail(`duplicate or empty node id "${node.id}"`)
      if (typeof node.label !== 'string') fail(`node "${node.id}" requires a text label`)
      for (const field of ['children', 'ports', 'edges', 'items', 'slots', 'columns', 'headers', 'values'] as const) {
        if (node[field] !== undefined && !Array.isArray(node[field])) fail(`node "${node.id}" requires an array for ${field}`)
      }
      ids.add(node.id)
      byId.set(node.id, node)
      const ports = new Set<string>()
      for (const port of node.ports ?? []) {
        if (!port.id || ports.has(port.id)) fail(`node "${node.id}" has duplicate or empty port "${port.id}"`)
        if (!['top', 'bottom', 'left', 'right'].includes(port.side) || !['source', 'target'].includes(port.type)) {
          fail(`node "${node.id}" has invalid port "${port.id}"`)
        }
        ports.add(port.id)
      }
      if (node.kind && !Object.hasOwn(allowed, node.kind)) fail(`node "${node.id}" has unknown kind "${node.kind}"`)
      if (node.kind && node.kind !== 'container' && node.children !== undefined) {
        fail(`content node "${nodeId}" cannot have children`)
      }
      if (node.kind === 'container' && !Array.isArray(node.children)) fail(`container "${node.id}" requires children`)
      for (const field of payloads) {
        if (node[field] !== undefined && !(allowed[node.kind ?? ''] ?? []).includes(field)) {
          fail(`node "${node.id}" cannot use ${field} with kind "${node.kind ?? 'card'}"`)
        }
      }
      const required = { memory: 'slots', list: 'items', plot: 'plot', evolution: 'evolution' } as const
      const field = required[node.kind as keyof typeof required]
      if (field && node[field] === undefined) fail(`node "${node.id}" requires ${field}`)
      if (node.kind === 'table') {
        const schema = Array.isArray(node.columns)
        const data = Array.isArray(node.headers) && Array.isArray(node.values)
        if ((!schema && !data) || (schema && (node.headers !== undefined || node.values !== undefined))) {
          fail(`table "${node.id}" requires either columns or headers + values`)
        }
        if (data && node.values!.some(row => row.length !== node.headers!.length)) {
          fail(`table "${node.id}" has a row whose width differs from its headers`)
        }
      }
      if (node.children) visit(node.children)
      if (node.edges) {
        if (!node.children) fail(`node "${node.id}" has edges without children`)
        edges.push(...node.edges)
      }
    }
  }
  visit(scene.nodes)
  for (const note of scene.annotations ?? []) {
    if (!note.id || ids.has(note.id)) fail(`duplicate or empty annotation id "${note.id}"`)
    if (!byId.has(note.target)) fail(`annotation "${note.id}" references missing node "${note.target}"`)
    ids.add(note.id)
  }
  for (const edge of edges) {
    for (const type of ['source', 'target'] as const) {
      const id = edge[type === 'source' ? 'sourcePort' : 'targetPort']
      if (id !== undefined && !byId.get(edge[type])?.ports?.some(p => p.id === id && p.type === type)) {
        fail(`edge "${edge.source} → ${edge.target}" references missing ${type} port "${id}"`)
      }
    }
    for (const id of [edge.source, edge.target]) {
      if (!ids.has(id)) fail(`edge "${edge.source} → ${edge.target}" references missing node "${id}"`)
    }
  }
}
