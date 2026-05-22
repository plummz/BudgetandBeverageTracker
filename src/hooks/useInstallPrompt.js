// Capture the prompt at module level before React mounts — never miss the event
let _deferred = null
const _subs = new Set()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    _deferred = e
    _subs.forEach((fn) => fn(e))
  })
}

import { useState, useEffect } from 'react'

export function useInstallPrompt() {
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true)

  const [prompt, setPrompt] = useState(_deferred)
  const [installed, setInstalled] = useState(isStandalone)

  useEffect(() => {
    if (isStandalone) return
    // Subscribe to future events (in case it fires after mount)
    _subs.add(setPrompt)
    window.addEventListener('appinstalled', () => {
      setInstalled(true)
      _deferred = null
      setPrompt(null)
    })
    return () => _subs.delete(setPrompt)
  }, [isStandalone])

  const install = async () => {
    const p = prompt || _deferred
    if (!p) return false
    p.prompt()
    const { outcome } = await p.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
      _deferred = null
      setPrompt(null)
    }
    return outcome === 'accepted'
  }

  return {
    canInstall: !!(prompt || _deferred) && !installed,
    isInstalled: installed,
    install,
  }
}
