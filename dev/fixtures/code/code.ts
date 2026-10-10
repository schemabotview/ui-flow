import type { Scene } from '../../../src'

const SPARK = [
  'df = spark.read.parquet(path)',
  'result = (df',
  '    .filter(col("status") == "active")',
  '    .groupBy("region").count())',
].join('\n')

export const code: Scene = {
  id: 'code',
  title: 'Code — the width floor, hugged and raised',
  cols: 1,
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
