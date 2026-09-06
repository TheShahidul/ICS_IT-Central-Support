import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)
const storageKey = 'ics-theme'

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem(storageKey) || 'system')
  const [systemTheme, setSystemTheme] = useState(getSystemTheme)
  const effectiveTheme = mode === 'system' ? systemTheme : mode

  useEffect(() => {
    localStorage.setItem(storageKey, mode)
  }, [mode])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updateSystemTheme = (event) => setSystemTheme(event.matches ? 'dark' : 'light')
    mediaQuery.addEventListener('change', updateSystemTheme)
    return () => mediaQuery.removeEventListener('change', updateSystemTheme)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = effectiveTheme
  }, [effectiveTheme])

  const value = useMemo(() => ({ mode, setMode, effectiveTheme }), [mode, effectiveTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
