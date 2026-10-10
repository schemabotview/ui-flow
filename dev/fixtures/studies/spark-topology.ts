import type { Scene, SceneNode } from '../../../src'

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
      align: 'start',
      stretch: true,
      children: [sources, driver, workers, cluster],
      edges: [
        { source: 'sources', target: 'driver', route: 'step' },
        { source: 'driver', target: 'workers', label: 'tasks', route: 'step' },
        { source: 'workers', target: 'cluster', label: 'resources', route: 'step' },
        { source: 'w1-exec', target: 'drv-tasks', route: 'step', dashed: true, dir: 'RL' },
      ],
    },
    storage,
    outputs,
  ],
  align: 'start',
  stretch: true,
  edges: [
    { source: 'driver', target: 'storage-band', label: 'read source partitions', route: 'step' },
    { source: 'workers', target: 'storage-band', label: 'read / write', route: 'step', bidirectional: true },
    { source: 'workers', target: 'outputs', label: 'results', route: 'step' },
  ],
}
