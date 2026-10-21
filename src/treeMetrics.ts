import type { SceneNode, TreeEntry } from './types'
import { textWidth } from './textMetrics'
import { CODE_BAR_H, CODE_BAR_RULE, CODE_BORDER } from './codeMetrics'

export const TREE_FONT = 15
export const TREE_ROW_H = 27
export const TREE_INDENT = 16
export const TREE_CHEVRON = 12
export const TREE_CHEVRON_GAP = 4
export const TREE_ICON = 16
export const TREE_ICON_GAP = 8
export const TREE_PAD_X = 12
export const TREE_PAD_Y = 8
export const TREE_NOTE_FONT = 13
export const TREE_NOTE_GAP = 10
export const TREE_BADGE = 'NEW'
export const TREE_BADGE_FONT = 10
export const TREE_BADGE_PAD_X = 6
export const TREE_BADGE_GAP = 8
export const TREE_TITLE_FONT = 12
export const TREE_TITLE_TRACKING = 1
export const TREE_MIN_W = 220

export interface TreeRow {
  entry: TreeEntry
  depth: number
  folder: boolean
  open: boolean
}

export function treeRows(entries: TreeEntry[] = [], depth = 0): TreeRow[] {
  return entries.flatMap((entry) => {
    const open = !!entry.children?.length
    const row = { entry, depth, folder: open || !!entry.folder, open }
    return [row, ...(open ? treeRows(entry.children, depth + 1) : [])]
  })
}

export const treeBadgeWidth = (): number => Math.ceil(textWidth(TREE_BADGE, TREE_BADGE_FONT, 600)) + 2 * TREE_BADGE_PAD_X

export function treeRowWidth(row: TreeRow): number {
  const { entry } = row
  const name = textWidth(entry.name, TREE_FONT, entry.state === 'active' ? 600 : 400)
  const note = entry.note ? TREE_NOTE_GAP + textWidth(entry.note, TREE_NOTE_FONT) : 0
  const badge = entry.state === 'new' ? TREE_BADGE_GAP + treeBadgeWidth() : 0
  return row.depth * TREE_INDENT + TREE_CHEVRON + TREE_CHEVRON_GAP + TREE_ICON + TREE_ICON_GAP + name + note + badge
}

export function treeCardSize(node: Pick<SceneNode, 'label' | 'tree'>): { w: number; h: number } {
  const rows = treeRows(node.tree)
  const title = textWidth(node.label.toUpperCase(), TREE_TITLE_FONT, 600) + node.label.length * TREE_TITLE_TRACKING
  const inner = Math.max(title, ...rows.map(treeRowWidth))
  return {
    w: Math.max(TREE_MIN_W, Math.ceil(CODE_BORDER * 2 + TREE_PAD_X * 2 + inner)),
    h: CODE_BORDER * 2 + CODE_BAR_H + CODE_BAR_RULE + TREE_PAD_Y * 2 + rows.length * TREE_ROW_H,
  }
}
