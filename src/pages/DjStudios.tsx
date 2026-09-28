import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import SEO from '../components/SEO'
import StudioCarousel from '../components/StudioCarousel'
import { BG, SURF, TEXT, MUTED, BORDER, F_BODY, ACCENT, sectionLabel, btnPrimary } from '../styles'
import { FoundingBadge, FoundingCounter, useFoundingStatus } from '../components/FoundingBadge'
import { getStudios, formatPrice, sanityImageUrl, type SanityStudio } from '../lib/sanity'
import { roomBookingUrl } from '../lib/roomBookingUrl.js'

const BOOK_URL = 'https://book.studio-808.com'
const MEMBERSHIP_URL = `${BOOK_URL}/membership`

interface StudioData {
  id: string
  num: string
  name: string
  images: string[]
  price: string
  capacity: string
  desc: string
  equipment: string[]
  note: string | null
  /** Cue booking-link slug; null books the plain page, never a guessed room. */
  cueRoomSlug: string | null
}

const STATIC_IMAGES: Record<string, string[]> = {
  '01': ['/images/studios/studio1-performer-1.jpg', '/images/studios/studio1-performer-2.jpg'],
  '02': ['/images/studios/studio2-creator-1.jpg', '/images/studios/studio2-creator-2.jpg'],
  '03': ['/images/studios/studio3-prodj-1.jpg', '/images/studios/studio3-prodj-2.jpg'],
}

const DEFAULT_STUDIOS: StudioData[] = [
  {
    id: 'studio-1',
    num: '01',
    name: 'Studio 1 — Performer',
    images: STATIC_IMAGES['01'],
    price: '£25/hr · 2hr min',
    capacity: '8',
    desc: 'The most advanced standalone DJ setup available. The Pioneer AlphaTheta XDJ-AZ connects directly to Beatport Streaming, TIDAL and rekordbox cloud library — no laptop, no USB, just plug in and play. Ideal for DJs at any level who want a professional, self-contained practice environment.',
    equipment: [
      'Pioneer AlphaTheta XDJ-AZ (standalone)',
      '2× Adam T7V studio monitors',
      'Beatport / TIDAL / rekordbox streaming built-in',
      'No laptop required',
      'Air conditioning',
      'Wheelchair accessible',
    ],
    note: null,
    cueRoomSlug: 'studio-1',
  },
  {
    id: 'studio-2',
    num: '02',
    name: 'Studio 2 — Creator',
    images: STATIC_IMAGES['02'],
    price: '£35/hr · 2hr min',
    capacity: '4',
    desc: "Chelmsford's most versatile room. Studio 2 bridges the gap between DJing and music production — use it for DJ practice, beat-making, recording vocals, or all three in the same session. Bring your laptop and connect seamlessly to the studio's interface and monitors.",
    equipment: [
      'Pioneer DDJ-RX3 DJ controller',
      'Yamaha HS8 studio monitors (production desk)',
      'KRK Rokit RP5 G5 (DJ booth)',
      'NI Komplete Kontrol M32 keyboard',
      'Rode NT1 condenser microphone',
      'Focusrite Scarlett 4i4 audio interface',
      '2× Beyerdynamic DT 770 headphones',
      'Asus ProArt display monitor',
    ],
    note: 'Bring your own laptop. DAW not provided.',
    cueRoomSlug: 'studio-2',
  },
  {
    id: 'studio-3',
    num: '03',
    name: 'Studio 3 — Pro DJ',
    images: STATIC_IMAGES['03'],
    price: '£35/hr · 2hr min',
    capacity: '8',
    desc: "Essex's definitive club-standard DJ booth. The same setup you'll find in Fabric, Printworks and festival back-stages — CDJ-3000 multis, DJM-A9, Technics 1210s and a full RMX-1000 effects unit. Whether you're preparing for a gig, recording a mix or shooting content, Studio 3 has everything in one room.",
    equipment: [
      '3× Pioneer CDJ-3000 media players',
      'Pioneer DJM-A9 mixer',
      'Pioneer RMX-1000 remix station',
      '2× Technics SL-1210 MK2 turntables',
      '2× Pioneer VM-80 monitors',
      'Shure SM58 vocal microphone',
      'In-room computer for audio capture',
      '4K camera for content recording',
      'Air conditioning',
    ],
    note: 'Styluses are not provided — please bring your own if using vinyl.',
    cueRoomSlug: 'studio-3',
  },
]

