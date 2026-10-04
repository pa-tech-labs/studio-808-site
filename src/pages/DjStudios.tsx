import { useState, useEffect, useMemo, type CSSProperties } from 'react'
import { Helmet } from 'react-helmet-async'
import SEO from '../components/SEO'
import StudioCarousel from '../components/StudioCarousel'
import { BG, SURF, TEXT, MUTED, BORDER, F_BODY, sectionLabel } from '../styles'
import MembershipTeaser from '../components/MembershipTeaser'
import Reveal from '../components/Reveal'
import { SpecGrid, StickyBook, StudioHero, type StickyRoom } from '../components/StudioParts'
import { getStudios, formatPrice, sanityImageUrl, type SanityStudio } from '../lib/sanity'
import { roomBookingUrl } from '../lib/roomBookingUrl.js'
import { splitStudioName, studioKey } from '../lib/studioName.js'

interface StudioData {
  id: string
  num: string
  /** "Studio 1": the room, the hero headline. */
  room: string
  /** "Performer": the role, the hero's serif subline. */
  role: string
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
    room: 'Studio 1',
    role: 'Performer',
    images: STATIC_IMAGES['01'],
    price: '£25/hr · 2hr min',
    capacity: '8',
    desc: 'The most advanced standalone DJ setup available. The Pioneer AlphaTheta XDJ-AZ connects directly to Beatport Streaming, TIDAL and rekordbox cloud library: no laptop, no USB, just plug in and play. Ideal for DJs at any level who want a professional, self-contained practice environment.',
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
    room: 'Studio 2',
    role: 'Creator',
    images: STATIC_IMAGES['02'],
    price: '£35/hr · 2hr min',
    capacity: '4',
    desc: "Chelmsford's most versatile room. Studio 2 bridges the gap between DJing and music production. Use it for DJ practice, beat-making, recording vocals, or all three in the same session. Bring your laptop and connect seamlessly to the studio's interface and monitors.",
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
    room: 'Studio 3',
    role: 'Pro DJ',
    images: STATIC_IMAGES['03'],
    price: '£35/hr · 2hr min',
    capacity: '8',
    desc: "Essex's definitive club-standard DJ booth. The same setup you'll find in Fabric, Printworks and festival back-stages: CDJ-3000 multis, DJM-A9, Technics 1210s and a full RMX-1000 effects unit. Whether you're preparing for a gig, recording a mix or shooting content, Studio 3 has everything in one room.",
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
    note: 'Styluses are not provided. Please bring your own if using vinyl.',
    cueRoomSlug: 'studio-3',
  },
]

