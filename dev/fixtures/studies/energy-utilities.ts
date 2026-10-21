import type { Scene, SceneNode } from '../../../src'

type Pattern = SceneNode['pattern']

const card = (id: string, label: string, sub: string, icon: string, pattern: Pattern): SceneNode => ({ id, label, sub, icon, pattern })
const pills = (id: string, label: string, sub: string, icon: string, pattern: Pattern, items: string[]): SceneNode =>
  ({ id, label, sub, icon, pattern, kind: 'list', pills: true, items })
const bullets = (id: string, label: string, icon: string, pattern: Pattern, items: string[]): SceneNode =>
  ({ id, label, icon, pattern, kind: 'list', items })
const column = (id: string, badge: string, label: string, sub: string, pattern: Pattern, children: SceneNode[]): SceneNode =>
  ({ id, badge, label, sub, pattern, icon: 'none', children })

const sources = column('sources', '1', 'Source systems', 'Metering, operations, trading', 'external', [
  card('meter', 'Meter head-end', 'readings / corrections', 'gauge', 'external'),
  card('billing', 'Customer & billing DB', 'accounts / usage / billing', 'database', 'external'),
  card('scada', 'Generation SCADA', 'assets / telemetry', 'zap', 'external'),
  card('trading', 'Energy trading', 'trades / delivery legs', 'barchart', 'external'),
  card('files', 'DB / API / files', 'CSV, JSON, Parquet, APIs', 'file', 'external'),
])

const ingestion = column('ingestion', '2', 'Ingestion', 'Batch & streaming', 'network', [
  pills('batch', 'Databricks Python / PySpark', 'Batch ingestion', 'databricks', 'network', [
    'Full refresh / incremental extracts',
    'Optional CDC (from source systems)',
  ]),
  {
    id: 'streaming', label: 'Streaming ingestion', pattern: 'service', icon: 'none', children: [
      card('publishers', 'Head-end / grid publishers', 'meter and grid events', 'router', 'service'),
      card('kafka', 'Apache Kafka', 'ingest topics', 'kafka', 'service'),
      card('structured', 'Structured Streaming', 'Databricks', 'databricks', 'service'),
      { id: 'stream-checks', label: 'Validate · deduplicate · checkpoint', kind: 'note', pattern: 'service' },
    ],
  },
])

const landing = column('landing', '3', 'Landing & storage', 'S3 + Delta Lake', 'storage', [
  pills('bronze', 'Amazon S3 — Bronze', 'Immutable raw extracts', 's3', 'storage', [
    'Audit fields (source, load time, file hash)',
    'Schema gate / quarantine (invalid / rejected)',
  ]),
  pills('delta', 'Delta Lake on S3', 'Operational stream zone', 'layers', 'storage', [
    'Delta tables',
    'S3 checkpoints (streaming state)',
  ]),
])

const processing = column('processing', '4', 'Processing & curated models', 'Glue + Iceberg', 'service', [
  card('glue', 'AWS Glue', 'PySpark jobs', 'glue', 'service'),
  pills('silver', 'Silver — Apache Iceberg', 'Cleansed, conformed', 'database', 'service', [
    'Cleanse & standardise',
    'Normalise units (apply corrections)',
    'Enrich with reference data',
    'Conform to data model',
  ]),
  pills('gold', 'Gold — Apache Iceberg', 'Business-ready', 'database', 'service', [
    'Energy facts / conformed dimensions',
    'Reconciliation / lineage (auditable)',
  ]),
  { id: 'locations', label: 'Separate Delta / Iceberg locations on S3', kind: 'note', pattern: 'network' },
])

const serving = column('serving', '5', 'Serving', 'Query & access', 'user', [
  pills('athena', 'Amazon Athena', 'Iceberg exploration', 'athena', 'user', ['Serverless SQL', 'Self-service discovery']),
  pills('redshift', 'Redshift + dbt', 'Proposed analytical marts', 'redshift', 'user', [
    'Curated marts (energy, customers, assets)',
    'Transformations with dbt',
  ]),
  pills('dynamo', 'DynamoDB', 'Optional hot lookup', 'dynamodb', 'user', [
    'Real-time lookups (asset / meter cache)',
    'Global, scalable, low-latency',
  ]),
])

