import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useBudget } from '../hooks/useBudget'
import Modal from '../components/Modal'
import AnimatedNumber from '../components/AnimatedNumber'
import { formatDate, formatTime, getWeekDays } from '../utils/formatters'
import { EXPENSE_CATEGORIES, getRandom, budgetQuotes } from '../utils/quotes'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const [quote] = [getRandom(budgetQuotes)]

const ENTRY_TYPES = [
  { id: 'expense', label: 'Expense', color: '#ff3131', emoji: '💸' },
  { id: 'income', label: 'Extra Income', color: '#00ff88', emoji: '💰' },
  { id: 'savings', label: 'Savings', color: '#3b82f6', emoji: '🏦' },
]

export default function Dashboard({ isDark }) {
  const { allowance, entries, setAllowance, addEntry, deleteEntry, stats } = useBudget()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showAllowanceModal, setShowAllowanceModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const [form, setForm] = useState({ type: 'expense', category: 'food', amount: '', note: '' })
  const [newAllowance, setNewAllowance] = useState(String(allowance))

  const textColor = isDark ? 'text-white' : 'text-gray-900'
  const mutedColor = isDark ? 'text-white/50' : 'text-gray-500'

  const todayEntries = entries.filter((e) => {
    const today = new Date().toISOString().split('T')[0]
    return e.date === today
  })

  const weekDays = getWeekDays()
  const chartData = useMemo(() => {
    return weekDays.map((day) => {
      const dayExpenses = entries
        .filter((e) => e.date === day && e.type === 'expense')
        .reduce((s, e) => s + e.amount, 0)
      const daySaved = entries
        .filter((e) => e.date === day && e.type === 'savings')
        .reduce((s, e) => s + e.amount, 0)
      const label = new Date(day + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'short' })
      return { day: label, spent: dayExpenses, saved: daySaved }
    })
  }, [entries, weekDays])

  const handleAddEntry = () => {
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    addEntry(form)
    setForm({ type: 'expense', category: 'food', amount: '', note: '' })
    setShowAddModal(false)
    toast.success(`${form.type === 'expense' ? 'Expense' : form.type === 'income' ? 'Income' : 'Savings'} added!`)
  }

  const handleSetAllowance = () => {
    const amt = parseFloat(newAllowance)
    if (isNaN(amt) || amt < 0) { toast.error('Invalid amount'); return }
    setAllowance(amt)
    setShowAllowanceModal(false)
    toast.success('Allowance updated!')
  }

  const spentPct = stats.totalIncome > 0 ? Math.min((stats.totalExpenses / stats.totalIncome) * 100, 100) : 0
  const savedPct = stats.totalIncome > 0 ? Math.min((stats.totalSaved / stats.totalIncome) * 100, 100) : 0

  const getCatEmoji = (id) => EXPENSE_CATEGORIES.find((c) => c.id === id)?.emoji || '📦'

  return (
    <div className="page-container gap-4 px-4 pt-4">
      {/* Header */}
      <div className="flex items-start justify-between shrink-0">
        <div>
          <h1 className={`text-2xl font-black ${textColor}`}>BudgetFlow</h1>
          <p className={`text-sm ${mutedColor}`}>
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { setNewAllowance(String(allowance)); setShowAllowanceModal(true) }}
          className="flex flex-col items-end"
        >
          <span className={`text-xs ${mutedColor}`}>Daily Budget</span>
          <span className="neon-text font-black text-xl font-mono">₱{allowance.toLocaleString()}</span>
        </motion.button>
      </div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card px-4 py-3 shrink-0"
      >
        <p className={`text-xs italic ${mutedColor}`}>💡 {quote}</p>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="glass-card-elevated shrink-0 p-5 neon-border"
      >
        <p className={`text-xs font-medium uppercase tracking-widest ${mutedColor} mb-1`}>Remaining Balance</p>
        <AnimatedNumber
          value={stats.balance}
          prefix="₱"
          className={`text-4xl font-black font-mono ${stats.balance >= 0 ? 'neon-text' : 'scarlet-text'}`}
        />

        <div className="mt-4 space-y-2">
          {/* Spent bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className={mutedColor}>Spent</span>
              <span className="scarlet-text font-mono">₱{stats.totalExpenses.toFixed(2)}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: '#ff3131' }}
                initial={{ width: 0 }}
                animate={{ width: `${spentPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
          {/* Saved bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className={mutedColor}>Saved</span>
              <span className="neon-text font-mono">₱{stats.totalSaved.toFixed(2)}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: '#00ff88' }}
                initial={{ width: 0 }}
                animate={{ width: `${savedPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 shrink-0">
        {[
          { label: 'Budget', value: stats.totalIncome, color: '#fff', emoji: '💵' },
          { label: 'Spent', value: stats.totalExpenses, color: '#ff3131', emoji: '💸' },
          { label: 'Saved', value: stats.totalSaved, color: '#00ff88', emoji: '🏦' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-3 text-center"
          >
            <p className="text-xl mb-0.5">{stat.emoji}</p>
            <AnimatedNumber value={stat.value} prefix="₱" decimals={0} className="text-sm font-bold font-mono" style={{ color: stat.color }} />
            <p className={`text-xs ${mutedColor} mt-0.5`}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-4 shrink-0"
      >
        <p className={`text-sm font-semibold ${textColor} mb-3`}>7-Day Overview</p>
        <ResponsiveContainer width="100%" height={110}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff3131" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ff3131" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="savedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="spent" stroke="#ff3131" strokeWidth={2} fill="url(#spentGrad)" name="Spent ₱" />
            <Area type="monotone" dataKey="saved" stroke="#00ff88" strokeWidth={2} fill="url(#savedGrad)" name="Saved ₱" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Today's entries */}
      <div className="shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className={`text-sm font-semibold ${textColor}`}>Today's Entries</p>
          {entries.length > 0 && (
            <button onClick={() => setShowHistoryModal(true)} className={`text-xs ${mutedColor} active:opacity-50`}>
              View all →
            </button>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {todayEntries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-6 text-center"
            >
              <p className="text-3xl mb-2">📭</p>
              <p className={`text-sm ${mutedColor}`}>No entries today. Tap + to add one.</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {todayEntries.slice(0, 8).map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16, height: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-card flex items-center gap-3 px-4 py-3"
                >
                  <span className="text-xl shrink-0">
                    {entry.type === 'expense' ? getCatEmoji(entry.category) : entry.type === 'income' ? '💰' : '🏦'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${textColor}`}>
                      {entry.note || (entry.type === 'expense' ? EXPENSE_CATEGORIES.find(c => c.id === entry.category)?.label : entry.type === 'income' ? 'Extra Income' : 'Savings')}
                    </p>
                    <p className={`text-xs ${mutedColor}`}>{formatTime(entry.timestamp)}</p>
                  </div>
                  <span
                    className="text-sm font-bold font-mono shrink-0"
                    style={{ color: entry.type === 'expense' ? '#ff3131' : entry.type === 'income' ? '#00ff88' : '#3b82f6' }}
                  >
                    {entry.type === 'expense' ? '-' : '+'}₱{entry.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => setDeleteConfirm(entry.id)}
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-all"
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

      {/* Spacer */}
      <div className="h-4 shrink-0" />

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.06 }}
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-40"
        style={{
          background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
          boxShadow: '0 8px 32px rgba(0,255,136,0.4)',
        }}
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </motion.button>

      {/* Add Entry Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Entry">
        <div className="space-y-4">
          {/* Type selector */}
          <div>
            <label className={`block text-xs font-medium ${mutedColor} mb-2`}>Type</label>
            <div className="grid grid-cols-3 gap-2">
              {ENTRY_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setForm((f) => ({ ...f, type: t.id }))}
                  className="py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95"
                  style={{
                    background: form.type === t.id ? `${t.color}22` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${form.type === t.id ? t.color + '60' : 'rgba(255,255,255,0.08)'}`,
                    color: form.type === t.id ? t.color : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className={`block text-xs font-medium ${mutedColor} mb-2`}>Amount (₱)</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="input-field text-xl font-mono"
            />
          </div>

          {/* Category (expense only) */}
          {form.type === 'expense' && (
            <div>
              <label className={`block text-xs font-medium ${mutedColor} mb-2`}>Category</label>
              <div className="grid grid-cols-3 gap-2">
                {EXPENSE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setForm((f) => ({ ...f, category: cat.id }))}
                    className="py-2 px-1 rounded-xl text-xs font-medium transition-all active:scale-95"
                    style={{
                      background: form.category === cat.id ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${form.category === cat.id ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      color: form.category === cat.id ? '#00ff88' : 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label className={`block text-xs font-medium ${mutedColor} mb-2`}>Note (optional)</label>
            <input
              type="text"
              placeholder="What was this for?"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className="input-field"
            />
          </div>

          <button onClick={handleAddEntry} className="btn-primary w-full text-sm font-bold mt-2">
            Add Entry
          </button>
        </div>
      </Modal>

      {/* Set Allowance Modal */}
      <Modal open={showAllowanceModal} onClose={() => setShowAllowanceModal(false)} title="Set Daily Allowance">
        <div className="space-y-4">
          <p className={`text-sm ${mutedColor}`}>Set your daily allowance/budget for today.</p>
          <div>
            <label className={`block text-xs font-medium ${mutedColor} mb-2`}>Amount (₱)</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={newAllowance}
              onChange={(e) => setNewAllowance(e.target.value)}
              className="input-field text-2xl font-mono"
              autoFocus
            />
          </div>
          <button onClick={handleSetAllowance} className="btn-primary w-full font-bold">
            Save Allowance
          </button>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal open={showHistoryModal} onClose={() => setShowHistoryModal(false)} title="All Entries">
        <div className="space-y-2">
          {entries.length === 0 ? (
            <p className={`text-sm ${mutedColor} text-center py-8`}>No entries yet.</p>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="glass-card flex items-center gap-3 px-4 py-3">
                <span className="text-xl shrink-0">
                  {entry.type === 'expense' ? getCatEmoji(entry.category) : entry.type === 'income' ? '💰' : '🏦'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${textColor}`}>
                    {entry.note || EXPENSE_CATEGORIES.find(c => c.id === entry.category)?.label || entry.type}
                  </p>
                  <p className={`text-xs ${mutedColor}`}>{formatDate(entry.date)} · {formatTime(entry.timestamp)}</p>
                </div>
                <span
                  className="text-sm font-bold font-mono shrink-0"
                  style={{ color: entry.type === 'expense' ? '#ff3131' : '#00ff88' }}
                >
                  {entry.type === 'expense' ? '-' : '+'}₱{entry.amount.toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Entry?">
        <div className="space-y-4">
          <p className={`text-sm ${mutedColor}`}>Are you sure you want to delete this entry?</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-ghost flex-1">Cancel</button>
            <button
              onClick={() => { deleteEntry(deleteConfirm); setDeleteConfirm(null); toast.success('Deleted') }}
              className="btn-danger flex-1"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
