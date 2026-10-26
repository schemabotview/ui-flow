import type { Scene, SceneNode } from '../../../src'

const leaf = (id: string, label: string, pattern: SceneNode['pattern'] = 'service'): SceneNode => ({ id, label, pattern, icon: 'none' })

export const bands: Scene = {
  id: 'bands',
  title: "Header bands — header: 'band' inherited and overridden",
  header: 'band',
  framed: true,
  cols: 3,
  align: 'start',
  nodes: [
    {
      id: 'inherited',
      label: 'Inherited band',
      sub: "header: 'band' set on the scene",
      pattern: 'service',
      children: [leaf('i1', 'Ingest'), leaf('i2', 'Transform')],
    },
    {
      id: 'nested',
      label: 'Band, two levels deep',
      sub: 'the inner container inherits it too',
      pattern: 'storage',
      children: [{ id: 'inner', label: 'Lakehouse', pattern: 'storage', children: [leaf('n1', 'Bronze', 'storage'), leaf('n2', 'Silver', 'storage')] }],
    },
    {
      id: 'plain',
      label: 'Overridden to plain',
      sub: "header: 'plain' on this container only",
      pattern: 'network',
      header: 'plain',
      children: [leaf('p1', 'Gateway', 'network'), leaf('p2', 'Queue', 'network')],
    },
  ],
  edges: [],
}
