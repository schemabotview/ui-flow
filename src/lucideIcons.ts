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
}
