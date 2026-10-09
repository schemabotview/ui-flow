// Fixture: the LIST node — a service card with a bulleted body, sized from its own content.
//
// Not merged into another fixture, for the reason the registry gives for the whole `content`
// category: everywhere else the defect is SHAPE (a wrong direction, a crossed edge) and shape
// survives being scaled down, but here the defect is a clipped last line a few pixels tall, caused
// by the sizer reserving less than the renderer draws. That only fails when content lands exactly
// on a bound — which is what the cards below are built to do.
//
// WHAT EACH CARD COVERS
//   `floor`    — content narrower than LIST_MIN_W. Must come out at the floor width, NOT hug its
//                three short items, or a sparse card renders its type bigger than a dense one.
//   `measure`  — items longer than LIST_MAX_W, so the card caps at the reading measure and the text
//                wraps. This is the one that catches a greedy-wrap bug: `ceil(chars/width)` counts
//                four lines where the browser lays out five, and the fifth is clipped.
//   `unbreakable` — a path and a snake_case identifier longer than the whole measure. The renderer
//                sets `overflow-wrap: anywhere` and wrapLines splits mid-word to match; get the two
//                out of step and the token either overflows the border or loses a row.
//   `wrapped-title` — a title that takes two lines over a sub that takes two more. The header must
//                grow and the icon must stay pinned at the top (alignItems: flex-start), which is
//                what listHeaderHeight assumes. Shorten the title by a word and it lands ON the wrap
//                boundary: the real text fits one line with ~4% to spare, the sizer's advance margin
//                is ~4.4%, so it reserves two and the card carries ~25px of dead space under its last
//                bullet. That is the margin working — the alternative is an advance with no slack and
//                a clipped last line on the first capital-heavy string someone writes.
//   `titled`   — no `items` at all. Degrades to a titled block with NO hairline and no body padding;
//                the sizer returns a header-only height, so a stray rule would overhang the box.
//   `card`     — a plain 210×96 card in the same layer, deliberately. The list node's whole claim is
//                that it replaces a CONTAINER of these, so the two have to be comparable at a glance:
//                the title sits on a plain card's label size and the icon box is the same 26px.
//   the flow   — three of them in an LR flow proves the leaf claim: a list node takes edges on all
//                four sides and ranks like any other leaf, with no special case in layout.ts.
import type { Scene } from '../../../src'

export const list: Scene = {
  id: 'list',
  title: 'List — service + properties, sized to content',
  flow: 'LR',
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
    { id: 'titled', kind: 'list', items: [], label: 'No items', sub: 'degrades to a titled block', pattern: 'user', icon: 'tree' },
    { id: 'card', label: 'Plain card', sub: 'for size comparison', pattern: 'network', icon: 'server' },
  ],
  edges: [
    { source: 'floor', target: 'measure' },
    { source: 'measure', target: 'unbreakable' },
    { source: 'unbreakable', target: 'wrapped-title' },
    { source: 'wrapped-title', target: 'titled' },
    { source: 'titled', target: 'card' },
  ],
}
