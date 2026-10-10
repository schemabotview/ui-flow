import type { Scene } from '../../../src'

export const table: Scene = {
  id: 'table',
  title: 'Table — schema and data modes',
  flow: 'LR',
  nodes: [
    {
      id: 'schema',
      kind: 'table',
      label: 'orders',
      sub: 'schema',
      pattern: 'storage',
      columns: [
        { name: 'id', type: 'bigint', key: 'PK' },
        { name: 'customer_id', type: 'bigint', key: 'FK' },
        { name: 'placed_at', type: 'timestamptz' },
        { name: 'total', type: 'numeric(10,2)' },
        { name: 'status', type: 'text' },
      ],
    },
    {
      id: 'result',
      kind: 'table',
      label: 'SELECT status, count(*)',
      sub: 'result',
      pattern: 'service',
      headers: ['status', 'count'],
      values: [
        ['shipped', '1,204'],
        ['pending', '318'],
        ['cancelled', '47'],
      ],
    },
  ],
  edges: [{ source: 'schema', target: 'result', label: 'GROUP BY' }],
}
