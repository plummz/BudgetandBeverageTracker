import { useState, useCallback, useMemo, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { nanoid } from '../utils/nanoid'

const toCustomer = (r) => ({ id: r.id, name: r.name, createdAt: r.created_at })

export function useCustomers(entries = []) {
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    if (!user) { setCustomers([]); return }
    let live = true

    supabase.from('customers').select('*').eq('user_id', user.id).order('created_at').then(({ data }) => {
      if (!live) return
      setCustomers((data ?? []).map(toCustomer))
    })

    return () => { live = false }
  }, [user?.id])

  const addCustomer = useCallback(async (name) => {
    const trimmed = name.trim()
    if (!trimmed) return null

    const existing = customers.find(c => c.name.toLowerCase() === trimmed.toLowerCase())
    if (existing) return existing

    const c = { id: nanoid(), name: trimmed, createdAt: new Date().toISOString() }
    setCustomers(prev => [...prev, c])
    const { error } = await supabase.from('customers').insert({
      id: c.id, user_id: user.id, name: c.name, created_at: c.createdAt,
    })
    if (error) setCustomers(prev => prev.filter(x => x.id !== c.id))
    return c
  }, [customers, user?.id])

  const deleteCustomer = useCallback(async (id) => {
    const snap = customers.find(c => c.id === id)
    setCustomers(prev => prev.filter(c => c.id !== id))
    const { error } = await supabase.from('customers').delete().eq('id', id).eq('user_id', user.id)
    if (error && snap) setCustomers(prev => [...prev, snap])
  }, [customers, user?.id])

  const leaderboard = useMemo(() => {
    return customers.map(customer => {
      const cx = entries.filter(e => e.customerId === customer.id)
      const totalSpent  = cx.reduce((s, e) => s + e.amount, 0)
      const orderCount  = cx.length
      const serviceCounts = {}
      cx.forEach(e => { serviceCounts[e.serviceName] = (serviceCounts[e.serviceName] || 0) + 1 })
      const top = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])
      return { ...customer, totalSpent, orderCount, favoriteService: top[0]?.[0] ?? null, history: cx }
    }).sort((a, b) => b.totalSpent - a.totalSpent)
  }, [customers, entries])

  const recentCustomerIds = useMemo(() => {
    const seen = new Set(); const result = []
    for (const e of entries) {
      if (e.customerId && !seen.has(e.customerId)) {
        seen.add(e.customerId); result.push(e.customerId)
      }
      if (result.length >= 8) break
    }
    return result
  }, [entries])

  const recentCustomers = useMemo(
    () => recentCustomerIds.map(id => customers.find(c => c.id === id)).filter(Boolean),
    [recentCustomerIds, customers]
  )

  return { customers, leaderboard, recentCustomers, addCustomer, deleteCustomer }
}
