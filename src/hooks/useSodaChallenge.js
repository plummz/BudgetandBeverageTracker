import { useState, useCallback, useMemo } from 'react'
import { storage, STORAGE_KEYS } from '../utils/storage'
import { formatDateKey } from '../utils/formatters'

const DEFAULT = {
  streak: 0,
  longestStreak: 0,
  checkedDays: [],
  lastChecked: null,
  startDate: null,
}

export function useSodaChallenge() {
  const [state, setState] = useState(() => storage.get(STORAGE_KEYS.SODA, DEFAULT))

  const save = useCallback((next) => {
    setState(next)
    storage.set(STORAGE_KEYS.SODA, next)
  }, [])

  const todayKey = formatDateKey()
  const checkedToday = state.checkedDays.includes(todayKey)

  const checkToday = useCallback(() => {
    if (checkedToday) return

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = formatDateKey(yesterday)
    const wasStreaking = state.checkedDays.includes(yesterdayKey) || state.checkedDays.length === 0

    const newStreak = wasStreaking ? state.streak + 1 : 1
    const newCheckedDays = [...state.checkedDays, todayKey]

    const next = {
      ...state,
      streak: newStreak,
      longestStreak: Math.max(state.longestStreak, newStreak),
      checkedDays: newCheckedDays,
      lastChecked: todayKey,
      startDate: state.startDate || todayKey,
    }
    save(next)
    if (navigator.vibrate) navigator.vibrate([50, 30, 50])
  }, [state, checkedToday, todayKey, save])

  const resetChallenge = useCallback(() => {
    save(DEFAULT)
  }, [save])

  const { earnedBadges } = useMemo(() => {
    const { BADGES } = { BADGES: [3, 7, 14, 21, 30, 60, 100] }
    const earned = BADGES.filter((d) => state.longestStreak >= d)
    return { earnedBadges: earned }
  }, [state.longestStreak])

  const calendarMonth = useMemo(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    return { year, month, daysInMonth, firstDay }
  }, [])

  return {
    streak: state.streak,
    longestStreak: state.longestStreak,
    checkedDays: state.checkedDays,
    checkedToday,
    lastChecked: state.lastChecked,
    startDate: state.startDate,
    earnedBadgeCount: earnedBadges.length,
    calendarMonth,
    checkToday,
    resetChallenge,
  }
}
