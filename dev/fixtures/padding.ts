// Fixture: per-scene fitView padding. A sparse scene otherwise fills the pane, so its icons and type
// render LARGER than a dense scene's — the deck looks inconsistent slide to slide. `padding` buys
// that scene back some air. Resolution-independent: the same fraction at 1080p and at 4K.
// Compare against `flow-tb`, which is the same shape at the 0.12 default.
import type { Scene } from '../../src'

export const padding: Scene = {
  id: 'padding',
  title: 'Padding — sparse scene, 0.3',
  padding: 0.3,
  flow: 'LR',
  nodes: [
    { id: 'a', label: 'Producer', sub: 'sparse scene', pattern: 'service' },
    { id: 'b', label: 'Consumer', sub: 'more air around it', pattern: 'storage' },
  ],
  edges: [{ source: 'a', target: 'b', label: 'stream' }],
}
