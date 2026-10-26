import type { Scene } from '../../../src'

export const patterns: Scene = {
  id: 'patterns',
  title: 'Patterns — roles, variants, framing, warn in context',
  cols: 2,
  nodes: [
    {
      id: 'cards',
      label: 'Patterns — the seven roles',
      sub: "variant: 'card' (the default)",
      pattern: 'group',
      cols: 3,
      children: [
        { id: 'svc', label: 'Service', sub: 'compute', pattern: 'service' },
        { id: 'sto', label: 'Storage', sub: 'data at rest', pattern: 'storage' },
        { id: 'net', label: 'Network', sub: 'the path', pattern: 'network' },
        { id: 'usr', label: 'User', sub: 'a caller', pattern: 'user' },
        { id: 'ext', label: 'External', sub: 'outside', pattern: 'external' },
        { id: 'grp', label: 'Group', sub: 'a container, flat', pattern: 'group' },
        { id: 'wrn', label: 'Warn', sub: 'the catch', pattern: 'warn' },
      ],
    },
    {
      id: 'unframed',
      label: 'framed: false — the default',
      sub: 'a leaf inside a box is already bounded by the box',
      pattern: 'group',
      children: [
        { id: 'u-card', label: 'Service', sub: 'compute', pattern: 'service' },
        {
          id: 'u-list',
          kind: 'list',
          label: 'Bronze (raw)',
          sub: 'ADLS Gen2',
          pattern: 'storage',
          icon: 'folder',
          items: ['Raw, immutable', 'Partitioned by date', '90-day retention'],
        },
      ],
    },
    {
      id: 'framed',
      label: 'framed: true — set once, on the box',
      sub: 'inherited by every leaf under it; a node may still override',
      pattern: 'group',
      framed: true,
      children: [
        { id: 'f-card', label: 'Service', sub: 'compute', pattern: 'service' },
        {
          id: 'f-list',
          kind: 'list',
          label: 'Bronze (raw)',
          sub: 'ADLS Gen2',
          pattern: 'storage',
          icon: 'folder',
          items: ['Raw, immutable', 'Partitioned by date', '90-day retention'],
        },
        { id: 'f-off', label: 'Opted out', sub: 'framed: false under a framed box', pattern: 'warn', framed: false },
      ],
    },
    {
      id: 'ctx',
      label: 'warn — in the flow it constrains',
      sub: 'a limitation reads as one only in context',
      pattern: 'group',
      flow: 'LR',
      children: [
        { id: 'client', label: 'Client', pattern: 'user' },
        { id: 'api', label: 'API', sub: 'scales out', pattern: 'service' },
        { id: 'lock', label: 'Single writer', sub: 'the bottleneck', pattern: 'warn' },
        { id: 'db', label: 'Database', pattern: 'storage' },
      ],
      edges: [
        { source: 'client', target: 'api' },
        { source: 'api', target: 'lock', label: 'all writes' },
        { source: 'lock', target: 'db' },
      ],
    },
  ],
  edges: [],
}
