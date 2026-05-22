export const budgetQuotes = [
  'Every peso saved is a peso earned.',
  'Small steps lead to big changes.',
  'Your future self will thank you for saving today.',
  'A budget is telling your money where to go.',
  'Financial freedom starts with a single decision.',
  'Spend less than you earn — the golden rule.',
  'Track today, thrive tomorrow.',
  'Rich people plan for three generations. Poor people plan for Saturday night.',
  'The habit of saving is itself an education.',
  'Beware of little expenses — they sink great ships.',
]

export const sodaQuotes = [
  'Your body is a temple. Keep it clean!',
  'Water is life. Soda is a choice. Choose wisely.',
  'Every day without soda is a victory for your health!',
  'Your streak is proof of your willpower. Keep going!',
  'Champions choose water.',
  'Real strength is saying no to what feels good but hurts you.',
  'Your future self is cheering you on!',
  "One day at a time. You've got this!",
  'Health is wealth. Keep your streak alive!',
  "The best project you'll ever work on is yourself.",
]

export const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food', emoji: '🍜' },
  { id: 'transport', label: 'Transport', emoji: '🚌' },
  { id: 'school', label: 'School', emoji: '📚' },
  { id: 'snacks', label: 'Snacks', emoji: '🍪' },
  { id: 'personal', label: 'Personal', emoji: '🧴' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎮' },
  { id: 'clothing', label: 'Clothing', emoji: '👕' },
  { id: 'health', label: 'Health', emoji: '💊' },
  { id: 'other', label: 'Other', emoji: '📦' },
]

export const BADGES = [
  { days: 3, label: '3-Day Starter', emoji: '🌱', color: '#22c55e' },
  { days: 7, label: '1-Week Warrior', emoji: '⚡', color: '#00ff88' },
  { days: 14, label: '2-Week Hero', emoji: '🦸', color: '#3b82f6' },
  { days: 21, label: '21-Day Habit', emoji: '🎯', color: '#8b5cf6' },
  { days: 30, label: '1-Month Legend', emoji: '🏆', color: '#f59e0b' },
  { days: 60, label: '2-Month Champion', emoji: '👑', color: '#ef4444' },
  { days: 100, label: '100-Day Titan', emoji: '💎', color: '#00bfff' },
]

export const DEFAULT_SERVICES = [
  { id: 'xerox', name: 'Xerox Printing', price: 15, color: '#00ff88', emoji: '🖨️' },
  { id: 'shirt', name: 'Shirt Printing', price: 150, color: '#3b82f6', emoji: '👕' },
  { id: 'editing', name: 'Editing Services', price: 50, color: '#8b5cf6', emoji: '🎬' },
  { id: 'project', name: 'Project Help', price: 30, color: '#f59e0b', emoji: '📚' },
  { id: 'snacks', name: 'Snacks', price: 10, color: '#ef4444', emoji: '🍪' },
]

export const SERVICE_COLORS = [
  '#00ff88', '#3b82f6', '#8b5cf6', '#f59e0b',
  '#ef4444', '#06b6d4', '#ec4899', '#84cc16',
  '#f97316', '#a78bfa',
]

export const SERVICE_EMOJIS = [
  '🖨️', '👕', '🎬', '📚', '🍪', '💻', '📷', '🎨',
  '📋', '🔧', '📦', '🎵', '✂️', '🧁', '📱', '🏫',
]
