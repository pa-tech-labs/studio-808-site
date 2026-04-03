import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

export default function NotFound() {
  return (
    <>
      <SEO
        title="Page Not Found | Studio 808"
        description="The page you're looking for doesn't exist. Return to Studio 808 Chelmsford's homepage."
      />
      <section style={{ minHeight: 'calc(100vh - 64px - 300px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px' }}>
          <p style={{ fontFamily: '"DM Serif Display", serif', fontSize: '80px', color: '#e8355a', margin: '0 0 8px', lineHeight: 1 }}>404</p>
          <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: '28px', color: '#f0ede8', margin: '0 0 16px', fontWeight: 400 }}>Page Not Found</h1>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'rgba(240,237,232,0.5)', margin: '0 0 32px', lineHeight: 1.6 }}>
            The page you're looking for has moved or doesn't exist yet. Blog posts will be published soon.
          </p>
          <Link to="/" style={{ display: 'inline-block', background: '#e8355a', color: '#fff', textDecoration: 'none', fontFamily: '"DM Sans", sans-serif', fontSize: '15px', fontWeight: 600, padding: '13px 28px', borderRadius: '8px' }}>
            Back to Home
          </Link>
        </div>
      </section>
    </>
  )
}
