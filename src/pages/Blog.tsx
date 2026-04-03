import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

const posts = [
  {
    slug: '10-years-of-studio-808',
    title: '10 Years Of Studio 808',
    excerpt: 'A decade of music, creativity and community in Chelmsford. We look back at how Studio 808 grew from a single room to four professional studios.',
    date: '2024',
    category: 'News',
  },
  {
    slug: 'how-to-start-a-podcast',
    title: 'How to Start a Podcast: From Idea to Launch',
    excerpt: 'Everything you need to know to launch your first podcast — from finding your format and buying gear to recording your first episode and publishing it online.',
    date: '2024',
    category: 'Podcasting',
  },
  {
    slug: 'how-to-publish-your-podcast',
    title: 'How to Publish Your Podcast: From Recording to Launch',
    excerpt: "You've recorded your first episode \u2014 now what? A step-by-step guide to editing, exporting and distributing your podcast across Spotify, Apple and more.",
    date: '2024',
    category: 'Podcasting',
  },
  {
    slug: 'finding-your-podcast-niche',
    title: 'Finding Your Podcast Niche: Stand Out from the Crowd',
    excerpt: 'With millions of podcasts competing for listeners, how do you carve out a space? We break down how to identify your niche and build an audience.',
    date: '2024',
    category: 'Podcasting',
  },
  {
    slug: 'get-better-chelmsford-case-study',
    title: 'The Get Better in Chelmsford Podcast | Case Study',
    excerpt: 'How local business podcast \u201cGet Better in Chelmsford\u201d used Studio 808 to build a consistent, professional-sounding show on a small budget.',
    date: '2024',
    category: 'Case Study',
  },
]

export default function Blog() {
  return (
    <>
      <SEO
        title="Blog | Studio 808 Chelmsford — DJing, Production & Podcasting Tips"
        description="Articles on DJing, music production and podcasting from the team at Studio 808, Chelmsford's creative hub since 2014."
        canonical="/blog"
      />

      <section style={{ padding: '72px 24px 60px', borderBottom: '1px solid rgba(240,237,232,0.06)' }}>
        <div style={{ maxWidth: '760px' }}>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 600, color: '#e8355a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Blog</span>
          <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 'clamp(32px, 5vw, 52px)', color: '#f0ede8', margin: '12px 0 20px', fontWeight: 400 }}>Articles &amp; Guides</h1>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '17px', color: 'rgba(240,237,232,0.55)', margin: 0, lineHeight: 1.65 }}>
            Tips, guides and stories from Studio 808 — Chelmsford's home for DJs, producers and podcasters since 2014.
          </p>
        </div>
      </section>

      <section style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {posts.map(post => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              style={{ textDecoration: 'none', display: 'block', background: '#111111', border: '1px solid rgba(240,237,232,0.08)', borderRadius: '12px', padding: '28px 32px', transition: 'border-color 0.15s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '10px' }}>
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', fontWeight: 600, color: '#e8355a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{post.category}</span>
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', color: 'rgba(240,237,232,0.3)', flexShrink: 0 }}>{post.date}</span>
              </div>
              <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 'clamp(18px, 2.5vw, 22px)', color: '#f0ede8', margin: '0 0 10px', fontWeight: 400 }}>{post.title}</h2>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'rgba(240,237,232,0.5)', margin: '0 0 16px', lineHeight: 1.6 }}>{post.excerpt}</p>
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: '#e8355a', fontWeight: 500 }}>Read more →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
