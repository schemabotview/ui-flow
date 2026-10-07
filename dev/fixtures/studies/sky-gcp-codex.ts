// Case Study 3 in Ganesh_Maddipoti_Interview_PrepGuide.pdf.
// Composition follows edf-aws-codex: five nested bands, cards and chips,
// batch and supplementary streaming processing, then shared platform controls.
// The guide gives BigQuery -> dbt/Snowflake lineage without a transfer mechanism.
// GCP services use supported Lucide glyphs rather than vendor icon fallbacks.
import type { Scene, SceneNode } from '../../../src'

const card = (id: string, label: string, sub: string, icon: string,
  pattern: SceneNode['pattern'] = 'service'): SceneNode => ({ id, label, sub, icon, pattern })
const chip = (id: string, label: string, pattern: SceneNode['pattern'] = 'storage'): SceneNode =>
  ({ id, label, variant: 'chip', pattern, icon: 'none' })
const band = (id: string, badge: string, label: string, pattern: SceneNode['pattern'],
  children: SceneNode[], sub?: string): SceneNode =>
  ({ id, badge, label, sub, pattern, icon: 'none', align: 'start', children })

const sources = band('sources', '01', 'Data sources', 'external', [
  card('subscriber', 'Subscriber activity', 'RDBMS extracts and activity feeds', 'users', 'external'),
  card('viewership', 'Content viewership', 'Streaming session logs', 'monitor', 'external'),
  card('usage', 'Broadband usage', 'Transactional usage records', 'router', 'external'),
  card('billing', 'Billing exports', 'Subscriber and revenue control totals', 'receipt', 'external'),
  card('telemetry', 'Network / subscriber events', 'Broadband CPE telemetry and streaming sessions', 'waves', 'external'),
  card('reference', 'Reference data', 'Content catalogue and package / tariff tables', 'tag', 'external'),
])
const ingestion = band('ingestion', '02', 'Ingestion', 'network', [
  {
    id: 'jdbc', label: 'Python JDBC / Dataproc', sub: 'Batch ingestion - PySpark and Scala Spark',
    pattern: 'service', icon: 'plug', children: [
      card('full', 'Full refresh', 'Reference data and catalogue extracts', 'repeat'),
      card('incremental', 'Watermark incremental', 'Transactional viewership and usage records', 'clock'),
    ],
  },
  {
    id: 'pubsub', label: 'Google Cloud Pub/Sub', sub: 'Supplementary real-time network event delivery',
    pattern: 'network', icon: 'network', children: [
      chip('topics', 'raw / enriched / dlq', 'network'),
      chip('volume', '~500K events/hour (~139 msgs/sec)', 'network'),
      chip('subscriptions', 'One subscription per consumer', 'network'),
    ],
  },
  card('metadata', 'BigQuery metadata control', 'Watermarks, expected schemas and QUARANTINED flags', 'database', 'storage'),
  card('secrets', 'GCP Secret Manager', 'Credentials for Dataproc jobs and Composer connections', 'key', 'user'),
])
const lake = band('lake', '03', 'Storage & processing', 'storage', [
  {
    id: 'gcs', label: 'Google Cloud Storage',
    sub: 'Shared bucket; separate raw, curated and real-time zones',
    pattern: 'storage', icon: 'cloud', flow: 'LR', align: 'start', stretch: true, children: [
      {
        id: 'raw', label: 'Bronze - raw', sub: 'Append-only Parquet (Snappy)',
        pattern: 'storage', icon: 'folder', children: [
          chip('raw-partitions', 'year / month / day / source_system'),
          chip('raw-audit', 'ingested_at / source_system / batch_run_id'),
          chip('raw-quality', 'Great Expectations before Silver', 'service'),
          chip('raw-lifecycle', '30d Nearline / 90d Coldline / 365d Archive'),
        ],
      },
      {
        id: 'curated', label: 'Silver - curated', sub: 'Validated and reconciled Parquet',
        pattern: 'storage', icon: 'database', children: [
          chip('curated-dedupe', 'subscriber_id + event_ts'),
          chip('curated-mapping', 'Types and package / tariff mapping'),
          chip('curated-metrics', 'Daily watch-time / usage percentiles'),
          chip('curated-dlq', 'DLQ with rejection_reason', 'warn'),
        ],
      },
      {
        id: 'realtime', label: 'Real-time zone', sub: 'Permanent streaming event record',
        pattern: 'storage', icon: 'folder', children: [
          chip('realtime-record', 'Network and session events'),
          chip('realtime-merge', 'Read with raw zone in next daily batch'),
          chip('realtime-dedupe', 'node_id + event_ts'),
          chip('realtime-path', 'Silver -> BigQuery -> Snowflake'),
        ],
      },
    ],
  },
  {
    id: 'processing', label: 'Processing',
    sub: 'Separate batch and streaming code; shares only the storage layer',
    pattern: 'service', icon: 'braces', cols: 1, align: 'start', stretch: true, children: [
      {
        id: 'batch-proc', label: 'Batch processing', sub: 'Raw landing -> schema gate -> Dataproc Silver -> BigQuery -> dbt',
        pattern: 'service', icon: 'zap', cols: 3, align: 'start', children: [
          card('schema', 'Cloud Function schema gate', 'GCS event via Pub/Sub; additive changes update metadata; breaking changes quarantine and alert', 'braces'),
          card('dataproc', 'Dataproc - Scala / PySpark', 'Cleanse, enrich and reconcile; custom subscriber Partitioner reduces shuffle', 'zap'),
          card('dbt', 'dbt business models', 'Snowflake staging -> intermediate -> marts; incremental models and SCD snapshots', 'layers'),
        ],
      },
      {
        id: 'stream', label: 'Streaming processing', sub: 'Dataproc Structured Streaming reads enriched Pub/Sub events',
        pattern: 'service', icon: 'waves', cols: 3, align: 'start', children: [
          card('eventtime', 'Event time and recovery', '60-second trigger; 10-minute watermark; GCS checkpoints', 'clock'),
          card('enrichment', 'Cell / node enrichment', 'Broadcast reference join; rolling event counts for anomaly flags', 'layers'),
          card('stream-sinks', 'Parallel streaming sinks', 'Permanent GCS real-time record and Bigtable operational hot path', 'share'),
        ],
      },
    ],
  },
])
lake.stretch = true
lake.edges = [
  // Keep zone connections at this level so GCS retains its three-column LR
  // composition rather than ranking raw and real-time together before Silver.
  { source: 'raw', target: 'curated', route: 'step', dir: 'LR' },
  { source: 'realtime', target: 'curated', route: 'step', dashed: true, dir: 'RL' },
  { source: 'raw', target: 'schema', route: 'step', dir: 'TB', dashed: true },
  { source: 'dataproc', target: 'curated', route: 'step', dir: 'BT' },
  { source: 'stream-sinks', target: 'realtime', route: 'step', dir: 'BT' },
]
const serving = band('serving', '04', 'Serving', 'storage', [
  {
    id: 'bigquery', label: 'Google BigQuery', sub: 'Intermediate analytics -> dbt / Snowflake',
    pattern: 'storage', icon: 'warehouse', children: [
      chip('bq-layout', 'Partitioned and clustered datasets'),
      chip('bq-views', 'Materialised views for heavy aggregates'),
    ],
  },
  {
    id: 'snowflake', label: 'Snowflake', sub: 'Gold subscriber, billing and content marts',
    pattern: 'storage', icon: 'snowflake', children: [
      card('facts', 'Viewership and usage facts', 'FACT_VIEWERSHIP; FACT_USAGE_DAILY at one subscriber per day', 'table', 'storage'),
      card('dimensions', 'Subscriber SCD Type 2', 'Content, package and date dimensions; surrogate keys active at event time', 'history', 'storage'),
    ],
  },
  card('bigtable', 'Google Bigtable', 'Sub-10ms reads; node_id + timestamp; network_signals / velocity; per-cell TTL', 'database', 'storage'),
  card('looker', 'Looker', 'Self-service reporting over Snowflake Gold marts', 'barchart', 'user'),
  card('capacity-export', 'BigQuery scheduled export', 'Network capacity and NOC-facing batch reporting', 'gauge'),
])
const consumers = band('consumers', '05', 'Business users', 'user', [
  card('noc', 'NOC operations', 'Bigtable dashboard reads; network detection target about 90 seconds', 'monitor', 'user'),
  card('product', 'Product & marketing', 'Subscriber, content performance and churn analytics', 'chartpie', 'user'),
  card('analysts', 'Analytics team', 'Direct SQL exploration over Snowflake marts', 'search', 'user'),
  card('capacity', 'Network capacity teams', 'Scheduled BigQuery exports for capacity reporting', 'gauge', 'user'),
])

