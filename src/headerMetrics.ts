import { wrapLines, longestWordWidth, textWidth } from './textMetrics'
import { hasIcon } from './NodeIcon'
import type { SceneNode } from './types'

export const HEADER_TITLE_FONT = 22
export const HEADER_TITLE_LINE_H = 29
export const HEADER_SUB_FONT = 16
export const HEADER_SUB_LINE_H = 23
export const HEADER_SUB_GAP = 3

export const HEADER_ICON = 28
export const HEADER_ICON_GAP = 12
export const HEADER_BADGE_GAP = 14
export const HEADER_INSET_X = 16
export const HEADER_INSET_Y = 14
export const HEADER_BORDER = 3
export const HEADER_MIN = 58

export const headerBadgeWidth = (badge?: string): number =>
  badge ? Math.ceil(textWidth(badge, HEADER_TITLE_FONT, 600)) + HEADER_BADGE_GAP : 0

export const headerIconWidth = (icon?: string): number => (hasIcon(icon) ? HEADER_ICON + HEADER_ICON_GAP : 0)

export const HEADER_MAX_FORCED_W = 420

export function headerMinWidth(node: Pick<SceneNode, 'label' | 'badge' | 'icon'>): number {
  const longestWord = longestWordWidth(node.label, HEADER_TITLE_FONT, 600)
  const gutter = headerBadgeWidth(node.badge) + headerIconWidth(node.icon)
  return Math.min(HEADER_MAX_FORCED_W, Math.ceil(2 * (HEADER_INSET_X + HEADER_BORDER) + gutter + longestWord))
}

export const headerTextWidth = (node: Pick<SceneNode, 'badge' | 'icon'>, boxW: number): number =>
  Math.max(40, boxW - 2 * (HEADER_INSET_X + HEADER_BORDER) - headerBadgeWidth(node.badge) - headerIconWidth(node.icon))

export function headerHeight(node: Pick<SceneNode, 'label' | 'sub' | 'badge' | 'icon'>, boxW: number): number {
  const textW = headerTextWidth(node, boxW)
  const labelH = wrapLines(node.label, textW, HEADER_TITLE_FONT, 600) * HEADER_TITLE_LINE_H
  const subH = node.sub ? wrapLines(node.sub, textW, HEADER_SUB_FONT) * HEADER_SUB_LINE_H + HEADER_SUB_GAP : 0
  const content = Math.max(hasIcon(node.icon) ? HEADER_ICON : 0, labelH + subH)
  return Math.max(HEADER_MIN, Math.ceil(2 * HEADER_INSET_Y + content))
}
