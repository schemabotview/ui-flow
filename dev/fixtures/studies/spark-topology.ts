// Fixture: the Apache Spark runtime topology, at the size a real architecture poster is.
//
// WHAT THIS STUDY IS FOR, next to barclays-azure. That one varies SCALE — 30+ nodes, three nesting
// levels, a five-band row. This one varies the SHAPE of the composition: two bands rows rather than
// one, a repeated unit (two identical worker nodes, three levels deep), a leaf that is a counted
// token rather than a described thing, and a channel that runs AGAINST the flow. Between them they
// cover what the 0.10.0 capabilities are actually for; a fixture that only ever draws one row would
// have let `align`/`stretch` ship as an untested claim about the second.
//
// IT IS THE BACK-EDGE CASE. `workers → driver` is how Spark really works — executors heartbeat task
// status back to the driver that scheduled them — and it is also the edge that broke the layering
// before `depthOf` learned to draw a back edge without ranking it: relaxed like any other, it pushed
// the driver from layer 1 to layer 3 and sat it beside the cluster manager. Drawn `dashed`, it reads
// as what it is: an annotation on the flow, not a stage of it.
//
// EVERY CLAIM HERE IS PLAIN SPARK — one driver per application, executors as JVM processes holding
// cache and local disk, the cluster manager allocating resources independently of task scheduling.
// Nothing is specific to a vendor or a version.
//
// Built to be read at FULL WINDOW (`?full=1` in the harness).
import type { Scene, SceneNode } from '../../../src'

// ── Band 01 · what Spark reads. These are systems OUTSIDE the application, which is what `external`
// would normally mean — but every one of them is a store, and `storage` is the honest role for a
// thing that holds data at rest. The band's colour is its role, never its position in the row.
const sources: SceneNode = {
  id: 'sources',
  badge: '01',
  label: 'Data sources',
  sub: 'data lives outside the application',
  pattern: 'storage',
  icon: 'none',
  align: 'start',
  children: [
    { id: 'src-files', label: 'Files & tables', sub: 'Parquet, object storage, HDFS', pattern: 'storage', icon: 'database' },
    { id: 'src-jdbc', label: 'Relational sources', sub: 'JDBC readers for external databases', pattern: 'storage', icon: 'table' },
    { id: 'src-stream', label: 'Event streams', sub: 'Kafka and other supported sources', pattern: 'storage', icon: 'waves' },
  ],
}

// ── Band 02 · the control plane. `network` because the driver COORDINATES — it holds no data and
// runs no user code over partitions; it plans, schedules and tracks.
const driver: SceneNode = {
  id: 'driver',
  badge: '02',
  label: 'Driver · control plane',
  sub: 'one driver per application',
  pattern: 'network',
  icon: 'none',
  align: 'start',
  children: [
    { id: 'drv-session', label: 'SparkSession', sub: 'your application enters Spark here', pattern: 'network', icon: 'code' },
    { id: 'drv-plan', label: 'Planning & scheduling', sub: 'builds and optimises the execution plan', pattern: 'network', icon: 'brain' },
    { id: 'drv-tasks', label: 'Task scheduling', sub: 'stages, task assignment and progress', pattern: 'network', icon: 'workflow' },
  ],
}

// One worker, built twice. A repeated unit is the shape a cluster diagram always has, and writing it
// as a function rather than twice by hand is what keeps the two identical — the point of drawing two
// is that they ARE the same, and a pair that drifted by a bullet would be saying the opposite.
//
// The TASKS are chips: four of them, and what the reader has to take from the row is that there are
// four, read without counting words. Cache and local disk are chips too — not because they are
// counted, but because at this depth they are tokens the executor HOLDS, and a 300px prose card
// inside a box three levels down would set the width of the whole poster.
const workerNode = (n: number): SceneNode => ({
  id: `w${n}`,
  label: `Worker node ${n}`,
  sub: 'tasks process partitions; executors exchange shuffle data',
  pattern: 'storage',
  icon: 'server',
  children: [
    {
      id: `w${n}-exec`,
      label: 'Executor · JVM process',
      pattern: 'storage',
      icon: 'cpu',
      cols: 4,
      align: 'start',
      children: [
        { id: `w${n}-t1`, label: 'Task 1', variant: 'chip', pattern: 'network', icon: 'none' },
        { id: `w${n}-t2`, label: 'Task 2', variant: 'chip', pattern: 'network', icon: 'none' },
        { id: `w${n}-t3`, label: 'Task 3', variant: 'chip', pattern: 'network', icon: 'none' },
        { id: `w${n}-t4`, label: 'Task 4', variant: 'chip', pattern: 'network', icon: 'none' },
        { id: `w${n}-cache`, label: 'Cache / memory', variant: 'chip', pattern: 'storage', icon: 'memory' },
        { id: `w${n}-disk`, label: 'Local disk', variant: 'chip', pattern: 'storage', icon: 'harddrive' },
      ],
    },
  ],
})

