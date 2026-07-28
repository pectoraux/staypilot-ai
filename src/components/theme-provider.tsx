'use client'

import * as React from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
})

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  enableSystem = true,
  ...props
}: {
  children: React.ReactNode
  defaultTheme?: string
  enableSystem?: boolean
  attribute?: string
  disableTransitionOnChange?: boolean
}) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme as Theme)

  React.useEffect(() => {
    // Read from localStorage or system preference
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('theme') : null
    if (stored === 'dark' || stored === 'light') {
      setThemeState(stored)
    } else if (enableSystem && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setThemeState('light')
    }
  }, [enableSystem])

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    window.localStorage.setItem('theme', theme)
  }, [theme])

  const setTheme = React.useCallback((t: Theme) => setThemeState(t), [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }} {...props}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return React.useContext(ThemeContext)
}
