// The visual for a CONTAINER node: a labelled box that holds child nodes (which react-flow renders
// inside it via parentId). Header at the top (badge, icon, label and sub), a pattern-coloured outline
// and a faint fill of the same accent. Handles are transparent — they only let edges route to/from
// the container.
//
// THE CONTAINER CARRIES THE COLOUR NOW, and the leaves inside it do not. Through 0.9.0 it was the
// other way round: every card was framed and tinted in its role, and the box around them was a
// barely-there hairline (`${p.color}59` outline over an `0f` fill). That reads as a wash — a dozen
// framed rectangles competing at one contrast, with the grouping, which is what a reader needs
// FIRST, drawn weakest of all. Inverting it is the whole 0.10.0 look: the band is the loud thing,
// its members are quiet text, and the eye indexes the diagram by band before it reads a word inside
// one.
//
// A CONTAINER'S COLOUR IS ITS `pattern`, and that is the only mechanism. An earlier draft took the
// accent from `--flow-container-accent`, a CSS variable a consuming repo set in its own theme.css.
// It was removed before release and must not come back: it is per-repo theming through a side door
// (the invariant the 0.2.0 brand-orange override was dropped for), and it could not do the job
// anyway — one variable paints every container in a scene the same colour, whereas the shape every
// architecture diagram actually wants is four bands in four hues. `pattern` already gives that, per
// node, out of the theme's own table: a sources band is `storage` because it IS storage, a control
// plane is `network`, compute is `service`, consumers are `user`.
//
// FOCUS: a container ignored `__focus` entirely, so `Section.focus` pointing at one was a silent
// no-op — no error, nothing lit. Found by auditing focus across the concept repos (python had four
// sections doing exactly this). The treatment is deliberately quieter than a card's: a container is
// large, so a full card glow would flood the frame. It gets a thicker outline, a slightly stronger
// tint, and a soft ring — enough to read as "this band" without drowning its own children.

import { type NodeProps } from '@xyflow/react'
import { patternOf } from './themes'
import { useFlowTheme } from './themeContext'
import { NodeIcon, hasIcon } from './NodeIcon'
import { NodeHandles } from './Handles'
import {
  HEADER_ICON,
  HEADER_ICON_GAP,
  HEADER_BADGE_GAP,
  HEADER_INSET_X,
  HEADER_INSET_Y,
  HEADER_TITLE_FONT,
  HEADER_TITLE_LINE_H,
  HEADER_SUB_FONT,
  HEADER_SUB_LINE_H,
  HEADER_SUB_GAP,
  headerBadgeWidth,
} from './headerMetrics'
import type { SceneNode as SceneNodeData } from './types'

export function ContainerNode({ data }: NodeProps) {
  const d = data as unknown as SceneNodeData & { __focus?: boolean }
  const t = useFlowTheme()
  const p = patternOf(t, d.pattern, 'external')
  // The badge's gutter comes from the SIZER, not from the text's natural width, so the title starts
  // at exactly the x the header band was measured against. Letting it hug would put the title a few
  // px left of where the wrap was computed — the direction that clips.
  const badgeW = headerBadgeWidth(d.badge) - HEADER_BADGE_GAP
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        borderRadius: 16,
        // Full accent, not a 35%-alpha ghost of it: the outline IS the grouping.
        border: `${d.__focus ? 3 : 1.5}px solid ${d.__focus ? p.color : `${p.color}cc`}`,
        background: d.__focus ? `${p.color}1c` : `${p.color}0d`,
        boxShadow: d.__focus ? `0 0 0 4px ${p.color}2e, 0 0 30px ${p.color}3d` : 'none',
        position: 'relative',
      }}
    >
      <NodeHandles ports={d.ports} />
      <div
        style={{
          position: 'absolute',
          top: HEADER_INSET_Y,
          left: HEADER_INSET_X,
          right: HEADER_INSET_X,
          display: 'flex',
          alignItems: 'flex-start',
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        }}
      >
        {d.badge && (
          // Dimmed, and on the title's baseline: the numeral ORDERS the bands, it does not name
          // them, so it must be findable without competing with the word beside it.
          <div
            style={{
              flex: 'none',
              width: badgeW,
              marginRight: HEADER_BADGE_GAP,
              fontSize: HEADER_TITLE_FONT,
              fontWeight: 600,
              lineHeight: `${HEADER_TITLE_LINE_H}px`,
              color: p.color,
              opacity: 0.55,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {d.badge}
          </div>
        )}
        {hasIcon(d.icon) && (
          // Fixed box, not just `flex: none`: the sizer reserved exactly HEADER_ICON, and a vendor
          // tile that renders a pixel wider would otherwise steal it from the title's measure.
          <div
            style={{
              flex: 'none',
              width: HEADER_ICON,
              height: HEADER_TITLE_LINE_H,
              marginRight: HEADER_ICON_GAP,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <NodeIcon icon={d.icon} pattern={p} size={HEADER_ICON} />
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          {/* The title takes the ACCENT, not the ink. On a canvas whose leaves are plain text,
              colour is what separates "the name of this band" from "a thing inside it". */}
          <div
            style={{
              fontSize: HEADER_TITLE_FONT,
              fontWeight: 600,
              lineHeight: `${HEADER_TITLE_LINE_H}px`,
              overflowWrap: 'anywhere',
              color: p.color,
            }}
          >
            {d.label}
          </div>
          {d.sub && (
            <div
              style={{
                fontSize: HEADER_SUB_FONT,
                lineHeight: `${HEADER_SUB_LINE_H}px`,
                overflowWrap: 'anywhere',
                marginTop: HEADER_SUB_GAP,
                color: t.inkMuted,
              }}
            >
              {d.sub}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
