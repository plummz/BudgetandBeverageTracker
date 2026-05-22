export const STORAGE_KEYS = {
  BUDGET: 'bf_budget',
  BUDGET_ENTRIES: 'bf_budget_entries',
  SERVICES: 'bf_services',
  COLLECTION_ENTRIES: 'bf_collection_entries',
  CUSTOMERS: 'bf_customers',
  SODA: 'bf_soda',
  THEME: 'bf_theme',
}

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.warn('Storage write failed:', e)
    }
  },
  remove(key) {
    try { localStorage.removeItem(key) } catch { /* ignore */ }
  },
}
