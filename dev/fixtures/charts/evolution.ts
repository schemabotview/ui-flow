import type { Scene } from '../../../src'

export const evolution: Scene = {
  id: 'evolution',
  title: 'evolution — truncated axis',
  padding: 0.16,
  nodes: [
    {
      id: 'cpus',
      kind: 'evolution',
      label: 'Evolution of desktop CPUs',
      sub: 'Twenty years of flagship parts — the jump is at the end, not the middle',
      pattern: 'network',
      evolution: {
        unit: 'Max clock speed (GHz)',
        baseline: 3,
        stages: [
          {
            at: '2004',
            sub: 'Intel',
            label: 'Pentium 4 570J',
            icon: 'cpu',
            value: 3.8,
            valueLabel: '3.8 GHz',
            items: ['Prescott', 'TDP 115 W', '90 nm', '1 core'],
          },
          {
            at: '2014',
            sub: 'Intel',
            label: 'Core i7-4790K',
            icon: 'cpu',
            value: 4.4,
            valueLabel: '4.4 GHz',
            items: ['Haswell R', 'TDP 88 W', '22 nm', '4 cores'],
          },
          {
            at: '2022',
            sub: 'AMD',
            label: 'Ryzen 9 7950X',
            icon: 'cpu',
            value: 5.7,
            valueLabel: '5.7 GHz',
            items: ['Zen 4', 'TDP 170 W', '5 nm', '16 cores'],
          },
          {
            at: '2024',
            sub: 'Intel',
            label: 'Core i9-14900KS',
            icon: 'cpu',
            value: 6.2,
            valueLabel: '6.2 GHz',
            items: ['Raptor Lake R', 'TDP 253 W', 'Intel 7', '24 cores', '8P + 16E'],
          },
        ],
      },
    },
  ],
  edges: [],
}

export const evolutionZero: Scene = {
  id: 'evolution-zero',
  title: 'evolution — zero-based, wide span',
  padding: 0.16,
  nodes: [
    {
      id: 'throughput',
      kind: 'evolution',
      label: 'Pipeline throughput per release',
      sub: 'Zero-based: the first bar is genuinely almost nothing next to the last',
      pattern: 'external',
      evolution: {
        unit: 'Rows processed per second (millions)',
        stages: [
          {
            at: 'v1.0',
            sub: 'single node',
            label: 'Batch',
            icon: 'server',
            value: 0.4,
            valueLabel: '0.4M/s',
            items: ['nightly_full_reload', 'single writer'],
          },
          {
            at: 'v2.0',
            sub: 'partitioned',
            label: 'Parallel batch',
            icon: 'layers',
            value: 3.1,
            valueLabel: '3.1M/s',
            items: ['hash_partitioned', '8 writers'],
          },
          {
            at: 'v3.0',
            sub: 'streaming',
            label: 'Micro-batch',
            icon: 'layers',
            value: 12,
            valueLabel: '12M/s',
            items: ['structured_streaming', 'checkpointed'],
          },
          {
            at: 'v4.0 (current)',
            sub: 'streaming + columnar',
            label: 'Vectorised',
            icon: 'zap',
            value: 12.4,
            valueLabel: '12.4M/s',
            pattern: 'storage',
            items: ['arrow_record_batches', 'checkpointed'],
          },
        ],
      },
    },
  ],
  edges: [],
}
