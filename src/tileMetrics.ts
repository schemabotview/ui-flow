import type { SceneNode } from './types'
import { wrapLines, longestWordWidth } from './textMetrics'
import { hasIcon } from './NodeIcon'

export const TILE_LABEL_FONT = 15
export const TILE_LABEL_LINE_H = 17
export const TILE_SUB_FONT = 11
export const TILE_SUB_LINE_H = 14
export const TILE_SUB_GAP = 2

export const TILE_ICON = 46
export const TILE_ICON_GAP = 9
export const TILE_PAD_X = 8
export const TILE_PAD_Y = 8
export const TILE_W = 128
export const TILE_H = 96
export const TILE_MAX_W = 168

export function tileSize(node: Pick<SceneNode, 'label' | 'sub' | 'icon'>): { w: number; h: number } {
  const longestWord = longestWordWidth(node.label, TILE_LABEL_FONT, 600)
  const w = Math.min(TILE_MAX_W, Math.max(TILE_W, Math.ceil(longestWord) + 2 * TILE_PAD_X))
  const textW = w - 2 * TILE_PAD_X
  const labelH = wrapLines(node.label, textW, TILE_LABEL_FONT, 600) * TILE_LABEL_LINE_H
  const subH = node.sub ? TILE_SUB_GAP + wrapLines(node.sub, textW, TILE_SUB_FONT) * TILE_SUB_LINE_H : 0
  const iconH = hasIcon(node.icon) ? TILE_ICON + TILE_ICON_GAP : 0
  return { w, h: Math.max(TILE_H, Math.ceil(iconH + labelH + subH + 2 * TILE_PAD_Y)) }
}
