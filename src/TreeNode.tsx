import { NodeIcon } from './NodeIcon'
import { FILL, SANS, useNodeStyle, type NodeViewProps } from './nodeStyle'
import { patternOf } from './themes'
import { CODE_BAR_H, CODE_BAR_RULE, CODE_BORDER } from './codeMetrics'
import {
  TREE_BADGE, TREE_BADGE_FONT, TREE_BADGE_GAP, TREE_BADGE_PAD_X, TREE_CHEVRON, TREE_CHEVRON_GAP, TREE_FONT, TREE_ICON, TREE_ICON_GAP,
  TREE_INDENT, TREE_NOTE_FONT, TREE_NOTE_GAP, TREE_PAD_X, TREE_PAD_Y, TREE_ROW_H, TREE_TITLE_FONT, TREE_TITLE_TRACKING, treeRows,
} from './treeMetrics'

const iconOf = (name: string, folder: boolean) => (folder ? 'folder' : name.endsWith('.py') ? 'python' : 'file')

function Chevron({ open, color }: { open: boolean; color: string }) {
  return (
    <svg width={TREE_CHEVRON} height={TREE_CHEVRON} viewBox="0 0 12 12" style={{ flex: 'none', transform: open ? 'rotate(90deg)' : undefined }}>
      <path d="M4 2.5 7.5 6 4 9.5" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function TreeNode({ data }: NodeViewProps) {
  const { d, t, p } = useNodeStyle(data, 'network')
  const glyph = { ...p, color: t.code.filename }
  const fresh = { ...p, color: patternOf(t, 'storage', 'storage').color }
  return (
    <div
      style={{
        ...FILL, display: 'flex', flexDirection: 'column', borderRadius: 12, overflow: 'hidden', fontFamily: SANS, background: t.code.bg,
        border: `${CODE_BORDER}px solid ${d.__focus ? t.code.borderFocus : t.code.border}`,
        boxShadow: d.__focus ? '0 0 0 4px #5b8cff22, 0 0 28px #5b8cff33' : '0 1px 0 #00000040',
      }}
    >
      <div
        style={{
          height: CODE_BAR_H, boxSizing: 'content-box', flex: 'none', display: 'flex', alignItems: 'center', padding: `0 ${TREE_PAD_X}px`,
          background: t.code.chrome, borderBottom: `${CODE_BAR_RULE}px solid ${t.code.chromeBorder}`,
          fontSize: TREE_TITLE_FONT, fontWeight: 600, letterSpacing: TREE_TITLE_TRACKING, textTransform: 'uppercase', color: t.code.filename, whiteSpace: 'nowrap',
        }}
      >
        {d.label}
      </div>
      <div style={{ flex: 1, padding: `${TREE_PAD_Y}px 0` }}>
        {treeRows(d.tree).map(({ entry, depth, folder, open }, i) => {
          const active = entry.state === 'active'
          const muted = entry.state === 'muted'
          const isNew = entry.state === 'new'
          return (
            <div
              key={i}
              style={{
                height: TREE_ROW_H, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
                padding: `0 ${TREE_PAD_X}px 0 ${TREE_PAD_X + depth * TREE_INDENT}px`,
                background: active ? `${p.color}2e` : undefined, boxShadow: active ? `inset 3px 0 0 ${p.color}` : undefined,
                opacity: muted ? 0.5 : 1,
              }}
            >
              <span style={{ width: TREE_CHEVRON, marginRight: TREE_CHEVRON_GAP, display: 'flex', flex: 'none' }}>
                {folder && <Chevron open={open} color={t.code.filename} />}
              </span>
              <span style={{ width: TREE_ICON, marginRight: TREE_ICON_GAP, display: 'flex', flex: 'none' }}>
                <NodeIcon icon={iconOf(entry.name, folder)} pattern={isNew ? fresh : glyph} size={TREE_ICON} />
              </span>
              <span style={{ fontSize: TREE_FONT, fontWeight: active ? 600 : 400, color: isNew ? fresh.color : t.code.ink }}>{entry.name}</span>
              {entry.note && <span style={{ marginLeft: TREE_NOTE_GAP, fontSize: TREE_NOTE_FONT, color: t.code.filename, fontStyle: 'italic' }}>{entry.note}</span>}
              {isNew && (
                <span
                  style={{
                    marginLeft: TREE_BADGE_GAP, padding: `1px ${TREE_BADGE_PAD_X}px`, borderRadius: 4, fontSize: TREE_BADGE_FONT, fontWeight: 600,
                    letterSpacing: 0, color: t.code.bg, background: fresh.color, lineHeight: '14px',
                  }}
                >
                  {TREE_BADGE}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

