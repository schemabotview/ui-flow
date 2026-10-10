import type { SceneNode } from './types'

export const CODE_FONT = 15
export const CODE_LINE_H = 22
export const CODE_CHAR_W = 9.02
export const CODE_BAR_H = 30
export const CODE_BAR_RULE = 1
export const CODE_GUTTER_W = 40
export const CODE_GUTTER_PAD = 12
export const CODE_PAD_X = 16
export const CODE_PAD_Y = 14
export const CODE_BORDER = 1
export const CODE_TAB_W = 4

export const CODE_MIN_COLS = 64

export function codeLines(node: Pick<SceneNode, 'label' | 'sub'>): string[] {
  const src = node.label.split('\n').map(expandTabs)
  return node.sub ? [...src, `# ${expandTabs(node.sub)}`] : src
}

function expandTabs(line: string): string {
  if (!line.includes('\t')) return line
  let out = ''
  for (const ch of line) out += ch === '\t' ? ' '.repeat(CODE_TAB_W - (out.length % CODE_TAB_W)) : ch
  return out
}

export function codeCardSize(node: Pick<SceneNode, 'label' | 'sub' | 'filename' | 'hug' | 'minCols'>): { w: number; h: number } {
  const lines = codeLines(node)
  const chrome = (node.filename?.length ?? 0) + 8
  const floor = node.hug ? 1 : (node.minCols ?? CODE_MIN_COLS)
  const maxChars = Math.max(floor, chrome, ...lines.map((l) => l.length))
  const w = CODE_BORDER * 2 + CODE_GUTTER_W + CODE_GUTTER_PAD + Math.ceil(maxChars * CODE_CHAR_W) + CODE_PAD_X
  const h = CODE_BORDER * 2 + CODE_BAR_H + CODE_BAR_RULE + lines.length * CODE_LINE_H + CODE_PAD_Y * 2
  return { w, h }
}
