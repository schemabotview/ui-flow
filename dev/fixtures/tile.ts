// Fixture: the compact `tile` variant (icon over label) and an explicit `icon` override beating the
// pattern's default glyph. Tiles are what a "three steps" row inside a container is built from.
import type { Scene } from '../../src'

export const tile: Scene = {
  id: 'tile',
  title: 'Tiles — variant and icon override',
  cols: 4,
  nodes: [
    { id: 't1', label: 'fetch', pattern: 'service', variant: 'tile', icon: 'scroll' },
    { id: 't2', label: 'decode', pattern: 'service', variant: 'tile', icon: 'braces' },
    { id: 't3', label: 'execute', pattern: 'service', variant: 'tile', icon: 'cpu' },
    { id: 't4', label: 'default glyph', pattern: 'storage', variant: 'tile' },
  ],
  edges: [],
}
