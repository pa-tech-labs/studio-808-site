import { useEffect, useState } from 'react'
import { BG, TEXT, MUTED, BORDER, F_BODY, ACCENT, sectionLabel, btnPrimary } from '../styles'

const PLACE_ID = 'ChIJY9ttgnvp2EcRbCmku6lPW08'
const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string
const CACHE_KEY = 'studio808_google_reviews'
const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/f8cHeqnyRYvgZ64E9'

interface GoogleReview {
  author_name: string
  author_url: string
  profile_photo_url: string
  rating: number
  relative_time_description: string
  text: string
}

interface PlaceData {
  rating: number
  totalReviews: number
  reviews: GoogleReview[]
}

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.maps?.places) { resolve(); return }
    const existing = document.getElementById('google-maps-script')
    if (existing) { existing.addEventListener('load', () => resolve()); return }
    const script = document.createElement('script')
    script.id = 'google-maps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })
}

function fetchPlaceDetails(): Promise<PlaceData> {
  // Check sessionStorage cache
  const cached = sessionStorage.getItem(CACHE_KEY)
  if (cached) {
    try { return Promise.resolve(JSON.parse(cached)) } catch { /* ignore */ }
  }

  return loadGoogleMaps().then(() => {
    return new Promise<PlaceData>((resolve, reject) => {
      const div = document.createElement('div')
      const service = new (window as any).google.maps.places.PlacesService(div)
      service.getDetails(
        { placeId: PLACE_ID, fields: ['reviews', 'rating', 'user_ratings_total'] },
        (place: any, status: any) => {
          if (status !== 'OK' || !place) { reject(new Error(`Places API: ${status}`)); return }
          const data: PlaceData = {
            rating: place.rating ?? 0,
            totalReviews: place.user_ratings_total ?? 0,
            reviews: (place.reviews ?? []).map((r: any) => ({
              author_name: r.author_name,
              author_url: r.author_url,
              profile_photo_url: r.profile_photo_url,
              rating: r.rating,
              relative_time_description: r.relative_time_description,
              text: r.text,
            })),
          }
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(data))
          resolve(data)
        },
      )
    })
  })
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={i <= rating ? ACCENT : 'rgba(240,237,232,0.15)'}>
          <path d="M10 1.12l2.47 5.01 5.53.8-4 3.9.94 5.5L10 13.77l-4.94 2.6.94-5.5-4-3.9 5.53-.8z" />
        </svg>
      ))}
    </span>
  )
}

function ReviewCard({ review }: { review: GoogleReview }) {
  const [expanded, setExpanded] = useState(false)
  const needsTruncate = review.text.length > 100
  const displayText = !expanded && needsTruncate ? review.text.slice(0, 100) + '…' : review.text

  return (
    <div
      className="hover-lift"
      style={{
        background: '#111111',
        border: `1px solid ${BORDER}`,
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {/* Author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <a href={review.author_url} target="_blank" rel="noopener noreferrer">
          <img
            src={review.profile_photo_url}
            alt={review.author_name}
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
            loading="lazy"
          />
        </a>
        <div style={{ minWidth: 0 }}>
          <a
            href={review.author_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: F_BODY, fontSize: '13px', fontWeight: 600, color: TEXT, textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {review.author_name}
          </a>
          <p style={{ fontFamily: F_BODY, fontSize: '11px', color: MUTED, margin: '1px 0 0' }}>
            {review.relative_time_description}
          </p>
        </div>
      </div>

      {/* Stars */}
      <Stars rating={review.rating} size={12} />

      {/* Text */}
      <p style={{ fontFamily: F_BODY, fontSize: '13px', color: 'rgba(240,237,232,0.7)', margin: 0, lineHeight: 1.55, flex: 1 }}>
        {displayText}
        {needsTruncate && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: F_BODY, fontSize: '12px', fontWeight: 600,
              color: ACCENT, padding: '0 0 0 4px',
            }}
          >
            {expanded ? 'Less' : 'More'}
          </button>
        )}
      </p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="reviews-grid" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 16px' }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{
          background: '#111111', border: `1px solid ${BORDER}`, borderRadius: '10px',
          padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(240,237,232,0.06)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: '80px', height: '12px', borderRadius: '3px', background: 'rgba(240,237,232,0.06)', marginBottom: '5px' }} />
              <div style={{ width: '55px', height: '9px', borderRadius: '3px', background: 'rgba(240,237,232,0.04)' }} />
            </div>
          </div>
          <div style={{ width: '70px', height: '12px', borderRadius: '3px', background: 'rgba(240,237,232,0.06)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ width: '100%', height: '10px', borderRadius: '3px', background: 'rgba(240,237,232,0.04)' }} />
            <div style={{ width: '75%', height: '10px', borderRadius: '3px', background: 'rgba(240,237,232,0.04)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function Fallback() {
  return (
    <a
      href={GOOGLE_MAPS_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={btnPrimary}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      Read our Google Reviews
    </a>
  )
}

export default function GoogleReviews() {
  const [data, setData] = useState<PlaceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  useEffect(() => {
    if (!API_KEY) { setError(true); setLoading(false); return }
    fetchPlaceDetails()
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  return (
    <section className="section" style={{ background: BG, textAlign: 'center' }}>
      <style>{`
        .reviews-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px;max-width:1240px;margin:0 auto}
        @media(min-width:960px){
          .reviews-grid{grid-template-columns:repeat(3,1fr);gap:14px;padding:0}
        }
      `}</style>

      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '24px' }}>
          {[0, 1, 2, 3, 4].map(i => (
            <span key={i} style={{ fontSize: '20px', color: ACCENT }}>★</span>
          ))}
        </div>
        <span style={sectionLabel}>Reviews</span>
        <h2 className="mh" style={{ fontSize: 'clamp(28px, 4vw, 46px)', color: TEXT, margin: '0 0 20px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Don't just take <em>our word for it.</em>
        </h2>

        {/* Overall rating */}
        {data && (
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontFamily: F_BODY, fontSize: '36px', fontWeight: 700, color: TEXT }}>{data.rating.toFixed(1)}</span>
            <span style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, marginLeft: '10px' }}>
              Based on {data.totalReviews} review{data.totalReviews !== 1 ? 's' : ''} on Google
            </span>
          </div>
        )}

        {!data && !loading && !error && (
          <p style={{ fontFamily: F_BODY, fontSize: '16px', color: MUTED, margin: '0 0 36px', lineHeight: 1.65 }}>
            Hundreds of sessions booked by DJs, producers and podcasters across Essex. See what our customers say on Google.
          </p>
        )}
      </div>

      {/* Review cards */}
      <div style={{ marginTop: '36px' }}>
        {loading && <LoadingSkeleton />}
        {error && <Fallback />}
        {data && data.reviews.length > 0 && (
          <>
            <div className="reviews-grid">
              {data.reviews.slice(0, 6).map((r, i) => (
                <ReviewCard key={i} review={r} />
              ))}
            </div>

            {/* Attribution + link */}
            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: F_BODY, fontSize: '14px', fontWeight: 600, color: ACCENT, textDecoration: 'none' }}
              >
                See all reviews on Google →
              </a>
              <span style={{ fontFamily: F_BODY, fontSize: '11px', color: 'rgba(240,237,232,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.44 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Powered by Google
              </span>
            </div>
          </>
        )}
        {data && data.reviews.length === 0 && <Fallback />}
      </div>
    </section>
  )
}
