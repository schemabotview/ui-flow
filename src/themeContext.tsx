import { createContext, useContext } from 'react'
import { THEMES, type Theme } from './themes'

const FlowThemeContext = createContext<Theme>(THEMES.dark)

export const FlowThemeProvider = FlowThemeContext.Provider

export const useFlowTheme = (): Theme => useContext(FlowThemeContext)
