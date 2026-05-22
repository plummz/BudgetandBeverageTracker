import { useState, useCallback } from 'react'
import { storage, STORAGE_KEYS } from '../utils/storage'
import { nanoid } from '../utils/nanoid'

const DEFAULT = {
  amountPerTap: 15,
  history: [],
}

export function useCollection() {
  const [state, setState] = useState(() => storage.get(STORAGE_KEYS.COLLECTION, DEFAULT))

  const save = useCallback((next) => {
    setState(next)
    storage.set(STORAGE_KEYS.COLLECTION, next)
  }, [])

  const setAmount = useCallback((amount) => {
    save({ ...state, amountPerTap: parseFloat(amount) || 15 })
  }, [state, save])

  const addCollection = useCallback(() => {
    const entry = {
      id: nanoid(),
      amount: state.amountPerTap,
      timestamp: new Date().toISOString(),
    }
    save({ ...state, history: [entry, ...state.history] })
    if (navigator.vibrate) navigator.vibrate(30)
  }, [state, save])

  const undoLast = useCallback(() => {
    if (!state.history.length) return
    save({ ...state, history: state.history.slice(1) })
  }, [state, save])

  const reset = useCallback(() => {
    save({ ...state, history: [] })
  }, [state, save])

  const total = state.history.reduce((s, e) => s + e.amount, 0)
  const count = state.history.length

  return {
    amountPerTap: state.amountPerTap,
    history: state.history,
    total,
    count,
    setAmount,
    addCollection,
    undoLast,
    reset,
  }
}
