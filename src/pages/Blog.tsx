import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { BG, SURF, TEXT, MUTED, BORDER, F_BODY, ACCENT, sectionLabel } from '../styles'
import posts from '../data/blogPosts'

export default function Blog() {
  return (
    <>
      <SEO
        title="Blog | Studio 808 Chelmsford — DJing, Production & Podcasting Tips"
        description="Articles on DJing, music production and podcasting from the team at Studio 808, Chelmsford's creative hub since 2014."
        canonical="/blog"
        image="/images/studios/studio3-prodj-1.jpg"
      />

      {/* Page header */}
      <section style={{ paddingTop: '152px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <span style={sectionLabel}>Blog</span>
          <h1 className="mh" style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', color: TEXT, margin: '0 0 20px', lineHeight: 1.05, letterSpacing: '-0.02em', maxWidth: '700px' }}>
            Articles &amp; <em>Guides.</em>
          </h1>
          <p style={{ fontFamily: F_BODY, fontSize: '17px', color: MUTED, margin: 0, lineHeight: 1.65, maxWidth: '540px' }}>
            Tips, guides and stories from Studio 808 — Chelmsford's home for DJs, producers and podcasters since 2014.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="section" style={{ background: BG }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {posts.map((post, idx) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              style={{
                textDecoration: 'none',
                display: 'block',
                background: idx % 2 === 0 ? SURF : BG,
                border: `1px solid ${BORDER}`,
                borderRadius: '16px',
                padding: '32px 36px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '12px' }}>
                <span style={{ fontFamily: F_BODY, fontSize: '11px', fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{post.category}</span>
                <span style={{ fontFamily: F_BODY, fontSize: '12px', color: 'rgba(240,237,232,0.3)', flexShrink: 0 }}>{post.date}</span>
              </div>
              <h2 className="mh" style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', color: TEXT, margin: '0 0 10px', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                {post.title}
              </h2>
              <p style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED, margin: '0 0 18px', lineHeight: 1.6 }}>{post.excerpt}</p>
              <span style={{ fontFamily: F_BODY, fontSize: '13px', color: ACCENT, fontWeight: 600 }}>Read more →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
