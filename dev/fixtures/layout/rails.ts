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

const fan: SceneNode = {
  id: 'fan',
  label: 'Aligned ports',
  sub: 'a face with several edges slides each anchor to line up with its far end',
  pattern: 'group',
  header: 'plain',
  flow: 'BT',
  children: [
    { id: 'base', label: 'Shared platform', sub: 'one face, three edges', pattern: 'storage', span: 'all', children: [leaf('b1', 'Inner', 'storage')] },
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

const crowd: SceneNode = {
  id: 'crowd',
  label: 'Crowded face',
  sub: 'far ends too close together spread evenly instead',
  pattern: 'group',
  children: [
    leaf('hub', 'Hub', 'network'),
    { id: 'pair', label: 'Two paths to one card', kind: 'note', pattern: 'network' },
    leaf('sink', 'Sink', 'network'),
  ],
  edges: [
    { source: 'hub', target: 'pair' },
    { source: 'hub', target: 'sink', label: 'first' },
    { source: 'hub', target: 'sink', label: 'second', dashed: true },
  ],
}

export const rails: Scene = {
  id: 'rails',
  title: 'Spans, aligned ports and header bands',
  header: 'band',
  framed: true,
  cols: 3,
  align: 'start',
  nodes: [grid, fan, crowd],
  edges: [],
}
