// The visual for a CODE node: a small IDE-editor card. Window chrome (traffic-light dots + a filename
// tab), then a body of gutter-numbered, syntax-highlighted source. Painted at a fixed base font; the
// node's box was sized to fit by layout.ts (see codeMetrics), and SceneView's fitView scales it into
// the pane. Handles are transparent — they only give react-flow clean anchors so a code card can sit
// in a flow (edges route to/from it) like any other node.

import { type NodeProps } from '@xyflow/react'
import { NodeHandles } from './Handles'
import { tokenizeCode } from './codeHighlight'
import { CODE_FONT, CODE_LINE_H, CODE_BAR_H, CODE_GUTTER_W, CODE_PAD_X, CODE_PAD_Y, codeLines } from './codeMetrics'
import type { SceneNode as SceneNodeData } from './types'

export function CodeNode({ data }: NodeProps) {
  const d = data as unknown as SceneNodeData & { __focus?: boolean }
  const lines = codeLines(d)
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 12,
        border: `1px solid ${d.__focus ? '#3b475c' : '#232a36'}`,
        background: '#0e1420',
        overflow: 'hidden',
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        boxShadow: d.__focus ? '0 0 0 4px #5b8cff22, 0 0 28px #5b8cff33' : '0 1px 0 #00000040',
      }}
    >
      <NodeHandles />
      {/* window chrome */}
      <div
        style={{
          height: CODE_BAR_H,
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 12px',
          background: '#131b29',
          borderBottom: '1px solid #202836',
        }}
      >
        <span style={{ display: 'flex', gap: 6 }}>
          <i style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
          <i style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
          <i style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
        </span>
        {d.filename && <span style={{ fontSize: 12, color: '#7f8a9c' }}>{d.filename}</span>}
      </div>
      {/* source body */}
      <div style={{ flex: 1, padding: `${CODE_PAD_Y}px 0`, fontSize: CODE_FONT, lineHeight: `${CODE_LINE_H}px` }}>
        {lines.map((line, li) => (
          <div key={li} style={{ display: 'flex', whiteSpace: 'pre' }}>
            <span
              style={{
                width: CODE_GUTTER_W,
                flex: 'none',
                textAlign: 'right',
                paddingRight: 12,
                color: '#454f60',
                userSelect: 'none',
              }}
            >
              {li + 1}
            </span>
            <span style={{ paddingRight: CODE_PAD_X }}>
              {tokenizeCode(line).map((t, ti) => (
                <span key={ti} className={`tok-${t.cls}`}>
                  {t.text}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
