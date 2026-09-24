// Fixture: `focusId` — the "this is the node this section narrates" highlight.
//
// Pick a node from the FOCUS control in the harness bar. Every renderer family is here because focus
// is painted independently by each one, and two of them were found SILENTLY IGNORING it in
// production: TileNode read `__focus` and never drew it, ContainerNode never read it at all. Both
// were caught by auditing content repos (python had four sections pointing focus at a container and
// getting nothing), not by the engine — because through 0.7.0 SceneView took a `focusId` prop that
// the harness never passed. The capability shipped in the public surface with no fixture behind it.
//
// The treatments are deliberately NOT uniform, and that is what this fixture is for — a card glows,
// a tile gets a tinted plate (it has no chrome to thicken), a container gets a quieter border and
// ring (a full card glow on a large box floods the frame), and the content nodes brighten their own
// borders. They should all read as "this one" at capture size without any of them shouting.
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
