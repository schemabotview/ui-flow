// Fixture: a REAL architecture, authored from the EDF Energy / AWS case study in
// ../../projects-workspace/Ganesh_Maddipoti_Interview_PrepGuide.docx (§"Case Study 1 — EDF Energy":
// Architecture Overview, Section A steps 1–10, Section B). Smart metering, generation, trading and
// customer analytics on AWS, built for Ofgem audit.
//
// SAME COMPOSITION AS `edf-aws-codex`, DIFFERENT CONTENT RULE. The structure is that fixture's —
// five single-column bands over one `foundation` row, cards and chips, no `list` nodes — because at
// this scale a flat column of services reads faster than a taxonomy of them: a wrapper box per
// capability holds exactly one card, so it spends a header and a frame to say what the service's own
// name already said.
//
// The content rule is the one that differs: EVERY TECHNOLOGY HERE APPEARS IN THAT SECTION OF THE
// DOCUMENT, and nothing else does. So there is no AWS DMS and no MSK Connect (neither is in Case
// Study 1), and Delta Lake and EventBridge — both named in the document, the streaming sink and the
// trigger for the schema Lambda — are drawn rather than dropped. Kafka is not identified as MSK in
// the source, so it is drawn as Apache Kafka.
//
// ONE THING IS DELIBERATELY NOT REPLICATED: the feedback edges from the processing boxes back up
// into Bronze. They are the honest relationship — batch and streaming both land there — but a step
// route from a card three levels down to a node two tiers away drops at that CARD's x, which is
// inside the boxes between them; drawn, they put an arrowhead in the middle of a sub line and a
// vertical rule through a card's body. `processing`'s own sub states the fact instead, and the band
// stacks with no internal edges.
//
// Built to be read at FULL WINDOW (`?full=1` in the harness).
import type { Scene, SceneNode } from '../../../src'

const card = (id: string, label: string, sub: string, icon: string,
  pattern: SceneNode['pattern'] = 'service'): SceneNode => ({ id, label, sub, icon, pattern })
// A token the thing above it is configured WITH — a key, an interval, a topic name, a retention
// window. Almost every fact this document states is one of those, and a chip hugs its own text where
// a bullet body takes ~3× the width to say the same thing.
const chip = (id: string, label: string, pattern: SceneNode['pattern'] = 'storage'): SceneNode =>
  ({ id, label, variant: 'chip', pattern, icon: 'none' })
const band = (id: string, badge: string, label: string, pattern: SceneNode['pattern'],
  children: SceneNode[], sub?: string): SceneNode =>
  ({ id, badge, label, sub, pattern, icon: 'none', align: 'start', children })

// ── Band 01 · the feeds (Step 1). A SINGLE COLUMN of plain cards: each feed is a thing in its own
// right — a separate extract on its own schedule that an edge could point at — and the load regime
// the document groups them by rides on each card's own sub, rather than buying two wrapper boxes.
// `external` because that is what they are: systems outside the platform.
const sources = band('sources', '01', 'Data sources', 'external', [
  card('meters', 'Smart metering', 'Meter reads from the head-end systems; 50M+ daily, incremental', 'gauge', 'external'),
  card('assets', 'Generation assets', 'SCADA extracts and asset telemetry', 'zap', 'external'),
  card('trading', 'Energy trading', 'Trading events from the trading systems', 'chartpie', 'external'),
  card('billing', 'Customer and billing', 'Billing records, consumption and the source control totals', 'users', 'external'),
  card('events', 'Meter / grid events', 'Continuous telemetry for the streaming path', 'waves', 'external'),
  card('reference', 'Reference systems', 'Meter registry, tariffs and asset master; full load, row-count validated', 'database', 'external'),
], 'full load (reference) · incremental watermark (transactional)')

// ── Band 02 · ingestion (Step 1, and Section B's broker configuration). One column: the two
// ingestion technologies, then the two things every source connection needs.
const ingestion = band('ingestion', '02', 'Ingestion', 'network', [
  {
    id: 'databricks', label: 'AWS Databricks', sub: 'Python / PySpark ingestion frameworks · schema enforced at landing',
    pattern: 'service', icon: 'databricks', children: [
      card('full', 'Full refresh', 'Reference datasets; truncate, reload and row-count validation', 'repeat'),
      card('incremental', 'Incremental loads', 'Transactional data; watermark control', 'clock'),
    ],
  },
  {
    id: 'kafka', label: 'Apache Kafka', sub: 'Real-time ingestion · Avro via Schema Registry',
    pattern: 'network', icon: 'network', children: [
      chip('kafka-topics', 'raw / enriched / dlq', 'network'),
      chip('kafka-brokers', '3 brokers / replication factor 3', 'network'),
      chip('kafka-partitions', '24 partitions · ~450K events/hour', 'network'),
    ],
  },
  card('control', 'DynamoDB control', 'Watermarks and quarantined-source flags', 'dynamodb', 'storage'),
  card('credentials', 'Secrets Manager', 'Source connection credentials; nothing hardcoded, pre-commit scanned', 'secretsmanager', 'user'),
])

