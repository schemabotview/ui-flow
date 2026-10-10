import type { SceneNode } from './types'

export const LIST_TITLE_FONT = 20
export const LIST_TITLE_LINE_H = 26
export const LIST_SUB_FONT = 16
export const LIST_SUB_LINE_H = 23
export const LIST_ITEM_FONT = 14
export const LIST_ITEM_LINE_H = 21
export const LIST_ITEM_GAP = 7

export const LIST_PAD_X = 18
export const LIST_HEAD_PAD_TOP = 14
export const LIST_HEAD_PAD_BOTTOM = 12
export const LIST_BODY_PAD_Y = 12
export const LIST_RULE_H = 1
export const LIST_ICON = 40
export const LIST_ICON_GAP = 13
export const LIST_BULLET_W = 15
export const LIST_BORDER = 2.5

export const LIST_MIN_W = 259
export const LIST_MAX_W = 320

import { wrapLines, textWidth } from './textMetrics'

function naturalWidth(node: Pick<SceneNode, 'label' | 'sub' | 'items'>): number {
  const head =
    LIST_ICON +
    LIST_ICON_GAP +
    Math.max(textWidth(node.label, LIST_TITLE_FONT, 600), node.sub ? textWidth(node.sub, LIST_SUB_FONT) : 0)
  const body = LIST_BULLET_W + Math.max(0, ...(node.items ?? []).map((i) => textWidth(i, LIST_ITEM_FONT)))
  return Math.max(head, body)
}

export function listContentWidth(node: Pick<SceneNode, 'label' | 'sub' | 'items'>): number {
  return Math.min(LIST_MAX_W, Math.max(LIST_MIN_W, Math.ceil(naturalWidth(node))))
}

export function listHeaderHeight(node: Pick<SceneNode, 'label' | 'sub' | 'items'>): number {
  const textW = listContentWidth(node) - LIST_ICON - LIST_ICON_GAP
  const titleH = wrapLines(node.label, textW, LIST_TITLE_FONT, 600) * LIST_TITLE_LINE_H
  const subH = node.sub ? 2 + wrapLines(node.sub, textW, LIST_SUB_FONT) * LIST_SUB_LINE_H : 0
  return Math.max(
    LIST_HEAD_PAD_TOP + titleH + subH + LIST_HEAD_PAD_BOTTOM,
    LIST_HEAD_PAD_TOP + LIST_ICON + LIST_HEAD_PAD_BOTTOM,
  )
}

export function listCardSize(node: Pick<SceneNode, 'label' | 'sub' | 'items'>): { w: number; h: number } {
  const content = listContentWidth(node)
  const items = node.items ?? []
  const textW = content - LIST_BULLET_W
  const bodyLines = items.reduce((sum, i) => sum + wrapLines(i, textW, LIST_ITEM_FONT), 0)
  const bodyH = items.length
    ? bodyLines * LIST_ITEM_LINE_H + (items.length - 1) * LIST_ITEM_GAP + LIST_BODY_PAD_Y * 2 + LIST_RULE_H
    : 0
  return {
    w: content + LIST_PAD_X * 2 + LIST_BORDER * 2,
    h: listHeaderHeight(node) + bodyH + LIST_BORDER * 2,
  }
}
