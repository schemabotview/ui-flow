// Patterns map a node's semantic role → its visual identity (icon + accent + fill). Content authors
// pick a PatternKey; the engine owns how each looks, so every scene across every course renders in
// one consistent visual language.

import { Server, Database, Network, Users, Globe, Box, type LucideIcon } from 'lucide-react'
import type { PatternKey } from './types'

export interface PatternStyle {
  icon: LucideIcon
  color: string // accent: border + icon
  bg: string // node fill
}

export const PATTERNS: Record<PatternKey, PatternStyle> = {
  service: { icon: Server, color: '#f0902f', bg: '#241c12' },
  storage: { icon: Database, color: '#37b877', bg: '#122419' },
  network: { icon: Network, color: '#4f8ff7', bg: '#111d2e' },
  user: { icon: Users, color: '#c98bff', bg: '#1e1428' },
  external: { icon: Globe, color: '#9aa4b2', bg: '#181b20' },
  group: { icon: Box, color: '#9aa4b2', bg: 'transparent' },
}
