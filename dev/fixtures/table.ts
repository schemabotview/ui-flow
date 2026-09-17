// Fixture: the table node, both modes, side by side.
//
// A relation is not a card. Rendering a schema as a labelled box loses what the content IS — the
// column order, the types beside the names, which column is the key. The table node paints a real
// monospace grid instead, sized from its content so every table in a deck shares one type size.
//
// SCHEMA mode (left) takes `columns`; the PK/FK gutter is only reserved when some column has a key.
// DATA mode (right) takes `headers` + `values` — a small result set. Edges anchor to the NODE, never
// to a row, which is why the join here points at the table rather than at `customer_id`.
import type { Scene } from '../../src'

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
