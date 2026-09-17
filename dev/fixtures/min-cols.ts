// Fixture: the code-card width floor, and why it is per-concept.
//
// Both cards hold IDENTICAL source whose longest line is 44 chars — under either floor, so the floor
// is what sets the width in both cases. The top card takes the 64-column default; the bottom one
// raises it to 76 via `minCols`. The bottom card is visibly wider, and because fitView scales the
// scene to the pane, a wider card means SMALLER rendered type.
//
// That is the whole point: the floor exists so every code card in a deck renders type at one size,
// and the right common column depends on how wide that concept's source runs. python's snippets top
// out at 61 chars and want 64; apache-spark's run 63–73 and want 76. One global constant cannot
// serve both, which is why this is a per-card option rather than a changed default.
import type { Scene } from '../../src'

const SRC = [
  'df = spark.read.parquet(path)',
  'result = (df',
  '    .filter(col("status") == "active")',
  '    .groupBy("region").count())',
].join('\n')

export const minCols: Scene = {
  id: 'min-cols',
  title: 'minCols — the per-concept width floor',
  cols: 1,
  nodes: [
    { id: 'default', kind: 'code', filename: 'default — floor 64', label: SRC },
    { id: 'raised', kind: 'code', filename: 'minCols: 76', label: SRC, minCols: 76 },
  ],
  edges: [],
}
