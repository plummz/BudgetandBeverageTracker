import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const INPUT_STYLE = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  padding: '13px 16px',
  color: '#fff',
  fontSize: 15,
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}

function Field({ label, type = 'text', value, onChange, placeholder, extra }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...INPUT_STYLE,
            borderColor: focused ? '#00ff88' : 'rgba(255,255,255,0.12)',
            paddingRight: extra ? 44 : 16,
          }}
          autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'off'}
        />
        {extra}
      </div>
    </div>
  )
}

function PasswordField({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="current-password"
          style={{
            ...INPUT_STYLE,
            borderColor: focused ? '#00ff88' : 'rgba(255,255,255,0.12)',
            paddingRight: 44,
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            color: 'rgba(255,255,255,0.4)', fontSize: 14,
          }}
        >
          {show ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  )
}

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [tab, setTab] = useState('login')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')

  const [name, setName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')
  const [regConfirm, setRegConfirm] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setErr('')
    if (!loginEmail.trim() || !loginPass) { setErr('Please fill in all fields'); return }
    setBusy(true)
    try {
      await signIn({ email: loginEmail, password: loginPass })
    } catch {
      setErr('Incorrect email or password')
    } finally {
      setBusy(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setErr('')
    if (!name.trim()) { setErr('Display name is required'); return }
    if (!regEmail.trim()) { setErr('Email is required'); return }
    if (regPass.length < 8) { setErr('Password must be at least 8 characters'); return }
    if (regPass !== regConfirm) { setErr('Passwords do not match'); return }
    setBusy(true)
    try {
      await signUp({ email: regEmail, password: regPass, displayName: name.trim() })
    } catch (e) {
      const msg = e?.message ?? ''
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setErr('An account with this email already exists')
      } else {
        setErr('Could not create account. Please try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  const switchTab = (t) => { setTab(t); setErr('') }

  return (
    <div style={{
      minHeight: '100dvh', width: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 30% 0%, rgba(0,255,136,0.06) 0%, #080808 55%)',
      padding: '24px 20px',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 32 }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px',
          background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, boxShadow: '0 0 24px rgba(0,255,136,0.35)',
        }}>
          💰
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
          BudgetFlow
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
          Smart finance for students
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        style={{
          width: '100%', maxWidth: 400,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 24, padding: '28px 24px',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Tab switcher */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4,
          marginBottom: 28,
        }}>
          {['login', 'signup'].map(t => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              style={{
                padding: '9px 0', border: 'none', borderRadius: 9, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
                transition: 'all 0.2s',
                background: tab === t ? '#00ff88' : 'transparent',
                color: tab === t ? '#080808' : 'rgba(255,255,255,0.45)',
              }}
            >
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Error */}
        <AnimatePresence>
          {err && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              style={{
                background: 'rgba(255,49,49,0.12)', border: '1px solid rgba(255,49,49,0.3)',
                borderRadius: 10, padding: '10px 14px',
                fontSize: 13, color: '#ff6b6b', lineHeight: 1.4,
              }}
            >
              {err}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {tab === 'login' ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleLogin}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <Field label="Email" type="email" value={loginEmail} onChange={setLoginEmail} placeholder="you@email.com" />
              <PasswordField label="Password" value={loginPass} onChange={setLoginPass} placeholder="Your password" />
              <button
                type="submit"
                disabled={busy}
                style={{
                  marginTop: 8, padding: '14px', border: 'none', borderRadius: 12,
                  background: busy ? 'rgba(0,255,136,0.4)' : '#00ff88',
                  color: '#080808', fontSize: 15, fontWeight: 700,
                  fontFamily: 'Inter, sans-serif', cursor: busy ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', letterSpacing: '-0.2px',
                }}
              >
                {busy ? 'Signing in…' : 'Sign In'}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="signup"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleSignup}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <Field label="Display Name" value={name} onChange={setName} placeholder="e.g. Rey Marquillero" />
              <Field label="Email" type="email" value={regEmail} onChange={setRegEmail} placeholder="you@email.com" />
              <PasswordField label="Password (min 8 chars)" value={regPass} onChange={setRegPass} placeholder="Create a strong password" />
              <PasswordField label="Confirm Password" value={regConfirm} onChange={setRegConfirm} placeholder="Repeat your password" />
              <button
                type="submit"
                disabled={busy}
                style={{
                  marginTop: 8, padding: '14px', border: 'none', borderRadius: 12,
                  background: busy ? 'rgba(0,255,136,0.4)' : '#00ff88',
                  color: '#080808', fontSize: 15, fontWeight: 700,
                  fontFamily: 'Inter, sans-serif', cursor: busy ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', letterSpacing: '-0.2px',
                }}
              >
                {busy ? 'Creating account…' : 'Create Account'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      <div style={{ marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
        Your data is encrypted and stored securely.
      </div>
    </div>
  )
}
