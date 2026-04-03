import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ACCENT, F_HEAD, F_BODY, TEXT, MUTED } from '../styles'

const BOOK_URL = 'https://book.studio-808.com'

const links = [
  { to: '/studios',                  label: 'Studios' },
  { to: '/dj-studio',                label: 'DJ Studios' },
  { to: '/main-production-studio',   label: 'Production' },
  { to: '/about-us',                 label: 'About' },
  { to: '/contact',                  label: 'Contact' },
]

const mobileLinks = [
  ...links,
  { to: '/podcast-studio', label: 'Podcast' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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
            <div style={{ width: '34px', height: '34px', background: ACCENT, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: F_HEAD, color: '#fff', fontSize: '16px', lineHeight: 1 }}>8</span>
            </div>
            <span style={{ fontFamily: F_HEAD, fontSize: '19px', color: TEXT, fontWeight: 400, letterSpacing: '-0.01em' }}>
              Studio 808
            </span>
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

          {/* CTA — right */}
          <div className="nav-desktop" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <a
              href={BOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
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
              href={BOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
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
          </div>
        )}
      </header>
    </>
  )
}
