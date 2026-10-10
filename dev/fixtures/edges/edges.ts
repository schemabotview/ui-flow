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
      id: 'curved',
      label: "route: 'curve' — the default",
      sub: 'the fan bows into four diagonals',
      pattern: 'group',
      children: [
        { id: 'c-in', label: 'Ingest', pattern: 'network' },
        { id: 'c-a', label: 'Shard A', pattern: 'storage' },
        { id: 'c-b', label: 'Shard B', pattern: 'storage' },
        { id: 'c-out', label: 'Reducer', pattern: 'service' },
      ],
      edges: [
        { source: 'c-in', target: 'c-a' },
        { source: 'c-in', target: 'c-b' },
        { source: 'c-a', target: 'c-out' },
        { source: 'c-b', target: 'c-out' },
        { source: 'c-out', target: 'c-in', label: 'ack', dashed: true },
      ],
    },
    {
      id: 'stepped',
      label: "route: 'step' — orthogonal",
      sub: 'the same fan, sharing lanes instead of crossing',
      pattern: 'group',
      children: [
        { id: 'k-in', label: 'Ingest', pattern: 'network' },
        { id: 'k-a', label: 'Shard A', pattern: 'storage' },
        { id: 'k-b', label: 'Shard B', pattern: 'storage' },
        { id: 'k-out', label: 'Reducer', pattern: 'service' },
      ],
      edges: [
        { source: 'k-in', target: 'k-a', route: 'step' },
        { source: 'k-in', target: 'k-b', route: 'step' },
        { source: 'k-a', target: 'k-out', route: 'step' },
        { source: 'k-b', target: 'k-out', route: 'step' },
        { source: 'k-out', target: 'k-in', label: 'ack', route: 'step', dashed: true },
      ],
    },
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
