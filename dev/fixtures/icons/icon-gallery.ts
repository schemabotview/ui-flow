import type { Scene } from '../../../src'
import { LUCIDE_ICONS } from '../../../src/lucideIcons'

export const iconGallery: Scene = {
  id: 'icon-gallery',
  title: `Icon registry — ${Object.keys(LUCIDE_ICONS).length} lucide keys`,
  cols: 10,
  nodes: Object.keys(LUCIDE_ICONS)
    .sort()
    .map((key) => ({ id: key, label: key, pattern: 'service' as const, variant: 'tile' as const, icon: key })),
  edges: [],
}
