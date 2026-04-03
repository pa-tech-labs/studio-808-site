import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { BG, SURF, TEXT, MUTED, BORDER, F_BODY, ACCENT, sectionLabel, btnPrimary, btnSecondary } from '../styles'

const BOOK_URL = 'https://book.studio-808.com'

const stats = [
  { value: 'Est. 2014', label: 'A decade of music' },
  { value: '4 Studios',  label: 'DJ, production & content' },
  { value: 'Club-Std',   label: 'Pioneer & Neumann gear' },
  { value: 'City Centre', label: 'Chelmsford, Essex' },
]

const studios = [
  {
    name: 'Studio 1',
    sub: 'Performer',
    image: '/images/studios/studio1-performer-1.jpg',
    price: 'From £10/hr',
    desc: 'Pioneer AlphaTheta XDJ-AZ, streaming-ready. No laptop needed.',
    tags: ['Streaming', 'Air Con', 'Accessible'],
    href: '/dj-studio',
  },
  {
    name: 'Studio 2',
    sub: 'Creator',
    image: '/images/studios/studio2-creator-1.jpg',
    price: 'From £8/hr',
    desc: 'Hybrid DJ/production — Pioneer RX3, Yamaha HS8 monitors, Rode NT1.',
    tags: ['DJ + Production', 'Recording', 'Self-serve'],
    href: '/dj-studio',
  },
  {
    name: 'Studio 3',
    sub: 'Pro DJ',
    image: '/images/studios/studio3-prodj-1.jpg',
    price: 'From £14/hr',
    desc: 'CDJ-3000s, DJM-A9, Technics 1210s. Club booth. 4K content-ready.',
    tags: ['CDJ-3000', 'Vinyl', '4K Camera'],
    href: '/dj-studio',
  },
  {
    name: 'Studio 4',
    sub: 'Production',
    image: '/images/studios/studio4-production-1.jpg',
    price: 'From £60/hr',
    desc: 'Focal SM9, Neve 1073, UA Apollo 8x, Neumann U87. Engineer available.',
    tags: ['Neve 1073', 'U87 Mic', 'Mix & Master'],
    href: '/main-production-studio',
  },
]