// ── Band 03 · storage AND processing in one band (Steps 2–5, 8 and Section B's stream job). The
// medallion is a flow INSIDE the lake; the two processing jobs sit beneath it as a pair, because the
// document is explicit that they never share pipeline code — only this storage layer.
const lake = band('lake', '03', 'Storage & processing', 'storage', [
  {
    id: 's3', label: 'Amazon S3 · Apache Iceberg',
    sub: 'Schema evolution, hidden partitioning and time travel — chosen over plain Parquet or Delta for Ofgem audit',
    pattern: 'storage', icon: 's3', flow: 'LR', align: 'start', stretch: true, children: [
      {
        id: 'bronze', label: 'Bronze · raw', sub: 'Exactly as received; the single replay point',
        pattern: 'storage', icon: 's3', children: [
          chip('bronze-date', 'load_date / source_system'),
          chip('bronze-audit', 'ingested_at / batch_run_id'),
          chip('bronze-quality', 'Great Expectations', 'service'),
          chip('bronze-retention', '90 days → Glacier'),
        ],
      },
      {
        id: 'silver', label: 'Silver · cleansed', sub: 'Reads Bronze only, so it is always re-runnable',
        pattern: 'storage', icon: 'database', children: [
          chip('silver-dedupe', 'meter_id + reading_timestamp'),
          chip('silver-units', 'Tariff mapping / unit normalisation'),
          chip('silver-utc', 'UTC ISO 8601 timestamps'),
          chip('silver-dlq', 'Invalid records → DLQ', 'warn'),
        ],
      },
      {
        id: 'gold', label: 'Gold · curated', sub: 'The complete reconciled picture — both tracks merged',
        pattern: 'storage', icon: 'table', children: [
          chip('gold-consumption', 'Daily consumption'),
          chip('gold-generation', 'Generation utilisation %'),
          chip('gold-upserts', 'Iceberg upserts'),
          chip('gold-history', 'Time travel for audit'),
        ],
      },
    ],
    edges: [
      { source: 'bronze', target: 'silver', route: 'step' },
      { source: 'silver', target: 'gold', route: 'step' },
    ],
  },
  {
    id: 'processing', label: 'Processing',
    sub: 'Batch and streaming both land in Bronze; transformations produce Silver and Gold',
    pattern: 'service', icon: 'braces', cols: 1, align: 'start', stretch: true,
    children: [
      {
        id: 'batch-proc', label: 'Batch processing', sub: 'Databricks landing → Bronze; then the schema gate, Glue and dbt',
        pattern: 'service', icon: 'glue', cols: 3, align: 'start', children: [
          card('schema', 'Schema evolution gate', 'EventBridge → Lambda on S3 PutObject; additive changes approved, breaking changes quarantined with an SNS alert', 'lambda'),
          card('glue-job', 'AWS Glue · PySpark', 'Cleanse, enrich, normalise units and reconcile', 'glue'),
          card('dbt', 'dbt business models', 'Staging → intermediate → marts; 150+ tests', 'sigma'),
        ],
      },
      {
        id: 'stream', label: 'Streaming processing', sub: 'Databricks Structured Streaming reads the enriched topic',
        pattern: 'service', icon: 'waves', cols: 3, align: 'start', children: [
          card('eventtime', 'Event time and recovery', '30-second trigger; 10-minute watermark; S3 checkpoints', 'clock'),
          card('enrichment', 'Meter asset enrichment', 'Broadcast join against the asset reference table', 'layers'),
          card('delta', 'Delta Lake on S3', 'Permanent append record in its own prefix; merged into the next Iceberg batch run', 's3', 'storage'),
        ],
      },
    ],
  },
])
lake.stretch = true

// ── Band 04 · serving (Steps 7, 10 and Section B's hot path). One column of services, no capability
// wrapper around each.
const serving = band('serving', '04', 'Serving', 'storage', [
  {
    id: 'redshift', label: 'Amazon Redshift', sub: 'Gold star schema warehouse, materialised by dbt',
    pattern: 'storage', icon: 'redshift', children: [
      card('facts', 'Meter and generation facts', 'Periodic snapshots with surrogate-key joins', 'table', 'storage'),
      card('dimensions', 'Customer SCD Type 2', 'Meter, tariff and asset dimensions; historical customer versions', 'database', 'storage'),
    ],
  },
  card('hot', 'Amazon DynamoDB', 'Streaming hot path; meter_id + reading_timestamp; 90-day TTL', 'dynamodb', 'storage'),
  card('powerbi', 'Power BI', 'Commercial reporting over Redshift', 'barchart', 'user'),
  card('athena', 'Amazon Athena', 'Data science queries Iceberg directly, off the warehouse', 'athena', 'service'),
  card('submission', 'Ofgem submission task', 'MWAA reconciliation; variance > 0.01% blocks submission', 'scroll', 'service'),
])

