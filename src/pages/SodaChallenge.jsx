import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useSodaChallenge } from '../hooks/useSodaChallenge'
import Modal from '../components/Modal'
import { formatDate, formatDateKey } from '../utils/formatters'
import { BADGES, getRandom, sodaQuotes } from '../utils/quotes'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const quote = getRandom(sodaQuotes)

export default function SodaChallenge({ isDark }) {
  const {
    streak, longestStreak, checkedDays, checkedToday,
    calendarMonth, checkToday, resetChallenge, startDate,
  } = useSodaChallenge()

  const [showReset, setShowReset] = useState(false)
  const [showBadges, setShowBadges] = useState(false)
  const [burst, setBurst] = useState(false)

  const textColor = isDark ? 'text-white' : 'text-gray-900'
  const mutedColor = isDark ? 'text-white/45' : 'text-gray-500'

  const earnedBadges = BADGES.filter((b) => longestStreak >= b.days)
  const nextBadge = BADGES.find((b) => longestStreak < b.days)
  const flameCount = Math.min(Math.ceil(streak / 7) + 1, 5)

  const handleCheck = () => {
    if (checkedToday) { toast('Already checked in today!', { icon: '✅' }); return }
    checkToday()
    setBurst(true)
    setTimeout(() => setBurst(false), 2500)
    const newStreak = streak + 1
    const milestone = BADGES.find((b) => b.days === newStreak)
    if (milestone) {
      toast.success(`${milestone.emoji} ${milestone.label} unlocked!`, { duration: 4000 })
    } else {
      toast.success(`Day ${newStreak} streak! Keep going!`)
    }
    if (navigator.vibrate) navigator.vibrate([60, 40, 100, 40, 150])
  }

  const { year, month, daysInMonth, firstDay } = calendarMonth
  const monthName = new Date(year, month).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })

  const calDays = useMemo(() => {
    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      cells.push({ d, key, checked: checkedDays.includes(key), isToday: key === formatDateKey() })
    }
    return cells
  }, [year, month, daysInMonth, firstDay, checkedDays])

  const monthChecked = checkedDays.filter((d) =>
    d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
  ).length

  return (
    <div className="page gap-4">
      {/* Header */}
      <div className="px-4 pt-5 pb-1 shrink-0">
        <h1 className={`text-2xl font-black ${textColor}`}>No Soda Challenge</h1>
        <p className={`text-sm ${mutedColor}`}>Build the habit. Break the addiction.</p>
      </div>

      {/* Streak hero card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-4 glass-high shrink-0 relative overflow-hidden"
        style={{
          border: streak > 0 ? '1px solid rgba(0,255,136,0.22)' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: streak > 0 ? '0 0 40px rgba(0,255,136,0.1)' : undefined,
        }}
      >
        {streak > 0 && (
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,136,0.08) 0%, transparent 70%)' }} />
        )}

        <div className="relative p-6 text-center">
          {/* Flames */}
          {streak > 0 && (
            <div className="flex justify-center gap-1.5 mb-3">
              {Array.from({ length: flameCount }).map((_, i) => (
                <motion.span
                  key={i}
                  className="text-xl"
                  animate={{ scaleY: [1, 1.2, 1], rotate: [-4, 4, -4] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
                >
                  🔥
                </motion.span>
              ))}
            </div>
          )}

          <motion.p
            key={streak}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-7xl font-black font-mono leading-none neon-text"
          >
            {streak}
          </motion.p>
          <p className={`text-sm font-bold mt-1 ${textColor}`}>
            {streak === 0 ? 'Start your streak today!' : streak === 1 ? 'day streak' : 'days streak'}
          </p>
          <p className={`text-xs ${mutedColor} mt-0.5`}>
            Best: {longestStreak} days
            {startDate ? ` · since ${formatDate(startDate)}` : ''}
          </p>

          {nextBadge && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className={mutedColor}>{nextBadge.emoji} {nextBadge.label}</span>
                <span className="neon-text font-bold">{streak}/{nextBadge.days}</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg,#00ff88,#00cc6a)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((streak / nextBadge.days) * 100, 100)}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quote */}
      <div className="mx-4 shrink-0">
        <div className="glass px-4 py-3 rounded-2xl" style={{ borderLeft: '3px solid rgba(0,255,136,0.4)' }}>
          <p className={`text-xs italic ${mutedColor}`}>"{quote}"</p>
        </div>
      </div>

      {/* CHECK IN BUTTON */}
      <div className="px-4 shrink-0">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleCheck}
          className="relative w-full py-5 rounded-3xl flex flex-col items-center gap-2 overflow-hidden"
          style={checkedToday ? {
            background: 'rgba(0,255,136,0.07)',
            border: '2px solid rgba(0,255,136,0.35)',
          } : {
            background: 'linear-gradient(135deg,#00ff88 0%,#00cc6a 100%)',
            boxShadow: '0 12px 48px rgba(0,255,136,0.35)',
          }}
        >
          {/* Burst particles */}
          <AnimatePresence>
            {burst && ['🎉', '⭐', '✨', '💚', '🌟', '🎊', '💫'].map((em, i) => (
              <motion.span
                key={i}
                className="absolute text-2xl pointer-events-none"
                initial={{ y: 20, x: `${(i - 3) * 30}px`, opacity: 1, scale: 0.5 }}
                animate={{ y: -100, opacity: 0, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, delay: i * 0.08 }}
                style={{ left: '50%' }}
              >
                {em}
              </motion.span>
            ))}
          </AnimatePresence>

          {checkedToday ? (
            <>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="text-4xl"
              >
                ✅
              </motion.span>
              <p className="neon-text font-black text-lg">DONE FOR TODAY!</p>
              <p className={`text-xs ${mutedColor}`}>See you tomorrow. Stay strong!</p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-3xl">🚫</span>
                <span className="text-3xl">🥤</span>
              </div>
              <p className="text-dark-bg font-black text-base" style={{ color: '#080808' }}>
                I DID NOT DRINK SODA TODAY
              </p>
              <p className="text-xs font-semibold" style={{ color: 'rgba(0,0,0,0.6)' }}>
                Tap to log today and extend your streak
              </p>
            </>
          )}
        </motion.button>
      </div>

      {/* No-soda visual */}
      <div className="px-4 shrink-0">
        <div className="glass p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            {['🍺', '🧃', '🥤', '🫙'].map((d, i) => (
              <div key={i} className="relative">
                <span className="text-2xl opacity-30">{d}</span>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-0.5 h-9 rotate-45 rounded-full" style={{ background: '#ff3131', opacity: 0.8 }} />
                </div>
              </div>
            ))}
          </div>
          <div className="text-right">
            <p className="text-xs font-black scarlet-text">AVOID</p>
            <p className={`text-xs ${mutedColor}`}>Stay hydrated</p>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mx-4 glass-md p-4 rounded-2xl shrink-0"
      >
        <div className="flex items-center justify-between mb-3">
          <p className={`text-sm font-bold ${textColor}`}>{monthName}</p>
          <p className="neon-text text-xs font-bold">{monthChecked} days checked</p>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className={`text-center text-[10px] font-bold ${mutedColor}`}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calDays.map((day, i) => (
            day === null ? <div key={`e${i}`} /> : (
              <motion.div
                key={day.key}
                initial={day.checked ? { scale: 0 } : false}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className="aspect-square flex items-center justify-center rounded-lg text-[11px] font-semibold"
                style={{
                  background: day.checked
                    ? 'rgba(0,255,136,0.18)'
                    : day.isToday
                    ? 'rgba(255,255,255,0.08)'
                    : 'transparent',
                  border: day.isToday ? '1px solid rgba(0,255,136,0.45)' : '1px solid transparent',
                  color: day.checked ? '#00ff88' : day.isToday ? '#fff' : 'rgba(255,255,255,0.3)',
                }}
              >
                {day.checked ? '✓' : day.d}
              </motion.div>
            )
          ))}
        </div>
      </motion.div>

      {/* Badges */}
      <div className="px-4 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">Achievements · {earnedBadges.length}/{BADGES.length}</p>
          <button onClick={() => setShowBadges(true)} className={`text-xs ${mutedColor} active:opacity-50`}>
            View all →
          </button>
        </div>
        <div className="hscroll">
          {BADGES.map((badge) => {
            const earned = longestStreak >= badge.days
            return (
              <motion.div
                key={badge.days}
                whileTap={{ scale: 0.92 }}
                className="shrink-0 flex flex-col items-center gap-1.5 glass p-3.5 min-w-[80px] text-center rounded-2xl"
                style={{
                  opacity: earned ? 1 : 0.3,
                  border: earned ? `1px solid ${badge.color}40` : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: earned ? `0 0 16px ${badge.color}20` : 'none',
                }}
              >
                <span className="text-2xl">{badge.emoji}</span>
                <p className="text-[11px] font-black" style={{ color: earned ? badge.color : 'rgba(255,255,255,0.3)' }}>
                  {badge.days}d
                </p>
                {earned && (
                  <div className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${badge.color}18`, color: badge.color }}>
                    EARNED
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Reset */}
      <div className="px-4 shrink-0">
        <button onClick={() => setShowReset(true)} className={`text-xs ${mutedColor} w-full text-center py-2 underline active:opacity-50`}>
          Reset challenge
        </button>
      </div>

      <div className="h-4 shrink-0" />

      {/* Badges Modal */}
      <Modal open={showBadges} onClose={() => setShowBadges(false)} title="All Badges">
        <div className="space-y-3">
          {BADGES.map((badge) => {
            const earned = longestStreak >= badge.days
            return (
              <div key={badge.days}
                className="glass flex items-center gap-4 px-4 py-3 rounded-2xl"
                style={{ opacity: earned ? 1 : 0.4, border: earned ? `1px solid ${badge.color}35` : undefined }}
              >
                <span className="text-3xl">{badge.emoji}</span>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{badge.label}</p>
                  <p className="text-xs text-muted">{badge.days} consecutive days</p>
                </div>
                {earned
                  ? <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: `${badge.color}18`, color: badge.color }}>Earned</span>
                  : <span className="text-xs text-muted">{badge.days - longestStreak}d away</span>
                }
              </div>
            )
          })}
        </div>
      </Modal>

      {/* Reset Modal */}
      <Modal open={showReset} onClose={() => setShowReset(false)} title="Reset Challenge?">
        <div className="space-y-4">
          <p className={`text-sm ${mutedColor}`}>
            This will reset your {streak}-day streak and clear all {checkedDays.length} checked days.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowReset(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={() => { resetChallenge(); setShowReset(false); toast('Challenge reset. Start fresh!') }} className="btn-red flex-1">
              Reset
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
