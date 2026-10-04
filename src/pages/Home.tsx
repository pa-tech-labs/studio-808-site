import { useState, useEffect, type CSSProperties } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SEO from '../components/SEO'
import { BG, SURF, TEXT, MUTED, BORDER, F_BODY, sectionLabel, btnPrimary, btnSecondary } from '../styles'
import GoogleReviews from '../components/GoogleReviews'
import Marquee from '../components/Marquee'
import Reveal from '../components/Reveal'
import StudioFinderSection from '../components/StudioFinderSection'
import { prefersReducedMotion } from '../hooks/useInView'
import { useMembershipData } from '../hooks/useMembershipData'
import { fromPriceLine } from '../lib/roomPricing.js'
import { getSiteSettings, getStudios, formatPrice, sanityImageUrl, type SanityStudio } from '../lib/sanity'
import { roomBookingUrl } from '../lib/roomBookingUrl.js'
import { splitStudioName, studioKey } from '../lib/studioName.js'

const BOOK_URL = 'https://book.studio-808.com'
const STUDIOS_ID = 'studios'

/** The marquee under the hero when Site Settings has no list of its own. */
const DEFAULT_MARQUEE = [
  'CDJ-3000', 'House', 'DJM-A9', 'Drum & Bass', 'Technics 1210', 'Techno', 'Neve 1073', 'UK Garage',
  'Neumann U87', 'Hip-hop', 'Focal SM9', 'Amapiano', 'XDJ-AZ', 'Grime', 'Apollo 8x', 'Jungle',
]

const stats = [
  { value: 'Est. 2014', label: 'A decade of music' },
  { value: '4 Studios',  label: 'DJ, production & content' },
  { value: 'Club-Std',   label: 'Pioneer & Neumann gear' },
  { value: 'City Centre', label: 'Chelmsford, Essex' },
]

