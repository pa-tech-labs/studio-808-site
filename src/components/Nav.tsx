import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const BOOK_URL = 'https://book.studio-808.com'

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header style={{ background: '#080808', borderBottom: '1px solid rgba(240,237,232,0.08)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: '#e8355a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: '"DM Serif Display", serif', color: '#fff', fontSize: '16px', lineHeight: 1 }}>8</span>
          </div>
          <span style={{ fontFamily: '"DM Serif Display", serif', fontSize: '20px', color: '#f0ede8', fontWeight: 400 }}>Studio 808</span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="hidden-mobile">
          <style>{`
            @media(max-width:768px){.hidden-mobile{display:none!important}.mobile-menu-btn{display:flex!important}}
            @media(min-width:769px){.mobile-nav{display:none!important}}
          `}</style>
          {[
            { to: '/studios', label: 'Studios' },
            { to: '/dj-studio', label: 'DJ Studios' },
            { to: '/main-production-studio', label: 'Production' },
            { to: '/about-us', label: 'About' },
            { to: '/contact', label: 'Contact' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                textDecoration: 'none',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: isActive ? '#f0ede8' : 'rgba(240,237,232,0.6)',
                transition: 'color 0.15s',
              })}
            >
              {label}
            </NavLink>
          ))}
          <a
            href={BOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#e8355a', color: '#fff', textDecoration: 'none',
              fontFamily: '"DM Sans", sans-serif', fontSize: '14px', fontWeight: 600,
              padding: '10px 20px', borderRadius: '8px', transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Book Now
          </a>
        </nav>

        {/* Hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setOpen(o => !o)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', flexDirection: 'column', gap: '5px', padding: '8px' }}
          aria-label="Toggle menu"
        >
          {[0,1,2].map(i => (
            <span key={i} style={{ display: 'block', width: '22px', height: '2px', background: '#f0ede8', borderRadius: '2px' }} />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="mobile-nav" style={{ background: '#111111', borderTop: '1px solid rgba(240,237,232,0.08)', padding: '16px 24px 24px' }}>
          {[
            { to: '/studios', label: 'Studios' },
            { to: '/dj-studio', label: 'DJ Studios' },
            { to: '/main-production-studio', label: 'Production Studio' },
            { to: '/podcast-studio', label: 'Podcast' },
            { to: '/about-us', label: 'About' },
            { to: '/contact', label: 'Contact' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              style={{ display: 'block', padding: '12px 0', fontFamily: '"DM Sans", sans-serif', fontSize: '16px', color: '#f0ede8', textDecoration: 'none', borderBottom: '1px solid rgba(240,237,232,0.06)' }}
            >
              {label}
            </Link>
          ))}
          <a
            href={BOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', marginTop: '16px', background: '#e8355a', color: '#fff', textDecoration: 'none', fontFamily: '"DM Sans", sans-serif', fontSize: '15px', fontWeight: 600, padding: '14px 20px', borderRadius: '8px', textAlign: 'center' }}
          >
            Book Now
          </a>
        </div>
      )}
    </header>
  )
}
