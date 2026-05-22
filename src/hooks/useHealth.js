import { useState, useCallback, useMemo, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { nanoid } from '../utils/nanoid'
import { formatDateKey } from '../utils/formatters'

// Calorie data sourced from USDA FoodData Central (fdc.nal.usda.gov)
// and FNRI-DOST (Food and Nutrition Research Institute of the Philippines)
export const FOOD_PRESETS = [
  // Staples — USDA FDC
  { name: 'Rice (1 cup cooked)',      cal: 242, emoji: '🍚', cat: 'Staples' },
  { name: 'Pandesal (1 piece)',        cal: 97,  emoji: '🥐', cat: 'Staples' },
  { name: 'White bread (1 slice)',     cal: 79,  emoji: '🍞', cat: 'Staples' },
  { name: 'Instant noodles (1 pack)', cal: 385, emoji: '🍜', cat: 'Staples' },
  // Filipino dishes — FNRI-DOST
  { name: 'Chicken Adobo (1 serving)', cal: 280, emoji: '🍗', cat: 'Filipino' },
  { name: 'Sinigang (1 bowl)',          cal: 180, emoji: '🍲', cat: 'Filipino' },
  { name: 'Lechon (100g)',              cal: 353, emoji: '🥩', cat: 'Filipino' },
  { name: 'Tinola (1 bowl)',            cal: 150, emoji: '🫕', cat: 'Filipino' },
  { name: 'Nilaga (1 bowl)',            cal: 170, emoji: '🥣', cat: 'Filipino' },
  { name: 'Pinakbet (1 serving)',       cal: 130, emoji: '🥦', cat: 'Filipino' },
  { name: 'Tapsilog (1 plate)',         cal: 520, emoji: '🍳', cat: 'Filipino' },
  { name: 'Sisig (1 serving)',          cal: 340, emoji: '🥘', cat: 'Filipino' },
  // Protein — USDA FDC
  { name: 'Egg fried (1 large)',             cal: 90,  emoji: '🍳', cat: 'Protein' },
  { name: 'Chicken breast (100g grilled)',   cal: 165, emoji: '🍗', cat: 'Protein' },
  { name: 'Pork (100g cooked)',              cal: 242, emoji: '🥩', cat: 'Protein' },
  { name: 'Tilapia (100g fried)',            cal: 128, emoji: '🐟', cat: 'Protein' },
  { name: 'Tofu (100g)',                     cal: 76,  emoji: '🫘', cat: 'Protein' },
  { name: 'Sardines canned (1 can 155g)',    cal: 191, emoji: '🐟', cat: 'Protein' },
  // Fruits — USDA FDC
  { name: 'Banana (1 medium)',      cal: 105, emoji: '🍌', cat: 'Fruits' },
  { name: 'Mango (1 medium)',       cal: 135, emoji: '🥭', cat: 'Fruits' },
  { name: 'Apple (1 medium)',       cal: 95,  emoji: '🍎', cat: 'Fruits' },
  { name: 'Watermelon (1 cup)',     cal: 46,  emoji: '🍉', cat: 'Fruits' },
  { name: 'Papaya (1 cup cubed)',   cal: 55,  emoji: '🍈', cat: 'Fruits' },
  // Drinks — USDA FDC
  { name: 'Water (1 glass 250ml)',     cal: 0,   emoji: '💧', cat: 'Drinks' },
  { name: 'Coffee black (1 cup)',      cal: 2,   emoji: '☕', cat: 'Drinks' },
  { name: 'Milk whole (1 cup 240ml)', cal: 149, emoji: '🥛', cat: 'Drinks' },
  { name: 'Orange juice (1 glass)',    cal: 112, emoji: '🧃', cat: 'Drinks' },
  { name: 'Soda cola (1 can 355ml)',   cal: 150, emoji: '🥤', cat: 'Drinks' },
  // Snacks — USDA FDC
  { name: 'Potato chips (1 small bag)', cal: 153, emoji: '🍟', cat: 'Snacks' },
  { name: 'Biscuit (1 piece)',           cal: 30,  emoji: '🍪', cat: 'Snacks' },
  { name: 'Ice cream (1 scoop)',         cal: 137, emoji: '🍦', cat: 'Snacks' },
  { name: 'Chocolate bar (1 small)',     cal: 235, emoji: '🍫', cat: 'Snacks' },
]

export const DAILY_GOAL = 2000 // WHO / FDA standard recommended daily intake
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']

const toEntry = (r) => ({
  id: r.id,
  date: r.date,
  timestamp: r.timestamp,
  mealType: r.meal_type,
  foodName: r.food_name,
  calories: r.calories,
  notes: r.notes,
})

export function useHealth() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])

  useEffect(() => {
    if (!user) { setEntries([]); return }
    let live = true
    supabase
      .from('health_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .then(({ data }) => {
        if (!live) return
        setEntries((data ?? []).map(toEntry))
      })
    return () => { live = false }
  }, [user?.id])

  const addEntry = useCallback(async ({ mealType, foodName, calories, notes }) => {
    const row = {
      id: nanoid(),
      user_id: user.id,
      date: formatDateKey(),
      timestamp: new Date().toISOString(),
      meal_type: mealType,
      food_name: foodName.trim(),
      calories: parseInt(calories) || 0,
      notes: notes?.trim() || null,
    }
    const mapped = toEntry(row)
    setEntries(prev => [mapped, ...prev])
    const { error } = await supabase.from('health_entries').insert(row)
    if (error) setEntries(prev => prev.filter(e => e.id !== row.id))
  }, [user?.id])

  const deleteEntry = useCallback(async (id) => {
    const snap = entries.find(e => e.id === id)
    setEntries(prev => prev.filter(e => e.id !== id))
    const { error } = await supabase.from('health_entries').delete().eq('id', id).eq('user_id', user.id)
    if (error && snap) setEntries(prev => [snap, ...prev])
  }, [entries, user?.id])

  const today = formatDateKey()
  const todayEntries = useMemo(() => entries.filter(e => e.date === today), [entries, today])
  const todayCalories = todayEntries.reduce((s, e) => s + e.calories, 0)

  const calendarData = useMemo(() => {
    const map = {}
    entries.forEach(e => { map[e.date] = (map[e.date] || 0) + e.calories })
    return map
  }, [entries])

  return { entries, todayEntries, todayCalories, calendarData, addEntry, deleteEntry }
}