const features = [
  {
    num: '01',
    title: 'Club-Standard Gear',
    desc: 'Pioneer CDJ-3000s, DJM-A9, Technics 1210s, Neumann U87, Neve 1073: the same equipment used by professionals worldwide.',
  },
  {
    num: '02',
    title: 'Content-Ready',
    desc: 'Studio 3 has a 4K camera built in. Create content as you practise, no extra kit needed.',
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

interface StudioCard {
  /** "Studio 1": the room, never with the dash. */
  name: string
  /** "Performer": the role line. */
  sub: string
  image: string
  price: string
  desc: string
  tags: string[]
  href: string
  /** Cue booking-link slug; null books the plain page, never a guessed room. */
  cueRoomSlug: string | null
}

const DEFAULT_STUDIOS: StudioCard[] = [
  {
    name: 'Studio 1',
    sub: 'Performer',
    image: '/images/studios/studio1-performer-1.jpg',
    price: '£25/hr · 2hr min',
    desc: 'Pioneer AlphaTheta XDJ-AZ, streaming-ready. No laptop needed.',
    tags: ['Streaming', 'Air Con', 'Accessible'],
    href: '/dj-studio',
    cueRoomSlug: 'studio-1',
  },
  {
    name: 'Studio 2',
    sub: 'Creator',
    image: '/images/studios/studio2-creator-1.jpg',
    price: '£35/hr · 2hr min',
    desc: 'Hybrid DJ/production: Pioneer RX3, Yamaha HS8 monitors, Rode NT1.',
    tags: ['DJ + Production', 'Recording', 'Self-serve'],
    href: '/dj-studio',
    cueRoomSlug: 'studio-2',
  },
  {
    name: 'Studio 3',
    sub: 'Pro DJ',
    image: '/images/studios/studio3-prodj-1.jpg',
    price: '£35/hr · 2hr min',
    desc: 'CDJ-3000s, DJM-A9, Technics 1210s. Club booth. 4K content-ready.',
    tags: ['CDJ-3000', 'Vinyl', '4K Camera'],
    href: '/dj-studio',
    cueRoomSlug: 'studio-3',
  },
  {
    name: 'Studio 4',
    sub: 'Production',
    image: '/images/studios/studio4-production-1.jpg',
    price: '£55/hr · 2hr min',
    desc: 'Focal SM9, Neve 1073, UA Apollo 8x, Neumann U87. Engineer available.',
    tags: ['Neve 1073', 'U87 Mic', 'Mix & Master'],
    href: '/main-production-studio',
    cueRoomSlug: 'studio-4',
  },
]

const STATIC_HERO: Record<string, string> = {
  '01': '/images/studios/studio1-performer-1.jpg',
  '02': '/images/studios/studio2-creator-1.jpg',
  '03': '/images/studios/studio3-prodj-1.jpg',
  '04': '/images/studios/studio4-production-1.jpg',
}

function mapSanityCard(s: SanityStudio): StudioCard {
  const heroImg = s.heroImage ? sanityImageUrl(s.heroImage, 600) : null
  const { room, role } = splitStudioName(s)
  return {
    name: room,
    sub: role,
    image: heroImg ?? STATIC_HERO[studioKey(s.studioNumber)] ?? '',
    price: formatPrice(s),
    desc: s.shortDescription ?? s.description ?? '',
    tags: s.tags ?? [],
    href: s.pageHref ?? (s.sortOrder <= 3 ? '/dj-studio' : '/main-production-studio'),
    cueRoomSlug: s.cueRoomSlug ?? null,
  }
}

// Scroll to the section named in the URL hash (e.g. /#studios). The SPA renders
// after the browser's own hash jump, so do it here, and again once the page has
// fully loaded in case late content above the section moved it.
function useHashScroll() {
  const { hash, key } = useLocation()
  useEffect(() => {
    const id = decodeURIComponent(hash.slice(1))
    if (!id) return
    const scroll = () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }
    scroll()
    if (document.readyState === 'complete') return
    window.addEventListener('load', scroll, { once: true })
    return () => window.removeEventListener('load', scroll)
  }, [hash, key])
}

export default function Home() {
  const [studios, setStudios] = useState<StudioCard[]>(DEFAULT_STUDIOS)
  // A room Cue prices in bands (Studio 4) reads "From £37.50/hr · 2hr min"
  // from Cue; every other card keeps its Sanity price.
  const { plans } = useMembershipData()
  const cuePrice = (room: string) => {
    if (plans?.source !== 'cue') return ''
    const r = plans.rooms.find(x => x.name.trim().toLowerCase() === room.trim().toLowerCase())
    return r ? fromPriceLine(r.bands, plans.minBookingHours) : ''
  }
  const [marquee, setMarquee] = useState<string[]>(DEFAULT_MARQUEE)
  // The hero film holds still on its first frame under reduced motion.
  const [reduceMotion] = useState(prefersReducedMotion)
  useHashScroll()

  useEffect(() => {
    getSiteSettings()
      .then(st => {
        const items = (st?.marqueeItems ?? []).map(i => i?.trim()).filter((i): i is string => Boolean(i))
        if (items.length > 0) setMarquee(items)
      })
      .catch(() => { /* use defaults */ })
  }, [])

  useEffect(() => {
    getStudios()
      .then(all => {
        if (all.length > 0) setStudios(all.map(mapSanityCard))
      })
      .catch(() => { /* use defaults */ })
  }, [])

  return (
    <>
      <SEO
        title="Studio 808 | Chelmsford's Creative Music Studios"
        description="DJ studios, production studio and content creation in Chelmsford city centre. Book online from £25/hr. Pioneer CDJ-3000s, Neve 1073, Neumann U87 and more."
        canonical="/"
        image="/images/studios/studio3-prodj-1.jpg"
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section data-nav-hero style={{
        position: 'relative',
        height: '100vh', minHeight: '640px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', overflow: 'hidden', background: '#080808',
      }}>
        {/* Background film, settling slowly over 18s */}
        <video
          className="s8-zoom"
          autoPlay={!reduceMotion}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.55) 60%, rgba(13,13,13,0.92) 100%)', zIndex: 1 }} />

        <div data-nav-hero-content style={{ position: 'relative', zIndex: 2, maxWidth: '860px', padding: '0 24px' }}>
          <span className="s8-seq" style={{ ...sectionLabel, marginBottom: '28px', '--s': 0 } as CSSProperties}>Chelmsford, Essex · Est. 2014</span>
          <h1
            className="mh s8-seq"
            style={{ fontSize: 'clamp(42px, 7vw, 80px)', color: TEXT, lineHeight: 1.05, margin: '0 0 22px', letterSpacing: '-0.02em', '--s': 1 } as CSSProperties}
          >
            Chelmsford's Creative<br />Powerhouse for <em>DJs &amp; Producers</em>
          </h1>
          <p className="s8-seq" style={{ fontFamily: F_BODY, fontWeight: 400, fontSize: 'clamp(16px, 2vw, 19px)', color: 'rgba(240,237,232,0.78)', lineHeight: 1.65, margin: '0 auto 40px', maxWidth: '540px', '--s': 2 } as CSSProperties}>
            Four professional studios. Club-standard gear. City centre location. Book online in minutes.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={BOOK_URL} className="s8-btn s8-seq" style={{ fontSize: '15px', padding: '15px 36px', '--s': 3 } as CSSProperties}>
              Book a Studio
            </a>
            <Link to={{ pathname: '/', hash: STUDIOS_ID }}
              className="s8-seq home-ghost"
              style={{ ...btnSecondary, fontSize: '15px', padding: '15px 36px', '--s': 4 } as CSSProperties}
            >
              View Studios
            </Link>
          </div>
        </div>
      </section>

      <Marquee items={marquee} label="Equipment and genres at Studio 808" />

      {/* ── Stats band ───────────────────────────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, background: SURF, overflowX: 'hidden' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 16px', display: 'flex' }}>
          {stats.map(({ value, label }, i) => (
            <div
              key={value}
              style={{
                flex: 1, minWidth: 0,
                padding: 'clamp(16px, 4vw, 40px) clamp(4px, 2vw, 24px)', textAlign: 'center',
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
      <section id={STUDIOS_ID} className="section" style={{ background: BG, scrollMarginTop: '72px' }}>
        <style>{`
          .home-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 16px; }
          .home-grid > .rv { display: flex; }
          .home-card { display: flex; flex-direction: column; overflow: hidden; flex: 1; }
          .home-card-media { height: 210px; flex-shrink: 0; overflow: hidden; background: rgba(240,237,232,0.04); }
          .home-card-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 600ms var(--s8-ease); }
          .home-view { display: block; text-align: center; padding: 10px 8px 2px; font-family: ${"'DM Sans', system-ui, sans-serif"}; font-size: 14px; font-weight: 600; color: rgba(240,237,232,0.72); text-decoration: underline; text-decoration-color: rgba(240,237,232,0.3); text-underline-offset: 4px; }
          .home-ghost { transition: border-color 200ms ease, background-color 200ms ease; }
          @media (hover: hover) and (pointer: fine) {
            .home-card:hover .home-card-media img { transform: scale(1.04); }
            .home-view:hover { color: ${TEXT}; text-decoration-color: ${TEXT}; }
            .home-ghost:hover { border-color: rgba(240,237,232,0.6) !important; background-color: rgba(240,237,232,0.06) !important; }
          }
          .home-view:focus-visible, .home-ghost:focus-visible { outline: 2px solid ${TEXT}; outline-offset: 3px; }
          @media (prefers-reduced-motion: reduce) { .home-card-media img { transition: none; } .home-card:hover .home-card-media img { transform: none; } }
        `}</style>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={sectionLabel}>Studios</span>
            <h2 className="mh" style={{ fontSize: 'clamp(30px, 4.5vw, 50px)', color: TEXT, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Four Studios. <em>Endless creativity.</em>
            </h2>
          </Reveal>
          <div className="home-grid">
            {studios.map((s, i) => (
              <Reveal key={s.name} index={i}>
                <article className="s8-card home-card">
                  <div className="home-card-media">
                    <img src={s.image} alt={`${s.name}, ${s.sub}, at Studio 808 Chelmsford`} loading="lazy" width="600" height="420" />
                  </div>
                  <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', marginBottom: '4px' }}>
                      <h3 style={{ fontFamily: F_BODY, fontSize: '19px', fontWeight: 700, color: TEXT, margin: 0, lineHeight: 1.2 }}>{s.name}</h3>
                      <span style={{ fontFamily: F_BODY, fontSize: '13px', color: 'var(--s8-coral-text)', fontWeight: 700, whiteSpace: 'nowrap' }}>{cuePrice(s.name) || s.price}</span>
                    </div>
                    <p className="s8-subline" style={{ fontSize: '19px', margin: '0 0 12px' }}>{s.sub}</p>
                    <p style={{ fontFamily: F_BODY, fontSize: '14px', color: 'rgba(240,237,232,0.68)', margin: '0 0 14px', lineHeight: 1.55, flex: 1 }}>{s.desc}</p>
                    {s.tags.length > 0 && (
                      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '0 0 18px', padding: 0, listStyle: 'none' }}>
                        {s.tags.map(tag => (
                          <li key={tag} style={{ fontFamily: F_BODY, fontSize: '12px', color: 'rgba(240,237,232,0.72)', background: 'rgba(240,237,232,0.05)', border: '1px solid rgba(240,237,232,0.12)', borderRadius: '999px', padding: '4px 10px' }}>{tag}</li>
                        ))}
                      </ul>
                    )}
                    <a href={roomBookingUrl(s.cueRoomSlug)} className="s8-btn" style={{ display: 'block' }}>
                      Book {s.name}
                    </a>
                    <Link to={s.href} className="home-view">View {s.name}</Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <StudioFinderSection />

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
                Every room at Studio 808 is equipped with the same tools you'll find at the world's best venues, because you deserve to practise on the real thing.
              </p>
              <a href={BOOK_URL}
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
                  <span style={{ fontFamily: F_BODY, fontSize: '12px', color: 'var(--s8-coral-text)', fontWeight: 700, letterSpacing: '0.05em', minWidth: '24px', paddingTop: '3px' }}>{num}</span>
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

      {/* ── Reviews ────────────────────────────────────────────────────── */}
      <GoogleReviews />

      {/* ── Location ─────────────────────────────────────────────────────── */}
      <section className="section" style={{ background: SURF, borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '56px', alignItems: 'center' }}>
          <div>
            <span style={sectionLabel}>Location</span>
            <h2 className="mh" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: TEXT, margin: '0 0 20px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Find us in <em>Chelmsford.</em>
            </h2>
            <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, margin: '0 0 28px', lineHeight: 1.7 }}>
              Studio 808 is in central Chelmsford, five minutes from the train station, easy parking on Navigation Road.
            </p>
            <div style={{ fontFamily: F_BODY, fontSize: '14px', color: 'rgba(240,237,232,0.7)', lineHeight: 1.8, marginBottom: '28px' }}>
              <strong style={{ color: TEXT }}>Studio 808 Ltd</strong><br />
              Unit 11–11A Robjohns House<br />
              Navigation Road<br />
              Chelmsford, CM2 6ND
            </div>
            <a href={BOOK_URL}
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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2481.5!2d0.4811709!3d51.7331205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8e97b826ddb63%3A0x4f5b4fa9bba4296c!2sStudio%20808!5e0!3m2!1sen!2suk!4v1"
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
