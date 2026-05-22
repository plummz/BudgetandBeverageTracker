import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useBudget } from '../hooks/useBudget'
import Modal from '../components/Modal'
import AnimatedNumber from '../components/AnimatedNumber'
import { formatDate, formatTime, getWeekDays } from '../utils/formatters'
import { EXPENSE_CATEGORIES, getRandom, budgetQuotes } from '../utils/quotes'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const quote = getRandom(budgetQuotes)

const ENTRY_TYPES = [
  { id: 'expense', label: 'Expense', color: '#ff3131', emoji: '💸' },
  { id: 'income', label: 'Income', color: '#00ff88', emoji: '💰' },
  { id: 'savings', label: 'Savings', color: '#3b82f6', emoji: '🏦' },
]

export default function Dashboard({ isDark }) {
  const { allowance, entries, setAllowance, addEntry, deleteEntry, stats } = useBudget()

  const [showAdd, setShowAdd] = useState(false)
  const [showAllowance, setShowAllowance] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [form, setForm] = useState({ type: 'expense', category: 'food', amount: '', note: '' })
  const [newAllowance, setNewAllowance] = useState(String(allowance))

  const textColor = isDark ? 'text-white' : 'text-gray-900'
  const mutedColor = isDark ? 'text-white/45' : 'text-gray-500'

  const today = new Date().toISOString().split('T')[0]
  const todayEntries = entries.filter((e) => e.date === today)

  const chartData = useMemo(() => {
    return getWeekDays().map((day) => {
      const spent = entries.filter((e) => e.date === day && e.type === 'expense').reduce((s, e) => s + e.amount, 0)
      const saved = entries.filter((e) => e.date === day && e.type === 'savings').reduce((s, e) => s + e.amount, 0)
      const label = new Date(day + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'short' })
      return { day: label, spent, saved }
    })
  }, [entries])

  const spentPct = stats.totalIncome > 0 ? Math.min((stats.totalExpenses / stats.totalIncome) * 100, 100) : 0
  const savedPct = stats.totalIncome > 0 ? Math.min((stats.totalSaved / stats.totalIncome) * 100, 100) : 0

  const handleAdd = () => {
    if (!form.amount || parseFloat(form.amount) <= 0) { toast.error('Enter a valid amount'); return }
    addEntry(form)
    setForm({ type: 'expense', category: 'food', amount: '', note: '' })
    setShowAdd(false)
    toast.success('Entry added!')
  }

  const handleSetAllowance = () => {
    const n = parseFloat(newAllowance)
    if (isNaN(n) || n < 0) { toast.error('Invalid amount'); return }
    setAllowance(n)
    setShowAllowance(false)
    toast.success('Allowance updated!')
  }

  const getCatEmoji = (id) => EXPENSE_CATEGORIES.find((c) => c.id === id)?.emoji || '📦'
  const getCatLabel = (id) => EXPENSE_CATEGORIES.find((c) => c.id === id)?.label || id

  return (
    <div className="page gap-4">
      {/* Header */}
      <div className="px-4 pt-5 pb-1 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-black ${textColor}`}>Budget</h1>
            <p className={`text-sm ${mutedColor}`}>
              {new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setNewAllowance(String(allowance)); setShowAllowance(true) }}
            className="text-right"
          >
            <p className={`text-[10px] ${mutedColor} uppercase tracking-wide`}>Daily Budget</p>
            <p className="neon-text font-black text-xl font-mono">₱{allowance.toLocaleString()}</p>
          </motion.button>
        </div>
      </div>

      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 glass-high shrink-0"
        style={{ border: '1px solid rgba(0,255,136,0.18)', boxShadow: '0 0 32px rgba(0,255,136,0.08)' }}
      >
        <div className="p-5">
          <p className={`text-xs font-semibold uppercase tracking-widest ${mutedColor} mb-1`}>Remaining Balance</p>
          <AnimatedNumber
            value={stats.balance}
            prefix="₱"
            className={`text-5xl font-black font-mono ${stats.balance >= 0 ? 'neon-text' : 'scarlet-text'}`}
          />

          <div className="mt-5 space-y-3">
            {[
              { label: 'Spent', value: stats.totalExpenses, pct: spentPct, color: '#ff3131' },
              { label: 'Saved', value: stats.totalSaved, pct: savedPct, color: '#3b82f6' },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className={mutedColor}>{bar.label}</span>
                  <span className="font-mono font-bold" style={{ color: bar.color }}>₱{bar.value.toFixed(2)}</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: bar.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.pct}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="px-4 grid grid-cols-3 gap-2.5 shrink-0">
        {[
          { label: 'Budget', value: stats.totalIncome, color: 'rgba(255,255,255,0.85)', emoji: '💵' },
          { label: 'Spent', value: stats.totalExpenses, color: '#ff3131', emoji: '💸' },
          { label: 'Saved', value: stats.totalSaved, color: '#3b82f6', emoji: '🏦' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass p-3 text-center rounded-2xl"
          >
            <p className="text-lg mb-0.5">{s.emoji}</p>
            <AnimatedNumber
              value={s.value}
              prefix="₱"
              decimals={0}
              className="text-sm font-black font-mono"
              style={{ color: s.color }}
            />
            <p className={`text-[10px] ${mutedColor} mt-0.5`}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Motivational quote */}
      <div className="mx-4 shrink-0">
        <div className="glass px-4 py-3 rounded-2xl" style={{ borderLeft: '3px solid rgba(0,255,136,0.4)' }}>
          <p className={`text-xs italic ${mutedColor}`}>"{quote}"</p>
        </div>
      </div>

      {/* Weekly chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mx-4 glass-md p-4 rounded-2xl shrink-0"
      >
        <p className={`text-sm font-bold ${textColor} mb-3`}>7-Day Overview</p>
        <ResponsiveContainer width="100%" height={110}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff3131" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#ff3131" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="svGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} labelStyle={{ color: 'rgba(255,255,255,0.6)' }} />
            <Area type="monotone" dataKey="spent" stroke="#ff3131" strokeWidth={2} fill="url(#spGrad)" name="Spent ₱" />
            <Area type="monotone" dataKey="saved" stroke="#3b82f6" strokeWidth={2} fill="url(#svGrad)" name="Saved ₱" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Today's entries */}
      <div className="px-4 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">Today's Entries</p>
          {entries.length > 0 && (
            <button onClick={() => setShowHistory(true)} className={`text-xs ${mutedColor} active:opacity-50`}>
              View all →
            </button>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {todayEntries.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-6 text-center rounded-2xl">
              <p className="text-3xl mb-2">📭</p>
              <p className={`text-sm ${mutedColor}`}>No entries today. Tap + to add one.</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {todayEntries.slice(0, 8).map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, height: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass flex items-center gap-3 px-4 py-3 rounded-2xl"
                >
                  <span className="text-xl shrink-0">
                    {entry.type === 'expense' ? getCatEmoji(entry.category) : entry.type === 'income' ? '💰' : '🏦'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${textColor}`}>
                      {entry.note || (entry.type === 'expense' ? getCatLabel(entry.category) : entry.type === 'income' ? 'Extra Income' : 'Savings')}
                    </p>
                    <p className={`text-xs ${mutedColor}`}>{formatTime(entry.timestamp)}</p>
                  </div>
                  <span className="text-sm font-bold font-mono shrink-0"
                    style={{ color: entry.type === 'expense' ? '#ff3131' : entry.type === 'income' ? '#00ff88' : '#3b82f6' }}>
                    {entry.type === 'expense' ? '-' : '+'}₱{entry.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => setDeleteTarget(entry.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-all"
                    style={{ background: 'rgba(255,49,49,0.1)' }}
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="#ff3131" strokeWidth="2.5">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-4 shrink-0" />

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.06 }}
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full flex items-center justify-center z-40"
        style={{
          background: 'linear-gradient(135deg,#00ff88,#00cc6a)',
          boxShadow: '0 8px 32px rgba(0,255,136,0.4)',
        }}
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="#080808" strokeWidth="3" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </motion.button>

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Entry">
        <div className="space-y-4">
          <div>
            <span className="label">Type</span>
            <div className="grid grid-cols-3 gap-2">
              {ENTRY_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setForm((f) => ({ ...f, type: t.id }))}
                  className="py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                  style={{
                    background: form.type === t.id ? `${t.color}1a` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${form.type === t.id ? t.color + '55' : 'rgba(255,255,255,0.07)'}`,
                    color: form.type === t.id ? t.color : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="label">Amount (₱)</span>
            <input
              type="number" inputMode="decimal" placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="input text-2xl font-mono"
            />
          </div>

          {form.type === 'expense' && (
            <div>
              <span className="label">Category</span>
              <div className="grid grid-cols-3 gap-2">
                {EXPENSE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setForm((f) => ({ ...f, category: cat.id }))}
                    className="py-2 px-1 rounded-xl text-xs font-medium transition-all active:scale-95"
                    style={{
                      background: form.category === cat.id ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${form.category === cat.id ? 'rgba(0,255,136,0.35)' : 'rgba(255,255,255,0.06)'}`,
                      color: form.category === cat.id ? '#00ff88' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="label">Note (optional)</span>
            <input
              type="text" placeholder="What was this for?"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className="input"
            />
          </div>

          <button onClick={handleAdd} className="btn-green w-full">Add Entry</button>
        </div>
      </Modal>

      {/* Allowance Modal */}
      <Modal open={showAllowance} onClose={() => setShowAllowance(false)} title="Set Daily Allowance">
        <div className="space-y-4">
          <p className={`text-sm ${mutedColor}`}>Set your daily budget for tracking expenses and savings.</p>
          <div>
            <span className="label">Amount (₱)</span>
            <input
              type="number" inputMode="decimal" placeholder="0.00"
              value={newAllowance}
              onChange={(e) => setNewAllowance(e.target.value)}
              className="input text-2xl font-mono"
              autoFocus
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[50, 100, 150, 200, 300, 500].map((n) => (
              <button key={n} onClick={() => setNewAllowance(String(n))} className="btn-ghost text-sm py-1.5 px-4">
                ₱{n}
              </button>
            ))}
          </div>
          <button onClick={handleSetAllowance} className="btn-green w-full">Save</button>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal open={showHistory} onClose={() => setShowHistory(false)} title="All Entries">
        <div className="space-y-2">
          {entries.length === 0 ? (
            <p className={`text-sm ${mutedColor} text-center py-8`}>No entries yet.</p>
          ) : (
            entries.map((e) => (
              <div key={e.id} className="glass flex items-center gap-3 px-4 py-3 rounded-2xl">
                <span className="text-lg shrink-0">
                  {e.type === 'expense' ? getCatEmoji(e.category) : e.type === 'income' ? '💰' : '🏦'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${textColor}`}>
                    {e.note || getCatLabel(e.category)}
                  </p>
                  <p className={`text-xs ${mutedColor}`}>{formatDate(e.date)} · {formatTime(e.timestamp)}</p>
                </div>
                <span className="text-sm font-bold font-mono shrink-0"
                  style={{ color: e.type === 'expense' ? '#ff3131' : '#00ff88' }}>
                  {e.type === 'expense' ? '-' : '+'}₱{e.amount.toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Entry?">
        <div className="space-y-4">
          <p className={`text-sm ${mutedColor}`}>Are you sure you want to delete this entry?</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteTarget(null)} className="btn-ghost flex-1">Cancel</button>
            <button
              onClick={() => { deleteEntry(deleteTarget); setDeleteTarget(null); toast.success('Deleted') }}
              className="btn-red flex-1"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
