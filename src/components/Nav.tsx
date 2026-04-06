import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { F_BODY, TEXT, MUTED } from '../styles'
import BookingsModal from './BookingsModal'
import { getSiteSettings } from '../lib/sanity'

const DEFAULT_BOOK_URL = 'https://book.studio-808.com'

const links = [
  { to: '/dj-studio',                label: 'DJ Studios' },
  { to: '/main-production-studio',   label: 'Production Studio' },
  { to: '/about-us',                 label: 'About' },
  { to: '/contact',                  label: 'Contact' },
]

const mobileLinks = [
  ...links,
  { to: '/podcast-studio', label: 'Podcast' },
]

export default function Nav() {
  const [scrolled, setScrolled]       = useState(false)
  const [open, setOpen]               = useState(false)
  const [showBookings, setShowBookings] = useState(false)
  const [bookUrl, setBookUrl]         = useState(DEFAULT_BOOK_URL)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    getSiteSettings()
      .then(s => { if (s?.bookingUrl) setBookUrl(s.bookingUrl) })
      .catch(() => { /* use default */ })
  }, [])

  const navBg = scrolled || open
    ? 'rgba(13,13,13,0.96)'
    : 'transparent'

  return (
    <>
      <style>{`
        .nav-link { transition: color 0.15s; }
        .nav-link:hover { color: ${TEXT} !important; }
        @media(max-width:768px){
          .nav-desktop { display:none !important; }
          .nav-ham     { display:flex !important; }
        }
        @media(min-width:769px){
          .nav-mobile-panel { display:none !important; }
          .nav-ham          { display:none !important; }
        }
      `}</style>

      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: navBg,
        borderBottom: scrolled ? '1px solid rgba(240,237,232,0.07)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'background 0.3s, border-color 0.3s, backdrop-filter 0.3s',
      }}>
        {/* ── Desktop ── */}
        <div style={{
          maxWidth: '1240px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center', height: '72px', padding: '0 32px',
        }}>

          {/* Logo — left */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/images/logo.png" alt="Studio 808" style={{ height: '40px', width: 'auto', flexShrink: 0 }} />
          </Link>

          {/* Nav links — centre */}
          <nav className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className="nav-link"
                style={({ isActive }) => ({
                  textDecoration: 'none',
                  fontFamily: F_BODY,
                  fontSize: '14px',
                  fontWeight: 500,
                  color: isActive ? TEXT : MUTED,
                  letterSpacing: '-0.01em',
                })}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* CTAs — right */}
          <div className="nav-desktop" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setShowBookings(true)}
              style={{
                background: 'transparent',
                color: MUTED,
                fontFamily: F_BODY, fontSize: '13px', fontWeight: 500,
                padding: '9px 16px', borderRadius: '999px',
                border: '1px solid rgba(240,237,232,0.18)',
                cursor: 'pointer', letterSpacing: '-0.01em',
                transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = TEXT; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(240,237,232,0.35)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = MUTED; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(240,237,232,0.18)' }}
            >
              My Bookings
            </button>
            <a
              href={bookUrl}
              style={{
                background: TEXT, color: '#0d0d0d',
                fontFamily: F_BODY, fontSize: '13px', fontWeight: 700,
                padding: '9px 20px', borderRadius: '999px',
                textDecoration: 'none', letterSpacing: '-0.01em',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Book Now
            </a>
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="nav-ham"
            onClick={() => setOpen(o => !o)}
            style={{
              display: 'none', background: 'none', border: 'none',
              cursor: 'pointer', flexDirection: 'column', gap: '5px',
              padding: '8px', marginLeft: 'auto', gridColumn: '3',
              justifySelf: 'end',
            }}
            aria-label="Toggle menu"
          >
            {[0,1,2].map(i => (
              <span key={i} style={{ display: 'block', width: '22px', height: '2px', background: TEXT, borderRadius: '2px', transition: 'opacity 0.15s' }} />
            ))}
          </button>
        </div>

        {/* ── Mobile panel ── */}
        {open && (
          <div className="nav-mobile-panel" style={{
            background: 'rgba(13,13,13,0.98)',
            borderTop: '1px solid rgba(240,237,232,0.08)',
            padding: '8px 24px 28px',
          }}>
            {mobileLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block', padding: '14px 0',
                  fontFamily: F_BODY, fontSize: '16px', color: TEXT,
                  textDecoration: 'none', borderBottom: '1px solid rgba(240,237,232,0.06)',
                  fontWeight: 500,
                }}
              >
                {label}
              </Link>
            ))}
            <a
              href={bookUrl}
              onClick={() => setOpen(false)}
              style={{
                display: 'block', marginTop: '20px',
                background: TEXT, color: '#0d0d0d',
                textDecoration: 'none', fontFamily: F_BODY,
                fontSize: '15px', fontWeight: 700,
                padding: '15px 20px', borderRadius: '999px', textAlign: 'center',
              }}
            >
              Book Now
            </a>
            <button
              onClick={() => { setOpen(false); setShowBookings(true) }}
              style={{
                display: 'block', width: '100%', marginTop: '10px',
                background: 'transparent', color: TEXT,
                fontFamily: F_BODY, fontSize: '15px', fontWeight: 500,
                padding: '15px 20px', borderRadius: '999px', textAlign: 'center',
                border: '1px solid rgba(240,237,232,0.18)', cursor: 'pointer',
              }}
            >
              My Bookings
            </button>
          </div>
        )}
      </header>

      {showBookings && <BookingsModal onClose={() => setShowBookings(false)} />}
    </>
  )
}
