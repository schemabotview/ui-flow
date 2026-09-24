// Fixture: everything an edge does — routing, arrowheads, labels, and the way labels fail.
//
// Merged at 0.8.0 from four fixtures (labels · bidirectional · dir-override · label-collision). The
// last of those was held out of the first merge on the grounds that its defect is "measured in
// pixels" and a shared fitView would hide it. That was wrong, and worth stating plainly: a pill
// overrunning its gap is a RATIO between two things in layout space, and fitView scales both by the
// same factor — a label that covers the cards at zoom 1.0 still covers them at 0.4. The reasoning
// that does hold is the one about CONTENT nodes, where the defect is a sizer reserving fewer pixels
// than the renderer draws; that one is absolute, and it is why content/ is still not merged.
//
// Read left to right, top to bottom: normal → arrowheads → routing → the failure.
//
// ROW 1  labels at a sane length · one-way vs bidirectional. A label renders as a pill on the path's
//   midpoint filled with the CANVAS colour, so it interrupts the line rather than sitting on it. That
//   fill is hardcoded in FlowEdge.tsx as '#1a1d23' — the shell's --bg, duplicated across a package
//   boundary. It looks right only because the harness stage paints the same colour; theming has to
//   fix that first, and this row is where it will show. Two arrowheads is a CLAIM (either side can
//   initiate), not decoration.
// ROW 2  the per-edge `dir` override — routing only, never positioning. Both replicas sit in the same
//   layer of a TB flow; left, the sideways edge inherits TB and loops out of the bottom face back
//   into the top. Right, `dir: 'LR'` routes it across. Positions are identical; only the arrow moves.
//   (flow-lr.ts claimed to cover this through 0.7.0 and never did — no edge in it set `dir`.)
// ROW 3  THE REGRESSION CASE. snowflake's first authored course shipped a frame where an edge label
//   was wide enough to cover the two cards it ran between, and `npm run build`, `tsc --noEmit` and
//   `npm run check` were all green. Guards cannot see this; only a rendered frame can. The same label
//   is shown four ways: overrunning a short TB gap, kept to a word, overrunning between narrower
//   TILES (nothing for the pill to hide behind), and finally in an LR flow where the gap is a node
//   width and the long label fits. The engine does NOT clamp label width — types.ts tells the author
//   "a word or two", and this row is what makes that concrete before a capture does.
import type { Scene } from '../../../src'

const replicas = (idp: string, edgeDir?: 'LR') => ({
  id: idp,
  label: edgeDir ? "dir: 'LR' on the sideways edge" : "default — inherits flow 'TB'",
  sub: edgeDir ? 'same positions, routed across' : 'the arrow loops under the cards',
  pattern: 'group' as const,
  children: [
    { id: `${idp}-w`, label: 'Writer', pattern: 'service' as const },
    { id: `${idp}-r1`, label: 'Replica A', pattern: 'storage' as const },
    { id: `${idp}-r2`, label: 'Replica B', pattern: 'storage' as const },
  ],
  edges: [
    { source: `${idp}-w`, target: `${idp}-r1` },
    { source: `${idp}-w`, target: `${idp}-r2` },
    { source: `${idp}-r1`, target: `${idp}-r2`, label: 'sync', ...(edgeDir ? { dir: edgeDir } : {}) },
  ],
})

const LONG = 'authenticates and then retries'

export const edges: Scene = {
  id: 'edges',
  title: 'Edges — routing, arrowheads, labels, overrun',
  cols: 3,
  nodes: [
    {
      id: 'labels',
      label: 'Labels at normal length',
      sub: 'the pill interrupts the line',
      pattern: 'group',
      flow: 'LR',
      children: [
        { id: 'l1', label: 'Producer', pattern: 'service' },
        { id: 'l2', label: 'Broker', pattern: 'network', icon: 'waves' },
        { id: 'l3', label: 'Consumer', pattern: 'service' },
      ],
      edges: [
        { source: 'l1', target: 'l2', label: 'publish' },
        { source: 'l2', target: 'l3', label: 'subscribe' },
      ],
    },
    {
      id: 'oneway',
      label: 'One-way',
      sub: 'the source initiates',
      pattern: 'group',
      flow: 'LR',
      children: [
        { id: 'a1', label: 'App', pattern: 'service' },
        { id: 'a2', label: 'Store', pattern: 'storage' },
      ],
      edges: [{ source: 'a1', target: 'a2', label: 'writes' }],
    },
    {
      id: 'both',
      label: 'bidirectional: true',
      sub: 'either side initiates',
      pattern: 'group',
      flow: 'LR',
      children: [
        { id: 'b1', label: 'VPC A', pattern: 'network' },
        { id: 'b2', label: 'VPC B', pattern: 'network' },
      ],
      edges: [{ source: 'b1', target: 'b2', label: 'peering', bidirectional: true }],
    },
    replicas('default'),
    replicas('overridden', 'LR'),
    {
      id: 'spacer',
      label: 'Label width is not clamped',
      sub: 'the pill is sized to its text — the row below is the same label, four ways',
      pattern: 'group',
      children: [{ id: 'note', label: `label: '${LONG}'`, sub: '29 characters', pattern: 'warn' }],
    },
    {
      id: 'overrun',
      label: 'Long label, short TB gap',
      sub: 'the pill overruns onto both cards',
      pattern: 'group',
      children: [
        { id: 's1', label: 'Client', pattern: 'user' },
        { id: 's2', label: 'Service', pattern: 'service' },
      ],
      edges: [{ source: 's1', target: 's2', label: LONG }],
    },
    {
      id: 'tiles',
      label: 'Same label between tiles',
      sub: 'narrower nodes — nothing to hide behind',
      pattern: 'group',
      children: [
        { id: 't1', label: 'Lambda', pattern: 'service', variant: 'tile', icon: 'lambda' },
        { id: 't2', label: 'DynamoDB', pattern: 'storage', variant: 'tile', icon: 'dynamodb' },
      ],
      edges: [{ source: 't1', target: 't2', label: LONG }],
    },
    {
      id: 'fits',
      label: 'Same label, LR — and kept short',
      sub: 'in LR the gap is a node width',
      pattern: 'group',
      flow: 'LR',
      children: [
        { id: 'w1', label: 'Client', pattern: 'user' },
        { id: 'w2', label: 'Service', pattern: 'service' },
      ],
      edges: [{ source: 'w1', target: 'w2', label: LONG }],
    },
  ],
  edges: [],
}
