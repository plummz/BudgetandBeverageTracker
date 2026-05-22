import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

/* ─── Instructions sheet (shared) ─────────────────────────────────────────── */
function HowToSheet({ onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[199]"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        initial={{ opacity: 0, y: 52 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 52 }}
        className="fixed bottom-24 left-4 right-4 z-[200] rounded-3xl p-5 space-y-4"
        style={{
          background: '#111',
          border: '1px solid rgba(255,255,255,0.11)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.75)',
        }}
      >
        <div className="flex items-center justify-between">
          <p className="text-base font-black text-white">Add to Home Screen</p>
          <button onClick={onClose} className="text-white/40 active:scale-90 transition-transform">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        {[
          'Tap the ⋮ three-dot menu in Chrome (top-right of browser)',
          'Tap "Add to Home Screen" or "Install app"',
          'Tap "Add" or "Install" to confirm',
        ].map((t, i) => (
          <div key={i} className="flex items-start gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-black"
              style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88' }}
            >
              {i + 1}
            </div>
            <p className="text-sm text-white/70 pt-1">{t}</p>
          </div>
        ))}
        <div
          className="p-3 rounded-xl text-xs text-white/40 text-center"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          Chrome Android · iOS Safari · Desktop Chrome
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ─── Top banner — always visible until dismissed ─────────────────────────── */
export default function InstallBanner() {
  const { canInstall, install } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)
  const [showSheet, setShowSheet] = useState(false)

  if (dismissed) return null

  return (
    <>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.4 }}
        className="mx-3 mt-2 shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg,rgba(0,255,136,0.12),rgba(0,204,106,0.05))',
          border: '1px solid rgba(0,255,136,0.22)',
        }}
      >
        <span className="text-xl shrink-0">📲</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white leading-tight">Install BudgetFlow</p>
          <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Works offline · Add to home screen
          </p>
        </div>
        <button
          onClick={canInstall ? install : () => setShowSheet(true)}
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
          className="shrink-0 active:scale-90 transition-all"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </motion.div>

      {showSheet && <HowToSheet onClose={() => setShowSheet(false)} />}
    </>
  )
}

/* ─── Inline button usable anywhere ──────────────────────────────────────── */
export function InstallButton({ className = '' }) {
  const { canInstall, install } = useInstallPrompt()
  const [showSheet, setShowSheet] = useState(false)

  return (
    <>
      <button
        onClick={canInstall ? install : () => setShowSheet(true)}
        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all active:scale-90 ${className}`}
        style={{
          background: canInstall ? 'linear-gradient(135deg,#00ff88,#00cc6a)' : 'rgba(0,255,136,0.11)',
          color: canInstall ? '#080808' : '#00ff88',
          border: canInstall ? 'none' : '1px solid rgba(0,255,136,0.22)',
        }}
      >
        📲 {canInstall ? 'Install App' : 'Get App'}
      </button>

      {showSheet && <HowToSheet onClose={() => setShowSheet(false)} />}
    </>
  )
}
