import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

const BOOK_URL = 'https://book.studio-808.com'

const stats = [
  { value: 'Est. 2014', label: 'A decade of music' },
  { value: '4 Studios', label: 'DJ, production & content' },
  { value: 'Club-Standard', label: 'Pioneer & Neumann gear' },
  { value: 'City Centre', label: 'Chelmsford, Essex' },
]

const studios = [
  {
    name: 'Studio 1 — Performer',
    price: 'From £10/hr',
    desc: 'Pioneer AlphaTheta XDJ-AZ, streaming-ready. No laptop needed.',
    tags: ['Streaming', 'Air Con', 'Wheelchair Access'],
    href: '/dj-studio',
  },
  {
    name: 'Studio 2 — Creator',
    price: 'From £8/hr',
    desc: 'Hybrid DJ/production setup with Pioneer RX3, Yamaha HS8 monitors and Rode NT1 mic.',
    tags: ['DJ + Production', 'Recording', 'Self-serve'],
    href: '/dj-studio',
  },
  {
    name: 'Studio 3 — Pro DJ',
    price: 'From £14/hr',
    desc: 'CDJ-3000s, DJM-A9, Technics 1210s, RMX-1000. Club booth. Content-ready.',
    tags: ['CDJ-3000', 'Vinyl Ready', '4K Camera'],
    href: '/dj-studio',
  },
  {
    name: 'Studio 4 — Production',
    price: 'From £60/hr',
    desc: 'Focal SM9 monitors, Neve 1073, UA Apollo 8x, Neumann U87. Available with engineer.',
    tags: ['Neve 1073', 'U87 Mic', 'Mix & Master'],
    href: '/main-production-studio',
  },
]

const features = [
  {
    icon: '🎛',
    title: 'Club-Standard Gear',
    desc: 'Pioneer CDJ-3000s, DJM-A9, Technics 1210s, Neumann U87, Neve 1073 — the same equipment used by professionals worldwide.',
  },
  {
    icon: '🎬',
    title: 'Content-Ready Studios',
    desc: 'Studio 3 has a 4K camera setup built in. Create content as you practice — no extra kit needed.',
  },
  {
    icon: '📍',
    title: 'Chelmsford City Centre',
    desc: 'Five minutes from Chelmsford station. Easy parking nearby. Right in the heart of Essex.',
  },
  {
    icon: '👋',
    title: 'All Levels Welcome',
    desc: "Whether you're picking up decks for the first time or recording your next EP, Studio 808 is for you.",
  },
]

