import { motion } from 'framer-motion'

const tabs = [
  {
    id: 'dashboard',
    label: 'Budget',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={active ? '#00ff88' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: 'collection',
    label: 'Collect',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={active ? '#00ff88' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v10M9 9.5C9 8.12 10.34 7 12 7s3 1.12 3 2.5c0 2.5-6 2.5-6 5 0 1.38 1.34 2.5 3 2.5s3-1.12 3-2.5" />
      </svg>
    ),
  },
  {
    id: 'soda',
    label: 'No Soda',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3h8l1 6H7L8 3z" stroke={active ? '#00ff88' : 'currentColor'} />
        <path d="M7 9l.5 9a2 2 0 002 2h5a2 2 0 002-2L17 9" stroke={active ? '#00ff88' : 'currentColor'} />
        <line x1="4" y1="4" x2="20" y2="20" stroke="#ff3131" strokeWidth="2.5" />
      </svg>
    ),
  },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
      style={{
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all duration-200 active:scale-95"
            style={{ minHeight: 60 }}
          >
            <motion.div
              animate={{ scale: isActive ? 1.15 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="relative"
            >
              {tab.icon(isActive)}
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neon-green"
                />
              )}
            </motion.div>
            <span
              className="text-xs font-medium transition-colors duration-200"
              style={{ color: isActive ? '#00ff88' : 'rgba(255,255,255,0.45)' }}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
