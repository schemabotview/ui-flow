// Fixture: a REAL architecture, authored from the EDF Energy / AWS case study in
// ../../projects-workspace/Ganesh_Maddipoti_Interview_PrepGuide.docx (§"Case Study 1 — EDF Energy":
// Architecture Overview, Section A steps 1–10, Section B). Smart metering, generation, trading and
// customer analytics on AWS, built for Ofgem audit.
//
// EVERY TECHNOLOGY NAMED HERE APPEARS IN THAT SECTION OF THE DOCUMENT, and nothing else does.
// Kafka is not identified as MSK in the source, so it is drawn as Apache Kafka.
//
// IT TAKES ITS STRUCTURE FROM `barclays-azure` AND ITS LEAVES FROM `spark-topology`, which is the
// whole point of having it beside both.
//
// The STRUCTURE is barclays': five bands — sources → ingestion → storage & processing → serving →
// consumers — with the platform concerns underneath as strata. In particular STORAGE AND PROCESSING
// ARE ONE BAND, with the medallion as a flow inside the lake and the two processing jobs in a single
// box beneath it. That is not a tidying decision, it is the document's own claim: the batch and
// streaming tracks never share pipeline code, only the storage layer. Drawn as a separate real-time
// row the diagram says the opposite — two pipelines that merely happen to be near each other — and
// the one box under the one lake is what states the shared-storage fact and the separate-code fact
// at the same time. It also puts the streaming job where it belongs relative to Silver and Gold,
// rather than leaving the reader to infer it from a prefix name in a caption.
//
// The LEAVES are spark-topology's: cards for THINGS, chips for the tokens they are configured with,
// and NO `list` nodes anywhere. Almost every fact this document states is a token — a partition key,
// a trigger interval, a topic name, a retention window — and a chip hugs its own text where a
// five-bullet body takes ~3× the width to say the same thing, which sets the band's width, which
// sets the poster's zoom, which is how the leaf type stops being readable.
//
// Built to be read at FULL WINDOW (`?full=1` in the harness).
import type { Scene, SceneNode } from '../../../src'

// A token the thing above it is configured WITH — a key, an interval, a window, a topic name, a
// table. Chips throughout, for the reason at the head of this file.
const chip = (id: string, label: string, pattern: SceneNode['pattern'] = 'storage'): SceneNode =>
  ({ id, label, variant: 'chip', pattern, icon: 'none' })

// ── Band 01 · the feeds (Step 1). The document splits them by LOAD REGIME, not by domain, because
// the regime is the engineering fact: 50M+ daily meter reads cannot be full-loaded inside the
// sub-1-hour ingestion SLA. The two boxes are the regimes; each feed inside stays a plain CARD,
// because a feed is a thing in its own right — a separate extract on its own schedule that an edge
// could legitimately point at — and not a property of the group above it.
const sources: SceneNode = {
  id: 'sources',
  badge: '01',
  label: 'Data sources',
  sub: 'a dozen heterogeneous systems',
  // `external` because that is what they are: systems outside the platform. A band's colour is its
  // ROLE, never its position in the row.
  pattern: 'external',
  icon: 'none',
  align: 'start',
  // The two regimes STACK. Side by side they were shorter, which mattered while this band set the
  // row's height — it no longer does, the three-tier storage band does. What side by side costs is
  // the edges: the left group's right face then sits in the MIDDLE of the band, so its arrow to
  // ingestion sets off across the right-hand group and reads as a line through a box it has nothing
  // to do with. Stacked, both groups present the same right edge and both arrows leave cleanly.
  children: [
    {
      id: 'txn-src',
      label: 'Transactional',
      sub: 'incremental watermark load',
      pattern: 'external',
      icon: 'database',
      children: [
        { id: 'src-meter', label: 'Smart meter reads', sub: 'head-end systems · 50M+ daily', pattern: 'external', icon: 'gauge' },
        { id: 'src-scada', label: 'Generation telemetry', sub: 'SCADA extracts from the assets', pattern: 'external', icon: 'waves' },
        { id: 'src-trading', label: 'Energy trading events', sub: 'trading systems', pattern: 'external', icon: 'receipt' },
        { id: 'src-usage', label: 'Customer consumption', sub: 'consumption records', pattern: 'external', icon: 'barchart' },
      ],
    },
    {
      id: 'ref-src',
      label: 'Reference',
      sub: 'full load, row-count validated',
      pattern: 'external',
      icon: 'tag',
      children: [
        { id: 'src-registry', label: 'Meter asset registry', pattern: 'external', icon: 'tree' },
        { id: 'src-tariff', label: 'Tariff tables', pattern: 'external', icon: 'scale' },
        { id: 'src-asset', label: 'Generation asset master', pattern: 'external', icon: 'building' },
        { id: 'src-billing', label: 'Billing database', sub: 'and its control totals', pattern: 'external', icon: 'file' },
      ],
    },
  ],
}

