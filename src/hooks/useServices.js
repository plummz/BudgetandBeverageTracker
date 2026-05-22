import { useState, useCallback, useMemo } from 'react'
import { storage, STORAGE_KEYS } from '../utils/storage'
import { nanoid } from '../utils/nanoid'
import { formatDateKey, getLastNDays } from '../utils/formatters'
import { DEFAULT_SERVICES } from '../utils/quotes'

export function useServices() {
  const [services, setServices] = useState(() =>
    storage.get(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES)
  )
  const [entries, setEntries] = useState(() =>
    storage.get(STORAGE_KEYS.COLLECTION_ENTRIES, [])
  )

  const saveServices = useCallback((next) => {
    setServices(next)
    storage.set(STORAGE_KEYS.SERVICES, next)
  }, [])

  const saveEntries = useCallback((next) => {
    setEntries(next)
    storage.set(STORAGE_KEYS.COLLECTION_ENTRIES, next)
  }, [])

  const addService = useCallback((data) => {
    const s = {
      id: nanoid(),
      name: data.name.trim(),
      price: parseFloat(data.price) || 0,
      color: data.color,
      emoji: data.emoji,
      createdAt: new Date().toISOString(),
    }
    saveServices([...services, s])
    return s
  }, [services, saveServices])

  const updateService = useCallback((id, updates) => {
    saveServices(services.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }, [services, saveServices])

  const deleteService = useCallback((id) => {
    saveServices(services.filter((s) => s.id !== id))
  }, [services, saveServices])

  const addEntry = useCallback((serviceId, customerId, customerName) => {
    const service = services.find((s) => s.id === serviceId)
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
    const next = [entry, ...entries]
    saveEntries(next)
    if (navigator.vibrate) navigator.vibrate(30)
    return entry
  }, [services, entries, saveEntries])

  const undoLast = useCallback(() => {
    if (!entries.length) return false
    saveEntries(entries.slice(1))
    return true
  }, [entries, saveEntries])

  const serviceStats = useMemo(() => {
    const map = {}
    services.forEach((s) => {
      const se = entries.filter((e) => e.serviceId === s.id)
      map[s.id] = {
        total: se.reduce((sum, e) => sum + e.amount, 0),
        count: se.length,
      }
    })
    return map
  }, [services, entries])

  const today = formatDateKey()
  const todayEntries = useMemo(() => entries.filter((e) => e.date === today), [entries, today])
  const todayTotal = todayEntries.reduce((s, e) => s + e.amount, 0)
  const allTimeTotal = entries.reduce((s, e) => s + e.amount, 0)

  const weeklyChart = useMemo(() => {
    const days = getLastNDays(7)
    return days.map((day) => {
      const dayEntries = entries.filter((e) => e.date === day)
      const label = new Date(day + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'short' })
      const byService = {}
      dayEntries.forEach((e) => {
        byService[e.serviceName] = (byService[e.serviceName] || 0) + e.amount
      })
      return { day: label, total: dayEntries.reduce((s, e) => s + e.amount, 0), ...byService }
    })
  }, [entries])

  return {
    services,
    entries,
    serviceStats,
    todayEntries,
    todayTotal,
    allTimeTotal,
    weeklyChart,
    addService,
    updateService,
    deleteService,
    addEntry,
    undoLast,
  }
}
