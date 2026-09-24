// Fixture: every PLACEMENT rule the engine has, in one frame.
//
// Merged at 0.8.0 from five fixtures (flow-lr · flow-bt · flow-rl · fan · grid). Each is now a
// container panel, because a container takes its own `flow`, `edges` and `cols` — so the same layout
// code runs, one level down, and all five are comparable at a glance instead of five rail clicks
// apart. The four directions especially: they are mirrors of each other, and a mirror is only
// checkable against the thing it mirrors.
//
// ONE THING NOT MERGED: others/padding.ts. `scene.padding` is the fitView MARGIN, a property of the
// viewport, and a scene has exactly one — so two paddings cannot share a frame.
//
// WHAT MERGING COSTS, and where it went: every panel here is a CONTAINER flow, so it exercises
// `n.flow`, not `scene.flow` — a separate read in collectEdges. Scene-level TB is covered by
// containers/deep-edge and LR by four other fixtures, so neither needed a fixture kept alive for it;
// scene-level BT now rides on others/padding.ts. RL is uncovered at scene level and stays that way: it is
// the same expression as BT with a different string.
//
// The scene's own `cols: 3` is not incidental — it IS the top-level grid-wrapping case, wrapping the
// panels themselves. The `grid` panel below covers the container-level `cols` path separately.
//
// COST OF MERGING, stated plainly: six panels share one fitView, so every card here renders at
// roughly half the size it did standalone. That is fine for what this fixture checks — DIRECTION,
// ORDER and WRAPPING are shape, and shape survives scaling. It would NOT be fine for a content node,
// where the defect is a clipped final column a few pixels wide. That is why the `content` category
// is not merged and should not be.
import type { Scene } from '../../../src'

export const flow: Scene = {
  id: 'flow',
  title: 'Layout — directions, fan, grid',
  cols: 3,
  nodes: [
    {
      id: 'lr',
      label: "flow: 'LR'",
      sub: 'left → right',
      pattern: 'group',
      flow: 'LR',
      children: [
        { id: 'lr1', label: 'You', pattern: 'user' },
        { id: 'lr2', label: 'CDN', pattern: 'network' },
        { id: 'lr3', label: 'Origin', pattern: 'storage' },
      ],
      edges: [
        { source: 'lr1', target: 'lr2', label: 'GET' },
        { source: 'lr2', target: 'lr3', label: 'miss' },
      ],
    },
    {
      id: 'rl',
      label: "flow: 'RL'",
      sub: 'right → left — the read path back out',
      pattern: 'group',
      flow: 'RL',
      children: [
        { id: 'rl1', label: 'Store', pattern: 'storage' },
        { id: 'rl2', label: 'Cache', pattern: 'service', icon: 'memory' },
        { id: 'rl3', label: 'Analyst', pattern: 'user' },
      ],
      edges: [
        { source: 'rl1', target: 'rl2', label: 'hydrate' },
        { source: 'rl2', target: 'rl3', label: 'rows' },
      ],
    },
    {
      id: 'grid',
      label: 'cols: 2 — edgeless',
      sub: 'no edges ⇒ peers wrap into a grid',
      pattern: 'group',
      cols: 2,
      children: [
        { id: 'g1', label: 'Lambda', pattern: 'service', variant: 'tile', icon: 'lambda' },
        { id: 'g2', label: 'S3', pattern: 'storage', variant: 'tile', icon: 's3' },
        { id: 'g3', label: 'VPC', pattern: 'network', variant: 'tile', icon: 'vpc' },
        { id: 'g4', label: 'IAM', pattern: 'user', variant: 'tile', icon: 'iam' },
      ],
    },
    {
      id: 'tb',
      label: "flow: 'TB' (container)",
      sub: 'the default, one level down',
      pattern: 'group',
      children: [
        { id: 'tb1', label: 'Client', pattern: 'user' },
        { id: 'tb2', label: 'API', pattern: 'service' },
        { id: 'tb3', label: 'Database', pattern: 'storage' },
      ],
      edges: [
        { source: 'tb1', target: 'tb2', label: 'request' },
        { source: 'tb2', target: 'tb3', label: 'query' },
      ],
    },
    {
      id: 'bt',
      label: "flow: 'BT'",
      sub: 'bottom → top — outbound, internet on top',
      pattern: 'group',
      flow: 'BT',
      children: [
        { id: 'bt1', label: 'Private host', pattern: 'service' },
        { id: 'bt2', label: 'NAT gateway', pattern: 'network', icon: 'router' },
        { id: 'bt3', label: 'Internet', pattern: 'external', icon: 'globe' },
      ],
      edges: [
        { source: 'bt1', target: 'bt2', label: 'egress' },
        { source: 'bt2', target: 'bt3' },
      ],
    },
    {
      id: 'fan',
      label: 'Fan — author order IS layer order',
      sub: 'no crossing minimisation; swap w1/w2 to see it cross',
      pattern: 'group',
      flow: 'LR',
      children: [
        { id: 'fq', label: 'Queue', pattern: 'network', icon: 'waves' },
        { id: 'fw1', label: 'Worker 1', pattern: 'service', variant: 'tile' },
        { id: 'fw2', label: 'Worker 2', pattern: 'service', variant: 'tile' },
        { id: 'fsink', label: 'Store', pattern: 'storage', icon: 'warehouse' },
      ],
      edges: [
        { source: 'fq', target: 'fw1' },
        { source: 'fq', target: 'fw2' },
        { source: 'fw1', target: 'fsink' },
        { source: 'fw2', target: 'fsink' },
      ],
    },
  ],
  edges: [],
}
