// Fixture: every lucide key in the registry, as a labelled tile.
//
// This is the index an author needs before writing `icon: '…'` — the registry has grown past 70 keys
// as concepts merged in, and a key that does not exist fails silently (the node falls back to its
// pattern glyph), so guessing is expensive. Reading the gallery is cheaper.
//
// It enumerates LUCIDE_ICONS directly rather than restating the keys, so it can never drift from the
// registry. The harness is internal to the package, so reaching past the barrel here is fine — a
// content repo cannot do this, and should not need to.
import type { Scene } from '../../src'
import { LUCIDE_ICONS } from '../../src/lucideIcons'

export const iconGallery: Scene = {
  id: 'icon-gallery',
  title: `Icon registry — ${Object.keys(LUCIDE_ICONS).length} lucide keys`,
  cols: 10,
  nodes: Object.keys(LUCIDE_ICONS)
    .sort()
    .map((key) => ({ id: key, label: key, pattern: 'service' as const, variant: 'tile' as const, icon: key })),
  edges: [],
}