function mapSanityStudio(s: SanityStudio): StudioData {
  const num = studioKey(s.studioNumber)
  const staticImgs = STATIC_IMAGES[num] ?? []
  const { room, role } = splitStudioName(s)
  const heroImg = s.heroImage ? sanityImageUrl(s.heroImage, 900) : null
  const galleryImgs = (s.galleryImages ?? [])
    .map(img => sanityImageUrl(img, 900))
    .filter((u): u is string => u !== null)
  const allSanityImgs = [...(heroImg ? [heroImg] : []), ...galleryImgs]
  return {
    id: `studio-${num}`,
    num,
    room,
    role,
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

  const stickyRooms: StickyRoom[] = useMemo(
    () => studios.map(s => ({ id: s.id, room: s.room, price: s.price, href: roomBookingUrl(s.cueRoomSlug) })),
    [studios],
  )

  return (
    <>
      <SEO
        title="DJ Studios Chelmsford | Studio 808 | From £25/hr"
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
              { '@type': 'Offer', name: 'Studio 1, Performer', price: '25', priceCurrency: 'GBP', unitText: 'per hour', description: 'Pioneer AlphaTheta XDJ-AZ standalone DJ setup. 2-hour minimum.' },
              { '@type': 'Offer', name: 'Studio 2, Creator', price: '35', priceCurrency: 'GBP', unitText: 'per hour', description: 'Hybrid DJ/production room with Pioneer RX3, Yamaha HS8, Rode NT1. 2-hour minimum.' },
              { '@type': 'Offer', name: 'Studio 3, Pro DJ', price: '35', priceCurrency: 'GBP', unitText: 'per hour', description: 'Club-standard booth with CDJ-3000s, DJM-A9, Technics 1210s, 4K camera. 2-hour minimum.' },
            ],
          },
        })}</script>
      </Helmet>

      {/* Page header */}
      <section style={{ paddingTop: '152px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <span className="s8-seq" style={{ ...sectionLabel, '--s': 0 } as CSSProperties}>DJ Studios</span>
          <h1 className="mh s8-seq" style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', color: TEXT, margin: '0 0 20px', lineHeight: 1.05, letterSpacing: '-0.02em', maxWidth: '700px', '--s': 1 } as CSSProperties}>
            Three Rooms. <em>One Standard.</em>
          </h1>
          <p className="s8-seq" style={{ fontFamily: F_BODY, fontSize: '17px', color: MUTED, margin: 0, lineHeight: 1.65, maxWidth: '540px', '--s': 2 } as CSSProperties}>
            From beginner to touring DJ, Studio 808 has the right room for your session. All three DJ studios are available to book online by the hour, with a 2-hour minimum.
          </p>
          <nav aria-label="DJ studios on this page" className="s8-seq" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '28px', '--s': 3 } as CSSProperties}>
            {studios.map(s => (
              <a key={s.id} href={`#${s.id}`} className="dj-jump">{s.room} <span className="s8-subline" style={{ fontSize: '15px' }}>{s.role}</span></a>
            ))}
          </nav>
          <style>{`
            .dj-jump { display: inline-flex; align-items: baseline; gap: 8px; font-family: ${"'DM Sans', system-ui, sans-serif"}; font-size: 14px; font-weight: 700; color: ${TEXT}; text-decoration: none; border: 1px solid rgba(240,237,232,0.18); border-radius: 999px; padding: 9px 16px; transition: border-color 200ms ease; }
            .dj-jump:focus-visible { outline: 2px solid ${TEXT}; outline-offset: 3px; }
            @media (hover: hover) and (pointer: fine) { .dj-jump:hover { border-color: rgba(232,53,90,0.6); } }
          `}</style>
        </div>
      </section>

      {/* One room at a time: its hero, then its photos, story and kit. */}
      {studios.map((s, idx) => (
        <article key={s.id} id={s.id} style={{ borderBottom: `1px solid ${BORDER}`, background: idx % 2 === 1 ? SURF : BG }}>
          <StudioHero
            image={s.images[0] ?? ''}
            imageAlt={`${s.room}, ${s.role}, DJ studio at Studio 808 Chelmsford`}
            room={s.room}
            role={s.role}
            level={2}
            meta={<>
              <span className="sh-price">{s.price}</span>
              {s.capacity && <span>Up to {s.capacity} people</span>}
            </>}
          />
          <div className="section" style={{ paddingTop: '56px' }}>
            <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '56px', alignItems: 'start' }}>
              <Reveal>
                <StudioCarousel images={s.images.length > 1 ? s.images.slice(1) : s.images} alt={`${s.room}, ${s.role}, DJ studio at Studio 808, Chelmsford`} />
              </Reveal>
              <div>
                <Reveal as="p" style={{ fontFamily: F_BODY, fontSize: '16px', color: 'rgba(240,237,232,0.78)', lineHeight: 1.7, margin: '0 0 32px' }}>{s.desc}</Reveal>
                <SpecGrid items={s.equipment} />
                {s.note && (
                  <div style={{ background: 'rgba(232,53,90,0.07)', border: '1px solid rgba(232,53,90,0.22)', borderRadius: '12px', padding: '12px 16px', marginBottom: '28px' }}>
                    <p style={{ fontFamily: F_BODY, fontSize: '14px', color: 'rgba(240,237,232,0.82)', margin: 0, lineHeight: 1.55 }}>{s.note}</p>
                  </div>
                )}
                <a href={roomBookingUrl(s.cueRoomSlug)} className="s8-btn">
                  Book {s.room}
                </a>
              </div>
            </div>
          </div>
        </article>
      ))}

      <MembershipTeaser track="dj" />
      <StickyBook rooms={stickyRooms} />
    </>
  )
}
