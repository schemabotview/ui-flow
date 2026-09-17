// Fixture: an edgeless scene wrapped into columns. With no edges the top-level nodes are peers, so
// `cols` decides the shape — this is the path a "six services" overview slide takes.
// Doubles as the card swatch: one node per PatternKey, so a colour regression is visible at a glance.
import type { Scene } from '../../src'

export const grid: Scene = {
  id: 'grid',
  title: 'Grid — edgeless, cols 3',
  cols: 3,
  nodes: [
    { id: 'svc', label: 'Service', sub: 'service', pattern: 'service' },
    { id: 'sto', label: 'Storage', sub: 'storage', pattern: 'storage' },
    { id: 'net', label: 'Network', sub: 'network', pattern: 'network' },
    { id: 'usr', label: 'User', sub: 'user', pattern: 'user' },
    { id: 'ext', label: 'External', sub: 'external', pattern: 'external' },
    { id: 'grp', label: 'Group', sub: 'group', pattern: 'group' },
  ],
  edges: [],
}
