import type { Scene } from '../../../src'

export const prose: Scene = {
  id: 'prose-hierarchy',
  title: 'Text & sizing — hierarchy, wrapping, list floors',
  cols: 2,
  nodes: [
    { id: 'outer', label: 'Neutral outer container', pattern: 'group', cols: 2,
      sub: 'Focus an inner container to compare its outline with its neutral parent.',
      children: [
        { id: 'controller', label: 'Controller', pattern: 'service', children: [
          { id: 'plan', label: 'Builds the execution plan', sub: 'A longer caption that must stay within its actual allocated node height.', pattern: 'network' },
          { id: 'fact', label: 'One process per application', sub: 'An annotation — a card is unframed until focused.', pattern: 'external' },
        ] },
        { id: 'processor', label: 'Processor', pattern: 'network', children: [
          { id: 'properties', kind: 'list', label: 'Responsibilities', pattern: 'network', sub: 'Caption and title both wrap safely.', items: ['Runs independent work', 'Reports progress and returns results'] },
        ] },
      ],
    },
    {
      id: 'wrapping', label: 'Wrapping', sub: 'cards, list titles and container headers grow to fit', pattern: 'group',
      children: [
        { id: 'sentence', label: 'The sentence worth keeping', sub: 'The controller decides and never works; processors do the reverse.', pattern: 'service' },
        { id: 'empty-list', kind: 'list', label: 'A long unbroken identifier_that_must_wrap_inside_the_card', sub: 'A caption with several long words near the wrapping boundary.', items: [] },
        { id: 'long-header', label: 'An outer group with a deliberately long wrapping heading', sub: 'The caption must not overlap the children below it.', pattern: 'group', children: [
          { id: 'child', label: 'Contained object', pattern: 'storage' },
        ] },
      ],
    },
    {
      id: 'list-sizing', label: 'List sizing', sub: 'width floor, reading measure, unbreakable tokens, no items', pattern: 'group', cols: 3,
      children: [
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
    },
  ],
  edges: [],
}
