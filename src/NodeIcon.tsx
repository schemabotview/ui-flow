import { AWS_ICONS } from './awsIcons'
import { AZURE_ICONS } from './azureIcons'
import { LUCIDE_ICONS } from './lucideIcons'
import { BRAND_ICONS, brandFill } from './brandIcons'
import { useFlowTheme } from './themeContext'
import type { PatternStyle } from './patterns'

export const ICON_NONE = 'none'

export const hasIcon = (icon?: string): boolean => icon !== ICON_NONE

export function NodeIcon({ icon, pattern, size = 26 }: { icon?: string; pattern: PatternStyle; size?: number }) {
  const t = useFlowTheme()
  if (!hasIcon(icon)) return null
  const Aws = icon ? AWS_ICONS[icon] : undefined
  if (Aws) return <span style={{ flex: 'none', display: 'inline-flex', borderRadius: 6, overflow: 'hidden', lineHeight: 0 }}><Aws size={size} /></span>
  const Azure = icon ? AZURE_ICONS[icon] : undefined
  if (Azure) return <span style={{ flex: 'none', display: 'inline-flex', lineHeight: 0 }}><Azure size={String(size)} viewBox="0 0 18 18" /></span>
  const brand = icon ? BRAND_ICONS[icon] : undefined
  if (brand)
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={brand.title} style={{ flex: 'none' }}>
        <path d={brand.path} fill={brandFill(brand.hex, t.surface, t.ink)} />
      </svg>
    )
  const Lucide = (icon ? LUCIDE_ICONS[icon] : undefined) ?? pattern.icon
  return <Lucide size={size} color={pattern.color} strokeWidth={1.75} style={{ flex: 'none' }} />
}
