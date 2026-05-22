import { motion } from 'framer-motion'

const tabs = [
  {
    id: 'dashboard',
    label: 'Budget',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" stroke={active ? '#00ff88' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'collection',
    label: 'Collect',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" stroke={active ? '#00ff88' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    id: 'leaderboard',
    label: 'Board',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" stroke={active ? '#00ff88' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'Stats',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" stroke={active ? '#00ff88' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: 'health',
    label: 'Health',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          stroke={active ? '#00ff88' : 'currentColor'} fill={active ? 'rgba(0,255,136,0.15)' : 'none'} />
      </svg>
    ),
  },
  {
    id: 'soda',
    label: 'Streak',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={active ? '#00ff88' : 'currentColor'} />
      </svg>
    ),
  },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
      style={{
        background: 'rgba(8,8,8,0.97)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all duration-150 active:scale-90 relative"
            style={{ minHeight: 54 }}
          >
            <motion.div
              animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -1 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              {tab.icon(isActive)}
            </motion.div>
            <span
              style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.03em', color: isActive ? '#00ff88' : 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif', transition: 'color 0.15s' }}
            >
              {tab.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute top-0 rounded-full"
                style={{ width: 28, height: 2, background: '#00ff88', boxShadow: '0 0 8px #00ff88' }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
