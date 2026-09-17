// Shared geometry for the MEMORY node so layout.ts (which SIZES it) and MemoryNode.tsx (which PAINTS
// it) agree exactly — the same split codeMetrics.ts makes for the code card.
//
// A memory node is the textbook object-layout figure: one contiguous block of cells that SHARE their
// edges (adjacent bytes are adjacent cells — never a gap), an offset axis running down the OUTSIDE of
// the block, and brackets on the right grouping consecutive cells into named regions. It is drawn at
// a fixed base font and fitView scales it, so every figure in the deck shares one type size.

import type { MemorySlot, SceneNode } from './types'

export const MEM_FONT = 15 // px — IBM Plex Mono, the cell text
export const MEM_CHAR_W = 9.02 // px advance of one monospace glyph at MEM_FONT (measured; matches code)
export const MEM_ROW_H = 46 // px per cell — a box, so taller than a code line
export const MEM_AXIS_GAP = 12 // gap between the offset axis and the block's left edge
export const MEM_CELL_PAD_X = 14 // cell inner horizontal padding (each side)
export const MEM_NOTE_GAP = 3 // blank columns between a slot's name and its note
export const MEM_BRACKET_GAP = 10 // gap between the block's right edge and the bracket lane
export const MEM_BRACKET_W = 12 // width of the bracket's own stroke lane
export const MEM_LABEL_CHAR_W = 6.6 // px advance of the 12px sans bracket/foot label
export const MEM_TITLE_H = 34 // title line above the block (label, 16px)
export const MEM_FOOT_H = 26 // caption line below the block (`sub`, 12px)
export const MEM_MIN_CELL_COLS = 30 // keep a short figure from rendering as a sliver

// Consecutive slots sharing a `group` form ONE bracket. A run is [start, end] over slot indices —
// computed here so the sizer's width and the painter's brackets can never disagree.
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

// The text a cell paints: the field name, then its note padded out to a common column so every note
// in the block lines up (the alignment is what makes a layout figure readable).
export function cellCols(slots: MemorySlot[]): { nameCols: number; totalCols: number } {
  const nameCols = Math.max(0, ...slots.map((s) => s.name.length))
  const noteCols = Math.max(0, ...slots.map((s) => s.note?.length ?? 0))
  const totalCols = Math.max(MEM_MIN_CELL_COLS, nameCols + (noteCols ? MEM_NOTE_GAP + noteCols : 0))
  return { nameCols, totalCols }
}

// Natural pixel size of a memory figure — the box the layout reserves for it.
export function memoryCardSize(node: Pick<SceneNode, 'label' | 'sub' | 'slots'>): { w: number; h: number } {
  const slots = node.slots ?? []
  const axisW = Math.max(0, ...slots.map((s) => s.at.length)) * MEM_CHAR_W + MEM_AXIS_GAP
  const blockW = cellCols(slots).totalCols * MEM_CHAR_W + MEM_CELL_PAD_X * 2
  const runs = groupRuns(slots)
  const bracketW = runs.length ? MEM_BRACKET_GAP + MEM_BRACKET_W + Math.max(...runs.map((r) => r.label.length)) * MEM_LABEL_CHAR_W + 8 : 0
  const titleH = node.label ? MEM_TITLE_H : 0
  const footH = node.sub ? MEM_FOOT_H : 0
  return {
    w: Math.ceil(axisW + blockW + bracketW),
    h: Math.ceil(titleH + slots.length * MEM_ROW_H + footH),
  }
}
