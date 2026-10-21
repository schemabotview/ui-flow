import { FILL, MONO, SANS, useNodeStyle, type NodeViewProps } from './nodeStyle'
import { patternOf } from './themes'
import { CODE_BAR_H, CODE_BAR_RULE, CODE_BORDER, CODE_FONT, CODE_LINE_H, CODE_PAD_X, CODE_PAD_Y } from './codeMetrics'
import { TERMINAL_TITLE, terminalLines } from './terminalMetrics'

export function TerminalNode({ data }: NodeViewProps) {
  const { d, t } = useNodeStyle(data, 'storage')
  const prompt = patternOf(t, 'storage', 'storage').color
  const error = patternOf(t, 'warn', 'warn').color
  return (
    <div
      style={{
        ...FILL, display: 'flex', flexDirection: 'column', borderRadius: 12, overflow: 'hidden', fontFamily: MONO, background: t.code.bg,
        border: `${CODE_BORDER}px solid ${d.__focus ? t.code.borderFocus : t.code.border}`,
        boxShadow: d.__focus ? '0 0 0 4px #5b8cff22, 0 0 28px #5b8cff33' : '0 1px 0 #00000040',
      }}
    >
      <div
        style={{
          height: CODE_BAR_H, boxSizing: 'content-box', flex: 'none', display: 'flex', alignItems: 'center', padding: '0 14px',
          background: t.code.chrome, borderBottom: `${CODE_BAR_RULE}px solid ${t.code.chromeBorder}`,
          fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.code.filename,
        }}
      >
        {d.filename ?? TERMINAL_TITLE}
      </div>
      <div style={{ flex: 1, padding: `${CODE_PAD_Y}px ${CODE_PAD_X}px`, fontSize: CODE_FONT, lineHeight: `${CODE_LINE_H}px`, color: t.code.ink }}>
        {terminalLines(d).map((line, i) => (
          <div key={i} style={{ whiteSpace: 'pre', minHeight: CODE_LINE_H, color: line.kind === 'error' ? error : undefined, opacity: line.kind === 'output' ? 0.88 : 1 }}>
            {line.kind === 'command' ? (
              <>
                <span style={{ color: prompt, userSelect: 'none' }}>$ </span>
                {line.text.slice(2)}
              </>
            ) : (
              line.text
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
