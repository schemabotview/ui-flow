import type { Scene } from '../../../src'

export const list: Scene = {
  id: 'list',
  title: 'List — service + properties, sized to content',
  cols: 3,
  nodes: [
    {
      id: 'floor',
      kind: 'list',
      label: 'Bronze (raw)',
      sub: 'ADLS Gen2',
      pattern: 'storage',
      icon: 'blob',
      items: ['Raw, immutable', 'Partitioned by date', '90-day retention'],
    },
    {
      id: 'measure',
      kind: 'list',
      label: 'Silver (cleansed)',
      sub: 'ADLS Gen2 · Delta Lake',
      pattern: 'storage',
      icon: 'adls',
      items: [
        'Cleansing, standardisation and enrichment against the reference data',
        'Business-rule transformations implemented in PySpark and SQL',
        'Conformed schema',
        'Delta MERGE with historical versioning for a full audit trail',
      ],
    },
    {
      id: 'unbreakable',
      kind: 'list',
      label: 'Gold',
      sub: 'Synapse Analytics',
      pattern: 'service',
      icon: 'synapse',
      items: [
        'abfss://gold@barclaysrisk.dfs.core.windows.net/marts',
        'dbt_utils.generate_surrogate_key on every dimension',
        'Star schema',
      ],
    },
    {
      id: 'wrapped-title',
      kind: 'list',
      label: 'Regulatory transformation and reconciliation layer',
      sub: 'Azure Databricks — PySpark and SQL, with Delta MERGE for upserts',
      pattern: 'warn',
      icon: 'databricks',
      items: ['Basel III / FRTB', 'Historical versioning'],
    },
    { id: 'titled', kind: 'list', label: 'No items', sub: 'degrades to a titled block', pattern: 'user', icon: 'tree' },
    { id: 'card', label: 'Plain card', sub: 'for size comparison', pattern: 'network', icon: 'server' },
  ],
  edges: [],
}
