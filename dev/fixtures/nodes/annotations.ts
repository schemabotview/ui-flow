import type { Scene } from '../../../src'

export const annotations: Scene = {
  id: 'annotations',
  title: 'Notes and property pills',
  cols: 3,
  align: 'start',
  nodes: [
    { id: 'note-short', label: 'On S3', kind: 'note', pattern: 'network' },
    { id: 'note-long', label: 'Separate Delta and Iceberg locations, so neither table format reads the other', kind: 'note', pattern: 'network' },
    { id: 'note-token', label: 'checkpoint_location_for_structured_streaming_state', kind: 'note', pattern: 'warn' },
    {
      id: 'pills', label: 'Silver — Apache Iceberg', sub: 'pills: true', icon: 'database', pattern: 'service', kind: 'list', pills: true,
      items: ['Cleanse & standardise', 'Normalise units (apply corrections)', 'Enrich with reference data', 'Conform to data model'],
    },
    {
      id: 'pills-wrap', label: 'Amazon S3 — Bronze', sub: 'a pill that wraps', icon: 's3', pattern: 'storage', kind: 'list', pills: true,
      items: ['Audit fields (source system, load time, file hash, batch run id and ingest timestamp)', 'Schema gate'],
    },
    {
      id: 'bullets', label: 'Same items, bullets', sub: 'the default list', icon: 'database', pattern: 'service', kind: 'list',
      items: ['Cleanse & standardise', 'Normalise units (apply corrections)', 'Enrich with reference data', 'Conform to data model'],
    },
  ],
  edges: [],
}