// ── Band 05 · who reads it (Step 10). A consumer is a reader, not a service: nothing to configure
// and no parts, so these stay plain cards.
const consumers = band('consumers', '05', 'Business users', 'user', [
  card('operations', 'Metering operations', 'DynamoDB dashboard reads; event visibility under 2 minutes', 'gauge', 'user'),
  card('commercial', 'Commercial analytics', 'Consumption insights and business reporting', 'chartpie', 'user'),
  card('regulator', 'Regulatory reporting', 'Ofgem submissions and historical evidence', 'scroll', 'user'),
  card('science', 'Data science', 'Exploration over Iceberg tables', 'brain', 'user'),
])

export const edfAwsClaude: Scene = {
  id: 'edf-aws-claude',
  title: 'edf-aws-claude — EDF Energy AWS data platform',
  padding: 0.04,
  nodes: [
    {
      id: 'architecture', label: 'Case study 1 — EDF Energy (AWS)',
      sub: 'Smart metering, generation, trading and customer analytics · batch and supplementary streaming architecture',
      pattern: 'group', icon: 'awscloud', flow: 'LR', align: 'start', stretch: true,
      children: [sources, ingestion, lake, serving, consumers],
      // Anchored at the BOXES the flow actually joins, not at the bands. Layout is unaffected — every
      // endpoint remaps to the band that owns it — but the arrows land where the architecture puts
      // them: the billing feed into the batch framework, grid events into Kafka, each ingestion mode
      // into its own processing job, the stream into the hot path, and the lake into the warehouse.
      edges: [
        { source: 'billing', target: 'databricks', route: 'step' },
        { source: 'events', target: 'kafka', route: 'step' },
        { source: 'databricks', target: 'batch-proc', route: 'step' },
        { source: 'kafka', target: 'stream', route: 'step' },
        { source: 'stream', target: 'hot', route: 'step' },
        { source: 'lake', target: 'redshift', route: 'step' },
        { source: 'serving', target: 'consumers', route: 'step' },
        { source: 'hot', target: 'operations', route: 'step' },
      ],
    },
    {
      // The platform concerns, as one row of three strata rather than three top-level bands. None of
      // the three carries a badge: they are peers under the numbered pipeline above, and numbering
      // one of them would read as a sixth stage.
      id: 'foundation', label: 'Shared platform controls', icon: 'none', pattern: 'group', cols: 3,
      align: 'start', stretch: true, children: [
        {
          id: 'orchestration', label: 'Orchestration and monitoring', pattern: 'network', icon: 'workflow', children: [
            card('mwaa', 'Amazon MWAA · Airflow', 'Sequences ingestion, the schema gate, Glue and dbt — 99.9% SLA adherence', 'workflow'),
            card('alerts', 'Retries and SLA alerts', '3 retries with 10/20/40-minute back-off; Slack then PagerDuty', 'bell', 'warn'),
          ],
        },
        {
          id: 'governance', label: 'Security and governance', pattern: 'user', icon: 'shieldcheck', cols: 2, children: [
            card('iam', 'IAM / Lake Formation', 'Least privilege per job; column-level permissions', 'iam', 'user'),
            card('kms', 'AWS KMS', 'PII held apart; encryption at rest; TLS 1.2+', 'kms', 'user'),
            card('audit', 'AWS CloudTrail', 'Access audit logs retained for 7 years', 'cloudtrail', 'user'),
            card('catalog', 'Glue Data Catalog', 'Expected schemas and lakehouse metadata', 'glue', 'storage'),
            card('quality', 'Data quality framework', 'Great Expectations on Bronze; dbt tests on Gold; DLQ with rejection_reason', 'circlecheck', 'user'),
            card('reconcile', 'Reconciliation gate', 'Source billing totals checked before Ofgem submission', 'scale', 'warn'),
          ],
        },
        {
          id: 'delivery', label: 'Infrastructure and releases', pattern: 'network', icon: 'gitbranch', children: [
            card('terraform', 'Terraform', 'Databricks, S3, IAM, Glue, secrets and networking', 'braces', 'network'),
            card('github', 'GitHub Actions', 'Code reviews, deployment approvals, validation and rollback', 'gitbranch', 'network'),
          ],
        },
      ],
    },
  ],
  edges: [],
}