// ── Band 03 · where user code actually runs. `service` — this is the compute.
const workers: SceneNode = {
  id: 'workers',
  badge: '03',
  label: 'Worker nodes',
  sub: 'each executor runs tasks in its own JVM',
  pattern: 'service',
  icon: 'none',
  align: 'start',
  stretch: true,
  children: [workerNode(1), workerNode(2)],
}

// ── Band 04 · the resource managers. `user` — a cluster manager is the party Spark ASKS, and the
// band reads as "someone else owns this" against the three that Spark itself is.
const cluster: SceneNode = {
  id: 'cluster',
  badge: '04',
  label: 'Cluster resources',
  sub: 'resource allocation is separate from task scheduling',
  pattern: 'user',
  icon: 'none',
  align: 'start',
  children: [
    { id: 'cm-standalone', label: 'Standalone', sub: "Spark's own cluster resource manager", pattern: 'user', icon: 'server' },
    { id: 'cm-yarn', label: 'YARN', sub: 'Hadoop resource management', pattern: 'user', icon: 'network' },
    { id: 'cm-k8s', label: 'Kubernetes', sub: 'pod-based driver and executor deployment', pattern: 'user', icon: 'boxes' },
  ],
}

// ── The lower row. Tiles, not cards: these are NAMED SYSTEMS the reader recognises by their shape,
// with nothing to say about each beyond what it is — which is the one case an icon over a label beats
// a line of prose. A `sub` on any of them would be padding.
const storage: SceneNode = {
  id: 'storage-band',
  label: 'Storage · read & write',
  sub: 'inputs, outputs and durable tables',
  pattern: 'storage',
  icon: 'database',
  cols: 4,
  children: [
    { id: 'st-hdfs', label: 'HDFS', variant: 'tile', pattern: 'storage', icon: 'harddrive' },
    { id: 'st-s3', label: 'Amazon S3', variant: 'tile', pattern: 'storage', icon: 's3' },
    { id: 'st-adls', label: 'Azure data lake', variant: 'tile', pattern: 'storage', icon: 'adls' },
    { id: 'st-formats', label: 'Table formats', variant: 'tile', pattern: 'storage', icon: 'layers' },
  ],
}

const outputs: SceneNode = {
  id: 'outputs',
  label: 'Outputs & consumers',
  sub: 'keep large results distributed',
  pattern: 'user',
  icon: 'users',
  cols: 3,
  children: [
    { id: 'out-tables', label: 'Tables / files', variant: 'tile', pattern: 'user', icon: 'table' },
    { id: 'out-analytics', label: 'Analytics', variant: 'tile', pattern: 'user', icon: 'chartpie' },
    { id: 'out-apps', label: 'Applications', variant: 'tile', pattern: 'user', icon: 'code' },
  ],
}

export const sparkTopology: Scene = {
  id: 'spark-topology',
  title: 'Study — Apache Spark runtime topology',
  padding: 0.05,
  nodes: [
    {
      id: 'runtime',
      label: 'The Spark runtime',
      sub: 'one application, four moving parts',
      pattern: 'group',
      icon: 'none',
      flow: 'LR',
      // Four bands ruled to one top edge and run to one bottom edge — the grid the reference draws.
      align: 'start',
      stretch: true,
      children: [sources, driver, workers, cluster],
      edges: [
        { source: 'sources', target: 'driver', route: 'step' },
        { source: 'driver', target: 'workers', label: 'tasks', route: 'step' },
        { source: 'workers', target: 'cluster', label: 'resources', route: 'step' },
        // THE BACK EDGE, anchored at its REAL endpoints rather than at the two bands. Layout remaps
        // it to `workers → driver` either way — and then declines to rank it, see depthOf — but what
        // gets DRAWN is the executor reporting to the scheduler that dispatched it, which is both the
        // more precise claim and the only one that renders. Band to band it would leave and enter the
        // same two faces as `tasks` and the two lines would coincide exactly, one hidden under the
        // other: two edges between one pair of faces is the shape this engine cannot yet separate.
        // No label — `tasks` already holds the midpoint of that gap, and the dash is what names this.
        { source: 'w1-exec', target: 'drv-tasks', route: 'step', dashed: true, dir: 'RL' },
      ],
    },
    storage,
    outputs,
  ],
  // The lower bands are NOT wrapped in a row container. They do not need one: they are the second
  // layer of the scene's own TB flow, so `align`/`stretch` at scene level rules them to one top and
  // one bottom exactly as the row container would — and a wrapper that exists only to hold a flow
  // direction would draw a box the architecture does not have. The upper row still needs `runtime`,
  // because its bands run LR and a scene has one flow direction.
  align: 'start',
  stretch: true,
  // The two rows are strata, so the cross-row edges carry their real deep endpoints and the layout
  // ranks the ROWS. Step-routed: between a band in the top row and one in the bottom a bezier would
  // sweep diagonally across everything between them.
  edges: [
    { source: 'driver', target: 'storage-band', label: 'read source partitions', route: 'step' },
    { source: 'workers', target: 'storage-band', label: 'read / write', route: 'step', bidirectional: true },
    { source: 'workers', target: 'outputs', label: 'results', route: 'step' },
  ],
}
