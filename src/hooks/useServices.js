import { useState, useCallback, useMemo, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { nanoid } from '../utils/nanoid'
import { formatDateKey, getLastNDays } from '../utils/formatters'
import { DEFAULT_SERVICES } from '../utils/quotes'

// DB row → app shape for services
const toService = (r) => ({ id: r.id, name: r.name, price: r.price, color: r.color, emoji: r.emoji, createdAt: r.created_at })
// DB row → app shape for collection entries
const toEntry = (r) => ({
  id: r.id,
  serviceId: r.service_id,
  serviceName: r.service_name,
  serviceColor: r.service_color,
  serviceEmoji: r.service_emoji,
  amount: r.amount,
  customerId: r.customer_id,
  customerName: r.customer_name,
  timestamp: r.timestamp,
  date: r.date,
})

export function useServices() {
  const { user } = useAuth()
  const [services, setServices] = useState([])
  const [entries, setEntries]   = useState([])

  useEffect(() => {
    if (!user) { setServices([]); setEntries([]); return }
    let live = true

    Promise.all([
      supabase.from('services').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('collection_entries').select('*').eq('user_id', user.id).order('timestamp', { ascending: false }),
    ]).then(async ([sr, er]) => {
      if (!live) return

      let svcs = (sr.data ?? []).map(toService)

      // Seed default services for brand-new accounts
      if (svcs.length === 0) {
        const defaults = DEFAULT_SERVICES.map(s => ({
          id: s.id,
          user_id: user.id,
          name: s.name,
          price: s.price,
          color: s.color,
          emoji: s.emoji,
          created_at: new Date().toISOString(),
        }))
        await supabase.from('services').insert(defaults)
        svcs = DEFAULT_SERVICES
      }

      setServices(svcs)
      setEntries((er.data ?? []).map(toEntry))
    })

    return () => { live = false }
  }, [user?.id])

  const addService = useCallback(async (data) => {
    const s = {
      id: nanoid(),
      name: data.name.trim(),
      price: parseFloat(data.price) || 0,
      color: data.color,
      emoji: data.emoji,
      createdAt: new Date().toISOString(),
    }
    setServices(prev => [...prev, s])
    const { error } = await supabase.from('services').insert({
      id: s.id, user_id: user.id, name: s.name, price: s.price,
      color: s.color, emoji: s.emoji, created_at: s.createdAt,
    })
    if (error) setServices(prev => prev.filter(x => x.id !== s.id))
    return s
  }, [user?.id])

  const updateService = useCallback(async (id, updates) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
    await supabase.from('services').update({
      name: updates.name, price: updates.price, color: updates.color, emoji: updates.emoji,
    }).eq('id', id).eq('user_id', user.id)
  }, [user?.id])

  const deleteService = useCallback(async (id) => {
    const snap = services.find(s => s.id === id)
    setServices(prev => prev.filter(s => s.id !== id))
    const { error } = await supabase.from('services').delete().eq('id', id).eq('user_id', user.id)
    if (error && snap) setServices(prev => [...prev, snap])
  }, [services, user?.id])

  const addEntry = useCallback(async (serviceId, customerId, customerName) => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return null

    const entry = {
      id: nanoid(),
      serviceId,
      serviceName: service.name,
      serviceColor: service.color,
      serviceEmoji: service.emoji,
      amount: service.price,
      customerId: customerId || null,
      customerName: customerName || null,
      timestamp: new Date().toISOString(),
      date: formatDateKey(),
    }
    setEntries(prev => [entry, ...prev])
    if (navigator.vibrate) navigator.vibrate(30)

    const { error } = await supabase.from('collection_entries').insert({
      id: entry.id,
      user_id: user.id,
      service_id: entry.serviceId,
      service_name: entry.serviceName,
      service_color: entry.serviceColor,
      service_emoji: entry.serviceEmoji,
      amount: entry.amount,
      customer_id: entry.customerId,
      customer_name: entry.customerName,
      timestamp: entry.timestamp,
      date: entry.date,
    })
    if (error) setEntries(prev => prev.filter(e => e.id !== entry.id))
    return entry
  }, [services, user?.id])

  const undoLast = useCallback(async () => {
    if (!entries.length) return false
    const [last, ...rest] = entries
    setEntries(rest)
    const { error } = await supabase.from('collection_entries').delete().eq('id', last.id).eq('user_id', user.id)
    if (error) setEntries(prev => [last, ...prev])
    return true
  }, [entries, user?.id])

  const serviceStats = useMemo(() => {
    const map = {}
    services.forEach(s => {
      const se = entries.filter(e => e.serviceId === s.id)
      map[s.id] = { total: se.reduce((sum, e) => sum + e.amount, 0), count: se.length }
    })
    return map
  }, [services, entries])

  const today = formatDateKey()
  const todayEntries = useMemo(() => entries.filter(e => e.date === today), [entries, today])
  const todayTotal   = todayEntries.reduce((s, e) => s + e.amount, 0)
  const allTimeTotal = entries.reduce((s, e) => s + e.amount, 0)

  const weeklyChart = useMemo(() => {
    const days = getLastNDays(7)
    return days.map(day => {
      const dayEntries = entries.filter(e => e.date === day)
      const label = new Date(day + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'short' })
      const byService = {}
      dayEntries.forEach(e => { byService[e.serviceName] = (byService[e.serviceName] || 0) + e.amount })
      return { day: label, total: dayEntries.reduce((s, e) => s + e.amount, 0), ...byService }
    })
  }, [entries])

  return { services, entries, serviceStats, todayEntries, todayTotal, allTimeTotal, weeklyChart, addService, updateService, deleteService, addEntry, undoLast }
}
