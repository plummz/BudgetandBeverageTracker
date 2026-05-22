import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

// One-time SW + cache nuke to fix stale PWA icon data in Chrome's internal store.
// Runs once per BUST_KEY, clears every cache bucket, unregisters the old SW,
// then reloads so the fresh SW re-installs with the correct icons.
const BUST_KEY = 'bf-cache-bust-v5'
if (!localStorage.getItem(BUST_KEY)) {
  localStorage.setItem(BUST_KEY, '1')
  ;(async () => {
    // 1. Wipe every Cache-API bucket (Workbox precache, runtime cache, etc.)
    if ('caches' in window) {
      const names = await caches.keys()
      await Promise.all(names.map(n => caches.delete(n)))
    }
    // 2. Unregister every service worker so Chrome re-registers fresh
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map(r => r.unregister()))
    }
    // 3. Hard-reload — Chrome fetches all resources fresh, re-reads manifest,
    //    downloads icons, rebuilds its PWA installability entry.
    window.location.reload(true)
  })()
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