// ── Band 02 · ingestion (Step 1, and Section B's Kafka configuration). The two MODES are boxes, each
// holding the one technology that implements it: the box is the ingestion mode the architecture has
// either way, the card is what delivers it today. The mode lives on the box rather than on each
// card's `sub`, so nothing is stated twice.
const ingestion: SceneNode = {
  id: 'ingestion',
  badge: '02',
  label: 'Ingestion layer',
  sub: 'batch & streaming',
  pattern: 'network',
  icon: 'none',
  align: 'start',
  children: [
    {
      id: 'batch-in',
      label: 'Batch ingestion',
      pattern: 'network',
      icon: 'clock',
      children: [
        {
          id: 'databricks',
          label: 'AWS Databricks',
          sub: 'Python / PySpark ingestion frameworks, schema enforced at landing',
          pattern: 'service',
          icon: 'databricks',
          cols: 2,
          children: [
            chip('in-full', 'full load: reference', 'service'),
            chip('in-incr', 'incremental: transactional', 'service'),
            chip('in-wm', 'watermark in DynamoDB'),
            chip('in-quar', 'QUARANTINED flags', 'warn'),
            chip('in-part', 'load_date'),
            chip('in-src', 'source_system'),
          ],
        },
      ],
    },
    {
      id: 'rt-in',
      label: 'Real-time ingestion',
      pattern: 'network',
      icon: 'waves',
      children: [
        {
          id: 'kafka',
          label: 'Apache Kafka',
          sub: '3-broker cluster, replication factor 3 — meter readings and grid events',
          pattern: 'service',
          icon: 'network',
          cols: 3,
          children: [
            chip('tp-raw', 'raw', 'network'),
            chip('tp-enriched', 'enriched', 'network'),
            chip('tp-dlq', 'dlq', 'warn'),
            chip('kf-parts', '24 partitions', 'network'),
            chip('kf-rate', '~450K events/hour', 'network'),
            chip('kf-avro', 'Avro · Schema Registry', 'network'),
          ],
        },
      ],
    },
    {
      id: 'in-secrets',
      label: 'AWS Secrets Manager',
      sub: 'every source credential — nothing hardcoded, enforced by a pre-commit scan',
      pattern: 'user',
      icon: 'secretsmanager',
    },
  ],
}