export const skyGcpCodex: Scene = {
  id: 'sky-gcp-codex', title: 'sky-gcp-codex - Sky GCP data platform', padding: 0.04,
  nodes: [
    {
      id: 'architecture', label: 'Case study 3 - Sky (GCP)',
      sub: 'Subscriber, content and broadband analytics - primary batch and supplementary streaming architecture',
      pattern: 'group', icon: 'cloud', flow: 'LR', align: 'start', stretch: true,
      children: [sources, ingestion, lake, serving, consumers],
      edges: [
        { source: 'subscriber', target: 'jdbc', route: 'step' },
        { source: 'telemetry', target: 'pubsub', route: 'step' },
        { source: 'jdbc', target: 'raw', route: 'step' },
        { source: 'pubsub', target: 'stream', route: 'step' },
        { source: 'curated', target: 'bigquery', route: 'step' },
        { source: 'stream', target: 'bigtable', route: 'step' },
        { source: 'snowflake', target: 'product', route: 'step' },
        { source: 'snowflake', target: 'analysts', route: 'step' },
        { source: 'bigtable', target: 'noc', route: 'step' },
        { source: 'capacity-export', target: 'capacity', route: 'step' },
      ],
    },
    {
      id: 'foundation', label: 'Shared platform controls', icon: 'none', pattern: 'group', cols: 3,
      align: 'start', stretch: true, children: [
        {
          id: 'orchestration', label: 'Orchestration and monitoring', pattern: 'network', icon: 'workflow', children: [
            card('composer', 'Cloud Composer - Airflow', 'Sequences ingestion, schema checks, Dataproc, BigQuery and dbt; integrates Dataflow', 'workflow'),
            card('alerts', 'Retries and SLA alerts', '3 retries with exponential back-off; DLQ thresholds and Slack alerts', 'bell', 'warn'),
            card('quality', 'Data quality and observability', 'Great Expectations; dbt tests and freshness; Cloud Monitoring and Cloud Logging', 'circlecheck'),
          ],
        },
        {
          id: 'governance', badge: '07', label: 'Security and governance', pattern: 'user', icon: 'shieldcheck', cols: 2, children: [
            card('iam', 'GCP IAM / Policy Tags', 'Scoped Dataproc service accounts; BigQuery column security and Data Catalog', 'shieldcheck', 'user'),
            card('kms', 'Cloud KMS', 'CMEK encryption at rest and TLS 1.2+ in transit', 'lock', 'user'),
            card('audit', 'Cloud Audit Logs', 'Access history retained for 7 years', 'scroll', 'user'),
            card('pii', 'Cloud DLP / PII erasure', 'Classify PII; separate anonymised-key PII table supports erasure', 'scanface', 'user'),
            card('rbac', 'Snowflake RBAC', 'Roles, grants and column masking policies protect subscriber PII', 'key', 'user'),
            card('reconcile', 'Gold reconciliation gate', 'Subscriber counts and revenue checked against billing control totals', 'circlecheck', 'user'),
          ],
        },
        {
          id: 'delivery', label: 'Performance and releases', pattern: 'network', icon: 'gitbranch', children: [
            card('tuning', 'Dataproc workload tuning', 'Partitioning, pushdown, connector and executor tuning; skew handling; about 45% faster batch runs', 'gears'),
            card('github', 'GitHub Actions', 'CI/CD for versioned dbt models, macros and source definitions', 'gitbranch', 'network'),
            card('cloning', 'Snowflake environments', 'Zero-copy dev/test cloning; streams, tasks, clustering and time travel', 'copy', 'storage'),
          ],
        },
      ],
    },
  ],
  edges: [],
}
