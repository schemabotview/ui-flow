// Fixture: the seventh pattern role. `warn` is a warm red so a limitation reads as the thing being
// flagged rather than as another peer in the diagram — it exists to mark the bottleneck in a design,
// which is why it sits at the end of a flow here rather than in the swatch grid.
import type { Scene } from '../../src'

export const warn: Scene = {
  id: 'warn',
  title: 'Warn — the seventh role',
  flow: 'LR',
  nodes: [
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
}
