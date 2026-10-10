import type { Scene } from '../../../src'

export const focus: Scene = {
  id: 'focus',
  title: 'Focus — pick a node in the bar',
  cols: 3,
  nodes: [
    { id: 'card', label: 'Card', sub: 'glows in its accent', pattern: 'service' },
    { id: 'tile', label: 'Tile', pattern: 'storage', variant: 'tile', icon: 'dynamodb' },
    {
      id: 'box',
      label: 'Container',
      sub: 'quieter — it is large',
      pattern: 'group',
      children: [
        { id: 'inner', label: 'Nested card', pattern: 'network' },
      ],
    },
    {
      id: 'code',
      kind: 'code',
      label: 'total = sum(counts)\nprint(total)',
      filename: 'focus.py',
      hug: true,
    },
    {
      id: 'table',
      kind: 'table',
      label: 'regions',
      pattern: 'storage',
      columns: [
        { name: 'id', type: 'int', key: 'PK' },
        { name: 'name', type: 'text' },
      ],
    },
    {
      id: 'plot',
      kind: 'plot',
      label: 'A figure',
      plot: {
        x: { min: 0, max: 10, label: 'x' },
        y: { min: 0, max: 10, label: 'y' },
        series: [{ kind: 'line', points: [[0, 1], [10, 9]], label: 'fit' }],
      },
    },
  ],
  edges: [],
}
