import type { SceneNode } from './types'
import { textWidth } from './textMetrics'
import { hasIcon } from './NodeIcon'

export const CHIP_FONT = 15
export const CHIP_LINE_H = 20

export const CHIP_PAD_X = 14
export const CHIP_PAD_Y = 7
export const CHIP_ICON = 16
export const CHIP_ICON_GAP = 7
export const CHIP_RADIUS = 8
export const CHIP_BORDER = 2
export const CHIP_MIN_W = 72

export function chipSize(node: Pick<SceneNode, 'label' | 'icon'>): { w: number; h: number } {
  const textW = Math.ceil(textWidth(node.label, CHIP_FONT))
  const iconW = hasIcon(node.icon) ? CHIP_ICON + CHIP_ICON_GAP : 0
  const w = Math.max(CHIP_MIN_W, textW + iconW + 2 * (CHIP_PAD_X + CHIP_BORDER))
  const h = Math.max(CHIP_LINE_H, CHIP_ICON) + 2 * (CHIP_PAD_Y + CHIP_BORDER)
  return { w, h: Math.ceil(h) }
}