function mapSanityStudio(s: SanityStudio): StudioData {
  const staticImgs = STATIC_IMAGES[s.studioNumber] ?? []
  const heroImg = s.heroImage ? sanityImageUrl(s.heroImage, 900) : null
  const galleryImgs = (s.galleryImages ?? [])
    .map(img => sanityImageUrl(img, 900))
    .filter((u): u is string => u !== null)
  const allSanityImgs = [...(heroImg ? [heroImg] : []), ...galleryImgs]
  return {
    id: `studio-${s.studioNumber}`,
    num: s.studioNumber,
    name: s.name,
    images: allSanityImgs.length > 0 ? allSanityImgs : staticImgs,
    price: formatPrice(s),
    capacity: s.capacity,
    desc: s.description,
    equipment: s.equipment ?? [],
    note: s.note ?? null,
    cueRoomSlug: s.cueRoomSlug ?? null,
  }
}

export default function DjStudios() {
  const founding = useFoundingStatus()
  const [studios, setStudios] = useState<StudioData[]>(DEFAULT_STUDIOS)

  useEffect(() => {
    getStudios()
      .then(all => {
        // DJ studios are sortOrder 1–3
        const dj = all.filter(s => s.sortOrder <= 3)
        if (dj.length > 0) setStudios(dj.map(mapSanityStudio))
      })
      .catch(() => { /* use defaults */ })
  }, [])

  return (
    <>
      <SEO
        title="DJ Studios Chelmsford | Studio 808 — From £25/hr"
        description="Three professional DJ studios in Chelmsford from £25/hr. Pioneer CDJ-3000s, DJM-A9, XDJ-AZ, Technics 1210s. 2-hour minimum booking. Book online."
        canonical="/dj-studio"
        image="/images/studios/studio3-prodj-1.jpg"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Service',
          serviceType: 'DJ Studio Hire',
          provider: { '@type': 'LocalBusiness', name: 'Studio 808', url: 'https://www.studio-808.com' },
          areaServed: { '@type': 'City', name: 'Chelmsford' },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'DJ Studios',
            itemListElement: [
              { '@type': 'Offer', name: 'Studio 1 — Performer', price: '25', priceCurrency: 'GBP', unitText: 'per hour', description: 'Pioneer AlphaTheta XDJ-AZ standalone DJ setup. 2-hour minimum.' },
              { '@type': 'Offer', name: 'Studio 2 — Creator', price: '35', priceCurrency: 'GBP', unitText: 'per hour', description: 'Hybrid DJ/production room with Pioneer RX3, Yamaha HS8, Rode NT1. 2-hour minimum.' },
              { '@type': 'Offer', name: 'Studio 3 — Pro DJ', price: '35', priceCurrency: 'GBP', unitText: 'per hour', description: 'Club-standard booth with CDJ-3000s, DJM-A9, Technics 1210s, 4K camera. 2-hour minimum.' },
            ],
          },
        })}</script>
      </Helmet>

      {/* Page header */}
      <section style={{ paddingTop: '152px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <span style={sectionLabel}>DJ Studios</span>
          <h1 className="mh" style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', color: TEXT, margin: '0 0 20px', lineHeight: 1.05, letterSpacing: '-0.02em', maxWidth: '700px' }}>
            Three Rooms. <em>One Standard.</em>
          </h1>
          <p style={{ fontFamily: F_BODY, fontSize: '17px', color: MUTED, margin: 0, lineHeight: 1.65, maxWidth: '540px' }}>
            From beginner to touring DJ — Studio 808 has the right room for your session. All three DJ studios are available to book online by the hour, with a 2-hour minimum.
          </p>
        </div>
      </section>

      {/* Studio sections */}
      {studios.map((s, idx) => (
        <section
          key={s.id}
          className="section"
          style={{ borderBottom: `1px solid ${BORDER}`, background: idx % 2 === 1 ? SURF : BG }}
        >
          <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'start' }}>
            {/* Image */}
            <StudioCarousel images={s.images} alt={`${s.name} DJ studio at Studio 808, Chelmsford`} />
            {/* Content */}
            <div>
              <span style={{ fontFamily: F_BODY, fontSize: '11px', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '12px' }}>
                Studio {s.num}
              </span>
              <h2 className="mh" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: TEXT, margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {s.name.split(' — ')[0]} — <em>{s.name.split(' — ')[1]}</em>
              </h2>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontFamily: F_BODY, fontSize: '15px', color: ACCENT, fontWeight: 700 }}>{s.price}</span>
                <span style={{ color: BORDER, fontSize: '16px' }}>·</span>
                <span style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED }}>{s.capacity ? `Up to ${s.capacity} people` : ''}</span>
              </div>
              <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, lineHeight: 1.7, margin: '0 0 28px' }}>{s.desc}</p>
              <p style={{ fontFamily: F_BODY, fontSize: '11px', fontWeight: 600, color: 'rgba(240,237,232,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>Equipment</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {s.equipment.map(item => (
                  <li key={item} style={{ fontFamily: F_BODY, fontSize: '14px', color: 'rgba(240,237,232,0.7)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: ACCENT, fontSize: '8px', flexShrink: 0, marginTop: '5px' }}>●</span> {item}
                  </li>
                ))}
              </ul>
              {s.note && (
                <div style={{ background: 'rgba(232,53,90,0.07)', border: '1px solid rgba(232,53,90,0.18)', borderRadius: '10px', padding: '12px 16px', marginBottom: '28px' }}>
                  <p style={{ fontFamily: F_BODY, fontSize: '13px', color: 'rgba(240,237,232,0.6)', margin: 0 }}>⚠ {s.note}</p>
                </div>
              )}
              <a href={roomBookingUrl(s.cueRoomSlug)}
                style={btnPrimary}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Book {s.name.split(' — ')[0]}
              </a>
            </div>
          </div>
        </section>
      ))}

      {/* ───────────── DJ Membership ───────────── */}

      {/* Membership intro / hero */}
      <section className="section" style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <span style={sectionLabel}>
            <span style={{ color: ACCENT }}>NEW ·</span> DJ Membership
          </span>
          <h2 className="mh" style={{ fontSize: 'clamp(36px, 5vw, 60px)', color: TEXT, margin: '0 0 24px', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
            Membership.<br /><em>Your decks, every month.</em>
          </h2>
          <p style={{ fontFamily: F_BODY, fontSize: '19px', color: TEXT, margin: '0 0 18px', lineHeight: 1.6, maxWidth: '640px' }}>
            Two tiers. 808 DJ gives you £25.00 of booking credit every month, spent at member rates across every room. 808 Resident doubles it to £50.00, plus a yearly Undiscovered feature slot and members-first casting.
          </p>
          <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, margin: '0 0 12px', lineHeight: 1.65, maxWidth: '640px' }}>
            Credit resets on the 1st of every month and never rolls over. Founding memberships: 3-month initial term, then monthly rolling. Standard memberships: monthly rolling, cancel anytime.
          </p>
          <p style={{ fontFamily: F_BODY, fontSize: '13px', fontWeight: 600, color: TEXT, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 32px' }}>
            Founding offer - first 15 members only
          </p>
          <a href={MEMBERSHIP_URL}
            style={btnPrimary}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Join from £20/month
          </a>
        </div>
      </section>

      {/* What's included */}
      <section className="section" style={{ background: SURF, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px', maxWidth: '640px' }}>
            <span style={sectionLabel}>What's included</span>
            <h2 className="mh" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: TEXT, margin: '0 0 18px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Two tiers, <em>pick your lane.</em>
            </h2>
            <p style={{ fontFamily: F_BODY, fontSize: '17px', color: MUTED, margin: 0, lineHeight: 1.65 }}>
              Founding pricing for the first 15 members — locked for life. Credit resets on the 1st of every month and never rolls over.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', maxWidth: '880px', margin: '0 auto' }}>
            {[
              {
                name: '808 DJ',
                founding: '£20/mo founding - first 15 members, locked for life. £25/mo after.',
                standard: '£25/mo - monthly rolling, cancel anytime.',
                perks: [
                  '£25.00 booking credit every month, spent at member rates',
                  'Member pricing on all rooms',
                  'Members-only late-night hours',
                  'One bonus daytime session per month (2h max, starts and ends by 16:00)',
                  'Undiscovered casting eligibility',
                  'Event invites',
                ],
              },
              {
                name: '808 Resident',
                founding: '£45/mo founding - locked for life. £50/mo after.',
                standard: '£50/mo - monthly rolling, cancel anytime.',
                perks: [
                  '£50.00 booking credit every month',
                  'Everything in 808 DJ',
                  'One Undiscovered feature slot per year',
                  'Members-first casting',
                ],
              },
            ].map(tier => (
              <div key={tier.name} style={{ background: BG, border: `1px solid ${founding.dj === 0 ? BORDER : 'rgba(232,53,90,0.35)'}`, borderRadius: '12px', padding: '32px 28px', display: 'flex', flexDirection: 'column' }}>
                <div><FoundingBadge remaining={founding.dj} label="Founding offer - first 15 members only" /></div>
                <p style={{ fontFamily: '"DM Serif Display", serif', fontSize: '28px', color: TEXT, margin: '0 0 6px', fontWeight: 400, lineHeight: 1.1 }}>{tier.name}</p>
                <p style={{ fontFamily: F_BODY, fontSize: '14px', fontWeight: 600, color: founding.dj === 0 ? TEXT : ACCENT, margin: '0 0 6px' }}>
                  {founding.dj === 0 ? tier.standard : tier.founding}
                </p>
                <FoundingCounter remaining={founding.dj} cap={15} />
                <div style={{ marginBottom: '12px' }} />
                <ul style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED, margin: '0 0 18px', paddingLeft: '18px', lineHeight: 1.7 }}>
                  {tier.perks.map(perk => <li key={perk}>{perk}</li>)}
                </ul>
                <p style={{ fontFamily: F_BODY, fontSize: '12.5px', color: MUTED, margin: '0 0 22px', lineHeight: 1.6 }}>
                  Credit resets on the 1st of every month and never rolls over. Founding: 3-month initial term, then monthly rolling. Standard: monthly rolling, cancel anytime.
                </p>
                <a href={MEMBERSHIP_URL}
                  style={{ ...btnPrimary, marginTop: 'auto', textAlign: 'center' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Join from £20/month
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership CTA banner */}
      <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '100px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 className="mh" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: TEXT, margin: '0 0 18px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Credit in your pocket, <em>every month.</em>
          </h2>
          <p style={{ fontFamily: F_BODY, fontSize: '17px', color: MUTED, margin: '0 0 32px', lineHeight: 1.65 }}>
            Join as a founding member from £20/month - your booking credit lands the moment you sign up, and again on the 1st of every month.
          </p>
          <a href={MEMBERSHIP_URL}
            style={btnPrimary}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Join the DJ Membership →
          </a>
        </div>
      </section>
    </>
  )
}
