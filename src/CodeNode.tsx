import type { NodeProps } from '@xyflow/react'
import { NodeHandles } from './Handles'
import { tokenizeCode } from './codeHighlight'
import { FILL, MONO, useNodeStyle } from './nodeStyle'
import {
  CODE_FONT, CODE_LINE_H, CODE_BAR_H, CODE_BAR_RULE, CODE_BORDER, CODE_GUTTER_W, CODE_GUTTER_PAD, CODE_PAD_X, CODE_PAD_Y, codeLines,
} from './codeMetrics'

const DOTS = ['#ff5f56', '#ffbd2e', '#27c93f']

export function CodeNode({ data }: NodeProps) {
  const { d, t } = useNodeStyle(data, 'service')
  return (
    <div
      style={{
        ...FILL, display: 'flex', flexDirection: 'column', borderRadius: 12, overflow: 'hidden', fontFamily: MONO, background: t.code.bg,
        border: `${CODE_BORDER}px solid ${d.__focus ? t.code.borderFocus : t.code.border}`,
        boxShadow: d.__focus ? '0 0 0 4px #5b8cff22, 0 0 28px #5b8cff33' : '0 1px 0 #00000040',
      }}
    >
      <NodeHandles />
      <div
        style={{
          height: CODE_BAR_H, boxSizing: 'content-box', flex: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px',
          background: t.code.chrome, borderBottom: `${CODE_BAR_RULE}px solid ${t.code.chromeBorder}`,
        }}
      >
        <span style={{ display: 'flex', gap: 6 }}>
          {DOTS.map((c) => <i key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        </span>
        {d.filename && <span style={{ fontSize: 12, color: t.code.filename }}>{d.filename}</span>}
      </div>
      <div style={{ flex: 1, padding: `${CODE_PAD_Y}px 0`, fontSize: CODE_FONT, lineHeight: `${CODE_LINE_H}px` }}>
        {codeLines(d).map((line, li) => (
          <div key={li} style={{ display: 'flex', whiteSpace: 'pre' }}>
            <span style={{ width: CODE_GUTTER_W, boxSizing: 'content-box', flex: 'none', textAlign: 'right', paddingRight: CODE_GUTTER_PAD, color: t.code.gutter, userSelect: 'none' }}>
              {li + 1}
            </span>
            <span style={{ paddingRight: CODE_PAD_X }}>
              {tokenizeCode(line).map((tok, ti) => <span key={ti} className={`tok-${tok.cls}`}>{tok.text}</span>)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
