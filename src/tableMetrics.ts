import type { SceneNode, TableColumn } from './types'
import { textWidth, wrapLines } from './textMetrics'
import { CODE_CHAR_W } from './codeMetrics'

export const TABLE_FONT = 15
export const TABLE_LINE_H = 26
export const TABLE_PAD_X = 16
export const TABLE_PAD_Y = 10
export const TABLE_COL_GAP = 20
export const TABLE_KEY_W = 34
export const TABLE_RULE_H = 1
export const TABLE_BORDER = 2.5

export const TABLE_MIN_CHARS = 24

export const TABLE_NAME_FONT = 17
export const TABLE_NAME_LINE_H = 22
export const TABLE_SUB_FONT = 12
export const TABLE_SUB_LINE_H = 16
export const TABLE_SUB_GAP = 2
export const TABLE_HEAD_PAD_TOP = 12
export const TABLE_HEAD_PAD_BOTTOM = 10

type TableSized = Pick<SceneNode, 'label' | 'sub' | 'columns' | 'headers' | 'values'>

export function tableContentWidth(node: TableSized): number {
  const chars = tableColumnChars(node)
  const gutter = hasKeys(node.columns) && !isDataTable(node) ? TABLE_KEY_W : 0
  const gridChars = Math.max(TABLE_MIN_CHARS, chars.reduce((a, b) => a + b, 0))
  const grid =
    gutter +
    Math.ceil(gridChars * CODE_CHAR_W) +
    TABLE_COL_GAP * Math.max(0, chars.length + (gutter ? 1 : 0) - 1)
  return Math.max(grid, Math.ceil(textWidth(node.label, TABLE_NAME_FONT, 600)))
}

export function tableHeaderHeight(node: TableSized): number {
  const sub = node.sub
    ? TABLE_SUB_GAP + wrapLines(node.sub, tableContentWidth(node), TABLE_SUB_FONT) * TABLE_SUB_LINE_H
    : 0
  return TABLE_HEAD_PAD_TOP + TABLE_NAME_LINE_H + sub + TABLE_HEAD_PAD_BOTTOM
}

export const isDataTable = (node: Pick<SceneNode, 'values'>): boolean => (node.values?.length ?? 0) > 0

export const hasKeys = (columns: TableColumn[] | undefined): boolean => (columns ?? []).some((c) => c.key)

export function tableColumnChars(node: Pick<SceneNode, 'columns' | 'headers' | 'values'>): number[] {
  if (isDataTable(node)) {
    const rows = [...(node.headers ? [node.headers] : []), ...(node.values ?? [])]
    const n = Math.max(...rows.map((r) => r.length))
    return Array.from({ length: n }, (_, i) => Math.max(...rows.map((r) => (r[i] ?? '').length)))
  }
  const cols = node.columns ?? []
  const nameW = Math.max(1, ...cols.map((c) => c.name.length))
  const typeW = Math.max(0, ...cols.map((c) => (c.type ?? '').length))
  return typeW > 0 ? [nameW, typeW] : [nameW]
}

export function tableBodyLines(node: Pick<SceneNode, 'columns' | 'headers' | 'values'>): number {
  return isDataTable(node)
    ? (node.headers ? 1 : 0) + (node.values?.length ?? 0)
    : (node.columns?.length ?? 0)
}

export function tableCardSize(node: Pick<SceneNode, 'label' | 'sub' | 'columns' | 'headers' | 'values'>): {
  w: number
  h: number
} {
  const w = TABLE_PAD_X * 2 + tableContentWidth(node) + TABLE_BORDER * 2
  const h =
    tableHeaderHeight(node) + TABLE_RULE_H + TABLE_PAD_Y * 2 + tableBodyLines(node) * TABLE_LINE_H + TABLE_BORDER * 2
  return { w, h }
}
