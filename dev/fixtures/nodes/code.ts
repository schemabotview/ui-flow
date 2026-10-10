import type { Scene } from '../../../src'

const SPARK = [
  'df = spark.read.parquet(path)',
  'result = (df',
  '    .filter(col("status") == "active")',
  '    .groupBy("region").count())',
].join('\n')

export const code: Scene = {
  id: 'code',
  title: 'Content cards — code, table, memory',
  cols: 2,
  nodes: [
    {
      id: 'floor',
      label: 'The floor — padded to 64 columns',
      sub: 'a card that IS the scene',
      pattern: 'group',
      children: [
        {
          id: 'src',
          kind: 'code',
          filename: 'squares.py',
          label: [
            'def squares(n):',
            '    """Yield n squares."""',
            '    for i in range(n):',
            '        yield i * i',
            '',
            'print(list(squares(5)))',
          ].join('\n'),
        },
      ],
    },
    {
      id: 'hugged',
      label: 'hug: true — sized to its own longest line',
      sub: 'a card sitting beside other nodes',
      pattern: 'group',
      flow: 'LR',
      children: [
        { id: 'call', kind: 'code', hug: true, filename: 'call.py', label: 'print(list(squares(5)))' },
        { id: 'out', kind: 'code', hug: true, filename: 'stdout', label: '[0, 1, 4, 9, 16]' },
      ],
      edges: [{ source: 'call', target: 'out', label: 'run' }],
    },
    {
      id: 'tables', label: 'Table — schema and data modes', sub: 'columns + key badges · a result set', pattern: 'group', flow: 'LR',
      children: [
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
    },
    {
      id: 'memory', label: 'Memory — slots, offsets, groups', sub: 'adjacent bytes share edges', pattern: 'group',
      children: [
        {
          id: 'listobj',
          kind: 'memory',
          label: 'PyListObject',
          sub: 'CPython, 64-bit',
          slots: [
            { at: '0x00', name: 'ob_refcnt', note: 'Py_ssize_t', group: 'PyObject' },
            { at: '0x08', name: 'ob_type', note: 'PyTypeObject *', group: 'PyObject' },
            { at: '0x10', name: 'ob_size', note: 'Py_ssize_t', group: 'VarObject' },
            { at: '0x18', name: 'ob_item', note: 'PyObject **', group: 'list body' },
            { at: '0x20', name: 'allocated', note: 'Py_ssize_t', group: 'list body' },
          ],
        },
      ],
    },
    {
      id: 'raised',
      label: 'minCols — the per-concept floor',
      sub: 'identical source, 44-char longest line, under both floors',
      pattern: 'group',
      cols: 2,
      children: [
        { id: 'c64', kind: 'code', filename: 'default — floor 64', label: SPARK },
        { id: 'c76', kind: 'code', filename: 'minCols: 76', label: SPARK, minCols: 76 },
      ],
    },
  ],
  edges: [],
}
