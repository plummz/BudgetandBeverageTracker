import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useServices } from '../hooks/useServices'
import { useCustomers } from '../hooks/useCustomers'
import Modal from '../components/Modal'
import AnimatedNumber from '../components/AnimatedNumber'
import { formatDateTime } from '../utils/formatters'
import { SERVICE_COLORS, SERVICE_EMOJIS } from '../utils/quotes'

const RANK_COLORS = { 0: '#ffd700', 1: '#c0c0c0', 2: '#cd7f32' }

export default function Collection({ isDark }) {
  const services = useServices()
  const {
    entries, serviceStats, todayEntries, todayTotal, allTimeTotal,
    addEntry, undoLast, addService, updateService, deleteService,
  } = services
  const { customers, recentCustomers, addCustomer } = useCustomers(entries)

  const [activeServiceId, setActiveServiceId] = useState(null)
  const [activeCustomerId, setActiveCustomerId] = useState(null)
  const [activeCustomerName, setActiveCustomerName] = useState(null)
  const [ripple, setRipple] = useState(false)
  const [lastAdded, setLastAdded] = useState(null)

  const [showAddService, setShowAddService] = useState(false)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [showEditService, setShowEditService] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  const [newService, setNewService] = useState({ name: '', price: '', color: '#00ff88', emoji: '🖨️' })
  const [newCustomerName, setNewCustomerName] = useState('')

  const textColor = isDark ? 'text-white' : 'text-gray-900'
  const mutedColor = isDark ? 'text-white/45' : 'text-gray-500'

  const activeService = services.services.find((s) => s.id === activeServiceId)

  const handleTap = useCallback(() => {
    if (!activeServiceId) {
      toast('Select a service first', { icon: '👆' })
      return
    }
    const entry = addEntry(activeServiceId, activeCustomerId, activeCustomerName)
    if (!entry) return
    setRipple(true)
    setTimeout(() => setRipple(false), 400)
    setLastAdded(entry)
    toast.success(`+₱${entry.amount} — ${entry.serviceName}`, { duration: 1500 })
  }, [activeServiceId, activeCustomerId, activeCustomerName, addEntry])

  const handleUndo = () => {
    if (undoLast()) {
      toast('Undone', { icon: '↩️' })
      setLastAdded(null)
    } else {
      toast.error('Nothing to undo')
    }
  }

  const handleSelectCustomer = (id, name) => {
    if (activeCustomerId === id) {
      setActiveCustomerId(null)
      setActiveCustomerName(null)
    } else {
      setActiveCustomerId(id)
      setActiveCustomerName(name)
    }
  }

  const handleAddCustomer = () => {
    if (!newCustomerName.trim()) { toast.error('Enter a name'); return }
    const c = addCustomer(newCustomerName)
    if (c) {
      setActiveCustomerId(c.id)
      setActiveCustomerName(c.name)
      setNewCustomerName('')
      setShowAddCustomer(false)
      toast.success(`${c.name} added!`)
    }
  }

  const handleSaveService = () => {
    if (!newService.name.trim()) { toast.error('Enter a service name'); return }
    if (!newService.price || parseFloat(newService.price) <= 0) { toast.error('Enter a valid price'); return }
    addService(newService)
    setNewService({ name: '', price: '', color: '#00ff88', emoji: '🖨️' })
    setShowAddService(false)
    toast.success('Service added!')
  }

  const handleDeleteService = (id) => {
    deleteService(id)
    if (activeServiceId === id) setActiveServiceId(null)
    setShowEditService(null)
    toast.success('Service deleted')
  }

  const recentTen = entries.slice(0, 10)

  return (
    <div className="page gap-0">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-black ${textColor}`}>Business</h1>
            <p className={`text-sm ${mutedColor}`}>Classroom collection tracker</p>
          </div>
          <div className="text-right">
            <p className={`text-xs ${mutedColor}`}>Today</p>
            <AnimatedNumber value={todayTotal} prefix="₱" className="text-xl font-black neon-text" />
          </div>
        </div>
      </div>

      {/* All-time + today stats */}
      <div className="px-4 mb-4 shrink-0">
        <div className="glass-md p-4 flex items-center justify-between">
          <div>
            <p className={`text-xs ${mutedColor} mb-0.5`}>All-time earnings</p>
            <AnimatedNumber value={allTimeTotal} prefix="₱" className="text-3xl font-black neon-text" />
          </div>
          <div className="text-right">
            <p className={`text-xs ${mutedColor} mb-0.5`}>Transactions</p>
            <p className={`text-2xl font-black ${textColor}`}>{entries.length}</p>
          </div>
        </div>
      </div>

      {/* Services grid */}
      <div className="px-4 mb-4 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">Services</p>
          <button
            onClick={() => setShowAddService(true)}
            className="flex items-center gap-1.5 text-xs font-semibold neon-text active:opacity-60"
          >
            <span className="text-base">+</span> Add Service
          </button>
        </div>

        <div className="hscroll">
          {services.services.map((service) => {
            const stats = serviceStats[service.id] || { total: 0, count: 0 }
            const isActive = activeServiceId === service.id
            return (
              <motion.button
                key={service.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => setActiveServiceId(isActive ? null : service.id)}
                onLongPress={() => setShowEditService(service)}
                className="shrink-0 w-36 p-3 rounded-2xl text-left transition-all duration-200"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${service.color}22, ${service.color}0a)`
                    : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isActive ? service.color + '50' : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: isActive ? `0 0 20px ${service.color}20` : 'none',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{service.emoji}</span>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full" style={{ background: service.color }} />
                  )}
                </div>
                <p className={`text-xs font-bold truncate ${textColor} mb-0.5`}>{service.name}</p>
                <p className="text-sm font-black font-mono" style={{ color: service.color }}>
                  ₱{service.price}
                </p>
                <p className={`text-[10px] ${mutedColor} mt-1`}>{stats.count} sales</p>
              </motion.button>
            )
          })}

          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setShowAddService(true)}
            className="shrink-0 w-24 h-full min-h-[100px] rounded-2xl flex flex-col items-center justify-center gap-2"
            style={{ border: '1.5px dashed rgba(255,255,255,0.12)' }}
          >
            <span className={`text-2xl ${mutedColor}`}>+</span>
            <p className={`text-xs ${mutedColor}`}>New</p>
          </motion.button>
        </div>
      </div>

      {/* Customer quick-pick */}
      <div className="px-4 mb-4 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">Customer</p>
          <button
            onClick={() => setShowAddCustomer(true)}
            className={`text-xs font-semibold ${mutedColor} active:opacity-50`}
          >
            + Add new
          </button>
        </div>

        <div className="hscroll">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setActiveCustomerId(null); setActiveCustomerName(null) }}
            className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all"
            style={{
              background: !activeCustomerId ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${!activeCustomerId ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: !activeCustomerId ? '#00ff88' : 'rgba(255,255,255,0.5)',
            }}
          >
            No customer
          </motion.button>

          {recentCustomers.map((c) => (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSelectCustomer(c.id, c.name)}
              className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all"
              style={{
                background: activeCustomerId === c.id ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${activeCustomerId === c.id ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: activeCustomerId === c.id ? '#00ff88' : 'rgba(255,255,255,0.5)',
              }}
            >
              {c.name}
            </motion.button>
          ))}

          {customers.length === 0 && (
            <p className={`text-xs ${mutedColor} py-2`}>No customers yet</p>
          )}
        </div>
      </div>

      {/* BIG TAP BUTTON */}
      <div className="px-4 flex flex-col items-center py-4 shrink-0">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onTouchStart={handleTap}
          onClick={handleTap}
          className="relative w-full max-w-sm h-36 rounded-3xl flex flex-col items-center justify-center overflow-hidden select-none"
          style={activeService ? {
            background: `linear-gradient(135deg, ${activeService.color}, ${activeService.color}bb)`,
            boxShadow: `0 12px 48px ${activeService.color}40, 0 4px 16px rgba(0,0,0,0.4)`,
          } : {
            background: 'rgba(255,255,255,0.05)',
            border: '1.5px dashed rgba(255,255,255,0.15)',
          }}
        >
          <AnimatePresence>
            {ripple && (
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{ background: 'rgba(255,255,255,0.2)' }}
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </AnimatePresence>

          {activeService ? (
            <>
              <span className="text-4xl mb-1">{activeService.emoji}</span>
              <p className="font-black text-lg" style={{ color: '#080808' }}>
                ADD COLLECTION
              </p>
              <p className="font-bold text-2xl font-mono" style={{ color: '#080808', opacity: 0.8 }}>
                +₱{activeService.price}
              </p>
              {activeCustomerName && (
                <p className="text-xs font-semibold mt-1" style={{ color: '#080808', opacity: 0.7 }}>
                  for {activeCustomerName}
                </p>
              )}
            </>
          ) : (
            <>
              <p className={`text-lg font-bold ${mutedColor}`}>Select a service above</p>
              <p className={`text-xs ${mutedColor} mt-1`}>then tap here to collect</p>
            </>
          )}
        </motion.button>

        {/* Action row */}
        <div className="flex gap-3 mt-4 w-full max-w-sm">
          <button
            onClick={handleUndo}
            className="btn-ghost flex-1 flex items-center justify-center gap-2 text-sm"
          >
            <span>↩</span> Undo
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="btn-ghost flex-1 flex items-center justify-center gap-2 text-sm"
          >
            <span>📋</span> History
          </button>
          {lastAdded && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 rounded-xl py-2 px-3 text-center"
              style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)' }}
            >
              <p className="text-xs font-bold neon-text">+₱{lastAdded.amount}</p>
              <p className="text-[10px] text-muted">added</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Today's transactions */}
      <div className="px-4 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">Today ({todayEntries.length})</p>
          <p className="neon-text text-xs font-bold">₱{todayTotal.toFixed(2)}</p>
        </div>

        <AnimatePresence mode="popLayout">
          {todayEntries.length === 0 ? (
            <div className="glass p-6 text-center">
              <p className="text-3xl mb-2">💼</p>
              <p className={`text-sm ${mutedColor}`}>No collections yet today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayEntries.slice(0, 6).map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass flex items-center gap-3 px-4 py-3"
                >
                  <span className="text-xl shrink-0">{entry.serviceEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${textColor}`}>
                      {entry.serviceName}
                    </p>
                    <p className="text-xs text-muted">
                      {entry.customerName || 'No customer'}
                    </p>
                  </div>
                  <span className="font-bold font-mono text-sm shrink-0" style={{ color: entry.serviceColor }}>
                    +₱{entry.amount.toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MODALS ── */}

      {/* Add Service */}
      <Modal open={showAddService} onClose={() => setShowAddService(false)} title="New Service">
        <div className="space-y-4">
          <div>
            <span className="label">Service Name</span>
            <input
              className="input"
              placeholder="e.g. Xerox Printing"
              value={newService.name}
              onChange={(e) => setNewService((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <span className="label">Price per transaction (₱)</span>
            <input
              className="input font-mono text-xl"
              type="number"
              inputMode="decimal"
              placeholder="15"
              value={newService.price}
              onChange={(e) => setNewService((p) => ({ ...p, price: e.target.value }))}
            />
          </div>
          <div>
            <span className="label">Emoji Icon</span>
            <div className="flex flex-wrap gap-2">
              {SERVICE_EMOJIS.map((em) => (
                <button
                  key={em}
                  onClick={() => setNewService((p) => ({ ...p, emoji: em }))}
                  className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all active:scale-90"
                  style={{
                    background: newService.emoji === em ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${newService.emoji === em ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="label">Color</span>
            <div className="flex flex-wrap gap-2">
              {SERVICE_COLORS.map((col) => (
                <button
                  key={col}
                  onClick={() => setNewService((p) => ({ ...p, color: col }))}
                  className="w-8 h-8 rounded-full transition-all active:scale-90"
                  style={{
                    background: col,
                    border: newService.color === col ? '2px solid white' : '2px solid transparent',
                    boxShadow: newService.color === col ? `0 0 12px ${col}80` : 'none',
                  }}
                />
              ))}
            </div>
          </div>
          <button onClick={handleSaveService} className="btn-green w-full">
            Add Service
          </button>
        </div>
      </Modal>

      {/* Add Customer */}
      <Modal open={showAddCustomer} onClose={() => setShowAddCustomer(false)} title="Add Customer">
        <div className="space-y-4">
          <div>
            <span className="label">Customer Name</span>
            <input
              className="input"
              placeholder="Enter name"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomer()}
              autoFocus
            />
          </div>
          <button onClick={handleAddCustomer} className="btn-green w-full">
            Add Customer
          </button>
        </div>
      </Modal>

      {/* History */}
      <Modal open={showHistory} onClose={() => setShowHistory(false)} title={`All Transactions (${entries.length})`}>
        <div className="space-y-2">
          {entries.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">No transactions yet.</p>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="glass flex items-center gap-3 px-4 py-3">
                <span className="text-lg shrink-0">{entry.serviceEmoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${textColor}`}>{entry.serviceName}</p>
                  <p className="text-xs text-muted">
                    {entry.customerName || 'No customer'} · {formatDateTime(entry.timestamp)}
                  </p>
                </div>
                <span className="font-bold font-mono text-sm shrink-0" style={{ color: entry.serviceColor }}>
                  +₱{entry.amount.toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  )
}
