import type { Scene } from '../../../src'

export const containers: Scene = {
  id: 'containers',
  title: 'Containers — grid, child flow, depth, boundary-crossing edge',
  nodes: [
    { id: 'user', label: 'Client', sub: 'outside the boundary', pattern: 'user' },
    {
      id: 'cloud',
      label: 'AWS Cloud',
      pattern: 'group',
      icon: 'cloud',
      cols: 3,
      children: [
        {
          id: 'region',
          label: 'Region — eu-west-1',
          sub: 'cols: 2, no edges ⇒ children are peers',
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
          id: 'subnet',
          label: 'Private subnet',
          pattern: 'network',
          children: [{ id: 'app', label: 'App', sub: 'two boxes deep', pattern: 'service' }],
        },
        {
          id: 'account',
          label: 'Account — a long label, so the header has to wrap',
          sub: 'children with their own edges ⇒ they flow',
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
    },
    { id: 'log', label: 'Audit log', pattern: 'storage', icon: 'scroll' },
  ],
  edges: [
    { source: 'user', target: 'app', label: 'request' },
    { source: 'app', target: 'log', label: 'writes' },
  ],
}
