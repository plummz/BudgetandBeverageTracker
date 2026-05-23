# CLAUDE.md — BudgetFlow PWA

## ⚠️ CRITICAL: READ THIS FILE FIRST BEFORE MAKING ANY CHANGES.

---

## 🚫 DO NOT CODE RULE

If the user says **"do not code"**, **"do not implement"**, **"do not change anything"**, or any equivalent:

- ❌ DO NOT edit any file
- ❌ DO NOT run any git commands that modify history
- ❌ DO NOT delete or create files
- ✅ ONLY read, analyze, and respond
- ✅ Wait for explicit permission before touching any code

---

## 📌 PROJECT OVERVIEW

**BudgetFlow** — A mobile-first PWA for student budget tracking, classroom collection, soda challenge, and health logging.

- **Stack:** React 18 + Vite 5 + Vite PWA (Workbox) + Framer Motion + Tailwind
- **Backend:** Supabase (Auth + PostgreSQL + RLS)
- **Hosting:** Vercel (auto-deploys on push to `main`)
- **Branch:** Always develop on `main`, then force-push to `claude/budgetflow-pwa-app-boRYS`

---

## 🔁 MANDATORY AFTER EVERY SINGLE CHANGE

### Bump the cache bust key in `src/main.jsx`

```js
// Before
const BUST_KEY = 'bf-cache-bust-v6'

// After your change → increment the number
const BUST_KEY = 'bf-cache-bust-v7'
```

**Why this matters:** The app is installed as a PWA. After a Vercel deploy, the device's service worker still serves old cached JS. Bumping the bust key forces every installed PWA to wipe its cache and reload fresh code on next open.

**Rule:** Every commit that changes any `.jsx`, `.js`, `.css`, or `.html` file MUST also bump this key. No exceptions.

### Push sequence after every change

```bash
npm run build          # must pass with zero errors
git add <files>
git commit -m "..."
git push -u origin main
git push origin main:claude/budgetflow-pwa-app-boRYS --force
```

---

## 🔐 SECURITY RULES (ABSOLUTE — NEVER VIOLATE)

- **NEVER** hardcode `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` in any source file
- **NEVER** commit `.env.local` — it is gitignored via `*.local` in `.gitignore`
- **NEVER** use the Supabase `service_role` key in frontend code — anon key only
- Credentials live in `.env.local` (local dev) and Vercel Environment Variables (production)
- **NEVER** expose user data in console logs, error messages, or UI text

---

## 🗄️ SUPABASE ARCHITECTURE

### Tables (all have RLS enabled)

| Table | Purpose |
|---|---|
| `profiles` | One row per user — display_name, theme |
| `budget_settings` | Allowance per user |
| `budget_entries` | Budget transactions (expense/income/savings) |
| `services` | User-defined services for collection |
| `customers` | Customer registry per user |
| `collection_entries` | Collection transaction log |
| `soda_challenge` | Soda streak state per user |
| `health_entries` | Daily food/calorie log per user |

### RLS Policy rule

