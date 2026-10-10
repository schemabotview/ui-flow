import type { MemorySlot, SceneNode } from './types'
import { textWidth, wrapLines } from './textMetrics'
import { CODE_CHAR_W } from './codeMetrics'

export const MEM_FONT = 15
export const MEM_ROW_H = 46
export const MEM_AXIS_GAP = 12
export const MEM_CELL_PAD_X = 14
export const MEM_NOTE_GAP = 3
export const MEM_BRACKET_GAP = 10
export const MEM_BRACKET_W = 12
export const MEM_BRACKET_LABEL_GAP = 8
export const MEM_LABEL_FONT = 12
export const MEM_TITLE_FONT = 16
export const MEM_TITLE_LINE_H = 21
export const MEM_TITLE_H = 34
export const MEM_FOOT_LINE_H = 16
export const MEM_FOOT_H = 26
export const MEM_MIN_CELL_COLS = 30

export interface GroupRun {
  label: string
  from: number
  to: number
}

export function groupRuns(slots: MemorySlot[]): GroupRun[] {
  const runs: GroupRun[] = []
  slots.forEach((s, i) => {
    if (!s.group) return
    const last = runs[runs.length - 1]
    if (last && last.label === s.group && last.to === i - 1) last.to = i
    else runs.push({ label: s.group, from: i, to: i })
  })
  return runs
}

export function cellCols(slots: MemorySlot[]): { nameCols: number; totalCols: number } {
  const nameCols = Math.max(0, ...slots.map((s) => s.name.length))
  const noteCols = Math.max(0, ...slots.map((s) => s.note?.length ?? 0))
  const totalCols = Math.max(MEM_MIN_CELL_COLS, nameCols + (noteCols ? MEM_NOTE_GAP + noteCols : 0))
  return { nameCols, totalCols }
}

export function memoryGeometry(node: Pick<SceneNode, 'label' | 'sub' | 'slots'>) {
  const slots = node.slots ?? []
  const axisW = Math.max(0, ...slots.map((s) => s.at.length)) * CODE_CHAR_W + MEM_AXIS_GAP
  const blockW = cellCols(slots).totalCols * CODE_CHAR_W + MEM_CELL_PAD_X * 2
  const runs = groupRuns(slots)
  const labelW = Math.max(0, ...runs.map((r) => Math.ceil(textWidth(r.label, MEM_LABEL_FONT))))
  const bracketW = runs.length ? MEM_BRACKET_GAP + MEM_BRACKET_W + MEM_BRACKET_LABEL_GAP + labelW : 0
  const w = Math.ceil(axisW + blockW + bracketW)
  const textW = w - axisW
  const titleH = node.label
    ? Math.max(MEM_TITLE_H, wrapLines(node.label, textW, MEM_TITLE_FONT, 600) * MEM_TITLE_LINE_H + (MEM_TITLE_H - MEM_TITLE_LINE_H))
    : 0
  const footH = node.sub
    ? Math.max(MEM_FOOT_H, wrapLines(node.sub, textW, MEM_LABEL_FONT) * MEM_FOOT_LINE_H + (MEM_FOOT_H - MEM_FOOT_LINE_H))
    : 0
  return { axisW, blockW, w, titleH, footH, h: Math.ceil(titleH + slots.length * MEM_ROW_H + footH) }
}

export function memoryCardSize(node: Pick<SceneNode, 'label' | 'sub' | 'slots'>): { w: number; h: number } {
  const g = memoryGeometry(node)
  return { w: g.w, h: g.h }
}
