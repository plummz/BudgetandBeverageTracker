import { useState, useCallback, useMemo } from 'react'
import { storage, STORAGE_KEYS } from '../utils/storage'
import { nanoid } from '../utils/nanoid'

export function useCustomers(entries = []) {
  const [customers, setCustomers] = useState(() =>
    storage.get(STORAGE_KEYS.CUSTOMERS, [])
  )

  const save = useCallback((next) => {
    setCustomers(next)
    storage.set(STORAGE_KEYS.CUSTOMERS, next)
  }, [])

  const addCustomer = useCallback((name) => {
    const trimmed = name.trim()
    if (!trimmed) return null
    const existing = customers.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    )
    if (existing) return existing
    const c = { id: nanoid(), name: trimmed, createdAt: new Date().toISOString() }
    save([...customers, c])
    return c
  }, [customers, save])

  const deleteCustomer = useCallback((id) => {
    save(customers.filter((c) => c.id !== id))
  }, [customers, save])

  const leaderboard = useMemo(() => {
    return customers
      .map((customer) => {
        const cx = entries.filter((e) => e.customerId === customer.id)
        const totalSpent = cx.reduce((s, e) => s + e.amount, 0)
        const orderCount = cx.length

        const serviceCounts = {}
        cx.forEach((e) => {
          serviceCounts[e.serviceName] = (serviceCounts[e.serviceName] || 0) + 1
        })
        const entries2 = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])
        const favoriteService = entries2.length > 0 ? entries2[0][0] : null

        return { ...customer, totalSpent, orderCount, favoriteService, history: cx }
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
  }, [customers, entries])

  const recentCustomerIds = useMemo(() => {
    const seen = new Set()
    const result = []
    for (const e of entries) {
      if (e.customerId && !seen.has(e.customerId)) {
        seen.add(e.customerId)
        result.push(e.customerId)
      }
      if (result.length >= 8) break
    }
    return result
  }, [entries])

  const recentCustomers = useMemo(
    () => recentCustomerIds.map((id) => customers.find((c) => c.id === id)).filter(Boolean),
    [recentCustomerIds, customers]
  )

  return { customers, leaderboard, recentCustomers, addCustomer, deleteCustomer }
}
