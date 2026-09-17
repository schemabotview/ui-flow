// Fixture: containers. A node with `children` becomes a labelled box the engine sizes to fit — the
// only way a scene can show real nesting instead of faking peers as a chain.
// Left box: edgeless children gridded by `cols`. Right box: children with their own `edges` + `flow`,
// which makes them FLOW inside the parent rather than stack.
import type { Scene } from '../../src'

export const container: Scene = {
  id: 'container',
  title: 'Containers — nesting, grid and child flow',
  cols: 2,
  nodes: [
    {
      id: 'region',
      label: 'Region',
      sub: 'eu-west-1',
      pattern: 'group',
      cols: 2,
      children: [
        { id: 'az-a', label: 'AZ a', pattern: 'network', variant: 'tile' },
        { id: 'az-b', label: 'AZ b', pattern: 'network', variant: 'tile' },
        { id: 'az-c', label: 'AZ c', pattern: 'network', variant: 'tile' },
        { id: 'az-d', label: 'AZ d', pattern: 'network', variant: 'tile' },
      ],
    },
    {
      id: 'account',
      label: 'Account',
      pattern: 'group',
      flow: 'LR',
      children: [
        { id: 'me', label: 'You', pattern: 'user' },
        { id: 'api', label: 'API', pattern: 'service' },
        { id: 'db', label: 'Store', pattern: 'storage' },
      ],
      edges: [
        { source: 'me', target: 'api', label: 'call' },
        { source: 'api', target: 'db' },
      ],
    },
  ],
  edges: [],
}
