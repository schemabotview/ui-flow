import type { Scene, SceneNode } from '../../../src'

const leaf = (id: string, label: string, pattern: SceneNode['pattern'] = 'service'): SceneNode => ({ id, label, pattern, icon: 'none' })

const fan: SceneNode = {
  id: 'fan',
  label: 'Aligned ports',
  sub: 'a face with several edges slides each anchor to line up with its far end',
  pattern: 'group',
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

export const ports: Scene = {
  id: 'ports',
  title: 'Ports — aligned anchors and a crowded face',
  framed: true,
  cols: 2,
  align: 'start',
  nodes: [fan, crowd],
  edges: [],
}
