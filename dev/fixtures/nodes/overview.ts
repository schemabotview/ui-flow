import type { Scene } from '../../../src'

const sample = (x: number) => 1 / (1 + Math.exp(-x))

export const overview: Scene = {
  id: 'nodes',
  title: 'Node types — one of each',
  cols: 4,
  nodes: [
    {
      id: 'ov-card', label: 'Card', sub: 'default leaf · colour = role', pattern: 'group', cols: 2,
      children: [
        { id: 'ov-c1', label: 'Service', sub: 'compute', pattern: 'service' },
        { id: 'ov-c2', label: 'Storage', sub: 'data at rest', pattern: 'storage' },
        { id: 'ov-c3', label: 'Network', sub: 'the path', pattern: 'network' },
        { id: 'ov-c4', label: 'Warn', sub: 'the catch', pattern: 'warn' },
      ],
    },
    {
      id: 'ov-tile', label: 'Tile', sub: "variant: 'tile'", pattern: 'group', cols: 2,
      children: [
        { id: 'ov-t1', label: 'lambda', pattern: 'service', variant: 'tile', icon: 'lambda' },
        { id: 'ov-t2', label: 'cosmos', pattern: 'storage', variant: 'tile', icon: 'cosmos' },
        { id: 'ov-t3', label: 'cpu', pattern: 'service', variant: 'tile', icon: 'cpu' },
        { id: 'ov-t4', label: 'default', pattern: 'network', variant: 'tile' },
      ],
    },
    {
      id: 'ov-chip', label: 'Chip', sub: "variant: 'chip'", pattern: 'group', cols: 2,
      children: [1, 2, 3, 4].map((i) => ({ id: `ov-k${i}`, label: `Task ${i}`, pattern: 'network' as const, variant: 'chip' as const, icon: 'none' })),
    },
    {
      id: 'ov-list', label: 'List', sub: "kind: 'list'", pattern: 'group',
      children: [
        { id: 'ov-l', kind: 'list', label: 'Bronze (raw)', sub: 'ADLS Gen2', pattern: 'storage', icon: 'folder', items: ['Raw, immutable', 'Partitioned by date', '90-day retention'] },
      ],
    },
    {
      id: 'ov-table', label: 'Table', sub: "kind: 'table'", pattern: 'group',
      children: [
        {
          id: 'ov-tb', kind: 'table', label: 'orders', pattern: 'storage',
          columns: [{ name: 'id', type: 'bigint', key: 'PK' }, { name: 'customer_id', type: 'bigint', key: 'FK' }, { name: 'placed_at', type: 'timestamptz' }],
        },
      ],
    },
    {
      id: 'ov-code', label: 'Code', sub: "kind: 'code'", pattern: 'group',
      children: [
        { id: 'ov-cd', kind: 'code', filename: 'total.py', hug: true, label: 'counts = [3, 5, 8]\ntotal = sum(counts)\nprint(f"total: {total}")' },
      ],
    },
    {
      id: 'ov-memory', label: 'Memory', sub: "kind: 'memory'", pattern: 'group',
      children: [
        {
          id: 'ov-m', kind: 'memory', label: 'PyObject', pattern: 'network',
          slots: [
            { at: '0', name: 'ob_refcnt', note: 'ssize_t', group: 'header' },
            { at: '8', name: 'ob_type', note: 'PyTypeObject *', group: 'header' },
            { at: '16', name: 'ob_digit[0]', note: 'uint32' },
          ],
        },
      ],
    },
    {
      id: 'ov-box', label: 'Container', sub: 'children + child flow', pattern: 'network', flow: 'LR',
      children: [
        { id: 'ov-b1', label: 'Client', variant: 'chip', pattern: 'user', icon: 'none' },
        { id: 'ov-b2', label: 'API', variant: 'chip', pattern: 'service', icon: 'none' },
      ],
      edges: [{ source: 'ov-b1', target: 'ov-b2' }],
    },
    {
      id: 'ov-plot', label: 'Plot', sub: "kind: 'plot'", pattern: 'group',
      children: [
        {
          id: 'ov-p', kind: 'plot', label: 'The sigmoid', pattern: 'network',
          plot: {
            x: { min: -6, max: 6, label: 'x' },
            y: { min: 0, max: 1, step: 0.25, label: 'σ(x)' },
            series: [{ kind: 'line', points: Array.from({ length: 61 }, (_, i) => { const x = -6 + i * 0.2; return [x, sample(x)] as [number, number] }), label: 'σ' }],
          },
        },
      ],
    },
    {
      id: 'ov-evo', label: 'Evolution', sub: "kind: 'evolution'", pattern: 'group',
      children: [
        {
          id: 'ov-e', kind: 'evolution', label: 'Max clock speed', pattern: 'service',
          evolution: {
            unit: 'GHz', baseline: 3,
            stages: [
              { label: 'i7-4790K', at: '2014', value: 4.4, valueLabel: '4.4 GHz' },
              { label: 'i9-9900K', at: '2018', value: 5.0, valueLabel: '5.0 GHz' },
              { label: 'R9 7950X', at: '2022', value: 5.7, valueLabel: '5.7 GHz', pattern: 'service' },
            ],
          },
        },
      ],
    },
  ],
  edges: [],
}