// ── Band 03 · storage AND processing, in ONE band (Steps 2–5, 8 and Section B's stream job). Three
// tiers, stacked: the lake, the gate that stands between its Bronze and its Silver, and the two
// processing jobs as a pair. See the note at the head of this file for why the streaming job lives
// here rather than in a row of its own.
//
// The children STACK — no band-internal edges. The real relationships are a cycle (the lake is read
// by the gate, the gate releases the jobs, the jobs write the lake) and there is no honest way to
// rank three boxes that feed each other; each box's own `sub` states where it sits instead.
const storage: SceneNode = {
  id: 'storage',
  badge: '03',
  label: 'Storage & processing',
  sub: 'medallion architecture on Apache Iceberg',
  pattern: 'storage',
  icon: 'none',
  align: 'start',
  stretch: true,
  children: [
    {
      id: 's3',
      // FRAMED: three zone boxes sit side by side here, and the frame is what keeps one zone's last
      // chip from reading as the next zone's first. The boxes holding a SINGLE card stay unframed —
      // the box already bounds them.
      framed: true,
      label: 'Amazon S3 · Apache Iceberg',
      sub: 'schema evolution, hidden partitioning and time travel — chosen over plain Parquet or Delta for Ofgem audit',
      pattern: 'storage',
      icon: 's3',
      flow: 'LR',
      align: 'start',
      // The zones carry what is STORED and the properties of storing it; the transforms that move
      // data between them belong to the processing box below, and are stated there once.
      children: [
        {
          id: 'bronze',
          label: 'Bronze · raw',
          sub: 'exactly as received, zero transformation — the single replay point',
          pattern: 'storage',
          icon: 's3',
          children: [
            chip('br-audit', 'ingested_at · batch_run_id'),
            chip('br-part', 'load_date / source_system'),
            chip('br-life', '90 days → Glacier'),
          ],
        },
        {
          id: 'silver',
          label: 'Silver · cleansed',
          sub: 'reads Bronze only, so it is safely re-runnable at any time',
          pattern: 'storage',
          icon: 'database',
          children: [
            chip('sv-dedupe', 'deduped meter_id + reading_ts'),
            chip('sv-dlq', 'DLQ + rejection_reason', 'warn'),
            chip('sv-upsert', 'Iceberg upserts'),
          ],
        },
        {
          id: 'gold',
          label: 'Gold · curated',
          sub: 'the complete reconciled picture — both tracks merged',
          pattern: 'storage',
          icon: 'table',
          children: [
            chip('gd-facts', 'FACT_METER_READS'),
            chip('gd-gen', 'FACT_GENERATION_OUTPUT'),
            chip('gd-scd', 'DIM_CUSTOMER is SCD2'),
          ],
        },
      ],
      edges: [
        { source: 'bronze', target: 'silver' },
        { source: 'silver', target: 'gold' },
      ],
    },
    {
      id: 'gate',
      framed: true,
      label: 'Schema evolution gate',
      sub: 'AWS Lambda on an EventBridge rule for S3 PutObject — fires after Bronze lands, and Silver does not start until it passes',
      pattern: 'service',
      icon: 'lambda',
      cols: 2,
      // THE ONE FORK IN THE ARCHITECTURE, and the reason it is two cards rather than one. In this
      // document it is the control the whole result rests on — meter reconciliation failures from
      // 6–8% to under 1% — and a `warn` card beside a `service` card is the engine saying these two
      // outcomes are not peers of one kind, which is exactly the claim: one continues the pipeline,
      // the other stops a source dead until a human clears it.
      children: [
        {
          id: 'additive',
          label: 'Additive change',
          sub: 'a new tariff column — Glue Catalog updated, Iceberg mergeSchema set, pipeline continues',
          pattern: 'service',
          icon: 'circlecheck',
        },
        {
          id: 'breaking',
          label: 'Breaking change',
          sub: 'kWh silently becoming Wh — partition to /quarantine/, flag written, SNS to on-call',
          pattern: 'warn',
          icon: 'ban',
        },
      ],
    },
    // THE TWO JOBS ARE A PAIR, in one box, side by side — the fact belongs to the pair and to
    // neither job alone: separate pipeline code, sharing only the storage layer above them. The box
    // sits directly under the lake in the same band, so that relationship is drawn rather than
    // described, and it is the thing `framed` can hang off for both at once.
    {
      id: 'processing',
      framed: true,
      label: 'Processing',
      sub: 'separate pipeline code; shares only the storage layer',
      pattern: 'service',
      icon: 'databricks',
      cols: 2,
      children: [
        {
          id: 'batch-proc',
          label: 'Batch processing',
          sub: 'AWS Glue PySpark into Silver, then dbt models into Gold',
          pattern: 'service',
          icon: 'glue',
          cols: 2,
          children: [
            chip('bp-ge', 'Great Expectations on Bronze', 'service'),
            chip('bp-utc', 'UTC ISO 8601', 'service'),
            chip('bp-rules', 'tariff map · unit normalise', 'service'),
            chip('bp-derived', 'consumption · utilisation %', 'service'),
            chip('bp-dbt', 'dbt: staging → marts', 'service'),
            chip('bp-tests', '150+ dbt tests', 'service'),
          ],
        },
        {
          id: 'rt-proc',
          label: 'Real-time processing',
          sub: 'Databricks Structured Streaming — PySpark, event-time, reading the enriched topic',
          pattern: 'service',
          icon: 'waves',
          cols: 2,
          children: [
            chip('rp-trigger', '30-second trigger', 'service'),
            chip('rp-wm', '10-minute watermark', 'service'),
            chip('rp-join', 'broadcast asset join', 'service'),
            chip('rp-ckpt', 'S3 checkpoints'),
            chip('rp-delta', 'Delta Lake real-time zone'),
            chip('rp-merge', 'merged by the next batch run'),
          ],
        },
      ],
    },
  ],
}

