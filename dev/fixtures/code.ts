// Fixture: the code node — an IDE card with window chrome, a filename tab, gutter numbers and
// syntax highlighting. `label` carries the source, newline-separated.
//
// The two cards differ by ONE flag. `hug: true` sizes a card to its own longest line; without it the
// CODE_MIN_COLS floor applies, so a short listing is padded out to deck-wide type size. That floor is
// right for a card that IS the scene and wrong for one sitting beside other nodes — this fixture is
// where that difference is visible side by side.
import type { Scene } from '../../src'

export const code: Scene = {
  id: 'code',
  title: 'Code nodes — width floor vs hug',
  flow: 'LR',
  nodes: [
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
    {
      id: 'out',
      kind: 'code',
      filename: 'stdout',
      hug: true,
      label: '[0, 1, 4, 9, 16]',
    },
  ],
  edges: [{ source: 'src', target: 'out', label: 'run' }],
}
