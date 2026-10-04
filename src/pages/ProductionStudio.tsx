import { useState, useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import SEO from '../components/SEO'
import StudioCarousel from '../components/StudioCarousel'
import { BG, SURF, TEXT, BORDER, F_BODY, sectionLabel } from '../styles'
import MembershipTeaser from '../components/MembershipTeaser'
import Reveal from '../components/Reveal'
import { SpecGrid, StickyBook, StudioHero } from '../components/StudioParts'
import { getStudios, formatPrice, sanityImageUrl, type SanityService } from '../lib/sanity'
import { roomBookingUrl } from '../lib/roomBookingUrl.js'
import { splitStudioName } from '../lib/studioName.js'

const STUDIO4_IMAGES = [
  '/images/studios/studio4-production-1.jpg',
  '/images/studios/studio4-production-2.jpg',
]

const DEFAULT_EQUIPMENT = [
  'Focal SM9 reference monitors',
  'SPL Tube Vitalizer channel strip',
  'Neve 1073 microphone preamp',
  'Universal Audio Apollo 8x interface',
  'Neumann U87 condenser microphone',
  'Novation Summit synthesiser',
  'Korg Minilogue XD synthesiser',
  'Akai MPC (standalone)',
  'Selection of microphones',
]

const DEFAULT_SERVICES: SanityService[] = [
  { name: 'Dry Hire',               price: '£55/hr · 2hr min', description: 'Room only. Bring your own engineer or work independently. Ideal for experienced producers and mix engineers.' },
  { name: 'With Engineer',          price: 'From £100/hr',     description: 'Includes the room and one of our experienced house engineers. Perfect for recording sessions and artist production.' },
  { name: 'Mixing & Mastering',     price: '£150 / track',     description: 'Professional mix and master from our in-house team. Delivery within agreed timeframe.' },
  { name: 'Custom Track Production', price: '£600 to £1,000',  description: 'Full custom track production from idea to finished master. Price varies by complexity and revisions.' },
]

interface Studio4Data {
  /** "Studio 4" and "Producer": the hero's headline and serif subline. */
  room: string
  role: string
  images: string[]
  price: string
  capacity: string
  equipment: string[]
  services: SanityService[]
  /** Cue booking-link slug; null books the plain page, never a guessed room. */
  cueRoomSlug: string | null
}

const DEFAULT_DATA: Studio4Data = {
  room: 'Studio 4',
  role: 'Producer',
  images: STUDIO4_IMAGES,
  price: '£55/hr · 2hr min',
  capacity: '5',
  equipment: DEFAULT_EQUIPMENT,
  services: DEFAULT_SERVICES,
  cueRoomSlug: 'studio-4',
}

export default function ProductionStudio() {
  const [data, setData] = useState<Studio4Data>(DEFAULT_DATA)

  useEffect(() => {
    getStudios()
      .then(all => {
        const studio4 = all.find(s => s.sortOrder === 4)
        if (!studio4) return

        const heroImg = studio4.heroImage ? sanityImageUrl(studio4.heroImage, 900) : null
        const galleryImgs = (studio4.galleryImages ?? [])
          .map(img => sanityImageUrl(img, 900))
          .filter((u): u is string => u !== null)
        const allSanityImgs = [...(heroImg ? [heroImg] : []), ...galleryImgs]

        const { room, role } = splitStudioName(studio4)
        setData({
          room: room || DEFAULT_DATA.room,
          role: role || DEFAULT_DATA.role,
          images: allSanityImgs.length > 0 ? allSanityImgs : STUDIO4_IMAGES,
          price: formatPrice(studio4),
          capacity: studio4.capacity ?? DEFAULT_DATA.capacity,
          equipment: studio4.equipment?.length ? studio4.equipment : DEFAULT_EQUIPMENT,
          services: studio4.services?.length ? studio4.services : DEFAULT_SERVICES,
          cueRoomSlug: studio4.cueRoomSlug ?? null,
        })
      })
      .catch(() => { /* use defaults */ })
  }, [])

  const stickyRooms = useMemo(
    () => [{ id: 'studio-4-details', room: data.room, price: data.price, href: roomBookingUrl(data.cueRoomSlug) }],
    [data.room, data.price, data.cueRoomSlug],
  )

  return (
    <>
      <SEO
        title="Production Studio Chelmsford | Studio 808 | Neve 1073, Neumann U87"
        description="Professional recording studio in Chelmsford. Focal SM9 monitors, Neve 1073, UA Apollo 8x, Neumann U87. Dry hire £55/hr (2hr min) or with engineer from £100/hr."
        canonical="/main-production-studio"
        image="/images/studios/studio4-production-1.jpg"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Service',
          serviceType: 'Recording & Production Studio Hire',
          provider: { '@type': 'LocalBusiness', name: 'Studio 808', url: 'https://www.studio-808.com' },
          areaServed: { '@type': 'City', name: 'Chelmsford' },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Production Studio Services',
            itemListElement: [
              { '@type': 'Offer', name: 'Dry Hire', price: '55', priceCurrency: 'GBP', unitText: 'per hour', description: 'Room only. Bring your own engineer or work independently. 2-hour minimum.' },
              { '@type': 'Offer', name: 'With Engineer', price: '100', priceCurrency: 'GBP', unitText: 'per hour', description: 'Room and experienced house engineer for recording sessions and artist production.' },
              { '@type': 'Offer', name: 'Mixing & Mastering', price: '150', priceCurrency: 'GBP', unitText: 'per track', description: 'Professional mix and master from the in-house team.' },
              { '@type': 'Offer', name: 'Custom Track Production', price: '600', priceCurrency: 'GBP', description: 'Full custom track production from idea to finished master. £600–£1,000 depending on complexity.' },
            ],
          },
        })}</script>
      </Helmet>

      <StudioHero
        id="studio-4"
        image={data.images[0] ?? STUDIO4_IMAGES[0]}
        imageAlt={`${data.room}, ${data.role}, production studio at Studio 808 Chelmsford`}
        room={data.room}
        role={data.role}
        eyebrow={<span style={sectionLabel}>Production Studio</span>}
        lede="Our flagship recording and production room. Acoustically treated, first floor, with an industry-standard signal chain from mic to monitor."
        meta={<>
          <span className="sh-price">Dry hire {data.price}</span>
          <span>With engineer from £100/hr</span>
          {data.capacity && <span>Up to {data.capacity} people</span>}
        </>}
        actions={<a href={roomBookingUrl(data.cueRoomSlug)} className="s8-btn" style={{ fontSize: '15px', padding: '15px 32px' }}>Book {data.room}</a>}
      />

      {/* Photos and kit. The sticky Book bar follows this section, not the
          hero, which has its own Book button. */}
      <section id="studio-4-details" className="section" style={{ borderBottom: `1px solid ${BORDER}`, background: BG }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '56px', alignItems: 'start' }}>
          <Reveal>
            <StudioCarousel images={data.images.length > 1 ? data.images.slice(1) : data.images} alt={`${data.room} production studio at Studio 808 Chelmsford, Focal SM9 monitors and Neve 1073`} />
          </Reveal>
          <div>
            <SpecGrid items={data.equipment} level={2} />

            <div className="s8-card s8-static" style={{ padding: '18px 20px', marginBottom: '32px' }}>
              <p style={{ fontFamily: F_BODY, fontSize: '14px', color: 'rgba(240,237,232,0.78)', margin: 0, lineHeight: 1.65 }}>
                <strong style={{ color: TEXT }}>Booking with an engineer?</strong>{' '}
                Email <a href="mailto:info@studio-808.com" style={{ color: 'var(--s8-coral-text)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>info@studio-808.com</a> at least 24 hours before your session.
              </p>
            </div>

            <a href={roomBookingUrl(data.cueRoomSlug)} className="s8-btn">
              Book {data.room}
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section" style={{ background: SURF, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <Reveal style={{ marginBottom: '48px' }}>
            <span style={sectionLabel}>Services</span>
            <h2 className="mh" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: TEXT, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Services &amp; <em>Pricing.</em>
            </h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {data.services.map((svc, i) => (
              <Reveal key={svc.name} index={i} style={{ display: 'flex' }}>
                <div className="s8-card" style={{ background: BG, padding: '28px', flex: 1 }}>
                  <h3 style={{ fontFamily: F_BODY, fontSize: '15px', fontWeight: 700, color: TEXT, margin: '0 0 10px' }}>{svc.name}</h3>
                  <p style={{ fontFamily: '"DM Serif Display", serif', fontSize: '28px', color: TEXT, margin: '0 0 12px', fontWeight: 400, lineHeight: 1.1 }}>{svc.price}</p>
                  <p style={{ fontFamily: F_BODY, fontSize: '14px', color: 'rgba(240,237,232,0.72)', margin: 0, lineHeight: 1.6 }}>{svc.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <MembershipTeaser track="producer" />
      <StickyBook rooms={stickyRooms} />
    </>
  )
}
