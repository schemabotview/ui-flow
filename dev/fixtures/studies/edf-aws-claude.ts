import type { Scene, SceneNode } from '../../../src'

const card = (id: string, label: string, sub: string, icon: string,
  pattern: SceneNode['pattern'] = 'service'): SceneNode => ({ id, label, sub, icon, pattern })
const chip = (id: string, label: string, pattern: SceneNode['pattern'] = 'storage'): SceneNode =>
  ({ id, label, variant: 'chip', pattern, icon: 'none' })
const band = (id: string, badge: string, label: string, pattern: SceneNode['pattern'],
  children: SceneNode[], sub?: string): SceneNode =>
  ({ id, badge, label, sub, pattern, icon: 'none', align: 'start', children })

const sources = band('sources', '01', 'Data sources', 'external', [
  card('meters', 'Smart metering', 'Meter reads from the head-end systems; 50M+ daily, incremental', 'gauge', 'external'),
  card('assets', 'Generation assets', 'SCADA extracts and asset telemetry', 'zap', 'external'),
  card('trading', 'Energy trading', 'Trading events from the trading systems', 'chartpie', 'external'),
  card('billing', 'Customer and billing', 'Billing records, consumption and the source control totals', 'users', 'external'),
  card('events', 'Meter / grid events', 'Continuous telemetry for the streaming path', 'waves', 'external'),
  card('reference', 'Reference systems', 'Meter registry, tariffs and asset master; full load, row-count validated', 'database', 'external'),
], 'full load (reference) · incremental watermark (transactional)')

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