Every table MUST have:
```sql
alter table <table> enable row level security;
create policy "<table>_all" on <table>
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

If you add a new table, add RLS immediately — no exceptions.

### Profile creation

Profiles are created automatically by a DB trigger (`on_auth_user_created`) — do NOT insert profiles from frontend code.

---

## 📅 DATE HANDLING (CRITICAL — PH TIMEZONE)

**ALWAYS use `formatDateKey()` from `src/utils/formatters.js` for date strings.**

This function uses **local date components** (not UTC `.toISOString()`). The Philippines is UTC+8 — using UTC would store the wrong date for any time before 8 AM local.

```js
// ✅ CORRECT — uses local time
export const formatDateKey = (date = new Date()) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ❌ WRONG — returns UTC date, breaks PH timezone
date.toISOString().split('T')[0]
```

Never use `.toISOString().split('T')[0]` for date keys anywhere in the codebase.

---

## 🔄 DATA PERSISTENCE RULES

- **All user data lives in Supabase** — not localStorage
- localStorage is only used for: theme preference, PWA cache bust key, Supabase auth session token
- App updates on Vercel **never** delete Supabase data
- Data persists across: device changes, app reinstalls, PWA updates, cache clears
- **Never** store user-entered data (budget, collection, health, streak) in localStorage

---

## 📱 PWA & CACHE RULES

### How the cache bust works

`src/main.jsx` has a one-time guard:
```js
const BUST_KEY = 'bf-cache-bust-vN'
if (!localStorage.getItem(BUST_KEY)) {
  // clears all Cache API buckets + unregisters SW + hard reloads
}
```

- Runs once per device per key value
- Forces the installed PWA to fetch fresh JS/CSS from Vercel
- **Must be incremented** (`vN` → `vN+1`) after every code change

### Vite PWA config

- `registerType: 'autoUpdate'` — SW auto-installs new version in background
- `globPatterns` in workbox covers all JS/CSS/HTML/PNG/SVG/fonts
- Icons are in `public/icons/` with `-v3` suffix (already cache-busted by filename)
- `manifest.webmanifest` and `sw.js` are served with `no-cache` headers via `vercel.json`

---

## 🧱 PROJECT STRUCTURE

```
src/
  App.jsx              — Auth gate, page router, theme toggle, sign-out
  main.jsx             — Cache bust key lives here, AuthProvider wrapper
  context/
    AuthContext.jsx    — Supabase auth state, signIn/signUp/signOut
  lib/
    supabase.js        — Supabase client (reads from env vars only)
  hooks/
    useBudget.js       — Budget entries + allowance (Supabase)
    useServices.js     — Services + collection entries (Supabase)
    useCustomers.js    — Customers + leaderboard (Supabase)
    useSodaChallenge.js — Streak state (Supabase)
    useHealth.js       — Health/calorie log (Supabase)
    useTheme.js        — Dark/light toggle (localStorage)
    useInstallPrompt.js — PWA install prompt capture
  pages/
    AuthPage.jsx       — Login / sign-up UI
    Dashboard.jsx      — Budget overview
    Collection.jsx     — Fast-tap service collection
    Leaderboard.jsx    — Customer rankings
    Analytics.jsx      — Charts and stats
    HealthRecord.jsx   — Food/calorie daily log
    SodaChallenge.jsx  — Streak tracker
  components/
    BottomNav.jsx      — 6-tab nav: Budget/Collect/Board/Stats/Health/Streak
    InstallBanner.jsx  — PWA install prompt (currently not rendered)
  utils/
    formatters.js      — Date/currency formatters (use formatDateKey always)
    storage.js         — localStorage wrapper (legacy, avoid for new features)
    nanoid.js          — Client-side ID generator
    quotes.js          — Static content: quotes, food presets, DEFAULT_SERVICES
supabase/
  schema.sql           — Full DB schema + RLS (run once in Supabase SQL Editor)
public/
  icons/               — All PWA icon sizes (-v3 suffix)
```

---

## ✅ PRE-COMMIT CHECKLIST

Before every commit, verify:

- [ ] `npm run build` passes with zero errors
- [ ] `BUST_KEY` in `src/main.jsx` was incremented
- [ ] No credentials hardcoded anywhere
- [ ] New Supabase tables have RLS enabled
- [ ] Date keys use `formatDateKey()` (local time, not UTC)
- [ ] Optimistic updates include rollback on error
- [ ] No localStorage used for user data
- [ ] Pushed to both `main` and `claude/budgetflow-pwa-app-boRYS`

---

## 📦 OUTPUT FORMAT (MANDATORY)

After completing any task, respond with:

### Files Changed
(list each file)

### What Was Done
(clear summary)

### Cache Key
`bf-cache-bust-vN` (what it was bumped to)

### Risks / Limitations
(honest assessment)
