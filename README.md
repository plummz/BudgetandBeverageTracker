# BudgetFlow 💸

A production-quality **Progressive Web App (PWA)** built for students.  
Track your budget, classroom collections, and personal health streaks — all offline.

---

## Features

### 💵 Daily Budget Tracker
- Set your daily allowance
- Add expenses, extra income, and savings
- Real-time remaining balance with animated counters
- 7-day spending chart
- Full entry history with delete support

### 🏫 Classroom Collection Tracker
- One-tap collection button (configurable amount, default ₱15)
- Auto-increments total and tally count
- Timestamp history for every entry
- Undo last entry, reset all
- Optimized for fast in-class use

### 🚫🥤 No Soda Challenge
- Daily streak tracker
- Calendar view with checked days
- Achievement badges (3, 7, 14, 21, 30, 60, 100 days)
- Motivational quotes
- Milestone celebrations with haptic feedback

### ⚡ PWA Features
- Installable on Android/iOS from Chrome
- Full offline support via Service Worker
- Saves all data in localStorage (no server needed)
- Standalone app experience

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 + Vite 5 | Framework & build tool |
| TailwindCSS 3 | Styling |
| Framer Motion 11 | Animations |
| Recharts 2 | Charts |
| vite-plugin-pwa | Service Worker & manifest |
| react-hot-toast | Notifications |

---

## Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Install as PWA

1. Open the app in Chrome on Android
2. Tap the browser menu (⋮)
3. Select **"Add to Home Screen"**
4. Or wait for the install banner to appear in the app

---

## Project Structure

```
src/
├── components/      # Shared UI components
│   ├── BottomNav.jsx
│   ├── Modal.jsx
│   ├── AnimatedNumber.jsx
│   └── InstallBanner.jsx
├── pages/           # Tab pages
│   ├── Dashboard.jsx    # Budget tracker
│   ├── Collection.jsx   # Classroom collections
│   └── SodaChallenge.jsx
├── hooks/           # Custom React hooks
│   ├── useBudget.js
│   ├── useCollection.js
│   ├── useSodaChallenge.js
│   ├── useTheme.js
│   └── useInstallPrompt.js
├── utils/           # Helpers
│   ├── storage.js
│   ├── formatters.js
│   ├── quotes.js
│   └── nanoid.js
├── App.jsx
├── main.jsx
└── index.css
public/
└── icons/           # PWA icons (SVG)
```

---

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#0a0a0a` | App background |
| Card | `rgba(255,255,255,0.04)` | Glass cards |
| Neon Green | `#00ff88` | Primary accent, positive values |
| Scarlet | `#ff3131` | Expenses, warnings, danger |
| White | `#ffffff` | Text |

---

## Data Storage

All data is stored locally using `localStorage`. No account or server required.

| Key | Contents |
|-----|----------|
| `bf_budget` | Allowance + all entries |
| `bf_collection` | Collection amount + history |
| `bf_soda` | Streak, checked days, badges |
| `bf_theme` | Dark/light preference |

---

Made with ❤️ for students who want to manage their money better.
