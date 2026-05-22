export const STORAGE_KEYS = {
  BUDGET: 'bf_budget',
  BUDGET_ENTRIES: 'bf_budget_entries',
  COLLECTION: 'bf_collection',
  SODA: 'bf_soda',
  THEME: 'bf_theme',
  ONBOARDED: 'bf_onboarded',
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
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
  },
}
