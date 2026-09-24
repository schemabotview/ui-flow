// How a theme reaches a node renderer.
//
// Not through `data`. react-flow owns node props, and stuffing the theme into every node's `data`
// would (a) put a large object in the memo key that changes identity on every render, and (b) mean a
// renderer silently falls back when a caller forgets. A context is read-only, has one provider, and
// gives every renderer the same object — which is the property that matters, because a card's accent
// and the edge pulse arriving at it are computed in two different files and must agree.
//
// Default is THEMES.dark, whose values are byte-identical to 0.7.0's hardcoded ones. So a renderer
// that is never wrapped — or a repo that never passes `theme` — paints exactly what it painted before.

import { createContext, useContext } from 'react'
import { THEMES, type Theme } from './themes'

const FlowThemeContext = createContext<Theme>(THEMES.dark)

export const FlowThemeProvider = FlowThemeContext.Provider

/** The active theme. Safe outside a provider — falls back to dark, i.e. 0.7.0 behaviour. */
export const useFlowTheme = (): Theme => useContext(FlowThemeContext)
