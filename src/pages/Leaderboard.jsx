import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useServices } from '../hooks/useServices'
import { useCustomers } from '../hooks/useCustomers'
import Modal from '../components/Modal'
import { formatDateTime } from '../utils/formatters'

const RANK_STYLE = [
  { bg: 'linear-gradient(135deg,#ffd700,#ffb300)', shadow: '#ffd70040', label: '1st', icon: '🥇' },
  { bg: 'linear-gradient(135deg,#c0c0c0,#909090)', shadow: '#c0c0c040', label: '2nd', icon: '🥈' },
  { bg: 'linear-gradient(135deg,#cd7f32,#a0522d)', shadow: '#cd7f3240', label: '3rd', icon: '🥉' },
]

export default function Leaderboard({ isDark }) {
  const { entries } = useServices()
  const { customers, leaderboard, addCustomer, deleteCustomer } = useCustomers(entries)

  const [search, setSearch] = useState('')
  const [profileCustomer, setProfileCustomer] = useState(null)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [newName, setNewName] = useState('')
  const [tab, setTab] = useState('board')

  const textColor = isDark ? 'text-white' : 'text-gray-900'
  const mutedColor = isDark ? 'text-white/45' : 'text-gray-500'

  const filtered = useMemo(() => {
    if (!search.trim()) return leaderboard
    return leaderboard.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [leaderboard, search])

  const top3 = leaderboard.slice(0, 3)
  const rest = filtered.slice(3)

  const totalRevenue = entries.reduce((s, e) => s + e.amount, 0)

  const handleAdd = () => {
    if (!newName.trim()) return
    addCustomer(newName)
    setNewName('')
    setShowAddCustomer(false)
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-black ${textColor}`}>Leaderboard</h1>
            <p className={`text-sm ${mutedColor}`}>{customers.length} customers · ₱{totalRevenue.toFixed(0)} total</p>
          </div>
          <button
            onClick={() => setShowAddCustomer(true)}
            className="btn-green text-sm px-4 py-2"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="px-4 mb-4 shrink-0">
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {['board', 'all'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={tab === t ? {
                background: 'rgba(0,255,136,0.15)',
                color: '#00ff88',
                border: '1px solid rgba(0,255,136,0.3)',
              } : {
                color: 'rgba(255,255,255,0.4)',
                border: '1px solid transparent',
              }}
            >
              {t === 'board' ? '🏆 Rankings' : '👥 All Customers'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'board' ? (
        <>
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="px-4 mb-5 shrink-0">
              <p className="section-title mb-4">Top Customers</p>

              {/* Podium layout */}
              <div className="flex items-end justify-center gap-3">
                {/* 2nd */}
                {top3[1] && (
                  <motion.button
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => setProfileCustomer(top3[1])}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2"
                      style={{ background: 'rgba(192,192,192,0.15)', border: '2px solid #c0c0c0' }}>
                      {top3[1].name.charAt(0).toUpperCase()}
                    </div>
                    <p className={`text-xs font-bold truncate max-w-full ${textColor}`}>{top3[1].name}</p>
                    <p className="text-xs text-muted">{top3[1].orderCount} orders</p>
                    <div className="w-full mt-2 rounded-t-xl py-3 text-center" style={{ background: 'linear-gradient(135deg,rgba(192,192,192,0.2),rgba(192,192,192,0.05))', border: '1px solid rgba(192,192,192,0.3)', borderBottom: 'none', minHeight: 64 }}>
                      <p className="text-[10px] text-muted">🥈</p>
                      <p className="text-sm font-black" style={{ color: '#c0c0c0' }}>₱{top3[1].totalSpent.toFixed(0)}</p>
                    </div>
                  </motion.button>
                )}

                {/* 1st */}
                {top3[0] && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setProfileCustomer(top3[0])}
                    className="flex-1 flex flex-col items-center"
                  >
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-2xl mb-1"
                    >
                      👑
                    </motion.div>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-2"
                      style={{ background: 'rgba(255,215,0,0.15)', border: '2px solid #ffd700', boxShadow: '0 0 20px rgba(255,215,0,0.3)' }}>
                      {top3[0].name.charAt(0).toUpperCase()}
                    </div>
                    <p className={`text-sm font-bold truncate max-w-full ${textColor}`}>{top3[0].name}</p>
                    <p className="text-xs text-muted">{top3[0].orderCount} orders</p>
                    <div className="w-full mt-2 rounded-t-xl py-4 text-center" style={{ background: 'linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,215,0,0.05))', border: '1px solid rgba(255,215,0,0.4)', borderBottom: 'none', minHeight: 80 }}>
                      <p className="text-xs">🥇</p>
                      <p className="text-base font-black" style={{ color: '#ffd700' }}>₱{top3[0].totalSpent.toFixed(0)}</p>
                    </div>
                  </motion.button>
                )}

                {/* 3rd */}
                {top3[2] && (
                  <motion.button
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    onClick={() => setProfileCustomer(top3[2])}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2"
                      style={{ background: 'rgba(205,127,50,0.15)', border: '2px solid #cd7f32' }}>
                      {top3[2].name.charAt(0).toUpperCase()}
                    </div>
                    <p className={`text-xs font-bold truncate max-w-full ${textColor}`}>{top3[2].name}</p>
                    <p className="text-xs text-muted">{top3[2].orderCount} orders</p>
                    <div className="w-full mt-2 rounded-t-xl py-3 text-center" style={{ background: 'linear-gradient(135deg,rgba(205,127,50,0.2),rgba(205,127,50,0.05))', border: '1px solid rgba(205,127,50,0.3)', borderBottom: 'none', minHeight: 48 }}>
                      <p className="text-[10px] text-muted">🥉</p>
                      <p className="text-sm font-black" style={{ color: '#cd7f32' }}>₱{top3[2].totalSpent.toFixed(0)}</p>
                    </div>
                  </motion.button>
                )}
              </div>
            </div>
          )}

          {/* Ranked list (4th+) */}
          {leaderboard.length > 3 && (
            <div className="px-4 mb-4 shrink-0">
              <p className="section-title mb-3">Full Rankings</p>
              <div className="space-y-2">
                {leaderboard.slice(3).map((customer, i) => (
                  <motion.button
                    key={customer.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setProfileCustomer(customer)}
                    className="glass w-full flex items-center gap-3 px-4 py-3 text-left"
                  >
                    <span className={`text-sm font-bold w-6 text-center ${mutedColor}`}>{i + 4}</span>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${textColor}`}>{customer.name}</p>
                      <p className="text-xs text-muted">{customer.orderCount} orders · {customer.favoriteService || 'No orders yet'}</p>
                    </div>
                    <span className="neon-text font-bold font-mono text-sm shrink-0">
                      ₱{customer.totalSpent.toFixed(0)}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {leaderboard.length === 0 && (
            <div className="px-4">
              <div className="glass p-8 text-center">
                <p className="text-4xl mb-3">🏆</p>
                <p className={`text-sm ${mutedColor}`}>No customers yet. Add your first customer!</p>
                <button onClick={() => setShowAddCustomer(true)} className="btn-green text-sm mt-4 px-6 py-2.5">
                  Add Customer
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* All customers tab */
        <div className="px-4">
          <div className="mb-3">
            <input
              className="input"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((customer, i) => (
                <motion.button
                  key={customer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setProfileCustomer(customer)}
                  className="glass w-full flex items-center gap-3 px-4 py-3 text-left"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88' }}>
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${textColor}`}>{customer.name}</p>
                    <p className="text-xs text-muted">{customer.orderCount} orders · {customer.favoriteService || 'no purchases'}</p>
                  </div>
                  <span className="neon-text font-bold font-mono text-sm">₱{customer.totalSpent.toFixed(0)}</span>
                </motion.button>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <p className={`text-sm ${mutedColor} text-center py-8`}>
                {search ? 'No customers found.' : 'No customers yet.'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Customer Profile Modal */}
      <Modal
        open={!!profileCustomer}
        onClose={() => setProfileCustomer(null)}
        title={profileCustomer?.name || ''}
      >
        {profileCustomer && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Spent', value: `₱${profileCustomer.totalSpent.toFixed(0)}`, color: '#00ff88' },
                { label: 'Orders', value: profileCustomer.orderCount, color: '#3b82f6' },
                { label: 'Avg Order', value: profileCustomer.orderCount > 0 ? `₱${(profileCustomer.totalSpent / profileCustomer.orderCount).toFixed(0)}` : '—', color: '#f59e0b' },
              ].map((s) => (
                <div key={s.label} className="glass p-3 text-center rounded-2xl">
                  <p className="text-sm font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] text-muted mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {profileCustomer.favoriteService && (
              <div className="glass px-4 py-3 rounded-2xl">
                <p className="text-xs text-muted mb-0.5">Favorite Service</p>
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {profileCustomer.favoriteService}
                </p>
              </div>
            )}

            <div>
              <p className="section-title mb-3">Transaction History</p>
              <div className="space-y-2">
                {profileCustomer.history.length === 0 ? (
                  <p className="text-sm text-muted text-center py-4">No transactions yet.</p>
                ) : (
                  profileCustomer.history.slice(0, 20).map((e) => (
                    <div key={e.id} className="glass flex items-center gap-3 px-3 py-2.5 rounded-xl">
                      <span className="text-base shrink-0">{e.serviceEmoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{e.serviceName}</p>
                        <p className="text-[10px] text-muted">{formatDateTime(e.timestamp)}</p>
                      </div>
                      <span className="text-xs font-bold font-mono" style={{ color: e.serviceColor }}>
                        +₱{e.amount.toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => { deleteCustomer(profileCustomer.id); setProfileCustomer(null) }}
              className="btn-ghost w-full text-sm"
              style={{ color: '#ff3131', borderColor: 'rgba(255,49,49,0.2)' }}
            >
              Remove Customer
            </button>
          </div>
        )}
      </Modal>

      {/* Add Customer Modal */}
      <Modal open={showAddCustomer} onClose={() => setShowAddCustomer(false)} title="Add Customer">
        <div className="space-y-4">
          <div>
            <span className="label">Name</span>
            <input
              className="input"
              placeholder="Customer name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              autoFocus
            />
          </div>
          <button onClick={handleAdd} className="btn-green w-full">Add Customer</button>
        </div>
      </Modal>
    </div>
  )
}
