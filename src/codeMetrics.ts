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

export type CodeRow = { n: number; text: string } | { fold: number }

export const foldLabel = (count: number): string => `··· ${count} line${count === 1 ? '' : 's'}`

export function codeRows(node: Pick<SceneNode, 'label' | 'sub' | 'show'>): CodeRow[] {
  const lines = codeLines(node)
  if (!node.show?.length) return lines.map((text, i) => ({ n: i + 1, text }))
  const keep = new Set<number>()
  for (const [from, to] of node.show) for (let n = from; n <= to; n++) keep.add(n)
  const rows: CodeRow[] = []
  let run = 0
  lines.forEach((text, i) => {
    if (!keep.has(i + 1)) return void run++
    if (run) rows.push({ fold: run })
    run = 0
    rows.push({ n: i + 1, text })
  })
  if (run) rows.push({ fold: run })
  return rows
}

export const rowText = (row: CodeRow): string => ('fold' in row ? foldLabel(row.fold) : row.text)

export function codeCardSize(node: Pick<SceneNode, 'label' | 'sub' | 'filename' | 'hug' | 'minCols' | 'show'>): { w: number; h: number } {
  const rows = codeRows(node)
  const chrome = (node.filename?.length ?? 0) + 8
  const floor = node.hug ? 1 : (node.minCols ?? CODE_MIN_COLS)
  const maxChars = Math.max(floor, chrome, ...rows.map((r) => rowText(r).length))
  const w = CODE_BORDER * 2 + CODE_GUTTER_W + CODE_GUTTER_PAD + Math.ceil(maxChars * CODE_CHAR_W) + CODE_PAD_X
  const h = CODE_BORDER * 2 + CODE_BAR_H + CODE_BAR_RULE + rows.length * CODE_LINE_H + CODE_PAD_Y * 2
  return { w, h }
}
