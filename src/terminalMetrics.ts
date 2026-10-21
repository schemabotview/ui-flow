import type { SceneNode } from './types'
import { CODE_BAR_H, CODE_BAR_RULE, CODE_BORDER, CODE_CHAR_W, CODE_LINE_H, CODE_PAD_X, CODE_PAD_Y } from './codeMetrics'

export const TERMINAL_MIN_COLS = 36
export const TERMINAL_TITLE = 'Terminal'

export type TerminalLine = { kind: 'command' | 'output' | 'error'; text: string }

const ERROR_LINE = /^(Traceback \(most recent call last\):|[A-Za-z_][\w.]*(Error|Exception|Warning|Exit|Interrupt)\b.*)$/

export function terminalLines(node: Pick<SceneNode, 'label'>): TerminalLine[] {
  return node.label.split('\n').map((text) => ({
    kind: text.startsWith('$ ') ? 'command' : ERROR_LINE.test(text) ? 'error' : 'output',
    text,
  }))
}

export function terminalCardSize(node: Pick<SceneNode, 'label' | 'filename'>): { w: number; h: number } {
  const lines = terminalLines(node)
  const title = (node.filename ?? TERMINAL_TITLE).length + 8
  const maxChars = Math.max(TERMINAL_MIN_COLS, title, ...lines.map((l) => l.text.length))
  return {
    w: CODE_BORDER * 2 + CODE_PAD_X * 2 + Math.ceil(maxChars * CODE_CHAR_W),
    h: CODE_BORDER * 2 + CODE_BAR_H + CODE_BAR_RULE + lines.length * CODE_LINE_H + CODE_PAD_Y * 2,
  }
}
