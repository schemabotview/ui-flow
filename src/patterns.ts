import { Server, Database, Network, Users, Globe, Box, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { PatternKey } from './types'

export interface PatternStyle {
  icon: LucideIcon
  color: string
  bg: string
}

export const PATTERN_ICONS: Record<PatternKey, LucideIcon> = {
  service: Server,
  storage: Database,
  network: Network,
  user: Users,
  external: Globe,
  group: Box,
  warn: TriangleAlert,
}
