// Fixture: a REAL architecture, authored from the Barclays / Azure case study in
// ../Interview-Preparation/Ganesh_Maddipoti_Interview_PrepGuide.docx (§"Case Study 2 — Barclays":
// Architecture Overview, Section A steps 1–10, Section B). Trade-finance and risk analytics on Azure.
//
// FIVE NUMBERED LAYERS over two platform bands: sources → ingestion → storage & processing →
// serving → consumers, with governance and DevOps underneath as strata rather than stages.
//
// IT IS BUILT ON THE `list` NODE, and that is the point of this version. Earlier drafts modelled a
// service's properties as a CONTAINER of one 210×96 card per bullet: "Bronze (raw)" was five nodes
// and ~537px of height to say what one card says in ~290. Three costs, all of them real — the node
// count tripled, every property became something an edge could point at, and the composition's
// fitView zoom fell far enough that the leaf type stopped being readable. Now a stage is ONE node
// and the bullets are its body, which is also why this draft can carry the document's full detail
// (audit columns, replication factor, the SCD2 argument) where the card version had to cut to three
// points per box.
//
// EVERY TECHNOLOGY NAMED HERE APPEARS IN THAT SECTION OF THE DOCUMENT, and nothing else does.
//
// A thing the engine does that a hand-drawn version of this does not: a flow's members are centred
// ACROSS the flow, not top-aligned, so the five columns sit centred on one another rather than
// ruled to a common top edge. There is no author-side lever, and spacer nodes would put geometry
// into the content.
//
// Built to be read at FULL WINDOW (`?full=1` in the harness).
import type { Scene, SceneNode } from '../../../src'

// ── Layer 0 · the feeds (Step 1). Two load regimes, and the doc names both.
const sources: SceneNode = {
  id: 'sources',
  align: 'start',
  label: 'Data sources',
  sub: 'core banking & reference',
  // `external` because that is what they are — systems outside the platform. A band's colour is its
  // ROLE, never its position in the row: a grey lead band is correct here, and reaching for a
  // livelier hue just to open the diagram warmly is how green stops meaning storage.
  pattern: 'external',
  icon: 'none',
  children: [
    {
      id: 'core-src',
      kind: 'list',
      label: 'Core banking systems',
      sub: 'watermark incremental',
      pattern: 'external',
      icon: 'database',
      items: [
        'Trade-finance transactions',
        'Exposure data and movements',
        'Counterparty hierarchies',
        'Credit limits from the limit engine',
      ],
    },
    {
      id: 'ref-src',
      kind: 'list',
      label: 'Reference & other',
      sub: 'full refresh',
      pattern: 'external',
      icon: 'tag',
      items: ['Counterparty master, LEI codes', 'Product hierarchy', 'Collateral positions and valuations'],
    },
  ],
}

// ── Layer 1 · ingestion (Step 1, and Section B's broker configuration).
const ingestion: SceneNode = {
  id: 'ingestion',
  align: 'start',
  badge: '01',
  label: 'Ingestion layer',
  sub: 'batch & streaming',
  pattern: 'network',
  icon: 'none',
  children: [
    {
      id: 'adf',
      kind: 'list',
      label: 'Azure Data Factory',
      sub: 'batch ingestion',
      pattern: 'service',
      icon: 'datafactory',
      items: [
        'Copy Activity, 100+ native connectors',
        'Reference data full-refresh; transactions incremental',
        'Watermark held in an Azure SQL control table',
        'Credentials from Key Vault — never hardcoded',
      ],
    },
    {
      id: 'eventhubs',
      kind: 'list',
      label: 'Azure Event Hubs',
      sub: 'real-time ingestion',
      pattern: 'service',
      icon: 'eventhubs',
      items: [
        'Kafka protocol — consumer code unchanged',
        'Topics raw → enriched → dlq, replication factor 3',
        '16 partitions for ~300K events/hour',
        'Avro via the Event Hubs Schema Registry',
      ],
    },
  ],
}

