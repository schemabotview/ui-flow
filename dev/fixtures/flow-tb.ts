// Fixture: the default top-to-bottom flow — nodes with edges, three pattern roles, edge labels.
// The baseline. If this one is wrong, nothing else is worth looking at.
import type { Scene } from '../../src'

export const flowTb: Scene = {
  id: 'flow-tb',
  title: 'Flow — top to bottom',
  nodes: [
    { id: 'client', label: 'Client', sub: 'browser', pattern: 'user' },
    { id: 'api', label: 'API', sub: 'FastAPI', pattern: 'service' },
    { id: 'db', label: 'Database', sub: 'PostgreSQL', pattern: 'storage' },
  ],
  edges: [
    { source: 'client', target: 'api', label: 'request' },
    { source: 'api', target: 'db', label: 'query' },
  ],
}
