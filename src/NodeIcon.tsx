import { AWS_ICONS } from './awsIcons'
import { AZURE_ICONS } from './azureIcons'
import { LUCIDE_ICONS } from './lucideIcons'
import type { PatternStyle } from './patterns'

// The leading glyph for a node, in priority order:
//   1. an official vendor service tile when `icon` names one (AWS_ICONS, then AZURE_ICONS) —
//      rendered in a small rounded frame so the square, full-colour logo sits cleanly against the card;
//   2. a named lucide glyph (LUCIDE_ICONS, e.g. icon: 'terminal') tinted in the pattern accent;
//   3. the pattern's own default glyph.
// The registries share no keys, so the order is a fallback chain, never a tie-break. Keep it that
// way: a key added to two vendor sets would silently resolve to whichever is checked first.
export function NodeIcon({ icon, pattern, size = 26 }: { icon?: string; pattern: PatternStyle; size?: number }) {
  const Aws = icon ? AWS_ICONS[icon] : undefined
  if (Aws) {
    return (
      <span style={{ flex: 'none', display: 'inline-flex', borderRadius: 6, overflow: 'hidden', lineHeight: 0 }}>
        <Aws size={size + 4} />
      </span>
    )
  }
  // Azure tiles need BOTH props. `size` is a string upstream (it is written straight into the SVG's
  // width/height), and the components ship no viewBox at all — so width alone grows the canvas and
  // leaves the artwork at its native 18px in the corner. Supplying the art board as a viewBox is what
  // makes them scale; see the note in azureIcons.ts about keys drawn on a different board.
  // No frame: these are transparent line/gradient art, not AWS's padded colour square.
  const Azure = icon ? AZURE_ICONS[icon] : undefined
  if (Azure) {
    return (
      <span style={{ flex: 'none', display: 'inline-flex', lineHeight: 0 }}>
        <Azure size={String(size)} viewBox="0 0 18 18" />
      </span>
    )
  }
  const Lucide = (icon ? LUCIDE_ICONS[icon] : undefined) ?? pattern.icon
  return <Lucide size={size} color={pattern.color} strokeWidth={1.75} style={{ flex: 'none' }} />
}
