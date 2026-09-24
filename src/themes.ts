// Themes: the surface a scene is painted on, the ink written on it, and the furniture in between.
//
// WHAT A THEME MAY AND MAY NOT CHANGE — the line that keeps this from becoming per-repo theming,
// which was tried and dropped at 0.2.0:
//
//   IT OWNS   the surface (canvas, dot grid), every ink (primary/muted/faint), the edge stroke and
//             its label pill, the code card's chrome, the plot's gutters and grid, and the exact
//             SHADE of each role's accent + fill.
//   IT MAY NOT change what a role MEANS. `service` is warm, `storage` is green, `network` is blue,
//             `user` is violet, `warn` is red — in every theme. A vendor theme shifts an accent
//             WITHIN its hue family (AWS pulls `service` to Smile Orange, Azure pulls `network` to
//             Azure Blue); it never swaps families. A green box means storage in every deck, which is
//             the invariant apache-spark's brand-orange `service` override broke and lost.
//
// So "the AWS theme" is a surface and an ink, not a re-labelling of the palette. That is also what
// makes the themes comparable: switch theme on any fixture and only the room changes, not the
// furniture's identity.
//
// EVERY COLOUR HERE IS 6-DIGIT HEX, without exception. The renderers build translucent variants by
// string concatenation (`${p.color}0f`, `${p.color}33`) in 14 places; a CSS variable or an rgba()
// cannot be substituted into those without reworking all of them. A theme is therefore a second
// resolved TABLE, not a token indirection — which is also the honest shape, because a light theme's
// fills cannot be derived from a dark theme's by alpha anyway. They have to be picked.

import type { PatternKey } from './types'
import { PATTERNS, type PatternStyle } from './patterns'

export type ThemeKey = 'dark' | 'light'

// VENDOR THEMES WERE BUILT AND REMOVED at 0.8.0, before release. `aws` (Squid Ink surface, `service`
// pulled to Smile Orange) and `azure` (a bluer ink, `network` pulled to Azure Blue) both worked and
// both kept the role semantics intact — and on screen neither read as meaningfully different from
// `dark`. That is the honest finding: once a theme is forbidden from reassigning what a role MEANS,
// a vendor theme can only shift the surface a few points and nudge one accent within its own hue, and
// that is not a look, it is a tint. Two more tables to hold in parity was a real cost for it.
// The rule they were built under still stands and still governs any future theme — see below.

/** A role's colours under one theme. The GLYPH is not themed — it comes from PATTERNS, because the
 *  icon is what the role IS, and changing it per theme would change the meaning, not the look. */
export interface ThemePattern {
  color: string // accent: border + icon
  bg: string // node fill
}

export interface Theme {
  key: ThemeKey
  /** Shown in the harness theme picker. */
  label: string
  /** The canvas SceneView paints. Through 0.7.0 the shell painted this and the engine only assumed
   *  it — which is why FlowEdge hardcoded the shell's `--bg` to fill its label pill. The engine owns
   *  it now, so a theme can actually change it. */
  surface: string
  /** The react-flow dot grid. Must stay recessive against `surface`. */
  dots: string
  ink: string // primary text on a card
  inkMuted: string // a `sub` line, a tick label
  /** A memory slot's trailing note — dimmer than `inkMuted`, because it annotates rather than labels.
   *  It has its own token only so the dark theme can stay EXACTLY 0.7.0: this shade was a separate
   *  literal there, and folding it into inkMuted would have shifted it, however slightly. */
  inkNote: string
  inkFaint: string // a gutter number, a bracket rule
  patterns: Record<PatternKey, ThemePattern>
  edge: { stroke: string; pulse: string; labelBg: string; labelBorder: string; labelInk: string }
  code: { bg: string; chrome: string; chromeBorder: string; border: string; borderFocus: string; gutter: string; filename: string; ink: string }
  plot: { surface: string; grid: string; axis: string; tick: string; ink: string; series: readonly string[] }
}

// The series ramp, in FIXED assignment order — never cycled. It is the PATTERNS accents
// (network · service · user · storage) so a curve and a card in the same frame speak one visual
// language. The order is deliberate and every theme must preserve it: it keeps green and orange
// non-adjacent, which is the pair that collapses under protanopia. `warn` red is never in a ramp —
// in this engine red means "the catch", and a status colour that also means "series 5" means neither.
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

// LIGHT is not DARK inverted. Each accent is darkened until it carries text-weight contrast on a
// near-white surface (the dark accents are tuned for glow on black and go muddy on paper), and each
// fill is a pale tint of its own accent rather than a lightened dark fill.
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
    // Exactly 0.7.0's values, so a repo that does not pass `theme` sees no change at all.
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
    // The code card stays DARK on a light page. An IDE is dark in every screenshot a learner has
    // seen, and a light code card in a light deck loses the "this is source" signal entirely.
    code: { bg: '#11161f', chrome: '#1a2130', chromeBorder: '#222a3a', border: '#2a3242', borderFocus: '#4a5a75', gutter: '#4d5667', filename: '#8b95a7', ink: '#eceef2' },
    plot: { surface: '#ffffff', grid: '#e4e8ee', axis: '#5a6675', tick: '#5a6675', ink: '#1a1d23', series: ramp(LIGHT_PATTERNS) },
  },
}

/** A role's full style under a theme: the themed colours plus the un-themed glyph from PATTERNS. */
export const patternOf = (theme: Theme, key: PatternKey | undefined, fallback: PatternKey = 'service'): PatternStyle => {
  const k = key && theme.patterns[key] ? key : fallback
  return { icon: PATTERNS[k].icon, ...theme.patterns[k] }
}
