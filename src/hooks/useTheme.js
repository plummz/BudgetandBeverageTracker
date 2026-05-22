import { useState, useEffect, useCallback } from 'react'
import { storage, STORAGE_KEYS } from '../utils/storage'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const stored = storage.get(STORAGE_KEYS.THEME)
    if (stored !== null) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }, [isDark])

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      storage.set(STORAGE_KEYS.THEME, next ? 'dark' : 'light')
      return next
    })
  }, [])

  return { isDark, toggle }
}