const consumption = column('consumption', '6', 'Consumption', 'Business & operations', 'external', [
  bullets('commercial', 'Commercial analytics', 'barchart', 'external', ['Energy sales & margin', 'Customer insights', 'Portfolio & risk']),
  bullets('dashboards', 'Operational dashboards', 'chartpie', 'external', ['Real-time & near real-time', 'Grid operations', 'Asset performance', 'Alerts & KPIs']),
  bullets('regulatory', 'Regulatory reporting', 'file', 'external', ['Statutory submissions', 'Market reporting', 'Emissions & compliance']),
  bullets('reconciled', 'Reconciled outputs', 'usercheck', 'external', ['Settlements & nominations', 'Reconciled datasets', 'Lineage & audit trails']),
])

const pipeline: SceneNode = {
  id: 'pipeline',
  label: 'End-to-end data architecture — Energy & Utilities',
  sub: 'AWS + Databricks + Iceberg + Kafka / Delta',
  pattern: 'group',
  icon: 'none',
  flow: 'LR',
  align: 'start',
  stretch: true,
  children: [sources, ingestion, landing, processing, serving, consumption],
  edges: [
    { source: 'meter', target: 'batch' },
    { source: 'billing', target: 'batch' },
    { source: 'trading', target: 'streaming' },
    { source: 'files', target: 'streaming' },
    { source: 'batch', target: 'bronze' },
    { source: 'streaming', target: 'delta' },
    { source: 'bronze', target: 'glue' },
    { source: 'delta', target: 'silver', label: 'reconcile through batch', dashed: true },
    { source: 'gold', target: 'athena' },
    { source: 'gold', target: 'redshift' },
    { source: 'gold', target: 'dynamo' },
    { source: 'athena', target: 'commercial' },
    { source: 'redshift', target: 'dashboards' },
    { source: 'dynamo', target: 'dashboards' },
    { source: 'publishers', target: 'kafka', dir: 'TB' },
    { source: 'kafka', target: 'structured', dir: 'TB' },
    { source: 'glue', target: 'silver', dir: 'TB' },
    { source: 'silver', target: 'gold', dir: 'TB' },
  ],
}

const dataops: SceneNode = {
  id: 'dataops',
  label: 'DataOps, orchestration & CI/CD',
  pattern: 'user',
  icon: 'none',
  span: 'all',
  flow: 'LR',
  children: [
    card('actions', 'GitHub Actions', 'source control & CI', 'githubactions', 'user'),
    card('terraform', 'Terraform', 'infrastructure as code', 'terraform', 'user'),
    card('mwaa', 'Amazon MWAA', 'orchestration & scheduling', 'airflow', 'user'),
    bullets('rollback', 'Validation & rollback', 'shieldcheck', 'user', ['Data quality checks', 'Automated tests', 'Safe deployment & rollback']),
  ],
  edges: [
    { source: 'actions', target: 'terraform' },
    { source: 'terraform', target: 'mwaa' },
    { source: 'mwaa', target: 'rollback' },
  ],
}

const security: SceneNode = {
  id: 'security',
  label: 'Security, governance & operations',
  pattern: 'storage',
  icon: 'none',
  span: 'all',
  cols: 6,
  children: [
    card('iam', 'AWS IAM', 'identity & access', 'iam', 'storage'),
    card('secrets', 'Secrets Manager', 'credentials & API keys', 'secretsmanager', 'storage'),
    card('network', 'Network controls', 'VPC, PrivateLink, SGs', 'vpc', 'storage'),
    card('kms', 'AWS KMS', 'encryption at rest & in transit', 'kms', 'storage'),
    card('lakeformation', 'Lake Formation', 'data governance & access', 'lakeformation', 'storage'),
    card('monitoring', 'Monitoring', 'CloudWatch, logs & alerts', 'cloudwatch', 'storage'),
  ],
}

export const energyUtilities: Scene = {
  id: 'energy-utilities',
  title: 'Study — Energy & Utilities end-to-end data architecture',
  flow: 'BT',
  framed: true,
  header: 'band',
  nodes: [security, dataops, pipeline],
  edges: [
    { source: 'security', target: 'dataops' },
    ...['sources', 'ingestion', 'landing', 'processing', 'serving', 'consumption'].map((target) => ({ source: 'dataops', target })),
  ],
}
