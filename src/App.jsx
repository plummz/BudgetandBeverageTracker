import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { useTheme } from './hooks/useTheme'
import BottomNav from './components/BottomNav'
import InstallBanner from './components/InstallBanner'
import Dashboard from './pages/Dashboard'
import Collection from './pages/Collection'
import SodaChallenge from './pages/SodaChallenge'

const PAGES = { dashboard: Dashboard, collection: Collection, soda: SodaChallenge }

const pageVariants = {
  initial: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
}

const PAGE_ORDER = ['dashboard', 'collection', 'soda']

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

  const bgStyle = isDark
    ? { background: 'radial-gradient(ellipse at 20% 0%, rgba(0,255,136,0.04) 0%, #0a0a0a 50%)' }
    : { background: 'radial-gradient(ellipse at 20% 0%, rgba(0,200,100,0.08) 0%, #f0f4f8 50%)' }

  return (
    <div
      className={`h-dvh w-full flex flex-col overflow-hidden relative ${isDark ? 'dark' : 'light'}`}
      style={bgStyle}
    >
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggle}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-yellow-300 fill-yellow-300" width={18}>
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gray-700" width={16}>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>

      {/* Install Banner */}
      <InstallBanner />

      {/* Page area */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={activePage}
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <ActivePage isDark={isDark} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Nav */}
      <BottomNav active={activePage} onChange={handlePageChange} />

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: isDark ? '#1a1a1a' : '#ffffff',
            color: isDark ? '#ffffff' : '#0a0a0a',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: 16,
            fontSize: 14,
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          },
          success: {
            iconTheme: { primary: '#00ff88', secondary: '#0a0a0a' },
          },
          error: {
            iconTheme: { primary: '#ff3131', secondary: '#ffffff' },
          },
        }}
      />
    </div>
  )
}
