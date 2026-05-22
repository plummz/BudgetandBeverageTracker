import { motion, AnimatePresence } from 'framer-motion'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { useState } from 'react'

export default function InstallBanner() {
  const { canInstall, install } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)

  if (!canInstall || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        className="flex items-center gap-3 px-4 py-3 mx-4 mt-2 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(0,255,136,0.12), rgba(0,204,106,0.06))',
          border: '1px solid rgba(0,255,136,0.2)',
        }}
      >
        <span className="text-2xl">📲</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Install BudgetFlow</p>
          <p className="text-xs text-muted truncate">Add to home screen for offline access</p>
        </div>
        <button onClick={install} className="btn-primary text-xs py-2 px-3 whitespace-nowrap">Install</button>
        <button onClick={() => setDismissed(true)} className="text-white/40 hover:text-white/70 transition-colors">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
