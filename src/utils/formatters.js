export const formatCurrency = (amount, symbol = '₱') => {
  const n = parseFloat(amount || 0)
  return `${symbol}${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const formatCompact = (amount, symbol = '₱') => {
  const n = parseFloat(amount || 0)
  if (Math.abs(n) >= 1000) {
    return `${symbol}${(n / 1000).toFixed(1)}k`
  }
  return `${symbol}${n.toFixed(2)}`
}

export const formatDateKey = (date = new Date()) => {
  return date.toISOString().split('T')[0]
}

export const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
}

export const formatDateTime = (dateStr) => {
  return `${formatDate(dateStr)}, ${formatTime(dateStr)}`
}

export const formatDayName = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-PH', { weekday: 'short' })
}

export const getWeekDays = () => {
  const today = new Date()
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(formatDateKey(d))
  }
  return days
}

export const getMonthDays = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i)
    days.push(formatDateKey(d))
  }
  return days
}

export const isToday = (dateStr) => {
  return dateStr === formatDateKey(new Date())
}

export const isSameMonth = (dateStr) => {
  const today = new Date()
  const d = new Date(dateStr)
  return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
}
