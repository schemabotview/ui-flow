import type { Scene } from '../../../src'

export const rankingPorts: Scene = {
  id: 'ranking-ports', title: 'Ranking controls and named ports', flow: 'LR', framed: true,
  nodes: [
    { id: 'producer', label: 'Producer', ports: [{ id: 'events', type: 'source', side: 'right' }] },
    { id: 'consumer', kind: 'list', label: 'Consumer', items: ['Process events', 'Report status'],
      ports: [{ id: 'input', type: 'target', side: 'left' }, { id: 'status', type: 'source', side: 'top' }] },
    { id: 'monitor', label: 'Monitor', pattern: 'network', ports: [{ id: 'status', type: 'target', side: 'top' }] },
  ],
  edges: [
    { source: 'producer', target: 'consumer', sourcePort: 'events', targetPort: 'input', label: 'events' },
    { source: 'consumer', target: 'monitor', sourcePort: 'status', targetPort: 'status',
      constraint: false, dashed: true, label: 'status', route: 'step' },
  ],
}

export const explicitContainers: Scene = {
  id: 'explicit-containers', title: 'Explicit and legacy containers', cols: 2,
  nodes: [
    { id: 'explicit', kind: 'container', label: 'Explicit container', children: [{ id: 'a', label: 'Member' }] },
    { id: 'legacy', label: 'Legacy container', children: [{ id: 'b', label: 'Member' }] },
    { id: 'empty', kind: 'container', label: 'Empty container', children: [] },
  ], edges: [],
}