const features = [
  {
    num: '01',
    title: 'Club-Standard Gear',
    desc: 'Pioneer CDJ-3000s, DJM-A9, Technics 1210s, Neumann U87, Neve 1073 — the same equipment used by professionals worldwide.',
  },
  {
    num: '02',
    title: 'Content-Ready',
    desc: 'Studio 3 has a 4K camera built in. Create content as you practice — no extra kit needed.',
  },
  {
    num: '03',
    title: 'City Centre',
    desc: 'Five minutes from Chelmsford station. Easy parking nearby. Right in the heart of Essex.',
  },
  {
    num: '04',
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
        image="/images/studios/studio3-prodj-1.jpg"
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        height: '100vh', minHeight: '640px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', overflow: 'hidden', background: '#080808',
      }}>
        {/* Background video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '860px', padding: '0 24px' }}>
          <span style={{ ...sectionLabel, marginBottom: '28px' }}>Chelmsford, Essex · Est. 2014</span>
          <h1
            className="mh"
            style={{ fontSize: 'clamp(42px, 7vw, 80px)', color: TEXT, lineHeight: 1.05, margin: '0 0 24px', letterSpacing: '-0.02em' }}
          >
            Chelmsford's Creative<br />Powerhouse for <em>DJs &amp; Producers</em>
          </h1>
          <p style={{ fontFamily: F_BODY, fontSize: 'clamp(16px, 2vw, 19px)', color: 'rgba(240,237,232,0.65)', lineHeight: 1.65, margin: '0 0 44px', maxWidth: '540px', marginLeft: 'auto', marginRight: 'auto' }}>
            Four professional studios. Club-standard gear. City centre location. Book online in minutes.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={BOOK_URL} target="_blank" rel="noopener noreferrer"
              style={{ ...btnPrimary, fontSize: '15px', padding: '15px 36px' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Book a Studio
            </a>
            <Link to="/dj-studio"
              style={{ ...btnSecondary, fontSize: '15px', padding: '15px 36px' }}
            >
              View Studios
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats band ───────────────────────────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, background: SURF }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <style>{`@media(max-width:640px){.stats-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
          {stats.map(({ value, label }, i) => (
            <div
              key={value}
              className="stats-grid"
              style={{
                padding: '40px 24px', textAlign: 'center',
                borderRight: i < stats.length - 1 ? `1px solid ${BORDER}` : 'none',
              }}
            >
              <p style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(22px, 3vw, 32px)', color: TEXT, margin: '0 0 6px', lineHeight: 1.1 }}>{value}</p>
              <p style={{ fontFamily: F_BODY, fontSize: '13px', color: MUTED, margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Studios grid ─────────────────────────────────────────────────── */}
      <section className="section" style={{ background: BG }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={sectionLabel}>Studios</span>
            <h2 className="mh" style={{ fontSize: 'clamp(30px, 4.5vw, 50px)', color: TEXT, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Four Studios. <em>Endless creativity.</em>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '16px' }}>
            {studios.map(s => (
              <div key={s.name} className="hover-lift" style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Photo */}
                <div style={{ background: 'rgba(240,237,232,0.04)', height: '210px', flexShrink: 0, overflow: 'hidden' }}>
                  <img src={s.image} alt={`${s.name} — ${s.sub} at Studio 808 Chelmsford`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                {/* Body */}
                <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                    <span style={{ fontFamily: F_BODY, fontSize: '11px', fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.name}</span>
                    <span style={{ fontFamily: F_BODY, fontSize: '12px', color: ACCENT, fontWeight: 600 }}>{s.price}</span>
                  </div>
                  <h3 style={{ fontFamily: '"DM Serif Display", serif', fontSize: '21px', color: TEXT, margin: '0 0 10px', fontWeight: 400, lineHeight: 1.2 }}>{s.sub}</h3>
                  <p style={{ fontFamily: F_BODY, fontSize: '13px', color: MUTED, margin: '0 0 14px', lineHeight: 1.55, flex: 1 }}>{s.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '18px' }}>
                    {s.tags.map(tag => (
                      <span key={tag} style={{ fontFamily: F_BODY, fontSize: '10px', color: 'rgba(240,237,232,0.45)', background: 'rgba(240,237,232,0.05)', border: '1px solid rgba(240,237,232,0.1)', borderRadius: '999px', padding: '3px 9px' }}>{tag}</span>
                    ))}
                  </div>
                  <Link to={s.href} style={{ ...btnSecondary, textAlign: 'center', padding: '10px 16px', fontSize: '13px', display: 'block' }}>
                    View Studio →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Studio 808 ───────────────────────────────────────────────── */}
      <section className="section" style={{ background: SURF, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '56px', alignItems: 'start' }}>
            {/* Left: heading */}
            <div>
              <span style={sectionLabel}>Why us</span>
              <h2 className="mh" style={{ fontSize: 'clamp(30px, 4vw, 48px)', color: TEXT, margin: '0 0 20px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                Club-standard gear, <em>built for creators.</em>
              </h2>
              <p style={{ fontFamily: F_BODY, fontSize: '16px', color: MUTED, lineHeight: 1.7, margin: '0 0 32px', maxWidth: '380px' }}>
                Every room at Studio 808 is equipped with the same tools you'll find at the world's best venues — because you deserve to practise on the real thing.
              </p>
              <a href={BOOK_URL} target="_blank" rel="noopener noreferrer"
                style={btnPrimary}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Book a Session
              </a>
            </div>
            {/* Right: feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {features.map(({ num, title, desc }, i) => (
                <div key={num} style={{ display: 'flex', gap: '20px', padding: '24px 0', borderTop: i === 0 ? `1px solid ${BORDER}` : 'none', borderBottom: `1px solid ${BORDER}` }}>
                  <span style={{ fontFamily: F_BODY, fontSize: '11px', color: ACCENT, fontWeight: 700, letterSpacing: '0.05em', minWidth: '24px', paddingTop: '3px' }}>{num}</span>
                  <div>
                    <h3 style={{ fontFamily: F_BODY, fontSize: '15px', color: TEXT, fontWeight: 700, margin: '0 0 6px' }}>{title}</h3>
                    <p style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED, margin: 0, lineHeight: 1.6 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews CTA ──────────────────────────────────────────────────── */}
      <section className="section" style={{ background: BG, textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '24px' }}>
            {[0,1,2,3,4].map(i => (
              <span key={i} style={{ fontSize: '20px' }}>★</span>
            ))}
          </div>
          <span style={sectionLabel}>Reviews</span>
          <h2 className="mh" style={{ fontSize: 'clamp(28px, 4vw, 46px)', color: TEXT, margin: '0 0 20px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Don't just take <em>our word for it.</em>
          </h2>
          <p style={{ fontFamily: F_BODY, fontSize: '16px', color: MUTED, margin: '0 0 36px', lineHeight: 1.65 }}>
            Hundreds of sessions booked by DJs, producers and podcasters across Essex. See what our customers say on Google.
          </p>
          <a
            href="https://g.page/r/studio808chelmsford/review"
            target="_blank"
            rel="noopener noreferrer"
            style={btnPrimary}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Read our Google Reviews
          </a>
        </div>
      </section>

      {/* ── Location ─────────────────────────────────────────────────────── */}
      <section className="section" style={{ background: SURF, borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '56px', alignItems: 'center' }}>
          <div>
            <span style={sectionLabel}>Location</span>
            <h2 className="mh" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: TEXT, margin: '0 0 20px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Find us in <em>Chelmsford.</em>
            </h2>
            <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, margin: '0 0 28px', lineHeight: 1.7 }}>
              Studio 808 is in central Chelmsford — five minutes from the train station, easy parking on Navigation Road.
            </p>
            <div style={{ fontFamily: F_BODY, fontSize: '14px', color: 'rgba(240,237,232,0.7)', lineHeight: 1.8, marginBottom: '28px' }}>
              <strong style={{ color: TEXT }}>Studio 808 Ltd</strong><br />
              Unit 11–11A Robjohns House<br />
              Navigation Road<br />
              Chelmsford, CM2 6ND
            </div>
            <a href={BOOK_URL} target="_blank" rel="noopener noreferrer"
              style={btnPrimary}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Book a Studio
            </a>
          </div>
          <div style={{ borderRadius: '16px', overflow: 'hidden', height: '340px' }}>
            <iframe
              title="Studio 808 location map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2474.97!2d0.47!3d51.73!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8927e60000001%3A0x1!2sRobjohns+House+Navigation+Rd+Chelmsford!5e0!3m2!1sen!2suk!4v1"
              width="100%" height="340"
              style={{ border: 0, display: 'block', filter: 'grayscale(30%) brightness(0.85)' }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  )
}
