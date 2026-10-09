import type { SceneNode } from './types'
import { wrapLines } from './textMetrics'

export const DECISION_TEXT_W = 190
export function decisionSize(node: Pick<SceneNode, 'label' | 'sub'>) {
  const body = wrapLines(node.label, DECISION_TEXT_W, 20, 600) * 26 +
    (node.sub ? wrapLines(node.sub, DECISION_TEXT_W, 16) * 23 + 4 : 0)
  // The central half of a diamond is a safe rectangle for all text corners.
  return { w: 2 * (DECISION_TEXT_W + 16), h: 2 * (body + 24) }
}