export default function Home() {
  return (
    <>
      <SEO
        title="Studio 808 | Chelmsford's Creative Music Studios"
        description="DJ studios, production studio and content creation in Chelmsford city centre. Book online from £8/hr. Pioneer CDJ-3000s, Neve 1073, Neumann U87 and more."
        canonical="/"
      />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg, #0d0d0d 0%, #080808 60%, #0f0408 100%)', padding: '100px 24px 120px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(232,53,90,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-block', background: 'rgba(232,53,90,0.12)', border: '1px solid rgba(232,53,90,0.3)', borderRadius: '20px', padding: '6px 16px', marginBottom: '24px' }}>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: '#e8355a', fontWeight: 500 }}>Chelmsford, Essex · Est. 2014</span>
          </div>
          <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 400, color: '#f0ede8', lineHeight: 1.1, margin: '0 0 24px' }}>
            Chelmsford's Creative<br />Powerhouse
          </h1>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'rgba(240,237,232,0.65)', lineHeight: 1.6, margin: '0 0 40px', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' }}>
            Four professional studios for DJs, music producers and content creators. Club-standard gear, city centre location, book online in minutes.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={BOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: '#e8355a', color: '#fff', textDecoration: 'none', fontFamily: '"DM Sans", sans-serif', fontSize: '16px', fontWeight: 600, padding: '14px 32px', borderRadius: '8px', display: 'inline-block' }}
            >
              Book a Studio
            </a>
            <Link
              to="/studios"
              style={{ background: 'rgba(240,237,232,0.08)', color: '#f0ede8', textDecoration: 'none', fontFamily: '"DM Sans", sans-serif', fontSize: '16px', fontWeight: 500, padding: '14px 32px', borderRadius: '8px', border: '1px solid rgba(240,237,232,0.12)', display: 'inline-block' }}
            >
              See our Studios
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: '#111111', borderTop: '1px solid rgba(240,237,232,0.06)', borderBottom: '1px solid rgba(240,237,232,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          {stats.map(({ value, label }) => (
            <div key={value} style={{ padding: '32px 24px', textAlign: 'center', borderRight: '1px solid rgba(240,237,232,0.06)' }}>
              <p style={{ fontFamily: '"DM Serif Display", serif', fontSize: '28px', color: '#f0ede8', margin: '0 0 4px' }}>{value}</p>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'rgba(240,237,232,0.5)', margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Studios grid */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px', textAlign: 'center' }}>
            <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 'clamp(28px, 4vw, 44px)', color: '#f0ede8', margin: '0 0 12px' }}>Four Studios, One Location</h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '16px', color: 'rgba(240,237,232,0.5)', margin: 0 }}>Professional recording and rehearsal studios in Chelmsford city centre</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {studios.map((s) => (
              <div key={s.name} style={{ background: '#111111', border: '1px solid rgba(240,237,232,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ background: 'rgba(240,237,232,0.04)', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(240,237,232,0.06)' }}>
                  <img src="" alt={`${s.name} at Studio 808 Chelmsford`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ fontFamily: '"DM Serif Display", serif', fontSize: '20px', color: '#f0ede8', margin: 0 }}>{s.name}</h3>
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: '#e8355a', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: '8px' }}>{s.price}</span>
                  </div>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'rgba(240,237,232,0.6)', margin: '0 0 16px', lineHeight: 1.5 }}>{s.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                    {s.tags.map(tag => (
                      <span key={tag} style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', color: 'rgba(240,237,232,0.5)', background: 'rgba(240,237,232,0.06)', border: '1px solid rgba(240,237,232,0.1)', borderRadius: '4px', padding: '3px 8px' }}>{tag}</span>
                    ))}
                  </div>
                  <Link to={s.href} style={{ display: 'block', background: '#e8355a', color: '#fff', textDecoration: 'none', fontFamily: '"DM Sans", sans-serif', fontSize: '14px', fontWeight: 600, padding: '11px 16px', borderRadius: '8px', textAlign: 'center' }}>
                    View Studio
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Studio 808 */}
      <section style={{ background: '#111111', borderTop: '1px solid rgba(240,237,232,0.06)', borderBottom: '1px solid rgba(240,237,232,0.06)', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 'clamp(28px, 4vw, 44px)', color: '#f0ede8', textAlign: 'center', margin: '0 0 48px' }}>Why Studio 808?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
            {features.map(({ icon, title, desc }) => (
              <div key={title} style={{ padding: '28px', background: 'rgba(240,237,232,0.03)', border: '1px solid rgba(240,237,232,0.08)', borderRadius: '12px' }}>
                <div style={{ fontSize: '28px', marginBottom: '14px' }}>{icon}</div>
                <h3 style={{ fontFamily: '"DM Serif Display", serif', fontSize: '20px', color: '#f0ede8', margin: '0 0 10px' }}>{title}</h3>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'rgba(240,237,232,0.55)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⭐⭐⭐⭐⭐</div>
          <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 'clamp(24px, 3.5vw, 36px)', color: '#f0ede8', margin: '0 0 16px' }}>Don't just take our word for it</h2>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '16px', color: 'rgba(240,237,232,0.55)', margin: '0 0 32px', lineHeight: 1.6 }}>
            Hundreds of sessions booked by DJs, producers and podcasters across Essex. See what our customers say on Google.
          </p>
          <a
            href="https://g.page/r/studio808chelmsford/review"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-block', background: '#e8355a', color: '#fff', textDecoration: 'none', fontFamily: '"DM Sans", sans-serif', fontSize: '15px', fontWeight: 600, padding: '14px 32px', borderRadius: '8px' }}
          >
            Read our Google Reviews
          </a>
        </div>
      </section>

      {/* Location */}
      <section style={{ background: '#111111', borderTop: '1px solid rgba(240,237,232,0.06)', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 'clamp(24px, 3.5vw, 36px)', color: '#f0ede8', margin: '0 0 20px' }}>Find Us in Chelmsford</h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'rgba(240,237,232,0.6)', margin: '0 0 24px', lineHeight: 1.7 }}>
              Studio 808 is located in central Chelmsford, just minutes from the train station and city centre parking. Easy to reach from across Essex and East London.
            </p>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'rgba(240,237,232,0.7)', lineHeight: 1.8 }}>
              <p style={{ margin: '0 0 4px', fontWeight: 600 }}>Studio 808 Ltd</p>
              <p style={{ margin: 0 }}>Unit 11–11A Robjohns House<br />Navigation Road<br />Chelmsford, CM2 6ND</p>
            </div>
          </div>
          <div style={{ background: 'rgba(240,237,232,0.04)', border: '1px solid rgba(240,237,232,0.08)', borderRadius: '12px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <iframe
              title="Studio 808 location map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2474.97!2d0.47!3d51.73!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8927e60000001%3A0x1!2sRobjohns+House+Navigation+Rd+Chelmsford!5e0!3m2!1sen!2suk!4v1"
              width="100%"
              height="280"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  )
}
