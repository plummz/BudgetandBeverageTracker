import { useState, useCallback, useMemo } from 'react'
import { storage, STORAGE_KEYS } from '../utils/storage'
import { formatDateKey } from '../utils/formatters'
import { nanoid } from '../utils/nanoid'

const DEFAULT_STATE = {
  allowance: 0,
  entries: [],
}

export function useBudget() {
  const [state, setState] = useState(() => storage.get(STORAGE_KEYS.BUDGET, DEFAULT_STATE))

  const save = useCallback((next) => {
    setState(next)
    storage.set(STORAGE_KEYS.BUDGET, next)
  }, [])

  const setAllowance = useCallback((amount) => {
    save({ ...state, allowance: parseFloat(amount) || 0 })
  }, [state, save])

  const addEntry = useCallback((entry) => {
    const newEntry = {
      id: nanoid(),
      date: formatDateKey(),
      timestamp: new Date().toISOString(),
      ...entry,
      amount: parseFloat(entry.amount) || 0,
    }
    const next = { ...state, entries: [newEntry, ...state.entries] }
    save(next)
  }, [state, save])

  const editEntry = useCallback((id, updates) => {
    const entries = state.entries.map((e) =>
      e.id === id ? { ...e, ...updates, amount: parseFloat(updates.amount) || e.amount } : e
    )
    save({ ...state, entries })
  }, [state, save])

  const deleteEntry = useCallback((id) => {
    save({ ...state, entries: state.entries.filter((e) => e.id !== id) })
  }, [state, save])

  const stats = useMemo(() => {
    const today = formatDateKey()
    const todayEntries = state.entries.filter((e) => e.date === today)
    const todayExpenses = todayEntries.filter((e) => e.type === 'expense')
    const todayIncome = todayEntries.filter((e) => e.type === 'income')
    const todaySavings = todayEntries.filter((e) => e.type === 'savings')

    const totalExpenses = todayExpenses.reduce((s, e) => s + e.amount, 0)
    const totalIncome = state.allowance + todayIncome.reduce((s, e) => s + e.amount, 0)
    const totalSaved = todaySavings.reduce((s, e) => s + e.amount, 0)
    const balance = totalIncome - totalExpenses - totalSaved

    const allExpenses = state.entries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
    const allSaved = state.entries.filter((e) => e.type === 'savings').reduce((s, e) => s + e.amount, 0)

    return { totalExpenses, totalIncome, totalSaved, balance, allExpenses, allSaved }
  }, [state])

  return {
    allowance: state.allowance,
    entries: state.entries,
    setAllowance,
    addEntry,
    editEntry,
    deleteEntry,
    stats,
  }
}
