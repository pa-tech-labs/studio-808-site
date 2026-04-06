import { useEffect, useRef, useState } from 'react'
import { ACCENT, BG, BORDER, F_BODY, MUTED, SURF, TEXT } from '../styles'
import { supabase } from '../lib/supabase'

const DASHBOARD_URL = 'https://book.studio-808.com/dashboard'

interface Props {
  onClose: () => void
}

export default function BookingsModal({ onClose }: Props) {
  const savedEmail = localStorage.getItem('studio808_remember_email')
  const [email, setEmail]         = useState(savedEmail ?? '')
  const [password, setPassword]   = useState('')
  const [rememberMe, setRememberMe] = useState(!!savedEmail)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    emailRef.current?.focus()
    // Close on Escape
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError || !data.session) {
        setError(authError?.message ?? 'Invalid email or password.')
        setLoading(false)
        return
      }

      // Persist or clear remembered email
      if (rememberMe) localStorage.setItem('studio808_remember_email', email.trim())
      else localStorage.removeItem('studio808_remember_email')

      // Pass tokens in the URL hash so the Supabase client on
      // book.studio-808.com picks up the session automatically.
      const { access_token, refresh_token } = data.session
      const hash = [
        `access_token=${encodeURIComponent(access_token)}`,
        `refresh_token=${encodeURIComponent(refresh_token)}`,
        'token_type=bearer',
        'type=signin',
      ].join('&')

      window.location.href = `${DASHBOARD_URL}#${hash}`
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', height: '46px', padding: '0 14px',
    background: BG, border: `1px solid ${BORDER}`, borderRadius: '10px',
    fontFamily: F_BODY, fontSize: '14px', color: TEXT,
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: SURF, borderRadius: '16px',
          border: `1px solid ${BORDER}`,
          padding: '32px 28px', width: '100%', maxWidth: '380px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ fontFamily: F_BODY, fontSize: '18px', fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>
          My Bookings
        </h2>
        <p style={{ fontFamily: F_BODY, fontSize: '13px', color: MUTED, margin: '0 0 24px' }}>
          Sign in with the email you used to book.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            ref={emailRef}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inp}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={inp}
            autoComplete="current-password"
          />

          <label style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            cursor: 'pointer', userSelect: 'none',
          }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              style={{
                width: '16px', height: '16px', margin: 0,
                accentColor: ACCENT, cursor: 'pointer',
              }}
            />
            <span style={{ fontFamily: F_BODY, fontSize: '13px', color: MUTED }}>
              Remember me
            </span>
          </label>

          {error && (
            <p style={{
              fontFamily: F_BODY, fontSize: '13px', color: ACCENT,
              margin: 0, padding: '10px 12px',
              background: 'rgba(232,53,90,0.1)', borderRadius: '8px',
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            style={{
              marginTop: '4px',
              height: '46px', borderRadius: '999px',
              background: ACCENT, color: '#fff',
              fontFamily: F_BODY, fontSize: '14px', fontWeight: 700,
              border: 'none', cursor: loading ? 'wait' : 'pointer',
              opacity: (loading || !email.trim() || !password) ? 0.6 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Signing in…' : 'View my bookings →'}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <a
            href="https://book.studio-808.com/login"
            style={{ fontFamily: F_BODY, fontSize: '12px', color: MUTED, textDecoration: 'underline' }}
          >
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  )
}
