import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { useTheme } from './hooks/useTheme'
import BottomNav from './components/BottomNav'
import InstallBanner from './components/InstallBanner'
import Dashboard from './pages/Dashboard'
import Collection from './pages/Collection'
import Leaderboard from './pages/Leaderboard'
import Analytics from './pages/Analytics'
import SodaChallenge from './pages/SodaChallenge'

const PAGES = {
  dashboard: Dashboard,
  collection: Collection,
  leaderboard: Leaderboard,
  analytics: Analytics,
  soda: SodaChallenge,
}
const PAGE_ORDER = ['dashboard', 'collection', 'leaderboard', 'analytics', 'soda']

const pageVariants = {
  initial: (dir) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0, scale: 0.97 }),
  animate: { x: 0, opacity: 1, scale: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0, scale: 0.97 }),
}

export default function App() {
  const { isDark, toggle } = useTheme()
  const [activePage, setActivePage] = useState('dashboard')
  const [direction, setDirection] = useState(1)

  const handlePageChange = (page) => {
    if (page === activePage) return
    const currentIdx = PAGE_ORDER.indexOf(activePage)
    const nextIdx = PAGE_ORDER.indexOf(page)
    setDirection(nextIdx > currentIdx ? 1 : -1)
    setActivePage(page)
  }

  const ActivePage = PAGES[activePage]

  return (
    <div
      className={`h-dvh w-full flex flex-col overflow-hidden ${isDark ? 'dark' : 'light'}`}
      style={{
        background: isDark
          ? 'radial-gradient(ellipse at 30% 0%, rgba(0,255,136,0.04) 0%, #080808 55%)'
          : 'radial-gradient(ellipse at 30% 0%, rgba(0,200,100,0.07) 0%, #f4f7fc 55%)',
      }}
    >
      {/* Top bar: theme toggle sits in flow so it never overlaps banner X */}
      <div className="shrink-0 flex justify-end px-3 pt-2">
        <button
          onClick={toggle}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}
        >
          {isDark ? (
            <svg viewBox="0 0 24 24" width="16" fill="#fcd34d" stroke="#fcd34d" strokeWidth="0">
              <circle cx="12" cy="12" r="5" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                <line key={i}
                  x1={12 + 7 * Math.cos((deg * Math.PI) / 180)}
                  y1={12 + 7 * Math.sin((deg * Math.PI) / 180)}
                  x2={12 + 9.5 * Math.cos((deg * Math.PI) / 180)}
                  y2={12 + 9.5 * Math.sin((deg * Math.PI) / 180)}
                  stroke="#fcd34d" strokeWidth="2" strokeLinecap="round"
                />
              ))}
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" fill="#374151">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>

      {/* Install banner */}
      <InstallBanner />

      {/* Page transitions */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={activePage}
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', stiffness: 380, damping: 34, mass: 0.9 }}
            className="absolute inset-0"
          >
            <ActivePage isDark={isDark} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <BottomNav active={activePage} onChange={handlePageChange} />

      {/* Toasts */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: isDark ? '#161616' : '#ffffff',
            color: isDark ? '#ffffff' : '#0a0a0a',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)'}`,
            borderRadius: 16,
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            maxWidth: 320,
          },
          success: { iconTheme: { primary: '#00ff88', secondary: '#080808' } },
          error: { iconTheme: { primary: '#ff3131', secondary: '#ffffff' } },
        }}
      />
    </div>
  )
}
