import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { TEXT, MUTED, BORDER, F_BODY, ACCENT, btnPrimary, btnSecondary } from '../styles'

export default function NotFound() {
  return (
    <>
      <SEO
        title="Page Not Found | Studio 808"
        description="The page you're looking for doesn't exist. Return to Studio 808 Chelmsford's homepage."
      />
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '480px' }}>
          <p style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(80px, 15vw, 120px)', color: ACCENT, margin: '0 0 8px', lineHeight: 1, fontWeight: 400 }}>404</p>
          <h1 className="mh" style={{ fontSize: 'clamp(24px, 4vw, 36px)', color: TEXT, margin: '0 0 16px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Page <em>Not Found.</em>
          </h1>
          <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, margin: '0 0 36px', lineHeight: 1.65 }}>
            The page you're looking for has moved or doesn't exist yet. Blog posts will be published soon.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/"
              style={btnPrimary}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Back to Home
            </Link>
            <Link to="/studios" style={btnSecondary}>
              View Studios
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
