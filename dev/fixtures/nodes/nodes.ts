// Fixture: every way a single node can LOOK, in one frame.
//
// Merged at 0.8.0 from three fixtures (swatch · tile · warn). The palette and the two variants belong
// on one screen because they are the same decision seen twice: `pattern` picks the colour role,
// `variant` picks the shape it is drawn in, and an author choosing a node writes both. Comparing them
// across three rail clicks was comparing from memory.
//
// PANEL 1 — the seven PatternKeys as cards. The palette is fixed and shared across every course:
//   PATTERNS owns how each role looks so a green box means "storage" in every deck. A colour change
//   lands here first and every content repo inherits it on the next minor.
// PANEL 2 — the same roles as tiles, plus an explicit `icon` beating the pattern's default glyph.
//   Tiles are what a "three steps" row inside a container is built from.
// PANEL 3 — `warn` IN CONTEXT. It is in the swatch too, but a limitation only reads as a limitation
//   when it is sitting in the flow it constrains, which is the thing that cannot be shown in a grid.
//
// NOT MERGED: others/focus.ts, which sits in its own category. Focus is a per-node STATE driven from
// the harness bar rather than anything the scene declares, and its fixture needs one of every
// renderer family (card · tile · container · code · table · plot) so focus can be stepped through all
// six — those content nodes would dominate this frame.
import type { Scene } from '../../../src'

export const nodes: Scene = {
  id: 'nodes',
  title: 'Nodes — palette, variants, warn in context',
  cols: 2,
  nodes: [
    {
      id: 'cards',
      label: 'Patterns — the seven roles',
      sub: "variant: 'card' (the default)",
      pattern: 'group',
      cols: 4,
      children: [
        { id: 'svc', label: 'Service', sub: 'compute', pattern: 'service' },
        { id: 'sto', label: 'Storage', sub: 'data at rest', pattern: 'storage' },
        { id: 'net', label: 'Network', sub: 'the path', pattern: 'network' },
        { id: 'usr', label: 'User', sub: 'a caller', pattern: 'user' },
        { id: 'ext', label: 'External', sub: 'outside', pattern: 'external' },
        { id: 'grp', label: 'Group', sub: 'a container, flat', pattern: 'group' },
        { id: 'wrn', label: 'Warn', sub: 'the catch', pattern: 'warn' },
      ],
    },
    {
      id: 'tiles',
      label: "variant: 'tile'",
      sub: 'icon over label — and an icon override',
      pattern: 'group',
      cols: 4,
      children: [
        { id: 't1', label: 'fetch', pattern: 'service', variant: 'tile', icon: 'scroll' },
        { id: 't2', label: 'decode', pattern: 'service', variant: 'tile', icon: 'braces' },
        { id: 't3', label: 'execute', pattern: 'service', variant: 'tile', icon: 'cpu' },
        { id: 't4', label: 'default glyph', pattern: 'storage', variant: 'tile' },
      ],
    },
    {
      id: 'ctx',
      label: 'warn — in the flow it constrains',
      sub: 'a limitation reads as one only in context',
      pattern: 'group',
      flow: 'LR',
      children: [
        { id: 'client', label: 'Client', pattern: 'user' },
        { id: 'api', label: 'API', sub: 'scales out', pattern: 'service' },
        { id: 'lock', label: 'Single writer', sub: 'the bottleneck', pattern: 'warn' },
        { id: 'db', label: 'Database', pattern: 'storage' },
      ],
      edges: [
        { source: 'client', target: 'api' },
        { source: 'api', target: 'lock', label: 'all writes' },
        { source: 'lock', target: 'db' },
      ],
    },
  ],
  edges: [],
}
