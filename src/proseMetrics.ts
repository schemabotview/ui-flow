import type { SceneNode } from './types'
import { wrapLines } from './textMetrics'

export const PROSE_TITLE_FONT = 20
export const PROSE_TITLE_LINE_H = 26
export const PROSE_CAPTION_FONT = 16
export const PROSE_CAPTION_LINE_H = 23
export const PROSE_CAPTION_GAP = 2

export const PROSE_W = 300
export const PROSE_ICON = 40
export const PROSE_ICON_GAP = 14
export const PROSE_PAD_X = 18
export const PROSE_PAD_Y = 14
export const PROSE_BORDER = 2.5
export const PROSE_MIN_H = 96

export const proseTextWidth = (): number =>
  PROSE_W - 2 * (PROSE_PAD_X + PROSE_BORDER) - PROSE_ICON - PROSE_ICON_GAP

export function proseSize(node: Pick<SceneNode, 'label' | 'sub'>): { w: number; h: number } {
  const textW = proseTextWidth()
  const title = wrapLines(node.label, textW, PROSE_TITLE_FONT, 600) * PROSE_TITLE_LINE_H
  const caption = node.sub
    ? PROSE_CAPTION_GAP + wrapLines(node.sub, textW, PROSE_CAPTION_FONT) * PROSE_CAPTION_LINE_H
    : 0
  const content = Math.max(PROSE_ICON, title + caption)
  return { w: PROSE_W, h: Math.max(PROSE_MIN_H, Math.ceil(content + 2 * PROSE_PAD_Y + 2 * PROSE_BORDER)) }
}
