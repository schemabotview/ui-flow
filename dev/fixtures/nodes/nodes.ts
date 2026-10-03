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
      // PANEL 3 — `variant: 'chip'`, the one leaf that kept its frame when 0.10.0 took the frame off
      // the prose card. A chip hugs its own text and never pads to a common width: a row of chips is
      // read as a SET, and equal boxes around unequal words would be a layout lying about the
      // content. The short/long pair and the icon/no-icon pair are both here because both are what
      // the sizer has to get right — the floor on one end, the measured advance on the other.
      id: 'chips',
      label: "variant: 'chip' — things counted, not described",
      sub: 'a chip earns its frame when the row would stop meaning what it means one member short',
      pattern: 'group',
      cols: 4,
      children: [
        { variant: 'chip' as const, id: 'k1', label: 'Task 1', pattern: 'network', icon: 'none' },
        { variant: 'chip' as const, id: 'k2', label: 'Task 2', pattern: 'network', icon: 'none' },
        { variant: 'chip' as const, id: 'k3', label: 'Task 3', pattern: 'network', icon: 'none' },
        { variant: 'chip' as const, id: 'k4', label: 'Task 4', pattern: 'network', icon: 'none' },
        { variant: 'chip' as const, id: 'k5', label: '3', pattern: 'storage', icon: 'none' },
        { variant: 'chip' as const, id: 'k6', label: 'Cache / memory', pattern: 'storage', icon: 'database' },
        { variant: 'chip' as const, id: 'k7', label: 'Local disk', pattern: 'storage', icon: 'server' },
        { variant: 'chip' as const, id: 'k8', label: 'a chip whose label runs long enough to set its own width', pattern: 'warn' },
      ],
    },
    {
      // PANEL 4 — `framed`, and the fact that it is INHERITED. Left panel unframed (the default),
      // right panel framed by one flag on the BOX, not on each card. The pair is here rather than in
      // two fixtures because the only question worth asking about a frame is what it buys over its
      // absence, and that is a comparison or it is nothing.
      //
      // Note which leaf needs it most. The prose card is a line of text with an icon: unframed it is
      // still obviously one thing. The LIST card is a header, a hairline and a body, and with nothing
      // bounding it the hairline runs out into space and the three parts stop reading as one object.
      id: 'unframed',
      label: 'framed: false — the default',
      sub: 'a leaf inside a box is already bounded by the box',
      pattern: 'group',
      children: [
        { id: 'u-card', label: 'Service', sub: 'compute', pattern: 'service' },
        {
          id: 'u-list',
          kind: 'list',
          label: 'Bronze (raw)',
          sub: 'ADLS Gen2',
          pattern: 'storage',
          icon: 'folder',
          items: ['Raw, immutable', 'Partitioned by date', '90-day retention'],
        },
      ],
    },
    {
      id: 'framed',
      label: 'framed: true — set once, on the box',
      sub: 'inherited by every leaf under it; a node may still override',
      pattern: 'group',
      framed: true,
      children: [
        { id: 'f-card', label: 'Service', sub: 'compute', pattern: 'service' },
        {
          id: 'f-list',
          kind: 'list',
          label: 'Bronze (raw)',
          sub: 'ADLS Gen2',
          pattern: 'storage',
          icon: 'folder',
          items: ['Raw, immutable', 'Partitioned by date', '90-day retention'],
        },
        // The override, and the reason it is a smell: this card is the only unframed thing in a framed
        // group, which reads as a mistake rather than as emphasis. `focus` is the tool for "this one".
        { id: 'f-off', label: 'Opted out', sub: 'framed: false under a framed box', pattern: 'warn', framed: false },
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