// ── Layer 2 · storage & processing (Steps 2–5, 7, 8 and Section B's stream job).
// The medallion is a flow INSIDE the lake; the two Databricks jobs sit under it as a pair, because
// the document is explicit that they never share pipeline code — only this storage layer.
const storage: SceneNode = {
  id: 'storage',
  align: 'start',
  stretch: true,
  badge: '02',
  label: 'Storage & processing',
  sub: 'medallion architecture',
  pattern: 'storage',
  icon: 'none',
  children: [
    {
      id: 'adls',
      label: 'Azure Data Lake Storage Gen2',
      sub: 'lakehouse storage with Delta',
      pattern: 'storage',
      icon: 'adls',
      flow: 'LR',
      align: 'start',
      children: [
        {
          id: 'bronze',
          kind: 'list',
          label: 'Bronze (raw)',
          sub: 'raw zone',
          pattern: 'storage',
          icon: 'blob',
          items: [
            'Raw and immutable, exactly as received',
            'Partitioned by load_date and source_system',
            'ingested_at / source_system / pipeline_run_id',
            '90 days, then archive tier',
            'Schema gate: Azure Function via Event Grid',
          ],
        },
        {
          id: 'silver',
          kind: 'list',
          label: 'Silver (cleansed)',
          sub: 'curated zone',
          pattern: 'storage',
          icon: 'adls',
          items: [
            'Joins trade, counterparty, limits, collateral',
            'Type standardisation and null-to-DLQ',
            'Dedup on trade_id + version',
            'Basel III / FRTB in PySpark and SQL',
            'Delta MERGE with historical versioning',
          ],
        },
        {
          id: 'gold',
          kind: 'list',
          label: 'Gold (business ready)',
          sub: 'Synapse Analytics',
          pattern: 'storage',
          icon: 'synapse',
          items: [
            'dbt: staging → intermediate → marts',
            'FACT_TRADES and FACT_CREDIT_EXPOSURE',
            'DIM_COUNTERPARTY as SCD Type 2',
            'Surrogate keys, never natural LEI joins',
            '150+ dbt tests on every build',
          ],
        },
      ],
      edges: [
        { source: 'bronze', target: 'silver' },
        { source: 'silver', target: 'gold' },
      ],
    },
    {
      id: 'processing',
      label: 'Processing',
      sub: 'separate pipeline code; shares only the storage layer',
      pattern: 'service',
      icon: 'databricks',
      flow: 'LR',
      align: 'start',
      // STACKED, not side by side. Side by side the pair came out 794 wide under a 1291-wide lake
      // and left the whole composition at 2.4:1 against a 1.7:1 window — width-bound, with ~30% of
      // the frame empty below it. Stacking spends that empty height instead: the fitView zoom is
      // identical (width still binds) but the diagram now fills the pane. It is also what the
      // reference drawing does — the two tracks are full rows under the lake, not columns beside it.
      children: [
        {
          id: 'batch-proc',
          kind: 'list',
          label: 'Batch processing',
          sub: 'Azure Databricks — PySpark, SQL, Delta',
          pattern: 'service',
          icon: 'databricks',
          items: [
            'Great Expectations validates Bronze first',
            'Business-rule mapping on product and status',
            'Scala Spark Partitioner removes a 3M-row shuffle',
            'Writes Silver and Gold in Delta',
          ],
        },
        {
          id: 'rt-proc',
          kind: 'list',
          label: 'Real-time processing',
          sub: 'Azure Databricks — Structured Streaming',
          pattern: 'service',
          icon: 'waves',
          items: [
            'Consumes from Event Hubs',
            'Validation and dedup on trade_id + event_version',
            '10-minute watermark for late events',
            'Windowed exposure against broadcast limits',
            'Checkpointed to ADLS for exactly-once',
          ],
        },
      ],
    },
  ],
}

// ── Layer 3 · serving (Steps 5, 7, 10 and Section B's hot path).
const serving: SceneNode = {
  id: 'serving',
  align: 'start',
  badge: '03',
  label: 'Serving layer',
  sub: 'reporting · reconciliation · access',
  pattern: 'service',
  icon: 'none',
  children: [
    {
      id: 'powerbi',
      kind: 'list',
      label: 'Power BI',
      sub: 'analytics & reporting',
      pattern: 'user',
      icon: 'powerbi',
      items: ['Connects to Synapse Gold over JDBC', 'Risk and regulatory reporting dashboards'],
    },
    {
      id: 'fabric',
      kind: 'list',
      label: 'Microsoft Fabric',
      sub: 'regulatory reconciliation',
      pattern: 'service',
      icon: 'sigma',
      items: [
        'Source freshness checks and relationship tests',
        'Reconciliation models replaced the spreadsheets',
        'Exception datasets; variance > 0.01% blocks publication',
      ],
    },
    {
      id: 'direct',
      kind: 'list',
      label: 'Hot path & direct read',
      sub: 'Cosmos DB · Gold Delta',
      pattern: 'storage',
      icon: 'cosmos',
      items: [
        'Cosmos DB, sub-5ms reads on /counterparty_id',
        'Session consistency, RUs sized for peak booking',
        'Data Science reads Gold Delta via notebooks',
      ],
    },
  ],
}