// ── Band 04 · serving (Steps 7, 10 and Section B's hot path). ONE COLUMN of services, with no
// capability wrapper around each. An earlier pass used barclays' two-level naming here — a box per
// capability ("Analytics & reporting", "Data access") holding the one service that provides it —
// on the argument that the capability survives a change of vendor. At this scale it does not pay
// for itself: every box held exactly one card, so the level added a header and a frame per service
// and said nothing the service's own name did not. Four services stacked in one column is the same
// information with two fewer rectangles, and the band reads as a list of what is served rather than
// as a taxonomy of serving. The consumers band beside it has always been one column for the same
// reason.
const serving: SceneNode = {
  id: 'serving',
  badge: '04',
  label: 'Serving layer',
  sub: 'warehouse · hot path · direct read · submission',
  pattern: 'storage',
  icon: 'none',
  align: 'start',
  children: [
    {
      id: 'redshift',
      label: 'Amazon Redshift',
      sub: 'the Gold star schema, materialised by dbt, for regulatory and commercial analytics',
      pattern: 'storage',
      icon: 'redshift',
      cols: 2,
      children: [
        chip('rs-dims', 'DIM_METER / CUSTOMER / TARIFF / ASSET'),
        chip('rs-sk', 'surrogate keys only'),
        chip('rs-eff', 'eff_start / eff_end / is_current'),
        chip('rs-nojoin', 'no BETWEEN at query time'),
      ],
    },
    {
      id: 'ddb',
      label: 'Amazon DynamoDB',
      sub: 'the streaming hot path for "now" — the point read Redshift is not built for',
      pattern: 'storage',
      icon: 'dynamodb',
      cols: 2,
      children: [
        chip('dd-key', 'PK meter_id · SK reading_ts'),
        chip('dd-ms', 'single-digit ms GetItem'),
        chip('dd-ttl', '90-day TTL'),
      ],
    },
    {
      id: 'athena',
      label: 'Amazon Athena',
      sub: 'Data Science queries the Iceberg tables directly, keeping exploration off the warehouse',
      pattern: 'service',
      icon: 'athena',
    },
    {
      id: 'submission',
      label: 'Ofgem submission task',
      sub: 'a dedicated Airflow task: read Gold, format to the submission structure, reconcile, then submit',
      pattern: 'service',
      icon: 'scroll',
      cols: 2,
      children: [
        chip('sb-control', 'control total from billing', 'service'),
        chip('sb-block', 'variance > 0.01% blocks', 'warn'),
      ],
    },
  ],
}

