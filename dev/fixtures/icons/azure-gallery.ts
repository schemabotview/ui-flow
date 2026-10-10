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