// ── Layer 4 · who reads it (Step 10). A consumer has no properties — it is a reader, not a service
// — so these stay plain cards. Reaching for a list node here would be the mirror of the mistake
// this draft fixes: a body with nothing to put in it.
const consumers: SceneNode = {
  id: 'consumers',
  align: 'start',
  label: 'Business consumers',
  sub: 'risk · regulatory · science',
  pattern: 'user',
  icon: 'none',
  children: [
    { id: 'c-risk', label: 'Risk Operations', sub: 'Intraday exposure', pattern: 'user', icon: 'gauge' },
    { id: 'c-reg', label: 'Regulatory Reporting', sub: 'FCA / PRA submissions', pattern: 'user', icon: 'scroll' },
    { id: 'c-biz', label: 'Business users', sub: 'Power BI dashboards', pattern: 'user', icon: 'users' },
    { id: 'c-ds', label: 'Data Science', sub: 'Gold Delta notebooks', pattern: 'user', icon: 'brain' },
  ],
}

// ── Band 4 · Step 9, plus Step 8's quality framework. One line each, so: cards, not lists.
const governance: SceneNode = {
  id: 'governance',
  badge: '04',
  label: 'Governance, security & monitoring',
  sub: 'Unity Catalog + Microsoft Fabric workspace integration — built for FCA/PRA scrutiny',
  pattern: 'user',
  icon: 'shieldcheck',
  cols: 6,
  children: [
    { id: 'gv-purview', label: 'Microsoft Purview', sub: 'Catalog & lineage', pattern: 'user', icon: 'purview' },
    { id: 'gv-kv', label: 'Azure Key Vault', sub: 'Keys · TLS 1.2+', pattern: 'user', icon: 'key' },
    { id: 'gv-unity', label: 'Unity Catalog', sub: 'RBAC · column masking', pattern: 'user', icon: 'tree' },
    { id: 'gv-fabric', label: 'Fabric workspace', sub: 'Integrated catalogs', pattern: 'user', icon: 'share' },
    { id: 'gv-audit', label: 'Audit logging', sub: '7-year retention', pattern: 'user', icon: 'scroll' },
    { id: 'gv-dq', label: 'Data quality', sub: 'GE · dbt · 0.01%', pattern: 'user', icon: 'circlecheck' },
  ],
}

// ── Band 5 · the Action list's last paragraph and Step 6's orchestration + alerting.
const devops: SceneNode = {
  id: 'devops',
  badge: '05',
  label: 'Orchestration, DevOps & infrastructure',
  sub: 'Airflow dependency graphs over ADF · reusable Terraform modules — environment build ~2 weeks to under a day',
  pattern: 'network',
  icon: 'braces',
  cols: 6,
  children: [
    { id: 'do-airflow', label: 'Apache Airflow', sub: 'Scheduler · DAGs', pattern: 'service', icon: 'workflow' },
    { id: 'do-adf', label: 'Azure Data Factory', sub: 'Execution engine', pattern: 'service', icon: 'datafactory' },
    { id: 'do-stages', label: 'Four workflows', sub: 'Independently run', pattern: 'service', icon: 'layers' },
    { id: 'do-git', label: 'DAGs in Git', sub: 'Python · reviewed', pattern: 'service', icon: 'gitbranch' },
    { id: 'do-tf', label: 'Terraform modules', sub: 'Clusters · services', pattern: 'service', icon: 'braces' },
    { id: 'do-alert', label: 'Retry & alerting', sub: 'Service Bus → Slack', pattern: 'warn', icon: 'bell' },
  ],
}

export const barclaysAzure: Scene = {
  id: 'barclays-azure',
  title: 'Case study — Barclays · Azure trade-finance & risk platform',
  // NO scene-level edges: the three top-level nodes are strata, not a flow, so they STACK (28px
  // apart) rather than being ranked 90px apart with arrows between them.
  padding: 0.05,
  nodes: [
    {
      id: 'layers',
      label: 'End-to-end data architecture — batch & real-time',
      sub: 'banking · Azure · reconciled, auditable, regulator ready',
      pattern: 'group',
      icon: 'none',
      flow: 'LR',
      // The five bands are a GRID, not a procession of boxes on a midline. `align: 'start'` rules
      // them to one top edge and `stretch` runs them to one bottom edge; without both, a tall band
      // beside a short one leaves the row looking like it drifted. See the note at the head of this
      // file — this is the one thing the engine could not express when the fixture was written.
      align: 'start',
      stretch: true,
      children: [sources, ingestion, storage, serving, consumers],
      // Orthogonal: between bands this wide a bezier bows out through the gap and reads as a pipe
      // with slack in it. A step goes out, along and in, which is what a band diagram draws.
      edges: [
        { source: 'sources', target: 'ingestion', route: 'step' },
        { source: 'ingestion', target: 'storage', route: 'step' },
        { source: 'storage', target: 'serving', route: 'step' },
        { source: 'serving', target: 'consumers', route: 'step' },
      ],
    },
    governance,
    devops,
  ],
  edges: [],
}
