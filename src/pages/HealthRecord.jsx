import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHealth, FOOD_PRESETS, MEAL_TYPES, DAILY_GOAL } from '../hooks/useHealth'
import { formatDateKey } from '../utils/formatters'

const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' }
const MEAL_EMOJIS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }
const CATS = ['All', 'Staples', 'Filipino', 'Protein', 'Fruits', 'Drinks', 'Snacks']

function CalorieRing({ current, goal = DAILY_GOAL }) {
  const r = 52, circ = 2 * Math.PI * r
  const pct = Math.min(current / goal, 1)
  const color = current > goal ? '#ff3131' : current > goal * 0.8 ? '#fcd34d' : '#00ff88'
  return (
    <svg width="136" height="136" viewBox="0 0 136 136" style={{ display: 'block' }}>
      <circle cx="68" cy="68" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
      <circle cx="68" cy="68" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${pct * circ} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 68 68)"
        style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.3s ease' }}
      />
      <text x="68" y="62" textAnchor="middle" fill="white" fontSize="22" fontWeight="800" fontFamily="Inter, sans-serif">{current}</text>
      <text x="68" y="80" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="Inter, sans-serif">/ {goal} kcal</text>
    </svg>
  )
}

function AddEntryModal({ onClose, onAdd }) {
  const [mealType, setMealType] = useState('breakfast')
  const [cat, setCat] = useState('All')
  const [search, setSearch] = useState('')
  const [custom, setCustom] = useState(false)
  const [foodName, setFoodName] = useState('')
  const [calories, setCalories] = useState('')
  const [selected, setSelected] = useState(null)
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return FOOD_PRESETS.filter(f =>
      (cat === 'All' || f.cat === cat) &&
      (!q || f.name.toLowerCase().includes(q))
    )
  }, [cat, search])

  const canAdd = custom ? (foodName.trim() && calories > 0) : selected

  const handleAdd = async () => {
    if (!canAdd) return
    setBusy(true)
    await onAdd({
      mealType,
      foodName: custom ? foodName.trim() : selected.name,
      calories: custom ? parseInt(calories) || 0 : selected.cal,
    })
    setBusy(false)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden flex flex-col"
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '88dvh' }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
        </div>

        <div className="px-5 pb-2 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-black text-white">Log Food</p>
            <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.4)' }} className="active:scale-90 transition-transform">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Meal type */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {MEAL_TYPES.map(m => (
              <button key={m} onClick={() => setMealType(m)}
                className="flex flex-col items-center gap-1 py-2 rounded-xl transition-all active:scale-95"
                style={{ background: mealType === m ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.05)', border: mealType === m ? '1px solid rgba(0,255,136,0.4)' : '1px solid transparent' }}
              >
                <span style={{ fontSize: 18 }}>{MEAL_EMOJIS[m]}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: mealType === m ? '#00ff88' : 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' }}>{m}</span>
              </button>
            ))}
          </div>

          {/* Custom toggle */}
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => { setCustom(false); setSelected(null) }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: !custom ? '#00ff88' : 'rgba(255,255,255,0.07)', color: !custom ? '#080808' : 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>
              Presets
            </button>
            <button onClick={() => { setCustom(true); setSelected(null) }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: custom ? '#00ff88' : 'rgba(255,255,255,0.07)', color: custom ? '#080808' : 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>
              Custom
            </button>
          </div>
        </div>

        {custom ? (
          <div className="px-5 pb-4 flex flex-col gap-3 shrink-0">
            <input value={foodName} onChange={e => setFoodName(e.target.value)} placeholder="Food name"
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 14, fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', outline: 'none' }} />
            <input value={calories} onChange={e => setCalories(e.target.value)} placeholder="Calories (kcal)" type="number" inputMode="numeric"
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 14, fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', outline: 'none' }} />
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden px-5">
            {/* Search */}
            <div className="relative mb-3 shrink-0">
              <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search food…"
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px 10px 34px', color: '#fff', fontSize: 13, fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-2 shrink-0" style={{ scrollbarWidth: 'none' }}>
              {CATS.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{ background: cat === c ? '#00ff88' : 'rgba(255,255,255,0.07)', color: cat === c ? '#080808' : 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>
                  {c}
                </button>
              ))}
            </div>
            {/* Food list */}
            <div className="overflow-y-auto flex-1 -mx-1 px-1" style={{ paddingBottom: 12 }}>
              {filtered.map(f => (
                <button key={f.name} onClick={() => setSelected(selected?.name === f.name ? null : f)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1.5 transition-all active:scale-98 text-left"
                  style={{ background: selected?.name === f.name ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.04)', border: selected?.name === f.name ? '1px solid rgba(0,255,136,0.35)' : '1px solid transparent' }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{f.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: 'Inter, sans-serif' }} className="truncate">{f.name}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#00ff88', fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>{f.cal} kcal</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add button */}
        <div className="px-5 pt-2 pb-6 shrink-0">
          <button onClick={handleAdd} disabled={!canAdd || busy}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-98"
            style={{ background: canAdd ? '#00ff88' : 'rgba(255,255,255,0.07)', color: canAdd ? '#080808' : 'rgba(255,255,255,0.25)', fontFamily: 'Inter, sans-serif', cursor: canAdd ? 'pointer' : 'not-allowed' }}>
            {busy ? 'Adding…' : `Add ${selected ? `${selected.emoji} ${selected.cal} kcal` : custom && calories ? `${calories} kcal` : 'Entry'}`}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function EntryRow({ entry, onDelete }) {
  const [confirm, setConfirm] = useState(false)
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1.5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontSize: 18 }}>{MEAL_EMOJIS[entry.mealType]}</span>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: 'Inter, sans-serif' }} className="truncate">{entry.foodName}</p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' }}>{entry.mealType}</p>
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#00ff88', fontFamily: 'Inter, sans-serif' }}>{entry.calories}</span>
      {confirm ? (
        <div className="flex gap-1">
          <button onClick={() => onDelete(entry.id)} className="px-2 py-1 rounded-lg text-xs font-bold active:scale-90" style={{ background: 'rgba(255,49,49,0.2)', color: '#ff6b6b', fontFamily: 'Inter, sans-serif' }}>Del</button>
          <button onClick={() => setConfirm(false)} className="px-2 py-1 rounded-lg text-xs active:scale-90" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>No</button>
        </div>
      ) : (
        <button onClick={() => setConfirm(true)} className="p-1.5 rounded-lg active:scale-90" style={{ color: 'rgba(255,255,255,0.2)' }}>
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>
        </button>
      )}
    </div>
  )
}

export default function HealthRecord({ isDark }) {
  const { todayEntries, todayCalories, calendarData, addEntry, deleteEntry } = useHealth()
  const [showAdd, setShowAdd] = useState(false)
  const [mealFilter, setMealFilter] = useState('all')
  const [showCal, setShowCal] = useState(false)

  const today = formatDateKey()
  const now = new Date()
  const year = now.getFullYear(), month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const monthName = now.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })

  const filtered = mealFilter === 'all' ? todayEntries : todayEntries.filter(e => e.mealType === mealFilter)

  const calStatus = (cal) => {
    if (!cal) return null
    if (cal > DAILY_GOAL) return '#ff3131'
    if (cal > DAILY_GOAL * 0.8) return '#fcd34d'
    return '#00ff88'
  }

  const pct = Math.round((todayCalories / DAILY_GOAL) * 100)
  const remaining = Math.max(0, DAILY_GOAL - todayCalories)

  return (
    <div className="h-full overflow-y-auto" style={{ fontFamily: 'Inter, sans-serif', paddingBottom: 100 }}>
      <div className="px-4 pt-3 pb-2">
        <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Health Log</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Calorie summary card */}
      <div className="mx-4 mb-4 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-5">
          <CalorieRing current={todayCalories} />
          <div className="flex-1">
            <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Today</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Consumed</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#00ff88' }}>{todayCalories} kcal</span>
              </div>
              <div className="flex justify-between">
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Goal</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{DAILY_GOAL} kcal</span>
              </div>
              <div className="flex justify-between">
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Remaining</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: todayCalories > DAILY_GOAL ? '#ff6b6b' : '#fff' }}>
                  {todayCalories > DAILY_GOAL ? `+${todayCalories - DAILY_GOAL} over` : `${remaining} left`}
                </span>
              </div>
              {pct > 0 && (
                <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: todayCalories > DAILY_GOAL ? '#ff3131' : '#00ff88', borderRadius: 2, transition: 'width 0.4s ease' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Meal filter tabs */}
      <div className="flex gap-2 px-4 mb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {['all', ...MEAL_TYPES].map(m => (
          <button key={m} onClick={() => setMealFilter(m)}
            className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
            style={{ background: mealFilter === m ? '#00ff88' : 'rgba(255,255,255,0.07)', color: mealFilter === m ? '#080808' : 'rgba(255,255,255,0.5)' }}>
            {m === 'all' ? '📋 All' : `${MEAL_EMOJIS[m]} ${MEAL_LABELS[m]}`}
          </button>
        ))}
      </div>

      {/* Today's entries */}
      <div className="px-4 mb-4">
        {filtered.length === 0 ? (
          <div className="py-8 text-center" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
            No entries yet — tap + to log food
          </div>
        ) : (
          filtered.map(e => <EntryRow key={e.id} entry={e} onDelete={deleteEntry} />)
        )}
      </div>

      {/* Calendar toggle */}
      <div className="px-4">
        <button onClick={() => setShowCal(v => !v)}
          className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-98"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
          📅 {showCal ? 'Hide' : 'Show'} Monthly Calendar
        </button>

        <AnimatePresence>
          {showCal && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="mt-3 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{monthName}</p>
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {['S','M','T','W','T','F','S'].map((d, i) => (
                    <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>{d}</div>
                  ))}
                </div>
                {/* Days */}
                <div className="grid grid-cols-7 gap-y-1">
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const d = i + 1
                    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                    const cal = calendarData[dateKey]
                    const isToday = dateKey === today
                    const dotColor = calStatus(cal)
                    return (
                      <div key={d} className="flex flex-col items-center gap-0.5 py-1">
                        <span style={{ fontSize: 12, fontWeight: isToday ? 800 : 400, color: isToday ? '#00ff88' : cal ? '#fff' : 'rgba(255,255,255,0.35)' }}>{d}</span>
                        {dotColor && <div style={{ width: 4, height: 4, borderRadius: '50%', background: dotColor }} />}
                        {!dotColor && <div style={{ width: 4, height: 4 }} />}
                      </div>
                    )
                  })}
                </div>
                {/* Legend */}
                <div className="flex gap-4 mt-3 justify-center">
                  {[['#00ff88','Under goal'],['#fcd34d','Near goal'],['#ff3131','Over goal']].map(([c,l]) => (
                    <div key={l} className="flex items-center gap-1.5">
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Data source note */}
      <div className="px-4 mt-4">
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.5 }}>
          Calorie estimates from USDA FoodData Central & FNRI-DOST Philippines.{'\n'}
          Daily goal of 2,000 kcal per WHO / FDA guidelines.
        </p>
      </div>

      {/* FAB */}
      <button onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full flex items-center justify-center active:scale-90 transition-all z-40"
        style={{ background: 'linear-gradient(135deg, #00ff88, #00cc6a)', boxShadow: '0 4px 20px rgba(0,255,136,0.4)', fontSize: 26, color: '#080808', fontWeight: 300 }}>
        +
      </button>

      {showAdd && <AddEntryModal onClose={() => setShowAdd(false)} onAdd={addEntry} />}
    </div>
  )
}
