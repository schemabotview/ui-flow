import type { Scene } from '../../../src'
import { proseGroup } from './prose'
import { notesGroup } from './annotations'

export const text: Scene = {
  id: 'prose-hierarchy',
  title: 'Text & lists — hierarchy, wrapping, list floors, notes, pills',
  cols: 2,
  align: 'start',
  nodes: [proseGroup, notesGroup],
  edges: [],
}
