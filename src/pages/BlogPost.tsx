import { useParams, Navigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import SEO from '../components/SEO'
import { BG, TEXT, MUTED, BORDER, F_BODY, ACCENT, sectionLabel } from '../styles'
import posts from '../data/blogPosts'

function parseDateStr(d: string): string {
  const parsed = new Date(d)
  return isNaN(parsed.getTime()) ? d : parsed.toISOString().split('T')[0]
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = posts.find(p => p.slug === slug)

  if (!post) return <Navigate to="/blog" replace />

  const blogPostSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: parseDateStr(post.date),
    author: { '@type': 'Organization', name: 'Studio 808', url: 'https://www.studio-808.com' },
    publisher: { '@type': 'Organization', name: 'Studio 808', url: 'https://www.studio-808.com', logo: { '@type': 'ImageObject', url: 'https://www.studio-808.com/images/logo.png' } },
    image: 'https://www.studio-808.com/images/studios/studio3-prodj-1.jpg',
    url: `https://www.studio-808.com/blog/${post.slug}`,
    mainEntityOfPage: `https://www.studio-808.com/blog/${post.slug}`,
  }

  return (
    <>
      <SEO
        title={`${post.title} | Studio 808 Blog`}
        description={post.excerpt}
        canonical={`/blog/${post.slug}`}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(blogPostSchema)}</script>
      </Helmet>

      <article style={{ paddingTop: '152px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <Link
            to="/blog"
            style={{ fontFamily: F_BODY, fontSize: '13px', color: ACCENT, textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginBottom: '32px' }}
          >
            ← Back to Blog
          </Link>

          <span style={sectionLabel}>{post.category}</span>

          <h1
            className="mh"
            style={{
              fontSize: 'clamp(28px, 4.5vw, 48px)',
              color: TEXT,
              margin: '0 0 16px',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {post.title}
          </h1>

          <p style={{ fontFamily: F_BODY, fontSize: '13px', color: 'rgba(240,237,232,0.3)', margin: '0 0 48px' }}>
            {post.date}
          </p>

          <div
            style={{
              fontFamily: F_BODY,
              fontSize: '16px',
              color: MUTED,
              lineHeight: 1.75,
              borderTop: `1px solid ${BORDER}`,
              paddingTop: '40px',
            }}
          >
            {post.body.split('\n\n').map((paragraph, i) => {
              const boldMatch = paragraph.match(/^\*\*(.+?)\*\*(.*)$/)
              if (boldMatch) {
                return (
                  <p key={i} style={{ margin: '0 0 24px' }}>
                    <strong style={{ color: TEXT }}>{boldMatch[1]}</strong>
                    {boldMatch[2]}
                  </p>
                )
              }
              return <p key={i} style={{ margin: '0 0 24px' }}>{paragraph}</p>
            })}
          </div>
        </div>
      </article>

      <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '60px 24px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <Link
            to="/blog"
            style={{ fontFamily: F_BODY, fontSize: '14px', color: ACCENT, textDecoration: 'none', fontWeight: 600 }}
          >
            ← View all articles
          </Link>
        </div>
      </section>
    </>
  )
}
