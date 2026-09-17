// A small registry of named lucide glyphs, so a node can pick a MEANINGFUL non-AWS icon via the same
// `icon` field (e.g. icon: 'terminal' for the CLI) instead of falling back to its pattern's default
// glyph. NodeIcon looks up AWS_ICONS first, then this, then the pattern glyph. Use for things that
// aren't AWS services — the four access surfaces (Console/CLI/SDK/IaC), non-AWS clouds, on-prem, etc.

import {
  Workflow, Box, Cog, MemoryStick, Zap, Brain, Waves, Share2,
  Filter, Copy, Table2,
  Monitor, Terminal, Code2, FileCode2, Cloud, Building2, Braces,
  Cpu, Layers, Globe, Database, Network, Wrench,
  Receipt, Tag, Gauge, BellRing,
  KeyRound, ShieldCheck, UserCheck, ScanFace, ScrollText, GitBranch,
  Ban, CircleCheck, CircleSlash,
  Router, DoorOpen, Server, Boxes,
  Clock, Repeat, Lock, Scale,
  HardDrive, Folder, FileText, Users, Power, Plug, Scissors, Link, Skull,
  Search, Pencil, Sigma, Hash, ArrowUpDown, Regex, Bug,
  BarChart3, ChartPie, Star, Snowflake, CalendarDays, Ruler, History, GitMerge,
  Warehouse, Package, ArrowDownUp, Trash2, ListTree, Fingerprint,
  type LucideIcon,
} from 'lucide-react'

export const LUCIDE_ICONS: Record<string, LucideIcon> = {
  monitor: Monitor, // web console / UI
  terminal: Terminal, // CLI
  code: Code2, // SDK / code
  filecode: FileCode2, // IaC (files)
  cloud: Cloud, // a generic (non-AWS) cloud
  building: Building2, // on-prem / data center
  braces: Braces, // an API / endpoint
  cpu: Cpu, // hardware / compute
  layers: Layers, // host software / stack
  globe: Globe, // global network / requests
  database: Database, // data / storage
  network: Network, // network config
  wrench: Wrench, // patching / maintenance
  receipt: Receipt, // a bill
  tag: Tag, // tagging resources
  gauge: Gauge, // budgets / limits
  bell: BellRing, // billing alarms
  key: KeyRound, // authentication / credentials
  shieldcheck: ShieldCheck, // authorization / permission check
  usercheck: UserCheck, // an authorized/verified principal
  scanface: ScanFace, // identity / who-are-you
  scroll: ScrollText, // a policy document
  gitbranch: GitBranch, // an org / account tree
  ban: Ban, // an explicit Deny
  circlecheck: CircleCheck, // an explicit Allow
  circleslash: CircleSlash, // implicit / default deny (nothing matched)
  router: Router, // a NAT gateway (routed egress)
  dooropen: DoorOpen, // an internet gateway (the VPC's edge door)
  server: Server, // an app / compute tier
  boxes: Boxes, // VPC endpoints / a set of resources
  clock: Clock, // latency / real-time / always-on
  repeat: Repeat, // throughput / high transaction rate
  lock: Lock, // durability / committed-and-permanent
  scale: Scale, // a ledger that must balance

  // ── Spark glyphs (merged in at 0.2.0 from apache-spark's copy) ──
  workflow: Workflow, // a DAG / scheduler (code → stages → tasks)
  box: Box, // an executor (a JVM process)
  gears: Cog, // task slots / cores turning tasks
  memory: MemoryStick, // in-memory cache
  zap: Zap, // the Spark engine (in-memory speed)
  brain: Brain, // an optimizer / planner (Catalyst, the driver planning)
  waves: Waves, // a stream (Structured Streaming)
  share: Share2, // one input fanning out to many (a broadcast join, a merge)
  // ── SQL glyphs (merged in at 0.4.0 from sql's copy) ──
  funnel: Filter, // a filtering / narrowing step (a semi/anti join, a WHERE)
  copy: Copy, // duplication — deduplicate, a broadcast copy
  table: Table2, // a table / tabular result
  // ── Linux glyphs (merged in at 0.5.0) ──
  harddrive: HardDrive, // a physical disk / block device
  folder: Folder, // a directory in the tree
  file: FileText, // a plain file (and, under /dev, a device)
  users: Users, // a user account / login
  power: Power, // power-on, POST, the very first instruction
  plug: Plug, // a device driver attaching to hardware
  scissors: Scissors, // splitting — the shell cutting a line into words
  link: Link, // a link — a second name, or a signpost to one
  skull: Skull, // a dead process — a zombie husk waiting to be reaped
  search: Search, // grep — finding lines
  pencil: Pencil, // sed — rewriting them
  sigma: Sigma, // awk — accumulating across lines
  hash: Hash, // counting / tallying (uniq -c, wc)
  sortarrows: ArrowUpDown, // ordering (sort)
  regex: Regex, // a pattern rather than a fixed string
  bug: Bug, // debugging — bash -x, shellcheck
  // ── Warehousing glyphs (merged in at 0.5.0) ──
  barchart: BarChart3, // a report / an aggregate read — the BI end of the pipeline
  chartpie: ChartPie, // a departmental data mart's dashboard
  star: Star, // the star schema
  snowflake: Snowflake, // the snowflake schema (a normalized dimension)
  calendar: CalendarDays, // the date dimension
  ruler: Ruler, // the GRAIN — what one fact row measures
  history: History, // time-variance / kept history / SCD
  merge: GitMerge, // the SCD-2 merge, a conforming step
  warehouse: Warehouse, // the curated warehouse itself
  package: Package, // a subject area / a packaged subset
  swap: ArrowDownUp, // an overwrite (SCD Type 1) — a value replaced in place
  trash: Trash2, // dropped / lost detail
  tree: ListTree, // a hierarchy inside a dimension (day → month → quarter → year)
  fingerprint: Fingerprint, // a key that identifies one row (natural or surrogate)
}
