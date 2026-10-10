import type { PatternKey } from './types'
import { PATTERN_ICONS, type PatternStyle } from './patterns'

export type ThemeKey = 'dark' | 'light'

export interface ThemePattern {
  color: string
  bg: string
}

export interface Theme {
  key: ThemeKey
  label: string
  surface: string
  dots: string
  ink: string
  inkMuted: string
  inkNote: string
  inkFaint: string
  patterns: Record<PatternKey, ThemePattern>
  edge: { stroke: string; pulse: string; labelBg: string; labelBorder: string; labelInk: string }
  code: { bg: string; chrome: string; chromeBorder: string; border: string; borderFocus: string; gutter: string; filename: string; ink: string }
  plot: { surface: string; grid: string; axis: string; tick: string; ink: string; series: readonly string[] }
}

const ramp = (p: Record<PatternKey, ThemePattern>) => [p.network.color, p.service.color, p.user.color, p.storage.color] as const

const DARK_PATTERNS: Record<PatternKey, ThemePattern> = {
  service: { color: '#f0902f', bg: '#241c12' },
  storage: { color: '#37b877', bg: '#122419' },
  network: { color: '#4f8ff7', bg: '#111d2e' },
  user: { color: '#c98bff', bg: '#1e1428' },
  external: { color: '#9aa4b2', bg: '#181b20' },
  group: { color: '#9aa4b2', bg: 'transparent' },
  warn: { color: '#f0656f', bg: '#2a1416' },
}

const LIGHT_PATTERNS: Record<PatternKey, ThemePattern> = {
  service: { color: '#b4610f', bg: '#fdf1e4' },
  storage: { color: '#177a4a', bg: '#e7f7ee' },
  network: { color: '#1f5fc4', bg: '#e8effc' },
  user: { color: '#7b3fbf', bg: '#f3eafd' },
  external: { color: '#5a6675', bg: '#eef1f5' },
  group: { color: '#6b7686', bg: 'transparent' },
  warn: { color: '#c0303c', bg: '#fdeaec' },
}

export const THEMES: Record<ThemeKey, Theme> = {
  dark: {
    key: 'dark',
    label: 'Dark (default)',
    surface: '#1a1d23',
    dots: '#2a2f38',
    ink: '#eef2f8',
    inkMuted: '#9aa4b2',
    inkNote: '#8b95a7',
    inkFaint: '#6b7686',
    patterns: DARK_PATTERNS,
    edge: { stroke: '#5b6675', pulse: '#7dd3fc', labelBg: '#1a1d23', labelBorder: '#2a2f38', labelInk: '#9aa4b2' },
    code: { bg: '#0e1420', chrome: '#131b29', chromeBorder: '#202836', border: '#232a36', borderFocus: '#3b475c', gutter: '#454f60', filename: '#7f8a9c', ink: '#eceef2' },
    plot: { surface: '#15181d', grid: '#272c34', axis: '#6b7686', tick: '#78828f', ink: '#eef2f8', series: ramp(DARK_PATTERNS) },
  },
  light: {
    key: 'light',
    label: 'Light',
    surface: '#f7f8fa',
    dots: '#d8dde5',
    ink: '#1a1d23',
    inkMuted: '#5a6675',
    inkNote: '#78838f',
    inkFaint: '#8b95a7',
    patterns: LIGHT_PATTERNS,
    edge: { stroke: '#97a1b0', pulse: '#2f7fd0', labelBg: '#f7f8fa', labelBorder: '#d8dde5', labelInk: '#5a6675' },
    code: { bg: '#11161f', chrome: '#1a2130', chromeBorder: '#222a3a', border: '#2a3242', borderFocus: '#4a5a75', gutter: '#4d5667', filename: '#8b95a7', ink: '#eceef2' },
    plot: { surface: '#ffffff', grid: '#e4e8ee', axis: '#5a6675', tick: '#5a6675', ink: '#1a1d23', series: ramp(LIGHT_PATTERNS) },
  },
}

export const patternOf = (theme: Theme, key: PatternKey | undefined, fallback: PatternKey = 'service'): PatternStyle => {
  const k = key && theme.patterns[key] ? key : fallback
  return { icon: PATTERN_ICONS[k], ...theme.patterns[k] }
}