// ── Band 05 · who reads it (Step 10). A consumer is a reader, not a service: it has nothing to be
// configured with and no parts, so these are plain cards with one line each. A chip row here would
// be the mirror of the mistake the rest of the scene avoids — tokens with nothing to configure.
const consumers: SceneNode = {
  id: 'consumers',
  badge: '05',
  label: 'Business consumers',
  sub: 'regulatory · commercial · operational',
  pattern: 'user',
  icon: 'none',
  align: 'start',
  children: [
    { id: 'c-ofgem', label: 'Ofgem regulatory', sub: 'Same-day, zero errors since go-live', pattern: 'user', icon: 'scroll' },
    { id: 'c-commercial', label: 'Commercial analytics', sub: 'Redshift over JDBC', pattern: 'user', icon: 'barchart' },
    { id: 'c-powerbi', label: 'Power BI', sub: 'Regulatory & commercial reports', pattern: 'user', icon: 'powerbi' },
    { id: 'c-ds', label: 'Data Science', sub: 'Athena over Iceberg tables', pattern: 'user', icon: 'brain' },
    { id: 'c-ops', label: 'Metering operations', sub: 'Grid events in under 2 minutes', pattern: 'user', icon: 'gauge' },
  ],
}

// ── Stratum 06 · Step 6, plus the Action list's Terraform and release-governance paragraph. One line
// each, so: cards, not chips — "Silver execution engine" against "Scheduler · DAGs in Git" IS the
// Glue/Airflow distinction the document spends a whole interview tip on.
const orchestration: SceneNode = {
  id: 'orchestration',
  badge: '06',
  label: 'Orchestration, infrastructure & delivery',
  sub: 'Airflow is the conductor and Glue the orchestra — 99.9% SLA adherence on MWAA DAGs, retries at 10/20/40 min, new environments in under a day',
  pattern: 'network',
  icon: 'workflow',
  cols: 6,
  children: [
    { id: 'o-mwaa', label: 'Airflow on MWAA', sub: 'Scheduler · DAGs in Git', pattern: 'service', icon: 'workflow' },
    { id: 'o-glue', label: 'AWS Glue', sub: 'Silver execution engine', pattern: 'service', icon: 'glue' },
    { id: 'o-dbx', label: 'Databricks jobs', sub: 'Parameterised by the DAG', pattern: 'service', icon: 'databricks' },
    { id: 'o-dbt', label: 'dbt build', sub: 'Gold, only after Silver', pattern: 'service', icon: 'sigma' },
    { id: 'o-tf', label: 'Terraform', sub: 'S3 · IAM · Glue · networking', pattern: 'service', icon: 'braces' },
    { id: 'o-cicd', label: 'GitHub Actions', sub: 'Approvals · rollback ready', pattern: 'service', icon: 'gitbranch' },
  ],
}

// ── Stratum 07 · Step 9's three-layer access model and the retention the regulator requires.
const security: SceneNode = {
  id: 'security',
  badge: '07',
  label: 'Security & data governance',
  sub: 'three access layers — storage, processing, warehouse — with customer PII held apart from the consumption facts it describes',
  pattern: 'user',
  icon: 'shieldcheck',
  cols: 6,
  children: [
    { id: 's-lf', label: 'Lake Formation', sub: 'Column-level grants', pattern: 'user', icon: 'lakeformation' },
    { id: 's-iam', label: 'IAM roles', sub: 'Least privilege per job', pattern: 'user', icon: 'iam' },
    { id: 's-kms', label: 'AWS KMS', sub: 'Customer-managed keys · TLS 1.2+', pattern: 'user', icon: 'kms' },
    { id: 's-sm', label: 'Secrets Manager', sub: 'Every source credential', pattern: 'user', icon: 'secretsmanager' },
    { id: 's-trail', label: 'CloudTrail', sub: '7-year Ofgem retention', pattern: 'user', icon: 'cloudtrail' },
    { id: 's-pii', label: 'PII separation', sub: 'Erasure keeps the facts', pattern: 'user', icon: 'lock' },
  ],
}

