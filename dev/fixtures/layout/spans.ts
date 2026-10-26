import type { Scene, SceneNode } from '../../../src'

const leaf = (id: string, label: string, pattern: SceneNode['pattern'] = 'service'): SceneNode => ({ id, label, pattern, icon: 'none' })

const grid: SceneNode = {
  id: 'grid',
  label: 'Grid with a spanning rail',
  sub: "cols: 3 — span: 'all' starts its own row and takes the row's full width",
  pattern: 'group',
  cols: 3,
  children: [
    leaf('g1', 'One'),
    leaf('g2', 'Two'),
    leaf('g3', 'Three'),
    { id: 'g-rail', label: 'Rail', sub: 'children re-centred', pattern: 'network', span: 'all', flow: 'LR', children: [leaf('r1', 'Left', 'network'), leaf('r2', 'Right', 'network')], edges: [{ source: 'r1', target: 'r2' }] },
    leaf('g4', 'Four'),
    leaf('g5', 'Five'),
  ],
}

const layered: SceneNode = {
  id: 'layered',
  label: 'A spanning node in a layered row',
  sub: "alone in its layer, span: 'all' takes the width of the widest row",
  pattern: 'group',
  flow: 'BT',
  children: [
    { id: 'base', label: 'Shared platform', sub: 'as wide as the row above', pattern: 'storage', span: 'all', children: [leaf('b1', 'Inner', 'storage')] },
    leaf('up1', 'Consumer A', 'user'),
    leaf('up2', 'Consumer B', 'user'),
    leaf('up3', 'Consumer C', 'user'),
  ],
  edges: [
    { source: 'base', target: 'up1' },
    { source: 'base', target: 'up2' },
    { source: 'base', target: 'up3' },
  ],
}

export const spans: Scene = {
  id: 'spans',
  title: "Spans — span: 'all' in a grid and in a layered row",
  framed: true,
  cols: 2,
  align: 'start',
  nodes: [grid, layered],
  edges: [],
}
