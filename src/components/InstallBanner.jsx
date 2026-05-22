import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

export default function InstallBanner() {
  const { canInstall, isInstalled, install } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)
  const [showManual, setShowManual] = useState(false)

  if (isInstalled || dismissed) return null

  return (
    <>
      <AnimatePresence>
        {canInstall && (
          <motion.div
            initial={{ y: -64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -64, opacity: 0 }}
            className="mx-4 mt-2 shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(0,255,136,0.12), rgba(0,204,106,0.06))',
              border: '1px solid rgba(0,255,136,0.25)',
            }}
          >
            <span className="text-2xl shrink-0">📲</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Install BudgetFlow</p>
              <p className="text-xs text-muted truncate">Add to home screen — works offline</p>
            </div>
            <button
              onClick={install}
              className="btn-green text-xs py-2 px-4 shrink-0"
            >
              Install
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
        )}
      </AnimatePresence>

      {/* Manual install instructions — always reachable via button */}
      {!canInstall && !isInstalled && (
        <>
          <AnimatePresence>
            {showManual && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="fixed inset-4 z-[200] flex items-end"
              >
                <div
                  className="w-full rounded-3xl p-5 space-y-4"
                  style={{
                    background: '#111',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-base font-black text-white">Install BudgetFlow</p>
                    <button onClick={() => setShowManual(false)} className="text-white/40 active:scale-90">
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {[
                      { step: '1', icon: '⋮', text: 'Tap the 3-dot menu at the top-right of Chrome' },
                      { step: '2', icon: '📲', text: 'Tap "Add to Home Screen" or "Install app"' },
                      { step: '3', icon: '✅', text: 'Tap "Add" or "Install" to confirm' },
                    ].map((s) => (
                      <div key={s.step} className="flex items-start gap-3">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-black"
                          style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88' }}
                        >
                          {s.step}
                        </div>
                        <p className="text-sm text-white/70 pt-1">{s.text}</p>
                      </div>
                    ))}
                  </div>

                  <div
                    className="p-3 rounded-xl text-xs text-white/50 text-center"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    Works on Chrome Android · iOS Safari · Desktop Chrome
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {showManual && (
            <motion.div
              className="fixed inset-0 z-[199]"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowManual(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </>
      )}
    </>
  )
}

// Exportable hook-driven button to place anywhere in the UI
export function InstallButton({ className = '' }) {
  const { canInstall, isInstalled, install } = useInstallPrompt()
  const [showManual, setShowManual] = useState(false)

  if (isInstalled) {
    return (
      <span className="text-xs text-muted flex items-center gap-1">
        <span className="neon-text">✓</span> Installed
      </span>
    )
  }

  return (
    <>
      <button
        onClick={canInstall ? install : () => setShowManual(true)}
        className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all active:scale-90 ${className}`}
        style={{
          background: canInstall
            ? 'linear-gradient(135deg,#00ff88,#00cc6a)'
            : 'rgba(255,255,255,0.07)',
          color: canInstall ? '#080808' : 'rgba(255,255,255,0.6)',
          border: canInstall ? 'none' : '1px solid rgba(255,255,255,0.1)',
        }}
      >
        📲 {canInstall ? 'Install App' : 'How to Install'}
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
                <button onClick={() => setShowManual(false)} className="text-white/40">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {[
                'Tap the ⋮ three-dot menu in Chrome',
                'Tap "Add to Home Screen" or "Install app"',
                'Tap "Add" to confirm',
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
