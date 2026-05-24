import { useState, useCallback, useMemo, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { formatDateKey } from '../utils/formatters'

const DEFAULT = { streak: 0, longestStreak: 0, checkedDays: [], lastChecked: null, startDate: null }

const toState = (r) => ({
  streak: r.streak,
  longestStreak: r.longest_streak,
  checkedDays: r.checked_days ?? [],
  lastChecked: r.last_checked,
  startDate: r.start_date,
})

export function useSodaChallenge() {
  const { user } = useAuth()
  const userId = user?.id
  const [state, setState] = useState(DEFAULT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setState(DEFAULT); setLoading(false); return }
    setLoading(true)
    let live = true

    supabase
      .from('soda_challenge')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!live) return
        if (error) {
          console.error('[soda] load failed:', error.message)
          setLoading(false)
          return
        }
        setState(data ? toState(data) : DEFAULT)
        setLoading(false)
      })

    return () => { live = false }
  }, [userId])

  const persist = useCallback(async (next) => {
    if (!userId) return
    setState(next)
    const { error } = await supabase.from('soda_challenge').upsert(
      {
        user_id: userId,
        streak: next.streak,
        longest_streak: next.longestStreak,
        checked_days: next.checkedDays,
        last_checked: next.lastChecked,
        start_date: next.startDate,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    if (error) console.error('[soda] persist failed:', error.message)
  }, [userId])

  const todayKey = formatDateKey()
  const checkedToday = state.checkedDays.includes(todayKey)

  const checkToday = useCallback(() => {
    if (checkedToday) return
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = formatDateKey(yesterday)
    const wasStreaking = state.checkedDays.includes(yesterdayKey) || state.checkedDays.length === 0
    const newStreak = wasStreaking ? state.streak + 1 : 1
    const next = {
      ...state,
      streak: newStreak,
      longestStreak: Math.max(state.longestStreak, newStreak),
      checkedDays: [...state.checkedDays, todayKey],
      lastChecked: todayKey,
      startDate: state.startDate || todayKey,
    }
    persist(next)
    if (navigator.vibrate) navigator.vibrate([50, 30, 50])
  }, [state, checkedToday, todayKey, persist])

  const resetChallenge = useCallback(() => persist(DEFAULT), [persist])

  const { earnedBadges } = useMemo(() => {
    const BADGES = [3, 7, 14, 21, 30, 60, 100]
    return { earnedBadges: BADGES.filter(d => state.longestStreak >= d) }
  }, [state.longestStreak])

  const calendarMonth = useMemo(() => {
    const today = new Date()
    const year  = today.getFullYear()
    const month = today.getMonth()
    return { year, month, daysInMonth: new Date(year, month + 1, 0).getDate(), firstDay: new Date(year, month, 1).getDay() }
  }, [])

  return {
    streak: state.streak,
    longestStreak: state.longestStreak,
    checkedDays: state.checkedDays,
    checkedToday,
    loading,
    lastChecked: state.lastChecked,
    startDate: state.startDate,
    earnedBadgeCount: earnedBadges.length,
    calendarMonth,
    checkToday,
    resetChallenge,
  }
}