// ── Stratum 08 · Step 8. Quality is its own stratum rather than part of governance because the
// document gives it its own GATE: the control-total variance is what blocks a submission outright.
const quality: SceneNode = {
  id: 'quality',
  badge: '08',
  label: 'Data quality & reconciliation',
  sub: 'a suite either side of the transform, and a control-total check standing between Gold and the regulator — variance above 0.01% blocks the submission',
  pattern: 'service',
  icon: 'circlecheck',
  cols: 6,
  children: [
    { id: 'q-ge', label: 'Great Expectations', sub: 'Bronze, before any transform', pattern: 'service', icon: 'circlecheck' },
    { id: 'q-dbt', label: 'dbt tests', sub: 'Gold · 150+ on each build', pattern: 'service', icon: 'sigma' },
    { id: 'q-dlq', label: 'DLQ partitions', sub: 'rejection_reason, never dropped', pattern: 'warn', icon: 'funnel' },
    { id: 'q-recon', label: 'Control totals', sub: 'Variance > 0.01% blocks', pattern: 'warn', icon: 'scale' },
    { id: 'q-quar', label: 'Quarantine & SNS', sub: 'On-call Slack, then pager', pattern: 'warn', icon: 'bell' },
    { id: 'q-tt', label: 'Iceberg time travel', sub: 'Prove the dataset as at a date', pattern: 'storage', icon: 'history' },
  ],
}

export const edfAwsClaude: Scene = {
  id: 'edf-aws-claude',
  title: 'Case study — EDF Energy · AWS smart metering & regulatory lakehouse',
  // NO scene-level edges: the four top-level nodes are strata, not a flow, so they STACK rather than
  // being ranked 90px apart with arrows between them.
  padding: 0.05,
  nodes: [
    {
      id: 'layers',
      label: 'End-to-end data architecture — batch & real-time',
      sub: 'energy · AWS · Ofgem-auditable, reconciled, same-day',
      pattern: 'group',
      icon: 'awscloud',
      flow: 'LR',
      // The five bands are a GRID, not a procession of boxes on a midline. `align: 'start'` rules
      // them to one top edge and `stretch` runs them to one bottom edge.
      align: 'start',
      stretch: true,
      children: [sources, ingestion, storage, serving, consumers],
      // Orthogonal, and anchored at the BOXES the flow actually joins rather than at the bands.
      // Layout is unaffected — every endpoint remaps to the band that owns it, so the five columns
      // rank exactly as they would otherwise — but the drawn arrows land where the architecture puts
      // them: both load regimes meet in the one batch framework, batch lands in the lake while the
      // stream goes straight to the stream job, and the lake is what both the warehouse and the
      // direct readers read. Band to band those facts collapse into one arrow saying "then".
      edges: [
        { source: 'txn-src', target: 'batch-in', route: 'step' },
        { source: 'ref-src', target: 'batch-in', route: 'step' },
        { source: 'txn-src', target: 'rt-in', route: 'step' },
        { source: 'batch-in', target: 's3', route: 'step' },
        // Anchored at the PROCESSING BOX, not at `rt-proc` inside it — the one place this scene
        // cannot afford barclays' deep-endpoint precision. The streaming job is the RIGHT-hand child
        // of the third tier of the band, so a step route to it leaves the left edge, runs along at
        // the source's own height and then drops at the job's x — which here is a vertical straight
        // through the "Additive change" card and then through "Batch processing" below it. Aimed at
        // the box, the drop happens at its left face and crosses nothing but container padding. The
        // box's own sub already says which of the two jobs is the streaming one.
        { source: 'rt-in', target: 'processing', route: 'step' },
        { source: 's3', target: 'redshift', route: 'step' },
        { source: 's3', target: 'athena', route: 'step' },
        { source: 'rt-proc', target: 'ddb', route: 'step' },
        { source: 'serving', target: 'consumers', route: 'step' },
      ],
    },
    orchestration,
    security,
    quality,
  ],
  edges: [],
}
