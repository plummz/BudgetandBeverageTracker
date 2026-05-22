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
  const [celebrated, setCelebrated] = useState(false)

  const textColor = isDark ? 'text-white' : 'text-gray-900'
  const mutedColor = isDark ? 'text-white/50' : 'text-gray-500'

  const earnedBadges = BADGES.filter((b) => longestStreak >= b.days)
  const nextBadge = BADGES.find((b) => longestStreak < b.days)

  const handleCheckToday = () => {
    if (checkedToday) {
      toast('Already checked in today! 🌟', { icon: '✅' })
      return
    }
    checkToday()
    setCelebrated(true)
    setTimeout(() => setCelebrated(false), 3000)

    const newStreak = streak + 1
    const milestone = BADGES.find((b) => b.days === newStreak)
    if (milestone) {
      toast.success(`🎉 ${milestone.label} badge unlocked!`, { duration: 4000 })
    } else {
      toast.success(`Day ${newStreak} complete! Keep going! 🔥`)
    }
    if (navigator.vibrate) navigator.vibrate([50, 30, 80, 30, 120])
  }

  const { year, month, daysInMonth, firstDay } = calendarMonth

  const calendarDays = useMemo(() => {
    const days = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ d, key, checked: checkedDays.includes(key), isToday: key === formatDateKey() })
    }
    return days
  }, [year, month, daysInMonth, firstDay, checkedDays])

  const monthName = new Date(year, month).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })

  const flameCount = Math.min(Math.ceil(streak / 5) + 1, 5)

  return (
    <div className="page-container gap-4 px-4 pt-4">
      {/* Header */}
      <div className="shrink-0">
        <h1 className={`text-2xl font-black ${textColor}`}>No Soda Challenge</h1>
        <p className={`text-sm ${mutedColor}`}>Stay healthy. Break the habit. 💪</p>
      </div>

      {/* Streak card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card-elevated shrink-0 p-6 text-center relative overflow-hidden"
        style={{
          border: streak > 0 ? '1px solid rgba(0,255,136,0.25)' : '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Glow background */}
        {streak > 0 && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: 'radial-gradient(ellipse at center, #00ff88 0%, transparent 70%)',
            }}
          />
        )}

        {/* Flames */}
        {streak > 0 && (
          <div className="flex justify-center gap-1 mb-3">
            {Array.from({ length: flameCount }).map((_, i) => (
              <motion.span
                key={i}
                className="text-xl"
                animate={{ scaleY: [1, 1.15, 1], rotate: [-3, 3, -3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              >
                🔥
              </motion.span>
            ))}
          </div>
        )}

        <div className="relative">
          <motion.div
            key={streak}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-7xl font-black font-mono neon-text leading-none"
          >
            {streak}
          </motion.div>
          <p className={`text-sm font-semibold ${textColor} mt-1`}>
            {streak === 0 ? 'Start your streak today!' : streak === 1 ? 'day streak' : 'day streak'}
          </p>
          <p className={`text-xs ${mutedColor} mt-1`}>Best: {longestStreak} days</p>
          {startDate && <p className={`text-xs ${mutedColor}`}>Since {formatDate(startDate)}</p>}
        </div>

        {/* Progress to next badge */}
        {nextBadge && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className={mutedColor}>Next: {nextBadge.emoji} {nextBadge.label}</span>
              <span className="neon-text">{streak}/{nextBadge.days}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #00ff88, #00cc6a)' }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((streak / nextBadge.days) * 100, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card px-4 py-3 shrink-0"
        style={{ borderLeft: '3px solid #00ff88' }}
      >
        <p className={`text-xs italic ${mutedColor}`}>"{quote}"</p>
      </motion.div>

      {/* Main CTA button */}
      <div className="flex justify-center shrink-0 py-2">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleCheckToday}
          className="relative w-full max-w-sm py-5 rounded-2xl flex flex-col items-center gap-2 overflow-hidden transition-all"
          style={checkedToday ? {
            background: 'rgba(0,255,136,0.08)',
            border: '2px solid rgba(0,255,136,0.4)',
          } : {
            background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
            boxShadow: '0 8px 40px rgba(0,255,136,0.35)',
          }}
        >
          {/* Celebration particles */}
          <AnimatePresence>
            {celebrated && (
              <>
                {['🎉', '⭐', '✨', '💚', '🌟'].map((emoji, i) => (
                  <motion.span
                    key={i}
                    className="absolute text-2xl pointer-events-none"
                    initial={{ y: 0, x: `${(i - 2) * 20}%`, opacity: 1, scale: 0 }}
                    animate={{ y: -80, opacity: 0, scale: 1.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    style={{ left: '50%' }}
                  >
                    {emoji}
                  </motion.span>
                ))}
              </>
            )}
          </AnimatePresence>

          {checkedToday ? (
            <>
              <span className="text-3xl">✅</span>
              <span className="text-neon-green font-black text-base">DONE FOR TODAY!</span>
              <span className="text-neon-green/70 text-xs font-medium">Come back tomorrow</span>
            </>
          ) : (
            <>
              <span className="text-3xl">🚫🥤</span>
              <span className="text-dark-bg font-black text-base">I DID NOT DRINK SODA TODAY</span>
              <span className="text-dark-bg/70 text-xs font-medium">Tap to confirm today's streak</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Crossed-out soda graphic */}
      <div className="flex items-center justify-center gap-4 shrink-0 py-1">
        <div className="flex items-center gap-2 opacity-60">
          {['🍺', '🧃', '🥤'].map((drink, i) => (
            <div key={i} className="relative">
              <span className="text-2xl opacity-40">{drink}</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-0.5 h-8 rotate-45 rounded-full" style={{ background: '#ff3131' }} />
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-center" style={{ color: '#ff3131' }}>
          <p className="font-bold">BANNED</p>
          <p className="opacity-60">Stay strong</p>
        </div>
      </div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 shrink-0"
      >
        <p className={`text-sm font-semibold ${textColor} mb-3`}>{monthName}</p>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className={`text-center text-xs font-medium ${mutedColor}`}>{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => (
            day === null ? (
              <div key={`empty-${i}`} />
            ) : (
              <motion.div
                key={day.key}
                initial={day.checked ? { scale: 0 } : false}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="aspect-square flex items-center justify-center rounded-lg text-xs font-medium"
                style={{
                  background: day.checked
                    ? 'rgba(0,255,136,0.2)'
                    : day.isToday
                    ? 'rgba(255,255,255,0.08)'
                    : 'transparent',
                  border: day.isToday ? '1px solid rgba(0,255,136,0.4)' : '1px solid transparent',
                  color: day.checked ? '#00ff88' : day.isToday ? '#fff' : 'rgba(255,255,255,0.4)',
                }}
              >
                {day.checked ? '✓' : day.d}
              </motion.div>
            )
          ))}
        </div>

        <p className={`text-xs ${mutedColor} mt-3 text-center`}>
          ✓ = No soda day · {checkedDays.filter(d => d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length} days this month
        </p>
      </motion.div>

      {/* Badges */}
      <div className="shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className={`text-sm font-semibold ${textColor}`}>
            Achievements · {earnedBadges.length}/{BADGES.length}
          </p>
          <button onClick={() => setShowBadges(true)} className={`text-xs ${mutedColor} active:opacity-50`}>
            View all →
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollable pb-1">
          {BADGES.map((badge) => {
            const earned = longestStreak >= badge.days
            return (
              <motion.div
                key={badge.days}
                className="flex-shrink-0 flex flex-col items-center gap-1 glass-card p-3 min-w-[80px] text-center"
                style={{
                  opacity: earned ? 1 : 0.35,
                  border: earned ? `1px solid ${badge.color}40` : '1px solid rgba(255,255,255,0.06)',
                }}
                whileTap={{ scale: 0.93 }}
              >
                <span className="text-2xl">{badge.emoji}</span>
                <p className="text-xs font-bold" style={{ color: earned ? badge.color : 'rgba(255,255,255,0.4)' }}>
                  {badge.days}d
                </p>
                {earned && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${badge.color}22`, color: badge.color }}
                  >
                    EARNED
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Reset button */}
      <div className="shrink-0">
        <button
          onClick={() => setShowReset(true)}
          className={`text-xs ${mutedColor} text-center w-full py-2 active:opacity-50 underline`}
        >
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
              <div
                key={badge.days}
                className="glass-card flex items-center gap-4 px-4 py-3"
                style={{ opacity: earned ? 1 : 0.4, border: earned ? `1px solid ${badge.color}40` : undefined }}
              >
                <span className="text-3xl">{badge.emoji}</span>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${textColor}`}>{badge.label}</p>
                  <p className={`text-xs ${mutedColor}`}>{badge.days} consecutive no-soda days</p>
                </div>
                {earned ? (
                  <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: `${badge.color}22`, color: badge.color }}>
                    ✓ Earned
                  </span>
                ) : (
                  <span className={`text-xs ${mutedColor}`}>{badge.days - longestStreak}d left</span>
                )}
              </div>
            )
          })}
        </div>
      </Modal>

      {/* Reset Modal */}
      <Modal open={showReset} onClose={() => setShowReset(false)} title="Reset Challenge?">
        <div className="space-y-4">
          <p className={`text-sm ${mutedColor}`}>
            This will reset your streak to 0 and clear all checked days. Your badges history will also reset.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowReset(false)} className="btn-ghost flex-1">Cancel</button>
            <button
              onClick={() => { resetChallenge(); setShowReset(false); toast('Challenge reset. Start fresh! 💪') }}
              className="btn-danger flex-1"
            >
              Reset
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
