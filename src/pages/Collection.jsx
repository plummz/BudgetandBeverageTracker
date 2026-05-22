import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useCollection } from '../hooks/useCollection'
import Modal from '../components/Modal'
import AnimatedNumber from '../components/AnimatedNumber'
import { formatDateTime } from '../utils/formatters'

export default function Collection({ isDark }) {
  const { amountPerTap, history, total, count, setAmount, addCollection, undoLast, reset } = useCollection()
  const [showSetModal, setShowSetModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [newAmount, setNewAmount] = useState(String(amountPerTap))
  const [ripple, setRipple] = useState(false)

  const textColor = isDark ? 'text-white' : 'text-gray-900'
  const mutedColor = isDark ? 'text-white/50' : 'text-gray-500'

  const handleTap = () => {
    addCollection()
    setRipple(true)
    setTimeout(() => setRipple(false), 400)
    toast.success(`+₱${amountPerTap} collected!`, { duration: 1200, icon: '💵' })
  }

  const handleSetAmount = () => {
    const n = parseFloat(newAmount)
    if (isNaN(n) || n <= 0) { toast.error('Enter a valid amount'); return }
    setAmount(n)
    setShowSetModal(false)
    toast.success(`Collection amount set to ₱${n}`)
  }

  const handleReset = () => {
    reset()
    setShowResetModal(false)
    toast.success('Collection reset!')
  }

  const handleUndo = () => {
    if (!history.length) { toast.error('Nothing to undo'); return }
    undoLast()
    toast('Last entry removed', { icon: '↩️' })
  }

  return (
    <div className="page-container gap-4 px-4 pt-4">
      {/* Header */}
      <div className="shrink-0">
        <h1 className={`text-2xl font-black ${textColor}`}>Classroom Collection</h1>
        <p className={`text-sm ${mutedColor}`}>Track xerox, activity fees & payments</p>
      </div>

      {/* Amount config */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card flex items-center justify-between px-5 py-4 shrink-0"
      >
        <div>
          <p className={`text-xs ${mutedColor} mb-0.5`}>Per collection</p>
          <p className="neon-text font-black text-2xl font-mono">₱{amountPerTap}</p>
        </div>
        <button
          onClick={() => { setNewAmount(String(amountPerTap)); setShowSetModal(true) }}
          className="btn-ghost text-sm"
        >
          Change Amount
        </button>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 shrink-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="glass-card-elevated neon-border p-4 text-center"
        >
          <p className={`text-xs ${mutedColor} mb-1`}>Total Collected</p>
          <AnimatedNumber value={total} prefix="₱" className="text-3xl font-black font-mono neon-text" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.08 }}
          className="glass-card-elevated p-4 text-center"
          style={{ border: '1px solid rgba(59,130,246,0.3)' }}
        >
          <p className={`text-xs ${mutedColor} mb-1`}>Students Paid</p>
          <AnimatedNumber value={count} decimals={0} className="text-3xl font-black font-mono" style={{ color: '#3b82f6' }} />
        </motion.div>
      </div>

      {/* BIG TAP BUTTON */}
      <div className="flex flex-col items-center justify-center py-4 shrink-0">
        <motion.button
          onTapStart={handleTap}
          whileTap={{ scale: 0.9 }}
          className="relative w-52 h-52 rounded-full flex flex-col items-center justify-center select-none overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
            boxShadow: '0 0 60px rgba(0,255,136,0.35), 0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Ripple */}
          <AnimatePresence>
            {ripple && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'rgba(255,255,255,0.25)' }}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </AnimatePresence>

          <span className="text-5xl font-black text-dark-bg select-none" style={{ fontFamily: 'monospace' }}>💵</span>
          <span className="text-dark-bg font-black text-lg mt-1 select-none">ADD COLLECTION</span>
          <span className="text-dark-bg/70 font-bold text-sm select-none">+₱{amountPerTap}</span>
        </motion.button>

        <p className={`text-xs ${mutedColor} mt-4 text-center`}>
          Tap the button for each payment received
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 shrink-0">
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={handleUndo}
          disabled={!history.length}
          className="flex-1 btn-ghost flex items-center justify-center gap-2 text-sm disabled:opacity-30"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 7v6h6M3.51 13A9 9 0 1 0 5.1 5.36L3 7" />
          </svg>
          Undo Last
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setShowHistoryModal(true)}
          className="flex-1 btn-ghost flex items-center justify-center gap-2 text-sm"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          History
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setShowResetModal(true)}
          className="flex-1 btn-ghost flex items-center justify-center gap-2 text-sm"
          style={{ color: '#ff3131', borderColor: 'rgba(255,49,49,0.2)' }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 7h16M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3" />
          </svg>
          Reset
        </motion.button>
      </div>

      {/* Recent history preview */}
      {history.length > 0 && (
        <div className="shrink-0">
          <p className={`text-sm font-semibold ${textColor} mb-3`}>Recent Collections</p>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {history.slice(0, 5).map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">💵</span>
                    <div>
                      <p className={`text-sm font-medium ${textColor}`}>Collection #{count - i}</p>
                      <p className={`text-xs ${mutedColor}`}>{formatDateTime(entry.timestamp)}</p>
                    </div>
                  </div>
                  <span className="neon-text font-bold font-mono text-sm">+₱{entry.amount.toFixed(2)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {history.length > 5 && (
              <button
                onClick={() => setShowHistoryModal(true)}
                className={`text-xs ${mutedColor} text-center w-full py-2 active:opacity-50`}
              >
                +{history.length - 5} more entries → View All
              </button>
            )}
          </div>
        </div>
      )}

      <div className="h-4 shrink-0" />

      {/* Set Amount Modal */}
      <Modal open={showSetModal} onClose={() => setShowSetModal(false)} title="Set Collection Amount">
        <div className="space-y-4">
          <p className={`text-sm ${mutedColor}`}>How much is collected per student?</p>
          <div>
            <label className={`block text-xs font-medium ${mutedColor} mb-2`}>Amount per tap (₱)</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="15"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="input-field text-2xl font-mono"
              autoFocus
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[5, 10, 15, 20, 25, 50].map((n) => (
              <button
                key={n}
                onClick={() => setNewAmount(String(n))}
                className="btn-ghost text-sm py-1.5 px-4"
              >
                ₱{n}
              </button>
            ))}
          </div>
          <button onClick={handleSetAmount} className="btn-primary w-full font-bold">
            Set Amount
          </button>
        </div>
      </Modal>

      {/* Reset Confirm Modal */}
      <Modal open={showResetModal} onClose={() => setShowResetModal(false)} title="Reset Collection?">
        <div className="space-y-4">
          <p className={`text-sm ${mutedColor}`}>
            This will clear all {count} collection entries (₱{total.toFixed(2)} total). This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowResetModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleReset} className="btn-danger flex-1">Reset All</button>
          </div>
        </div>
      </Modal>

      {/* Full History Modal */}
      <Modal open={showHistoryModal} onClose={() => setShowHistoryModal(false)} title={`All Collections (${count})`}>
        <div className="space-y-2">
          {history.length === 0 ? (
            <p className={`text-sm ${mutedColor} text-center py-8`}>No collections yet.</p>
          ) : (
            history.map((entry, i) => (
              <div key={entry.id} className="glass-card flex items-center justify-between px-4 py-3">
                <div>
                  <p className={`text-sm font-medium ${textColor}`}>Entry #{history.length - i}</p>
                  <p className={`text-xs ${mutedColor}`}>{formatDateTime(entry.timestamp)}</p>
                </div>
                <span className="neon-text font-bold font-mono text-sm">+₱{entry.amount.toFixed(2)}</span>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  )
}
