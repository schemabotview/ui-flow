import { AWS_ICONS } from './awsIcons'
import { LUCIDE_ICONS } from './lucideIcons'
import type { PatternStyle } from './patterns'

// The leading glyph for a node, in priority order:
//   1. an official vendor service tile when `icon` names one (AWS_ICONS) — rendered in a small
//      rounded frame so the square, full-colour logo sits cleanly against the card;
//   2. a named lucide glyph (LUCIDE_ICONS, e.g. icon: 'terminal') tinted in the pattern accent;
//   3. the pattern's own default glyph.
// The two registries share no keys, so the order is a fallback chain, never a tie-break.
export function NodeIcon({ icon, pattern, size = 26 }: { icon?: string; pattern: PatternStyle; size?: number }) {
  const Aws = icon ? AWS_ICONS[icon] : undefined
  if (Aws) {
    return (
      <span style={{ flex: 'none', display: 'inline-flex', borderRadius: 6, overflow: 'hidden', lineHeight: 0 }}>
        <Aws size={size + 4} />
      </span>
    )
  }
  const Lucide = (icon ? LUCIDE_ICONS[icon] : undefined) ?? pattern.icon
  return <Lucide size={size} color={pattern.color} strokeWidth={1.75} style={{ flex: 'none' }} />
}
