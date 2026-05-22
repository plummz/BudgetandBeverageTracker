import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

/* ─── Full-width banner shown at top of app ─── */
export default function InstallBanner() {
  const { canInstall, isInstalled, install } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)
  const [showManual, setShowManual] = useState(false)

  if (isInstalled || dismissed) return null

  return (
    <>
      <motion.div
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="mx-3 mt-2 shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(0,255,136,0.13), rgba(0,204,106,0.06))',
          border: '1px solid rgba(0,255,136,0.28)',
        }}
      >
        <span className="text-xl shrink-0">📲</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white leading-tight">Install BudgetFlow</p>
          <p className="text-xs text-white/45 truncate">Works offline · Add to home screen</p>
        </div>
        <button
          onClick={canInstall ? install : () => setShowManual(true)}
          className="shrink-0 text-xs font-bold px-4 py-2 rounded-xl active:scale-90 transition-all"
          style={{
            background: 'linear-gradient(135deg,#00ff88,#00cc6a)',
            color: '#080808',
          }}
        >
          {canInstall ? 'Install' : 'How to'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-white/30 hover:text-white/60 active:scale-90 transition-all"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </motion.div>

      {/* Manual install sheet */}
      <AnimatePresence>
        {showManual && (
          <>
            <motion.div
              className="fixed inset-0 z-[199]"
              style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowManual(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 48 }}
              className="fixed bottom-24 left-4 right-4 z-[200] rounded-3xl p-5 space-y-4"
              style={{
                background: '#111',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-base font-black text-white">How to Install</p>
                <button onClick={() => setShowManual(false)} className="text-white/40 active:scale-90">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {[
                { n: 1, text: 'Tap the ⋮ three-dot menu in Chrome (top-right)' },
                { n: 2, text: 'Tap "Add to Home Screen" or "Install app"' },
                { n: 3, text: 'Tap "Add" or "Install" to confirm' },
              ].map(({ n, text }) => (
                <div key={n} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-black"
                    style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88' }}>
                    {n}
                  </div>
                  <p className="text-sm text-white/70 pt-1">{text}</p>
                </div>
              ))}
              <div className="p-3 rounded-xl text-xs text-white/40 text-center"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                Chrome Android · iOS Safari · Desktop Chrome
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─── Small inline button usable anywhere ─── */
export function InstallButton({ className = '' }) {
  const { canInstall, isInstalled, install } = useInstallPrompt()
  const [showManual, setShowManual] = useState(false)

  if (isInstalled) {
    return (
      <span className="text-xs flex items-center gap-1" style={{ color: '#00ff88' }}>
        <span>✓</span> Installed
      </span>
    )
  }

  return (
    <>
      <button
        onClick={canInstall ? install : () => setShowManual(true)}
        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all active:scale-90 ${className}`}
        style={{
          background: canInstall ? 'linear-gradient(135deg,#00ff88,#00cc6a)' : 'rgba(0,255,136,0.12)',
          color: canInstall ? '#080808' : '#00ff88',
          border: canInstall ? 'none' : '1px solid rgba(0,255,136,0.25)',
        }}
      >
        📲 {canInstall ? 'Install App' : 'Get App'}
      </button>

      <AnimatePresence>
        {showManual && (
          <>
            <motion.div
              className="fixed inset-0 z-[199]"
              style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowManual(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-24 left-4 right-4 z-[200] rounded-3xl p-5 space-y-4"
              style={{
                background: '#111',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-base font-black text-white">How to Install</p>
                <button onClick={() => setShowManual(false)} className="text-white/40 active:scale-90">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {[
                'Tap the ⋮ three-dot menu in Chrome (top-right)',
                'Tap "Add to Home Screen" or "Install app"',
                'Tap "Add" or "Install" to confirm',
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-black"
                    style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88' }}>
                    {i + 1}
                  </div>
                  <p className="text-sm text-white/70 pt-0.5">{t}</p>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
