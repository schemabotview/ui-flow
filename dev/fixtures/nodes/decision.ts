import type { Scene } from '../../../src'

export const decision: Scene = {
  id: 'decision', title: 'Decision, named outcomes and anchored notes', flow: 'TB',
  nodes: [
    { id: 'request', label: 'Request', pattern: 'user' },
    { id: 'valid', kind: 'decision', label: 'Valid credentials?', sub: 'Check the supplied token',
      ports: [{ id: 'yes', type: 'source', side: 'bottom' }, { id: 'no', type: 'source', side: 'right' }] },
    { id: 'accept', label: 'Accept', pattern: 'service' },
    { id: 'reject', label: 'Reject', pattern: 'warn' },
  ],
  edges: [
    { source: 'request', target: 'valid' },
    { source: 'valid', target: 'accept', sourcePort: 'yes', label: 'yes' },
    { source: 'valid', target: 'reject', sourcePort: 'no', label: 'no', route: 'step' },
  ],
  annotations: [
    { id: 'note', target: 'valid', label: 'Authentication', sub: 'This note explains the decision without adding a stage to the request flow.' },
    { id: 'reject-note', target: 'reject', label: 'No retry here', sub: 'The caller handles an invalid token.', pattern: 'warn' },
  ],
}
