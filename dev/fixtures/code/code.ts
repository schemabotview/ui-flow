// Fixture: the code node, and the one decision an author actually makes about it — how wide it gets.
//
// Merged at 0.8.0 from two fixtures (code · min-cols). They were asking one question in two places:
// a code card's width is set by the CODE_MIN_COLS floor unless you opt out of it (`hug`) or raise it
// (`minCols`), and those three cases only mean anything against each other. Seeing the floor padded,
// the floor hugged and the floor raised in one frame is the comparison; two rail clicks apart it was
// a memory test.
//
// Merging cost almost nothing here, which is worth recording because it is NOT true of the plot
// fixtures next door. A code card is constrained on WIDTH and short on height, so these stack into
// vertical space that was empty anyway — the fitView zoom barely moves. A plot is a fixed 760×460
// box in both axes, so every plot added to a frame shrinks every other one.
//
// TOP     the floor, padded. Longest line is 23 chars; the card is padded out to the 64-column
//         default so a card that IS the scene renders its type at the deck-wide size. The empty
//         gutter on the right IS the floor — that is what it looks like working.
// MIDDLE  `hug: true` — the same kind of card sized to its own longest line instead. Right for a card
//         sitting BESIDE other nodes, where width sets the whole composition's size rather than the
//         type size; padding a 16-char listing out to 64 just inflates the scene and shrinks
//         everything in it. The `run` edge is here to make that "beside other nodes" case real.
// BOTTOM  `minCols: 76` against the 64 default, on IDENTICAL source whose longest line (44 chars) is
//         under both floors — so the floor alone sets the width, and the difference is the whole
//         signal. The raised card is visibly wider, and because fitView scales the scene to the pane,
//         a wider card means SMALLER rendered type. That is the point: the floor exists so every code
//         card in a deck renders type at one size, and the right common column depends on how wide
//         that concept's source runs. python tops out at 61 chars and wants 64; apache-spark runs
//         63–73 and wants 76. One global constant cannot serve both, which is why it is a per-card
//         option rather than a changed default.
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
