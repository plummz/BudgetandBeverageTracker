import { useState, useCallback, useMemo, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { formatDateKey } from '../utils/formatters'
import { nanoid } from '../utils/nanoid'

export function useBudget() {
  const { user } = useAuth()
  const [allowance, setAllowanceState] = useState(0)
  const [entries, setEntries] = useState([])

  useEffect(() => {
    if (!user) { setAllowanceState(0); setEntries([]); return }
    let live = true

    Promise.all([
      supabase.from('budget_settings').select('allowance').eq('user_id', user.id).single(),
      supabase.from('budget_entries').select('*').eq('user_id', user.id).order('timestamp', { ascending: false }),
    ]).then(([s, e]) => {
      if (!live) return
      if (s.data) setAllowanceState(s.data.allowance)
      if (e.data)  setEntries(e.data)
    })

    return () => { live = false }
  }, [user?.id])

  const setAllowance = useCallback(async (amount) => {
    const parsed = parseFloat(amount) || 0
    setAllowanceState(parsed)
    await supabase.from('budget_settings').upsert(
      { user_id: user.id, allowance: parsed, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
  }, [user?.id])

  const addEntry = useCallback(async (entry) => {
    const row = {
      id: nanoid(),
      user_id: user.id,
      date: formatDateKey(),
      timestamp: new Date().toISOString(),
      type: entry.type,
      category: entry.category ?? null,
      amount: parseFloat(entry.amount) || 0,
      note: entry.note ?? null,
    }
    setEntries(prev => [row, ...prev])
    const { error } = await supabase.from('budget_entries').insert(row)
    if (error) setEntries(prev => prev.filter(e => e.id !== row.id))
  }, [user?.id])

  const editEntry = useCallback(async (id, updates) => {
    setEntries(prev => prev.map(e =>
      e.id === id ? { ...e, ...updates, amount: parseFloat(updates.amount) || e.amount } : e
    ))
    const { error } = await supabase.from('budget_entries').update({
      type: updates.type,
      category: updates.category ?? null,
      amount: parseFloat(updates.amount) || 0,
      note: updates.note ?? null,
    }).eq('id', id).eq('user_id', user.id)
    if (error) {
      const { data } = await supabase.from('budget_entries').select('*').eq('id', id).single()
      if (data) setEntries(prev => prev.map(e => e.id === id ? data : e))
    }
  }, [user?.id])

  const deleteEntry = useCallback(async (id) => {
    const snapshot = entries.find(e => e.id === id)
    setEntries(prev => prev.filter(e => e.id !== id))
    const { error } = await supabase.from('budget_entries').delete().eq('id', id).eq('user_id', user.id)
    if (error && snapshot) setEntries(prev => [snapshot, ...prev])
  }, [entries, user?.id])

  const stats = useMemo(() => {
    const today = formatDateKey()
    const todayEntries = entries.filter(e => e.date === today)
    const totalExpenses = todayEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
    const totalIncome   = allowance + todayEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
    const totalSaved    = todayEntries.filter(e => e.type === 'savings').reduce((s, e) => s + e.amount, 0)
    const balance       = totalIncome - totalExpenses - totalSaved
    const allExpenses   = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
    const allSaved      = entries.filter(e => e.type === 'savings').reduce((s, e) => s + e.amount, 0)
    return { totalExpenses, totalIncome, totalSaved, balance, allExpenses, allSaved }
  }, [entries, allowance])

  return { allowance, entries, setAllowance, addEntry, editEntry, deleteEntry, stats }
}
