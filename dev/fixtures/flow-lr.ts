// Fixture: left-to-right flow, edge labels, a bidirectional edge, and a per-edge `dir` override.
// Covers the routing half of layout.ts — which faces an arrow leaves and enters.
import type { Scene } from '../../src'

export const flowLr: Scene = {
  id: 'flow-lr',
  title: 'Flow — left to right',
  flow: 'LR',
  nodes: [
    { id: 'you', label: 'You', sub: 'browser', pattern: 'user' },
    { id: 'edge', label: 'Edge', sub: 'CDN', pattern: 'network' },
    { id: 'origin', label: 'Origin', sub: 'object store', pattern: 'storage' },
    { id: 'peer', label: 'Peer network', pattern: 'external' },
  ],
  edges: [
    { source: 'you', target: 'edge', label: 'GET' },
    { source: 'edge', target: 'origin', label: 'miss' },
    { source: 'origin', target: 'peer', label: 'peering', bidirectional: true },
  ],
}
