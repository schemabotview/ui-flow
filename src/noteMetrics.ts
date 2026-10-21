import type { SceneNode } from './types'
import { longestWordWidth, textWidth, wrapLines } from './textMetrics'

export const NOTE_FONT = 16
export const NOTE_LINE_H = 23
export const NOTE_PAD_X = 16
export const NOTE_PAD_Y = 10
export const NOTE_BORDER = 2.5
export const NOTE_MIN_W = 140
export const NOTE_MAX_W = 300

const chrome = 2 * (NOTE_PAD_X + NOTE_BORDER)

export function noteCardSize(node: Pick<SceneNode, 'label'>): { w: number; h: number } {
  const natural = Math.ceil(textWidth(node.label, NOTE_FONT)) + chrome
  const clamped = Math.min(NOTE_MAX_W, Math.max(NOTE_MIN_W, natural))
  const w = Math.max(clamped, Math.ceil(longestWordWidth(node.label, NOTE_FONT)) + chrome)
  const lines = wrapLines(node.label, w - chrome, NOTE_FONT)
  return { w, h: lines * NOTE_LINE_H + 2 * (NOTE_PAD_Y + NOTE_BORDER) }
}
