import type { Scene } from '../../../src'
import { contentGroup } from './code'
import { idePanesGroup } from './ide'

export const content: Scene = {
  id: 'code',
  title: 'Content cards — code, table, memory, tree, terminal',
  align: 'start',
  nodes: [contentGroup, idePanesGroup],
  edges: [],
}
