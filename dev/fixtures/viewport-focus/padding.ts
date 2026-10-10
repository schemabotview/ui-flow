import type { Scene } from '../../../src'

export const padding: Scene = {
  id: 'padding',
  title: 'Padding — sparse scene, 0.3',
  padding: 0.3,
  flow: 'BT',
  nodes: [
    { id: 'a', label: 'Producer', sub: 'sparse scene', pattern: 'service' },
    { id: 'b', label: 'Consumer', sub: 'more air around it', pattern: 'storage' },
  ],
  edges: [{ source: 'a', target: 'b', label: 'stream' }],
}
