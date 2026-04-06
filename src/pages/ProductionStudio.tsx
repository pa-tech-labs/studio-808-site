import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import SEO from '../components/SEO'
import StudioCarousel from '../components/StudioCarousel'
import { BG, SURF, TEXT, MUTED, BORDER, F_BODY, ACCENT, sectionLabel, btnPrimary } from '../styles'
import { getStudios, formatPrice, sanityImageUrl, type SanityService } from '../lib/sanity'

const STUDIO4_IMAGES = [
  '/images/studios/studio4-production-1.jpg',
  '/images/studios/studio4-production-2.jpg',
]

const BOOK_URL = 'https://book.studio-808.com'

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
  { name: 'Dry Hire',               price: '£55/hr · 2hr min', description: 'Room only — bring your own engineer or work independently. Ideal for experienced producers and mix engineers.' },
  { name: 'With Engineer',          price: 'From £100/hr',     description: 'Includes the room and one of our experienced house engineers. Perfect for recording sessions and artist production.' },
  { name: 'Mixing & Mastering',     price: '£150 / track',     description: 'Professional mix and master from our in-house team. Delivery within agreed timeframe.' },
  { name: 'Custom Track Production', price: '£600 – £1,000',  description: 'Full custom track production from idea to finished master. Price varies by complexity and revisions.' },
]

interface Studio4Data {
  images: string[]
  price: string
  capacity: string
  equipment: string[]
  services: SanityService[]
}

const DEFAULT_DATA: Studio4Data = {
  images: STUDIO4_IMAGES,
  price: '£55/hr · 2hr min',
  capacity: '5',
  equipment: DEFAULT_EQUIPMENT,
  services: DEFAULT_SERVICES,
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

        setData({
          images: allSanityImgs.length > 0 ? allSanityImgs : STUDIO4_IMAGES,
          price: formatPrice(studio4),
          capacity: studio4.capacity ?? DEFAULT_DATA.capacity,
          equipment: studio4.equipment?.length ? studio4.equipment : DEFAULT_EQUIPMENT,
          services: studio4.services?.length ? studio4.services : DEFAULT_SERVICES,
        })
      })
      .catch(() => { /* use defaults */ })
  }, [])

  return (
    <>
      <SEO
        title="Production Studio Chelmsford | Studio 808 — Neve 1073 · Neumann U87"
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
              { '@type': 'Offer', name: 'Dry Hire', price: '55', priceCurrency: 'GBP', unitText: 'per hour', description: 'Room only — bring your own engineer or work independently. 2-hour minimum.' },
              { '@type': 'Offer', name: 'With Engineer', price: '100', priceCurrency: 'GBP', unitText: 'per hour', description: 'Room and experienced house engineer for recording sessions and artist production.' },
              { '@type': 'Offer', name: 'Mixing & Mastering', price: '150', priceCurrency: 'GBP', unitText: 'per track', description: 'Professional mix and master from the in-house team.' },
              { '@type': 'Offer', name: 'Custom Track Production', price: '600', priceCurrency: 'GBP', description: 'Full custom track production from idea to finished master. £600–£1,000 depending on complexity.' },
            ],
          },
        })}</script>
      </Helmet>

      {/* Page header */}
      <section style={{ paddingTop: '152px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <span style={sectionLabel}>Studio 4 — Production</span>
          <h1 className="mh" style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', color: TEXT, margin: '0 0 20px', lineHeight: 1.05, letterSpacing: '-0.02em', maxWidth: '700px' }}>
            Pro Production <em>Studio Chelmsford.</em>
          </h1>
          <p style={{ fontFamily: F_BODY, fontSize: '17px', color: MUTED, margin: 0, lineHeight: 1.65, maxWidth: '540px' }}>
            Our flagship recording and production room. Acoustically treated, first floor, with an industry-standard signal chain from mic to monitor.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="section" style={{ borderBottom: `1px solid ${BORDER}`, background: BG }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'start' }}>
          {/* Image */}
          <StudioCarousel images={data.images} alt="Studio 4 production studio at Studio 808 Chelmsford — Focal SM9 monitors, Neve 1073" />
          {/* Details */}
          <div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
              {[
                { label: 'Dry Hire',      value: data.price },
                { label: 'With Engineer', value: 'From £100/hr' },
                { label: 'Capacity',      value: data.capacity ? `Up to ${data.capacity} people` : '' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '12px 18px' }}>
                  <p style={{ fontFamily: F_BODY, fontSize: '10px', fontWeight: 600, color: 'rgba(240,237,232,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>{label}</p>
                  <p style={{ fontFamily: '"DM Serif Display", serif', fontSize: '20px', color: TEXT, margin: 0, fontWeight: 400 }}>{value}</p>
                </div>
              ))}
            </div>

            <p style={{ fontFamily: F_BODY, fontSize: '11px', fontWeight: 600, color: 'rgba(240,237,232,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>Equipment</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.equipment.map(item => (
                <li key={item} style={{ fontFamily: F_BODY, fontSize: '14px', color: 'rgba(240,237,232,0.7)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: ACCENT, fontSize: '8px', flexShrink: 0, marginTop: '5px' }}>●</span> {item}
                </li>
              ))}
            </ul>

            <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px 20px', marginBottom: '32px' }}>
              <p style={{ fontFamily: F_BODY, fontSize: '13px', color: MUTED, margin: 0, lineHeight: 1.65 }}>
                <strong style={{ color: TEXT }}>Booking with an engineer?</strong>{' '}
                Email <a href="mailto:info@studio-808.com" style={{ color: ACCENT, textDecoration: 'none' }}>info@studio-808.com</a> at least 24 hours before your session.
              </p>
            </div>

            <a href={BOOK_URL}
              style={btnPrimary}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Book Studio 4
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section" style={{ background: SURF, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px' }}>
            <span style={sectionLabel}>Services</span>
            <h2 className="mh" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: TEXT, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Services &amp; <em>Pricing.</em>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {data.services.map(svc => (
              <div key={svc.name} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '28px' }}>
                <span style={{ fontFamily: F_BODY, fontSize: '11px', fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>{svc.name}</span>
                <p style={{ fontFamily: '"DM Serif Display", serif', fontSize: '26px', color: TEXT, margin: '0 0 12px', fontWeight: 400, lineHeight: 1.1 }}>{svc.price}</p>
                <p style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED, margin: 0, lineHeight: 1.6 }}>{svc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
