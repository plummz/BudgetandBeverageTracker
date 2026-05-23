import { useState, useCallback, useMemo, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { formatDateKey } from '../utils/formatters'
import { nanoid } from '../utils/nanoid'

export function useBudget() {
  const { user } = useAuth()
  const userId = user?.id
  const [allowance, setAllowanceState] = useState(0)
  const [entries, setEntries] = useState([])

  useEffect(() => {
    if (!userId) { setAllowanceState(0); setEntries([]); return }
    let live = true

    Promise.all([
      supabase.from('budget_settings').select('allowance').eq('user_id', userId).maybeSingle(),
      supabase.from('budget_entries').select('*').eq('user_id', userId).order('timestamp', { ascending: false }),
    ]).then(([s, e]) => {
      if (!live) return
      if (s.error) console.error('[budget] settings load failed:', s.error.message)
      else if (s.data) setAllowanceState(s.data.allowance)
      if (e.error) console.error('[budget] entries load failed:', e.error.message)
      else if (e.data) setEntries(e.data)
    })

    return () => { live = false }
  }, [userId])

  const setAllowance = useCallback(async (amount) => {
    if (!userId) return
    const parsed = parseFloat(amount) || 0
    setAllowanceState(parsed)
    const { error } = await supabase.from('budget_settings').upsert(
      { user_id: userId, allowance: parsed, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    if (error) console.error('[budget] setAllowance failed:', error.message)
  }, [userId])

  const addEntry = useCallback(async (entry) => {
    if (!userId) return
    const row = {
      id: nanoid(),
      user_id: userId,
      date: formatDateKey(),
      timestamp: new Date().toISOString(),
      type: entry.type,
      category: entry.category ?? null,
      amount: parseFloat(entry.amount) || 0,
      note: entry.note ?? null,
    }
    setEntries(prev => [row, ...prev])
    const { error } = await supabase.from('budget_entries').insert(row)
    if (error) { console.error('[budget] addEntry failed:', error.message); setEntries(prev => prev.filter(e => e.id !== row.id)) }
  }, [userId])

  const editEntry = useCallback(async (id, updates) => {
    if (!userId) return
    setEntries(prev => prev.map(e =>
      e.id === id ? { ...e, ...updates, amount: parseFloat(updates.amount) || e.amount } : e
    ))
    const { error } = await supabase.from('budget_entries').update({
      type: updates.type,
      category: updates.category ?? null,
      amount: parseFloat(updates.amount) || 0,
      note: updates.note ?? null,
    }).eq('id', id).eq('user_id', userId)
    if (error) {
      console.error('[budget] editEntry failed:', error.message)
      const { data } = await supabase.from('budget_entries').select('*').eq('id', id).maybeSingle()
      if (data) setEntries(prev => prev.map(e => e.id === id ? data : e))
    }
  }, [userId])

  const deleteEntry = useCallback(async (id) => {
    if (!userId) return
    const snapshot = entries.find(e => e.id === id)
    setEntries(prev => prev.filter(e => e.id !== id))
    const { error } = await supabase.from('budget_entries').delete().eq('id', id).eq('user_id', userId)
    if (error) { console.error('[budget] deleteEntry failed:', error.message); if (snapshot) setEntries(prev => [snapshot, ...prev]) }
  }, [entries, userId])

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
