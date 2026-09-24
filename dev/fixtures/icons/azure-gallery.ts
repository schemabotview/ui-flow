// Fixture: every Azure key in the registry, as a labelled tile.
//
// Same job as `icon-gallery` does for lucide — the index an author reads before writing
// `icon: '…'`, since a key that does not exist fails silently into the pattern glyph. It enumerates
// AZURE_ICONS directly rather than restating the keys, so it cannot drift from the registry.
//
// It is also the only place the Azure tiles are seen at tile size: the upstream art board is 18px
// against AWS's padded square, so if a set of tiles ever reads small or clipped, it shows here first.
import type { Scene } from '../../../src'
import { AZURE_ICONS } from '../../../src/azureIcons'

export const azureGallery: Scene = {
  id: 'azure-gallery',
  title: `Azure registry — ${Object.keys(AZURE_ICONS).length} service tiles`,
  cols: 10,
  nodes: Object.keys(AZURE_ICONS)
    .sort()
    .map((key) => ({ id: key, label: key, pattern: 'service' as const, variant: 'tile' as const, icon: key })),
  edges: [],
}
