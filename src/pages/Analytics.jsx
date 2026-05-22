import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useServices } from '../hooks/useServices'
import { useCustomers } from '../hooks/useCustomers'
import { useBudget } from '../hooks/useBudget'
import { useSodaChallenge } from '../hooks/useSodaChallenge'
import AnimatedNumber from '../components/AnimatedNumber'
import { getLastNDays, formatDateKey } from '../utils/formatters'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

const CHART_TOOLTIP = {
  contentStyle: {
    background: '#111',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    fontSize: 12,
    color: '#fff',
  },
  itemStyle: { color: '#fff' },
  labelStyle: { color: 'rgba(255,255,255,0.6)' },
}

function StatCard({ label, value, sub, color, emoji, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-md p-4 rounded-2xl"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{emoji}</span>
        <p className="text-xs text-muted font-semibold uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-black font-mono" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </motion.div>
  )
}

export default function Analytics({ isDark }) {
  const { entries, services, serviceStats, todayTotal, allTimeTotal, weeklyChart } = useServices()
  const { customers, leaderboard } = useCustomers(entries)
  const { stats: budgetStats } = useBudget()
  const { streak, longestStreak } = useSodaChallenge()

  const textColor = isDark ? 'text-white' : 'text-gray-900'
  const mutedColor = isDark ? 'text-white/45' : 'text-gray-500'

  const today = formatDateKey()

  /* Weekly budget chart */
  const budgetWeekly = useMemo(() => {
    return getLastNDays(7).map((day) => {
      const label = new Date(day + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'short' })
      return { day: label }
    })
  }, [])

  /* This week's earnings */
  const weekDays = getLastNDays(7)
  const weekTotal = useMemo(
    () => entries.filter((e) => weekDays.includes(e.date)).reduce((s, e) => s + e.amount, 0),
    [entries, weekDays]
  )

  const monthStart = new Date()
  monthStart.setDate(1)
  const monthTotal = useMemo(
    () => entries.filter((e) => new Date(e.date) >= monthStart).reduce((s, e) => s + e.amount, 0),
    [entries]
  )

  /* Service pie data */
  const pieData = useMemo(
    () =>
      services
        .map((s) => ({ name: s.name, value: serviceStats[s.id]?.total || 0, color: s.color }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value),
    [services, serviceStats]
  )

  /* Top customer */
  const topCustomer = leaderboard[0] || null

  /* Most profitable service */
  const topService = useMemo(() => {
    let best = null
    services.forEach((s) => {
      const t = serviceStats[s.id]?.total || 0
      if (!best || t > (serviceStats[best.id]?.total || 0)) best = s
    })
    return best
  }, [services, serviceStats])

  /* Heatmap: last 28 days */
  const heatmapDays = useMemo(() => getLastNDays(28), [])
  const heatmapMax = useMemo(() => {
    let max = 1
    heatmapDays.forEach((day) => {
      const t = entries.filter((e) => e.date === day).reduce((s, e) => s + e.amount, 0)
      if (t > max) max = t
    })
    return max
  }, [heatmapDays, entries])

  return (
    <div className="page gap-4">
      {/* Header */}
      <div className="px-4 pt-5 pb-1 shrink-0">
        <h1 className={`text-2xl font-black ${textColor}`}>Analytics</h1>
        <p className={`text-sm ${mutedColor}`}>Your business & budget insights</p>
      </div>

      {/* Quick stat cards */}
      <div className="px-4 grid grid-cols-2 gap-3 shrink-0">
        <StatCard emoji="💵" label="Today" value={`₱${todayTotal.toFixed(0)}`} color="#00ff88" delay={0} />
        <StatCard emoji="📅" label="This Week" value={`₱${weekTotal.toFixed(0)}`} color="#3b82f6" delay={0.05} />
        <StatCard emoji="🗓️" label="This Month" value={`₱${monthTotal.toFixed(0)}`} color="#8b5cf6" delay={0.08} />
        <StatCard emoji="🏆" label="All Time" value={`₱${allTimeTotal.toFixed(0)}`} color="#f59e0b" delay={0.1} />
      </div>

      {/* 7-day collection trend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="px-4 shrink-0"
      >
        <div className="glass-md p-4 rounded-2xl">
          <p className={`text-sm font-bold ${textColor} mb-4`}>7-Day Collection Trend</p>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={weeklyChart} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP} />
              <Area type="monotone" dataKey="total" stroke="#00ff88" strokeWidth={2.5} fill="url(#areaGrad)" name="Earned ₱" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Service breakdown */}
      {pieData.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="px-4 shrink-0"
        >
          <div className="glass-md p-4 rounded-2xl">
            <p className={`text-sm font-bold ${textColor} mb-4`}>Service Breakdown</p>
            <div className="flex gap-4 items-center">
              <PieChart width={100} height={100}>
                <Pie data={pieData} cx={45} cy={45} innerRadius={28} outerRadius={46} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="flex-1 space-y-2">
                {pieData.map((item) => {
                  const pct = allTimeTotal > 0 ? ((item.value / allTimeTotal) * 100).toFixed(0) : 0
                  return (
                    <div key={item.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={mutedColor}>{item.name}</span>
                        <span className="font-bold" style={{ color: item.color }}>₱{item.value.toFixed(0)} · {pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: item.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top customer + top service */}
      <div className="px-4 grid grid-cols-2 gap-3 shrink-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.18 }}
          className="glass-md p-4 rounded-2xl"
        >
          <p className="text-xs text-muted mb-2 font-semibold uppercase tracking-wide">👑 Top Customer</p>
          {topCustomer ? (
            <>
              <p className={`text-sm font-black truncate ${textColor}`}>{topCustomer.name}</p>
              <p className="neon-text font-black text-lg font-mono">₱{topCustomer.totalSpent.toFixed(0)}</p>
              <p className="text-xs text-muted">{topCustomer.orderCount} orders</p>
            </>
          ) : (
            <p className="text-xs text-muted">No customers yet</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-md p-4 rounded-2xl"
        >
          <p className="text-xs text-muted mb-2 font-semibold uppercase tracking-wide">🏪 Best Service</p>
          {topService ? (
            <>
              <p className="text-xl">{topService.emoji}</p>
              <p className={`text-sm font-black truncate ${textColor}`}>{topService.name}</p>
              <p className="font-black text-lg font-mono" style={{ color: topService.color }}>
                ₱{(serviceStats[topService.id]?.total || 0).toFixed(0)}
              </p>
            </>
          ) : (
            <p className="text-xs text-muted">No data yet</p>
          )}
        </motion.div>
      </div>

      {/* Collection heatmap (28 days) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.22 }}
        className="px-4 shrink-0"
      >
        <div className="glass-md p-4 rounded-2xl">
          <p className={`text-sm font-bold ${textColor} mb-3`}>28-Day Activity</p>
          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {heatmapDays.map((day) => {
              const t = entries.filter((e) => e.date === day).reduce((s, e) => s + e.amount, 0)
              const intensity = t > 0 ? Math.max(0.15, t / heatmapMax) : 0
              const isToday2 = day === today
              return (
                <div
                  key={day}
                  className="aspect-square rounded-md"
                  style={{
                    background: t > 0
                      ? `rgba(0,255,136,${intensity})`
                      : 'rgba(255,255,255,0.04)',
                    border: isToday2 ? '1px solid rgba(0,255,136,0.5)' : '1px solid transparent',
                  }}
                  title={`${day}: ₱${t.toFixed(0)}`}
                />
              )
            })}
          </div>
          <div className="flex items-center gap-2 mt-3 justify-end">
            <p className="text-[10px] text-muted">Less</p>
            {[0.04, 0.15, 0.35, 0.6, 0.9].map((o) => (
              <div key={o} className="w-3 h-3 rounded-sm" style={{ background: o < 0.1 ? 'rgba(255,255,255,0.04)' : `rgba(0,255,136,${o})` }} />
            ))}
            <p className="text-[10px] text-muted">More</p>
          </div>
        </div>
      </motion.div>

      {/* Budget overview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.24 }}
        className="px-4 shrink-0"
      >
        <div className="glass-md p-4 rounded-2xl">
          <p className={`text-sm font-bold ${textColor} mb-3`}>Today's Budget</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Balance', value: budgetStats.balance, color: budgetStats.balance >= 0 ? '#00ff88' : '#ff3131' },
              { label: 'Spent', value: budgetStats.totalExpenses, color: '#ff3131' },
              { label: 'Saved', value: budgetStats.totalSaved, color: '#3b82f6' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-sm font-black font-mono" style={{ color: s.color }}>₱{s.value.toFixed(0)}</p>
                <p className="text-[10px] text-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Soda streak card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.26 }}
        className="px-4 shrink-0"
      >
        <div className="glass-md p-4 rounded-2xl flex items-center gap-4"
          style={{ border: streak > 0 ? '1px solid rgba(0,255,136,0.2)' : undefined }}>
          <div className="text-4xl font-black neon-text font-mono">{streak}</div>
          <div>
            <p className={`text-sm font-bold ${textColor}`}>
              {streak === 1 ? 'day' : 'days'} no soda streak
            </p>
            <p className="text-xs text-muted">Best: {longestStreak} days</p>
          </div>
          <div className="ml-auto text-3xl">
            {streak > 0 ? '🔥' : '💧'}
          </div>
        </div>
      </motion.div>

      <div className="h-4 shrink-0" />
    </div>
  )
}
