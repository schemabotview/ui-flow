import { LUCIDE_ICONS } from './lucideIcons'
import type { PatternStyle } from './patterns'

// The leading glyph for a node: a named lucide glyph from LUCIDE_ICONS when `icon` names one
// (e.g. icon: 'terminal'), tinted in the pattern accent; else the pattern's default glyph. Python is
// a code-first concept, so there is no vendor icon set — every glyph is a lucide line-icon.
export function NodeIcon({ icon, pattern, size = 26 }: { icon?: string; pattern: PatternStyle; size?: number }) {
  const Lucide = (icon ? LUCIDE_ICONS[icon] : undefined) ?? pattern.icon
  return <Lucide size={size} color={pattern.color} strokeWidth={1.75} style={{ flex: 'none' }} />
}
